import { NextResponse } from 'next/server';
import { IngestionPipeline } from '@/lib/ingestion-pipeline';

export async function GET() {
  try {
    const pipeline = new IngestionPipeline();
    const stats = await pipeline.run();

    return NextResponse.json({
      success: true,
      stats: {
        itemsFetched: stats.itemsFetched,
        itemsNew: stats.itemsNew,
        itemsDuplicate: stats.itemsDuplicate,
        itemsFailed: stats.itemsFailed,
        itemsAnalyzed: stats.itemsAnalyzed,
      },
      message: 'Ingestion completed successfully',
    });
  } catch (error: any) {
    console.error('Ingestion error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Ingestion failed',
      },
      { status: 500 }
    );
  }
}
