const { runIngestionPipeline } = require('./ingestion/pipeline');

async function main() {
  console.log('🚀 Running one-time ingestion...');
  
  try {
    const result = await runIngestionPipeline();
    console.log('✅ Ingestion completed:', result);
    process.exit(0);
  } catch (error) {
    console.error('❌ Ingestion failed:', error);
    process.exit(1);
  }
}

main();
