/**
 * Background Worker
 * 
 * Runs scheduled ingestion jobs using node-cron
 * Configure cron schedule in .env (default: every 6 hours)
 * 
 * Note: This requires tsx or ts-node to run TypeScript files
 * Install: npm install -g tsx
 * Run: tsx scripts/worker.js
 */

require('dotenv').config({ path: '.env.local' });
const cron = require('node-cron');

// Load cron schedule from env (default: every 6 hours)
const CRON_SCHEDULE = process.env.INGESTION_CRON_SCHEDULE || '0 */6 * * *';

console.log('🚀 CyberPulse Background Worker Starting...');
console.log(`📅 Scheduled ingestion: ${CRON_SCHEDULE}`);

// Simple in-memory backoff for AI analysis when rate limits hit
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
    const module = await import('../src/lib/ingestion-pipeline.ts');
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
  // Back off if we recently hit Groq rate limits
  const now = Date.now();
  if (analysisBlockedUntil && now < analysisBlockedUntil) {
    return;
  }

  try {
    const dbModule = await import('../src/lib/db.ts');
    const query = dbModule.query || dbModule.default?.query || dbModule.default;
    const updateIncidentAnalysis =
      dbModule.updateIncidentAnalysis || dbModule.default?.updateIncidentAnalysis;

    const aiModule = await import('../src/agents/ai-analysis-agent.ts');
    const riskModule = await import('../src/agents/risk-severity-agent.ts');
    const caseStudyModule = await import('../src/agents/case-study-agent.ts');

    const AIAnalysisAgent =
      aiModule.AIAnalysisAgent || aiModule.default?.AIAnalysisAgent || aiModule.default;
    const RiskSeverityAgent =
      riskModule.RiskSeverityAgent || riskModule.default?.RiskSeverityAgent || riskModule.default;
    const CaseStudyAgent =
      caseStudyModule.CaseStudyAgent || caseStudyModule.default?.CaseStudyAgent || caseStudyModule.default;

    const aiAgent = new AIAnalysisAgent();
    const riskAgent = new RiskSeverityAgent();
    const caseStudyAgent = new CaseStudyAgent();

    // Select a small batch of incidents needing analysis,
    // prioritizing today's incidents first.
    // We *only* look at analysis content, not status, so we also
    // repair older incidents that were marked analyzed without a summary.
    const result = await query(
      `SELECT id, title, description, content
       FROM incidents
       WHERE (
         analysis IS NULL
         OR analysis::text = 'null'
         OR analysis::text = '{}'
         OR (analysis->>'summary') IS NULL
         OR (analysis->>'summary') = ''
       )
       ORDER BY (published_at::date = CURRENT_DATE) DESC, published_at DESC
       LIMIT 3`
    );

    const incidents = result.rows || [];
    if (incidents.length === 0) {
      return;
    }

    console.log(`\n🧠 Analysis batch: processing ${incidents.length} incident(s)...`);

    for (const incident of incidents) {
      try {
        // Mark as analyzing
        await query(
          `UPDATE incidents
           SET status = 'analyzing'
           WHERE id = $1`,
          [incident.id]
        );

        const text = incident.description || incident.content || '';
        const ai = await aiAgent.analyzeIncident(incident.title, text);

        if (!ai) {
          throw new Error('AI analysis returned null');
        }

        const caseStudy = caseStudyAgent.enhanceCaseStudy(
          ai.case_study,
          incident.title,
          text
        );
        const risk = riskAgent.assessRisk(ai);

        await updateIncidentAnalysis(incident.id, {
          analysis: { ...ai, case_study: caseStudy },
          severity: risk.severity,
          attack_type: ai.attack_type,
          risk_score: risk.risk_score,
        });

        console.log(`   ✅ Analyzed incident: ${incident.id}`);

        // Small delay between calls
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (err) {
        const msg = err?.message || String(err);
        console.error(`   ❌ Analysis failed for ${incident.id}:`, msg);

        if (msg.includes('rate_limit_exceeded')) {
          console.warn('   ⚠️ Rate limit hit. Pausing analysis for 5 minutes.');
          analysisBlockedUntil = Date.now() + 5 * 60 * 1000;
          break;
        }

        // Mark as failed; future batches can retry
        await query(
          `UPDATE incidents
           SET status = 'failed'
           WHERE id = $1`,
          [incident.id]
        );
      }
    }
  } catch (error) {
    console.error('❌ Analysis batch failed:', error);
  }
}

// Keep process alive
console.log('✅ Worker is running. Press Ctrl+C to stop.');
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down worker...');
  process.exit(0);
});
