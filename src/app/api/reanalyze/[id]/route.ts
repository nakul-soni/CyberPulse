import { NextResponse } from "next/server";
import { AIAnalysisAgent } from "@/agents/ai-analysis-agent";
import { CaseStudyAgent } from "@/agents/case-study-agent";
import { RiskSeverityAgent } from "@/agents/risk-severity-agent";
import { getIncidentById, updateIncidentAnalysis } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const incident = await getIncidentById(id);

    if (!incident) {
      return NextResponse.json(
        { error: "Incident not found" },
        { status: 404 }
      );
    }

    // Prefer description, fall back to content
    const content = incident.description || incident.content || "";

    const aiAgent = new AIAnalysisAgent();
    const csAgent = new CaseStudyAgent();
    const riskAgent = new RiskSeverityAgent();

    const ai = await aiAgent.analyzeIncident(incident.title, content);
    if (!ai) {
      return NextResponse.json(
        { error: "AI analysis unavailable (rate limit or API error)" },
        { status: 429 }
      );
    }

    const caseStudy = csAgent.enhanceCaseStudy(
      ai.case_study,
      incident.title,
      content
    );
    const risk = riskAgent.assessRisk(ai);

    await updateIncidentAnalysis(id, {
      analysis: { ...ai, case_study: caseStudy },
      severity: risk.severity,
      attack_type: ai.attack_type,
      risk_score: risk.risk_score,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Reanalyze error:", error);
    return NextResponse.json(
        { error: error.message || "Failed to reanalyze incident" },
        { status: 500 }
      );
  }
}

