import Link from 'next/link';
import { SeverityBadge } from './SeverityBadge';
import { ShieldAlert, Calendar, ExternalLink } from 'lucide-react';

interface IncidentCardProps {
  incident: {
    id: string;
    title: string;
    source: string;
    published_at: string;
    severity?: 'Low' | 'Medium' | 'High';
    attack_type?: string;
    analysis?: any;
  };
}

export function IncidentCard({ incident }: IncidentCardProps) {
  const formattedDate = new Date(incident.published_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Parse analysis if it's a string
  const analysis = typeof incident.analysis === 'string' 
    ? JSON.parse(incident.analysis) 
    : incident.analysis;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <SeverityBadge severity={incident.severity} />
          {incident.attack_type && (
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
              {incident.attack_type}
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formattedDate}
        </span>
      </div>

      <Link href={`/incident/${incident.id}`} className="block group-hover:text-blue-600 transition-colors">
        <h3 className="text-lg font-semibold text-slate-900 leading-snug mb-2">
          {incident.title}
        </h3>
      </Link>

      <p className="text-slate-600 text-sm line-clamp-2 mb-4">
        {analysis?.summary || analysis?.why_it_matters || 'Processing analysis...'}
      </p>

      <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
          {incident.source}
        </span>
        <Link 
          href={`/incident/${incident.id}`}
          className="text-xs font-semibold text-blue-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          View Analysis
          <ShieldAlert className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
