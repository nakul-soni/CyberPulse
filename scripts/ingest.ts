/**
 * Manual Ingestion Script
 * 
 * Run: tsx scripts/ingest.ts
 */

import 'dotenv/config';
import { IngestionPipeline } from '../src/lib/ingestion-pipeline';

async function runIngestion() {
  try {
    console.log('🚀 Starting manual ingestion...');
    
    const pipeline = new IngestionPipeline();
    const stats = await pipeline.run('manual');
    
    console.log('\n✅ Ingestion completed:');
    console.log(`   Fetched: ${stats.itemsFetched}`);
    console.log(`   New: ${stats.itemsNew}`);
    console.log(`   Duplicates: ${stats.itemsDuplicate}`);
    console.log(`   Failed: ${stats.itemsFailed}`);
    
      process.exit(0);
    } catch (error: any) {
      console.error('❌ Ingestion failed:', error);
    process.exit(1);
  }
}

runIngestion();
