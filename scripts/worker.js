/**
 * Background Worker (Legacy / Persistent Process mode)
 * 
 * Runs scheduled ingestion and analysis cycles.
 * Useful for persistent environments like Render Background Workers.
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const cron = require('node-cron');

const CRON_SCHEDULE = process.env.INGESTION_CRON_SCHEDULE || '0 * * * *'; // Default: every 1 hour
const RUN_ON_STARTUP = process.env.RUN_INGESTION_ON_STARTUP === 'true';

console.log('🚀 CyberPulse Background Worker Starting...');
console.log(`📅 Scheduled worker cycle: ${CRON_SCHEDULE}`);

/**
 * Executes a full worker cycle (Ingestion + Analysis)
 */
async function runCycle() {
  try {
    const { runWorkerCycle } = await import('../src/lib/worker-utils.ts');
    await runWorkerCycle();
  } catch (error) {
    console.error('❌ Worker cycle failed:', error);
  }
}

// 1. Run immediately on startup if configured
if (RUN_ON_STARTUP) {
  console.log('🔄 Running initial cycle...');
  runCycle();
}

// 2. Schedule periodic cycles
cron.schedule(CRON_SCHEDULE, async () => {
  console.log(`\n⏰ Scheduled cycle triggered at ${new Date().toISOString()}`);
  await runCycle();
});

// 3. Keep a frequent analysis-only loop running for pending items
// This ensures that even if ingestion happens hourly, 
// the backlog of AI analysis is processed continuously.
setInterval(async () => {
  try {
    const { runAnalysisBatch } = await import('../src/lib/worker-utils.ts');
    await runAnalysisBatch(2); // Process 2 items every minute
  } catch (err) {
    // Ignore import errors or transient DB issues in the loop
  }
}, 60000);

console.log('✅ Worker is active. Press Ctrl+C to stop.');

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down worker...');
  process.exit(0);
});
