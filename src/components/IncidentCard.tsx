'use client';

import Link from 'next/link';
import { SeverityBadge } from './SeverityBadge';
import { Calendar, ArrowUpRight, Newspaper } from 'lucide-react';

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
  isHovered?: boolean;
  isOtherHovered?: boolean;
}

export function IncidentCard({ incident, isHovered = false, isOtherHovered = false }: IncidentCardProps) {
  const formattedDate = new Date(incident.published_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = new Date(incident.published_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const analysis = typeof incident.analysis === 'string' 
    ? JSON.parse(incident.analysis) 
    : incident.analysis;

  const attackTypeColors: Record<string, string> = {
    'Ransomware': 'bg-red-500/10 text-red-400 border-red-500/20',
    'Data Breach': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'Zero-day': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'Phishing': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'APT': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    'Malware': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    'DDoS': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  };

  const getAttackTypeStyle = (type?: string) => {
    if (!type) return 'bg-[var(--bg-card-hover)] text-[var(--text-muted)] border-[var(--border-primary)]';
    return attackTypeColors[type] || 'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] border-[var(--accent-blue)]/20';
  };

  return (
    <Link href={`/incident/${incident.id}`} className="block h-full">
      <div 
        className={`
          relative h-full p-4 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl 
          transition-all duration-200 ease-out cursor-pointer group overflow-hidden
          ${isHovered 
            ? 'scale-[1.02] z-20 shadow-xl shadow-[var(--accent-blue)]/10 border-[var(--accent-blue)]/50' 
            : isOtherHovered 
              ? 'scale-[0.98] opacity-60' 
              : 'hover:border-[var(--accent-blue)]/30'}
        `}
        style={{
          boxShadow: isHovered 
            ? '0 0 25px rgba(59, 130, 246, 0.12), 0 15px 30px rgba(0, 0, 0, 0.3)' 
            : undefined
        }}
      >
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-blue)]/5 to-transparent pointer-events-none" />
        )}
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-2.5 gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <SeverityBadge severity={incident.severity} />
              {incident.attack_type && (
                <span className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border ${getAttackTypeStyle(incident.attack_type)}`}>
                  {incident.attack_type}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[var(--text-muted)] shrink-0">
              <Calendar className="w-2.5 h-2.5" />
              <span className="text-[9px] font-mono uppercase tracking-tighter">{formattedDate}</span>
            </div>
          </div>

          <h3 className={`text-[15px] font-bold leading-tight mb-2 line-clamp-2 transition-colors duration-200 ${isHovered ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-primary)]'}`}>
            {incident.title}
          </h3>

          <p className="text-[var(--text-secondary)] text-xs line-clamp-2 mb-3 leading-relaxed">
            {analysis?.summary || analysis?.why_it_matters || (
              <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                <span className="w-1.5 h-1.5 bg-[var(--accent-cyan)] rounded-full animate-pulse" />
                Analyzing...
              </span>
            )}
          </p>

          <div className="pt-3 border-t border-[var(--border-primary)] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Newspaper className="w-3 h-3 text-[var(--text-muted)]" />
              <span className="text-[10px] font-bold text-[var(--text-muted)] bg-[var(--bg-card-hover)] px-1.5 py-0.5 rounded uppercase tracking-tight">
                {incident.source}
              </span>
            </div>
            <span 
              className={`
                flex items-center gap-1 text-[10px] font-black uppercase tracking-widest transition-all duration-200
                ${isHovered ? 'text-[var(--accent-cyan)] translate-x-0' : 'text-[var(--accent-blue)] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}
              `}
            >
              Details
              <ArrowUpRight className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
