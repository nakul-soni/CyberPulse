import { DashboardClient } from '@/components/DashboardClient';
import { getIncidents } from '@/lib/db';

export const revalidate = 0; // Disable cache for demo purposes

export default async function DashboardPage() {
  let incidents: any[] = [];
  let error: Error | null = null;

  try {
    const result = await getIncidents({ page: 1, limit: 50, todayOnly: true });
    incidents = result.incidents;
  } catch (err: any) {
    error = err;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-red-50 border border-red-100 p-6 rounded-xl text-red-800">
          <p className="font-semibold">Error loading incidents</p>
          <p className="text-sm opacity-80">{error.message}</p>
        </div>
      </div>
    );
  }

  return <DashboardClient initialIncidents={incidents} />;
}
