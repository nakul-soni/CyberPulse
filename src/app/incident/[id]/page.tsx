import { notFound } from 'next/navigation';
import { getIncidentById } from '@/lib/db';
import { IncidentDetailClient } from '@/components/IncidentDetailClient';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { performAnalysis, isAnalysisMissing } from '@/lib/analysis';

export const revalidate = 0;

export default async function IncidentDetailPage({ params }: { params: { id: string } }) {
  try {
    let incident = await getIncidentById(params.id);

    if (!incident) {
      notFound();
    }

    // On-demand analysis if missing
    if (isAnalysisMissing(incident.analysis)) {
      try {
        console.log(`[On-Demand Analysis] Starting for incident ${params.id}`);
        const analyzedIncident = await performAnalysis(incident);
        if (analyzedIncident) {
          incident = analyzedIncident;
        }
      } catch (analysisError) {
        console.error(`[On-Demand Analysis] Failed for incident ${params.id}:`, analysisError);
        // We continue anyway, the client will show the "pending" state or partial data
      }
    }

    const serializedIncident = {
      ...incident,
      published_at: incident.published_at instanceof Date 
        ? incident.published_at.toISOString() 
        : incident.published_at,
    };

    return <IncidentDetailClient incident={serializedIncident} />;
  } catch (error: any) {
    console.error('Error in IncidentDetailPage:', error);
    
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Intelligence Retrieval Failed</h1>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              We encountered a secure connection timeout while fetching this intelligence briefing. This usually happens when the database is under high load.
            </p>
          </div>
          <div className="pt-4 flex flex-col gap-3">
            <button 
              onClick={() => {}} // This is a server component, but we can't add interactivity here easily without making it a client component. 
              // However, the user can just refresh the page.
              className="w-full py-3 bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
              // In reality, since this is a server component, the "Refresh" would be a link to the same page
            >
              <a href={`/incident/${params.id}`}>Try Again</a>
            </button>
            <Link 
              href="/"
              className="flex items-center justify-center gap-2 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-colors uppercase tracking-widest"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
