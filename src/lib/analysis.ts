import { AIAnalysisAgent } from '@/agents/ai-analysis-agent';
import { CaseStudyAgent } from '@/agents/case-study-agent';
import { RiskSeverityAgent } from '@/agents/risk-severity-agent';
import { updateIncidentAnalysis, query } from '@/lib/db';

export async function performAnalysis(incident: { id: string; title: string; description?: string; content?: string }) {
  const content = incident.description || incident.content || "";
  
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
      throw new Error('AI analysis returned null');
    }

    const caseStudy = csAgent.enhanceCaseStudy(
      ai.case_study,
      incident.title,
      content
    );
    const risk = riskAgent.assessRisk(ai);

    const updatedIncident = await updateIncidentAnalysis(incident.id, {
      analysis: { ...ai, case_study: caseStudy },
      severity: risk.severity,
      attack_type: ai.attack_type,
      risk_score: risk.risk_score,
    });

    return updatedIncident;
  } catch (error) {
    // Mark as failed
    await query(
      `UPDATE incidents SET status = 'failed' WHERE id = $1`,
      [incident.id]
    );
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
  if (analysis.snapshot && analysis.executive_summary && analysis.facts && analysis.facts.length > 0) {
    return false;
  }
  
  // Old format check
  if (analysis.summary && analysis.summary.length > 0) {
    return false;
  }
  
  return true;
}
