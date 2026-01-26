import { NextResponse } from "next/server";
import { getIncidentById } from "@/lib/db";
import { performAnalysis } from "@/lib/analysis";

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

    try {
      await performAnalysis(incident);
      return NextResponse.json({ success: true });
    } catch (analysisError: any) {
      if (analysisError.message?.includes('rate_limit_exceeded')) {
        return NextResponse.json(
          { error: "AI analysis unavailable (rate limit)" },
          { status: 429 }
        );
      }
      throw analysisError;
    }
  } catch (error: any) {
    console.error("Reanalyze error:", error);
    return NextResponse.json(
        { error: error.message || "Failed to reanalyze incident" },
        { status: 500 }
      );
  }
}
