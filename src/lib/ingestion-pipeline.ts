/**
 * Ingestion Pipeline
 * 
 * Orchestrates all agents to process cyber news:
 * 1. News Ingestion Agent - Fetch RSS feeds
 * 2. Deduplication Agent - Remove duplicates
 * 3. (AI analysis handled by background worker, not here)
 */

import { NewsIngestionAgent, RSSFeedItem } from '../agents/news-ingestion-agent';
import { DeduplicationAgent } from '../agents/deduplication-agent';
import {
  insertIncident,
  createIngestionLog,
  updateIngestionLog,
} from './db';

export interface IngestionStats {
  itemsFetched: number;
  itemsNew: number;
  itemsDuplicate: number;
  itemsFailed: number;
}

export class IngestionPipeline {
  private newsAgent: NewsIngestionAgent;
  private dedupAgent: DeduplicationAgent;

  constructor() {
    this.newsAgent = new NewsIngestionAgent();
    this.dedupAgent = new DeduplicationAgent();
  }

  /**
   * Run the complete ingestion pipeline
   */
  async run(sourceName?: string): Promise<IngestionStats> {
    const log = await createIngestionLog(sourceName);
    const stats: IngestionStats = {
      itemsFetched: 0,
      itemsNew: 0,
      itemsDuplicate: 0,
      itemsFailed: 0,
    };

    try {
      console.log('🚀 Starting ingestion pipeline...');

      // Step 1: Fetch RSS feeds
      console.log('📡 Step 1: Fetching RSS feeds...');
      const feedItems = await this.newsAgent.fetchAllFeeds();
      stats.itemsFetched = feedItems.length;
      console.log(`✅ Fetched ${feedItems.length} items from RSS feeds`);

      await updateIngestionLog(log.id, {
        items_fetched: stats.itemsFetched,
      });

      if (feedItems.length === 0) {
        await updateIngestionLog(log.id, {
          status: 'completed',
        });
        return stats;
      }

      // Step 2: Deduplication
      console.log('🔍 Step 2: Checking for duplicates...');
      const duplicateChecks = await this.dedupAgent.checkDuplicates(feedItems);

      // Step 3: Process each item
      console.log('⚙️ Step 3: Processing incidents...');
      const processPromises = feedItems.map(async (item, index) => {
        const dupResult = duplicateChecks.get(index);
        
        if (dupResult?.isDuplicate) {
          stats.itemsDuplicate++;
          return;
        }

        try {
          // Generate content hash
          const contentHash = this.dedupAgent.generateContentHash(
            item.title,
            item.description
          );

          // Insert incident
          const incident = await insertIncident({
            title: item.title,
            description: item.description,
            content: item.content,
            url: item.url,
            source: item.source,
            published_at: item.publishedAt,
            content_hash: contentHash,
          });

          stats.itemsNew++;

        } catch (error: any) {
          console.error(`Error processing item ${item.url}:`, error.message);
          stats.itemsFailed++;
        }
      });

      await Promise.allSettled(processPromises);

      // Update log
      await updateIngestionLog(log.id, {
        items_new: stats.itemsNew,
        items_duplicate: stats.itemsDuplicate,
        items_failed: stats.itemsFailed,
        status: 'completed',
      });

      console.log('✅ Ingestion pipeline completed');
      console.log(`   New: ${stats.itemsNew}, Duplicates: ${stats.itemsDuplicate}, Failed: ${stats.itemsFailed}`);

      return stats;
    } catch (error: any) {
      console.error('❌ Ingestion pipeline failed:', error);
      await updateIngestionLog(log.id, {
        status: 'failed',
        error_message: error.message,
      });
      throw error;
    }
  }
}
