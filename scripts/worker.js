/**
 * Background Worker
 * 
 * Runs scheduled ingestion jobs using node-cron
 * Configure cron schedule in .env (default: every 6 hours)
 * 
 * Note: This requires tsx to run TypeScript files
 * Run: bun run worker (or tsx scripts/worker.js)
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const cron = require('node-cron');

// Load cron schedule from env (default: every 6 hours)
const CRON_SCHEDULE = process.env.INGESTION_CRON_SCHEDULE || '0 */6 * * *';

console.log('🚀 CyberPulse Background Worker Starting...');
console.log(`📅 Scheduled ingestion: ${CRON_SCHEDULE}`);

let analysisBlockedUntil = 0;

// Run ingestion immediately on startup (optional)
const RUN_ON_STARTUP = process.env.RUN_INGESTION_ON_STARTUP === 'true';

if (RUN_ON_STARTUP) {
  console.log('🔄 Running initial ingestion...');
  runIngestion().catch(console.error);
}

// Schedule periodic ingestion
cron.schedule(CRON_SCHEDULE, async () => {
  console.log(`\n⏰ Scheduled ingestion triggered at ${new Date().toISOString()}`);
  await runIngestion();
});

// Run analysis loop every 30 seconds
setInterval(async () => {
  await runAnalysisBatch();
}, 30000);

async function runIngestion() {
  try {
    // Import from src instead of dist for tsx support
    const module = await import('../src/lib/ingestion-pipeline.js').catch(() => import('../src/lib/ingestion-pipeline.ts'));
    const IngestionPipeline =
      module.IngestionPipeline || module.default?.IngestionPipeline || module.default;
    const pipeline = new IngestionPipeline();
    const stats = await pipeline.run('scheduled');

    console.log('✅ Ingestion completed:');
    console.log(`   Fetched: ${stats.itemsFetched}`);
    console.log(`   New: ${stats.itemsNew}`);
    console.log(`   Duplicates: ${stats.itemsDuplicate}`);
    console.log(`   Failed: ${stats.itemsFailed}`);
  } catch (error) {
    console.error('❌ Ingestion failed:', error);
  }
}

async function runAnalysisBatch() {
  const now = Date.now();
  if (analysisBlockedUntil && now < analysisBlockedUntil) {
    return;
  }

  try {
    const dbModule = await import('../src/lib/db.js').catch(() => import('../src/lib/db.ts'));
    const query = dbModule.query || dbModule.default?.query || dbModule.default;
    
    const analysisModule = await import('../src/lib/analysis.js').catch(() => import('../src/lib/analysis.ts'));
    const performAnalysis = analysisModule.performAnalysis || analysisModule.default?.performAnalysis;
    const isAnalysisMissing = analysisModule.isAnalysisMissing || analysisModule.default?.isAnalysisMissing;

    // Select incidents missing analysis
    // Fixed query to include new format check
    const result = await query(
      `SELECT id, title, description, content, analysis
       FROM incidents
       WHERE (
         analysis IS NULL
         OR analysis::text = 'null'
         OR analysis::text = '{}'
         OR (
           (analysis->>'snapshot') IS NULL 
           AND (analysis->>'summary') IS NULL
         )
       )
       ORDER BY (published_at::date = CURRENT_DATE) DESC, published_at DESC
         LIMIT 2`
    );

    const incidents = result.rows || [];
    if (incidents.length === 0) {
      return;
    }

    console.log(`\n🧠 Analysis batch: processing ${incidents.length} incident(s)...`);

    for (const incident of incidents) {
      // Double check if analysis is missing using the utility
      if (!isAnalysisMissing(incident.analysis)) {
        continue;
      }

      try {
        await performAnalysis(incident);
        console.log(`   ✅ Analyzed incident: ${incident.id}`);
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (err) {
        const msg = err?.message || String(err);
        console.error(`   ❌ Analysis failed for ${incident.id}:`, msg);

          if (msg.includes('rate_limit_exceeded')) {
            console.warn('   ⚠️ Rate limit hit. Pausing analysis for 5 minutes.');
            analysisBlockedUntil = Date.now() + 5 * 60 * 1000;
            break;
          }
          if (msg.includes('GROQ_CREDITS_EXHAUSTED')) {
            console.warn('   🛑 GROQ CREDITS EXHAUSTED. Pausing analysis for 1 hour.');
            analysisBlockedUntil = Date.now() + 60 * 60 * 1000;
            break;
          }
      }
    }
  } catch (error) {
    console.error('❌ Analysis batch failed:', error);
  }
}

console.log('✅ Worker is running. Press Ctrl+C to stop.');
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down worker...');
  process.exit(0);
});
