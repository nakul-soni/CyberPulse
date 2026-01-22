import { NextRequest, NextResponse } from 'next/server';
import { runWorkerCycle } from '@/lib/worker-utils';

export const maxDuration = 60; // 1 minute timeout for Vercel/Render Pro

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  // Basic security check
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runWorkerCycle();

    return NextResponse.json({
      success: true,
      ...result,
      message: 'Worker cycle completed successfully',
    });
  } catch (error: any) {
    console.error('Worker cycle failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Worker cycle failed',
      },
      { status: 500 }
    );
  }
}
