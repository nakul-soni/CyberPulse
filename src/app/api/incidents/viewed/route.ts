import { NextRequest, NextResponse } from 'next/server';
import { updateIncidentsViewed } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid incident IDs' },
        { status: 400 }
      );
    }

    // Update last_viewed_at for these incidents
    await updateIncidentsViewed(ids);

    return NextResponse.json({ success: true, updated: ids.length });
  } catch (error) {
    console.error('Error updating viewed incidents:', error);
    return NextResponse.json(
      { error: 'Failed to update viewed incidents' },
      { status: 500 }
    );
  }
}
