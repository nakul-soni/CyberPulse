/**
 * News Ingestion Agent
 * 
 * Responsibilities:
 * - Fetch RSS feeds from multiple sources
 * - Parse and normalize feed items
 * - Extract structured data (title, content, URL, date)
 */

import Parser from 'rss-parser';

export interface RSSFeedItem {
  title: string;
  description?: string;
  content?: string;
  url: string;
  publishedAt: Date;
  source: string;
}

export interface RSSSource {
  name: string;
  url: string;
  enabled: boolean;
}

// Global RSS sources configuration
export const RSS_SOURCES: RSSSource[] = [
  {
    name: 'The Hacker News',
    url: 'https://feeds.feedburner.com/TheHackersNews',
    enabled: true,
  },
  {
    name: 'BleepingComputer',
    url: 'https://www.bleepingcomputer.com/feed/',
    enabled: true,
  },
  {
    name: 'Krebs on Security',
    url: 'https://krebsonsecurity.com/feed/',
    enabled: true,
  },
  {
    name: 'SecurityWeek',
    url: 'https://www.securityweek.com/rss.xml',
    enabled: true,
  },
  {
    name: 'Dark Reading',
    url: 'https://www.darkreading.com/rss.xml',
    enabled: true,
  },
];

const parser = new Parser({
  timeout: 10000,
  maxRedirects: 5,
});

export class NewsIngestionAgent {
  /**
   * Fetch and parse RSS feed from a single source
   */
  async fetchFeed(source: RSSSource): Promise<RSSFeedItem[]> {
    if (!source.enabled) {
      return [];
    }

    try {
      console.log(`📡 Fetching feed: ${source.name}`);
      const feed = await parser.parseURL(source.url);
      
      const items: RSSFeedItem[] = [];
      
      for (const item of feed.items || []) {
        if (!item.link || !item.title) {
          continue;
        }

        // Parse publication date
        let publishedAt = new Date();
        if (item.pubDate) {
          publishedAt = new Date(item.pubDate);
        } else if (item.isoDate) {
          publishedAt = new Date(item.isoDate);
        }

        items.push({
          title: item.title.trim(),
          description: item.contentSnippet?.trim() || item.description?.trim(),
          content: item.content?.trim() || item.contentSnippet?.trim(),
          url: item.link.trim(),
          publishedAt,
          source: source.name,
        });
      }

      console.log(`✅ Fetched ${items.length} items from ${source.name}`);
      return items;
    } catch (error: any) {
      console.error(`❌ Error fetching ${source.name}:`, error.message);
      return [];
    }
  }

  /**
   * Fetch all enabled RSS feeds
   */
  async fetchAllFeeds(): Promise<RSSFeedItem[]> {
    const allItems: RSSFeedItem[] = [];
    
    // Fetch all feeds in parallel
    const fetchPromises = RSS_SOURCES.map(source => this.fetchFeed(source));
    const results = await Promise.allSettled(fetchPromises);
    
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allItems.push(...result.value);
      }
    }
    
    return allItems;
  }
}
