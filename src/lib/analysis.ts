import { AIAnalysisAgent } from '@/agents/ai-analysis-agent';
import { CaseStudyAgent } from '@/agents/case-study-agent';
import { RiskSeverityAgent } from '@/agents/risk-severity-agent';
import { updateIncidentAnalysis, query } from '@/lib/db';

export async function performAnalysis(incident: { id: string; title: string; description?: string | null; content?: string | null }) {
  const content = (incident.description || incident.content || "") as string;
  
  const aiAgent = new AIAnalysisAgent();
  const csAgent = new CaseStudyAgent();
  const riskAgent = new RiskSeverityAgent();

  // Mark as analyzing
  await query(
    `UPDATE incidents SET status = 'analyzing' WHERE id = $1`,
    [incident.id]
  );

  try {
    const ai = await aiAgent.analyzeIncident(incident.title, content);
    
    if (!ai) {
      throw new Error('AI analysis returned null - all models failed or returned invalid responses');
    }

    const caseStudy = csAgent.enhanceCaseStudy(
      ai,
      incident.title,
      content
    );
    const risk = riskAgent.assessRisk(ai);

    try {
      const updatedIncident = await updateIncidentAnalysis(incident.id, {
        analysis: { ...ai, case_study: caseStudy },
        severity: risk.severity,
        attack_type: ai.attack_type,
        risk_score: risk.risk_score,
      });

      return updatedIncident;
    } catch (dbError: any) {
      // Separate database errors from AI errors
      console.error(`💾 Database error while saving analysis for ${incident.id}:`, dbError.message);
      if (dbError.message.includes('value too long for type character varying')) {
        throw new Error(`Database schema issue: ${dbError.message}. Please run: psql $DATABASE_URL -f scripts/fix-column-lengths.sql`);
      }
      throw dbError;
    }
  } catch (error: any) {
    // Mark as failed
    await query(
      `UPDATE incidents SET status = 'failed' WHERE id = $1`,
      [incident.id]
    ).catch(err => console.error('Failed to update status:', err));
    
    // Re-throw with better context
    if (error.message.includes('AI analysis returned null')) {
      throw error; // Keep original message
    }
    throw error;
  }
}

export function isAnalysisMissing(analysis: any): boolean {
  if (!analysis) return true;
  if (typeof analysis === 'string') {
    try {
      const parsed = JSON.parse(analysis);
      return isAnalysisMissing(parsed);
    } catch {
      return true;
    }
  }
  
  // New format check
  if (analysis.snapshot && analysis.facts && analysis.facts.length > 0) {
    return false;
  }
  
  // Old format check
  if (analysis.summary && analysis.summary.length > 0) {
    return false;
  }
  
  return true;
}
