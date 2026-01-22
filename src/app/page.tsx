import { DashboardClient } from '@/components/DashboardClient';
import { getIncidents, getLastIngestionLog, isIngestionRunning } from '@/lib/db';
import { AlertTriangle } from 'lucide-react';

export const revalidate = 0;

export default async function DashboardPage() {
  let incidents: any[] = [];
  let error: Error | null = null;

  try {
    // 1. Check for background ingestion
    const lastLog = await getLastIngestionLog();
    const ONE_HOUR = 1 * 60 * 60 * 1000;
    const isOverdue = !lastLog || (Date.now() - new Date(lastLog.completed_at!).getTime() > ONE_HOUR);
    
    // Only trigger if overdue AND not already running
    if (isOverdue && !(await isIngestionRunning())) {
      // Trigger background worker (ingestion + analysis) without awaiting it
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      fetch(`${baseUrl}/api/worker`, {
        headers: {
          'Authorization': `Bearer ${process.env.CRON_SECRET}`
        }
      }).catch(err => console.error('Background worker failed to trigger:', err));
    }

    // 2. Fetch incidents for display
    const result = await getIncidents({ page: 1, limit: 200, todayOnly: true });
    incidents = result.incidents;
  } catch (err: any) {
    error = err;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-[var(--severity-high)]/10 border border-[var(--severity-high)]/30 p-6 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-[var(--severity-high)]/20 rounded-lg flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-[var(--severity-high)]" />
            </div>
            <div>
              <p className="font-semibold text-[var(--severity-high)] mb-1">Error loading incidents</p>
              <p className="text-sm text-[var(--text-secondary)]">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <DashboardClient initialIncidents={incidents} />;
}
