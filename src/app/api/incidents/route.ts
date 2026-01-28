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
    // If we have low results and there's a specific query, try to find more globally
    if (result.total < 5 && query && query.length >= 2 && !severity && !attackType && !date) {
      console.log(`[Global Search] Low results (${result.total}) for "${query}", searching global intelligence...`);
      const globalIncidents = await globalSearchAgent.searchGlobalAttack(query);
      
      if (globalIncidents && globalIncidents.length > 0) {
        for (const incident of globalIncidents) {
          // Create hash for deduplication
          const contentHash = crypto
            .createHash('md5')
            .update(incident.title + incident.description)
            .digest('hex');

          // Check if it already exists
          const { incidentExistsByHash } = await import('@/lib/db');
          const exists = await incidentExistsByHash(contentHash);
          
          if (!exists) {
            // Insert into database
            const newIncident = await insertIncident({
              title: incident.title,
              description: incident.description,
              content: incident.content,
              url: incident.url,
              source: incident.source,
              published_at: new Date(incident.published_at),
              content_hash: contentHash,
              region: incident.region,
            });

            // Add analysis
            await updateIncidentAnalysis(newIncident.id, {
              analysis: incident.analysis,
              severity: incident.severity,
              attack_type: incident.attack_type,
              risk_score: incident.risk_score,
            });
          }
        }

        // Re-fetch to get all records including the new ones
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
