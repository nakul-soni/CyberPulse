/**
 * Manual Ingestion Script (One-time)
 * 
 * Run: tsx scripts/ingest-once.js
 */

require('dotenv').config({ path: '.env.local' });

async function main() {
  console.log('🚀 Running one-time ingestion...');
  
  try {
    // Dynamic import for TypeScript modules
    const module = await import('../src/lib/ingestion-pipeline.ts');
    const IngestionPipeline = module.IngestionPipeline || module.default?.IngestionPipeline || module.default;
    
    if (!IngestionPipeline) {
      throw new Error('IngestionPipeline class not found');
    }
    
    const pipeline = new IngestionPipeline();
    const result = await pipeline.run('github-action');
    
    console.log('✅ Ingestion completed:', result);
    process.exit(0);
  } catch (error) {
    console.error('❌ Ingestion failed:', error);
    process.exit(1);
  }
}

main();
