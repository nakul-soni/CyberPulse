/**
 * Manual Ingestion Script
 * 
 * Run ingestion manually from command line
 * 
 * Note: This requires tsx or ts-node to run TypeScript files
 * Install: npm install -g tsx
 * Run: tsx scripts/ingest.js
 */

require('dotenv').config({ path: '.env.local' });

async function runIngestion() {
  try {
    // Dynamic import for TypeScript modules
    // tsx compiles TypeScript and may export differently
    const module = await import('../src/lib/ingestion-pipeline.ts');
    const IngestionPipeline = module.IngestionPipeline || module.default?.IngestionPipeline || module.default;
    
    if (!IngestionPipeline) {
      throw new Error('IngestionPipeline class not found');
    }
    
    const pipeline = new IngestionPipeline();
    
    console.log('🚀 Starting manual ingestion...');
    const stats = await pipeline.run('manual');
    
    console.log('\n✅ Ingestion completed:');
    console.log(`   Fetched: ${stats.itemsFetched}`);
    console.log(`   New: ${stats.itemsNew}`);
    console.log(`   Duplicates: ${stats.itemsDuplicate}`);
    console.log(`   Failed: ${stats.itemsFailed}`);
    console.log(`   Analyzed: ${stats.itemsAnalyzed}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ingestion failed:', error);
    process.exit(1);
  }
}

runIngestion();
