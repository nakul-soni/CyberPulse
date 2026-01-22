import { query, updateIncidentAnalysis } from './db';
import { AIAnalysisAgent } from '@/agents/ai-analysis-agent';
import { RiskSeverityAgent } from '@/agents/risk-severity-agent';
import { CaseStudyAgent } from '@/agents/case-study-agent';
import { IngestionPipeline } from './ingestion-pipeline';

/**
 * Runs a batch of AI analysis on pending incidents
 * @param limit Number of incidents to process in this batch
 * @returns Number of incidents successfully analyzed
 */
export async function runAnalysisBatch(limit: number = 3): Promise<number> {
  const aiAgent = new AIAnalysisAgent();
  const riskAgent = new RiskSeverityAgent();
  const caseStudyAgent = new CaseStudyAgent();

  // Select incidents needing analysis, prioritizing today's incidents
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
     LIMIT $1`,
    [limit]
  );

  const incidents = result.rows || [];
  if (incidents.length === 0) return 0;

  console.log(`\n🧠 Analysis batch: processing ${incidents.length} incident(s)...`);
  let successCount = 0;

  for (const incident of incidents) {
    try {
      // Mark as analyzing
      await query(`UPDATE incidents SET status = 'analyzing' WHERE id = $1`, [incident.id]);

      const text = incident.description || incident.content || '';
      const ai = await aiAgent.analyzeIncident(incident.title, text);

      if (!ai) throw new Error('AI analysis returned null');

      const caseStudy = caseStudyAgent.enhanceCaseStudy(ai.case_study, incident.title, text);
      const risk = riskAgent.assessRisk(ai);

      await updateIncidentAnalysis(incident.id, {
        analysis: { ...ai, case_study: caseStudy },
        severity: risk.severity,
        attack_type: ai.attack_type,
        risk_score: risk.risk_score,
      });

      console.log(`   ✅ Analyzed incident: ${incident.id}`);
      successCount++;

      // Small delay to avoid aggressive rate limits in short bursts
      if (incidents.length > 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (err: any) {
      console.error(`   ❌ Analysis failed for ${incident.id}:`, err.message);
      
      // Mark as failed so it can be retried later
      await query(`UPDATE incidents SET status = 'failed' WHERE id = $1`, [incident.id]);
      
      if (err.message?.includes('rate_limit_exceeded')) {
        console.warn('   ⚠️ Rate limit hit. Stopping batch.');
        break;
      }
    }
  }

  return successCount;
}

/**
 * Runs the full worker cycle: Ingestion + Analysis Batch
 */
export async function runWorkerCycle() {
  console.log('🔄 Starting worker cycle...');
  
  // 1. Ingestion
  const pipeline = new IngestionPipeline();
  const stats = await pipeline.run('scheduled');
  console.log(`✅ Ingestion: ${stats.itemsNew} new items`);

  // 2. Analysis
  const analyzedCount = await runAnalysisBatch(3);
  console.log(`✅ Analysis: ${analyzedCount} items processed`);

  return {
    ingestion: stats,
    analysisCount: analyzedCount
  };
}
