/**
 * Background Worker
 * 
 * Runs scheduled ingestion jobs using node-cron
 */

import 'dotenv/config';
import cron from 'node-cron';
import { IngestionPipeline } from '../src/lib/ingestion-pipeline';

// Load cron schedule from env (default: every 6 hours)
const CRON_SCHEDULE = process.env.INGESTION_CRON_SCHEDULE || '0 */6 * * *';

console.log('🚀 CyberPulse Background Worker Starting...');
console.log(`📅 Scheduled ingestion: ${CRON_SCHEDULE}`);

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
    const pipeline = new IngestionPipeline();
    const stats = await pipeline.run('scheduled');

    console.log('✅ Ingestion completed:');
    console.log(`   Fetched: ${stats.itemsFetched}`);
    console.log(`   New: ${stats.itemsNew}`);
    console.log(`   Duplicates: ${stats.itemsDuplicate}`);
    console.log(`   Failed: ${stats.itemsFailed}`);
  } catch (error: any) {
    console.error('❌ Ingestion failed:', error);
  }
}

async function runAnalysisBatch() {
  try {
    // Dynamic imports for analysis to keep worker light
    const { query } = await import('../src/lib/db');
    const { performAnalysis, isAnalysisMissing } = await import('../src/lib/analysis');

    // Select incidents missing analysis (recently fetched first)
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
       ORDER BY ingested_at DESC, published_at DESC
       LIMIT 5`
    );

    const incidents = result.rows || [];
    if (incidents.length === 0) {
      return;
    }

    console.log(`\n🧠 Analysis batch: processing ${incidents.length} incident(s)...`);

    for (const incident of incidents) {
      if (!isAnalysisMissing(incident.analysis)) {
        continue;
      }

      try {
        await performAnalysis(incident);
        console.log(`   ✅ Analyzed incident: ${incident.id}`);
        } catch (err: any) {
          console.error(`   ❌ Analysis failed for ${incident.id}:`, err?.message || String(err));
        }
      }
    } catch (error: any) {
      console.error('❌ Analysis batch failed:', error);
    }
  }

console.log('✅ Worker is running. Press Ctrl+C to stop.');
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down worker...');
  process.exit(0);
});
