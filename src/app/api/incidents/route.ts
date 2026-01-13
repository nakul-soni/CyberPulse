import { NextResponse } from 'next/server';
import { getIncidents } from '@/lib/db';

export const dynamic = 'force-dynamic';

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

    const result = await getIncidents({
      page,
      limit,
      severity,
      attackType,
      search: query,
      todayOnly,
      date,
    });

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
