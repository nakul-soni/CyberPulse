import { NextResponse } from 'next/server';
import { getIncidents, insertIncident, updateIncidentAnalysis } from '@/lib/db';
import { GlobalSearchAgent } from '@/agents/global-search-agent';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const globalSearchAgent = new GlobalSearchAgent();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const severity = searchParams.get('severity') || undefined;
    const attackType = searchParams.get('attack_type') || undefined;
    const query = searchParams.get('query') || undefined;
    const todayOnly = searchParams.get('todayOnly') === 'true';
    const date = searchParams.get('date') || undefined;

    let result = await getIncidents({
      page,
      limit,
      severity,
      attackType,
      search: query,
      todayOnly,
      date,
    });

    // Global Search Enhancement:
    // If we have no results and there's a specific query, try to find it globally
    if (result.total === 0 && query && query.length > 3 && !severity && !attackType && !date) {
      console.log(`[Global Search] No results for "${query}", searching global intelligence...`);
      const globalIncident = await globalSearchAgent.searchGlobalAttack(query);
      
      if (globalIncident) {
        // Create hash for deduplication
        const contentHash = crypto
          .createHash('md5')
          .update(globalIncident.title + globalIncident.description)
          .digest('hex');

        // Insert into database
        const newIncident = await insertIncident({
          title: globalIncident.title,
          description: globalIncident.description,
          content: globalIncident.content,
          url: globalIncident.url,
          source: globalIncident.source,
          published_at: new Date(globalIncident.published_at),
          content_hash: contentHash,
          region: globalIncident.region,
        });

        // Add analysis
        await updateIncidentAnalysis(newIncident.id, {
          analysis: globalIncident.analysis,
          severity: globalIncident.severity,
          attack_type: globalIncident.attack_type,
          risk_score: globalIncident.risk_score,
        });

        // Re-fetch to get the newly created record
        result = await getIncidents({
          page,
          limit,
          search: query,
        });
      }
    }

    return NextResponse.json({
      data: result.incidents,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch incidents' },
      { status: 500 }
    );
  }
}
