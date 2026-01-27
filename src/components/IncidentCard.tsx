'use client';

import Link from 'next/link';
import { SeverityBadge } from './SeverityBadge';
import { Calendar, ArrowUpRight, Newspaper, Cpu, Target } from 'lucide-react';

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

  const analysis = typeof incident.analysis === 'string' 
    ? JSON.parse(incident.analysis) 
    : incident.analysis;

  const attackTypeColors: Record<string, string> = {
    'Ransomware': 'from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/20',
    'Data Breach': 'from-orange-500/20 to-orange-500/5 text-orange-400 border-orange-500/20',
    'Zero-day': 'from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/20',
    'Phishing': 'from-yellow-500/20 to-yellow-500/5 text-yellow-400 border-yellow-500/20',
    'APT': 'from-pink-500/20 to-pink-500/5 text-pink-400 border-pink-500/20',
    'Malware': 'from-red-500/20 to-red-500/5 text-red-400 border-red-500/20',
    'DDoS': 'from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/20',
  };

  const getAttackTypeStyle = (type?: string) => {
    if (!type) return 'from-white/10 to-white/5 text-[var(--text-muted)] border-white/10';
    return attackTypeColors[type] || 'from-[var(--accent-blue)]/20 to-[var(--accent-blue)]/5 text-[var(--accent-blue)] border-[var(--accent-blue)]/20';
  };

  return (
    <Link href={`/incident/${incident.id}`} className="block h-full transition-transform duration-300 active:scale-[0.98]">
      <div 
        className={`
          glass-card glass-card-hover h-full p-8 rounded-[2.5rem] flex flex-col relative overflow-hidden group
          ${isHovered ? 'z-20 scale-[1.02]' : isOtherHovered ? 'opacity-40 blur-[2px]' : ''}
        `}
      >
        {/* Decorative corner elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[var(--accent-blue)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[var(--accent-purple)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Badge Row */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <SeverityBadge severity={incident.severity} />
              {incident.attack_type && (
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border bg-gradient-to-br ${getAttackTypeStyle(incident.attack_type)}`}>
                  {incident.attack_type}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[var(--text-muted)] group-hover:text-white transition-colors">
              <Calendar className="w-3 h-3" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-tighter">{formattedDate}</span>
            </div>
          </div>

          {/* Title Area */}
          <div className="mb-6">
            <h3 className={`text-2xl font-black leading-tight tracking-tight mb-4 transition-colors duration-300 ${isHovered ? 'text-[var(--accent-cyan)]' : 'text-white'}`}>
              {incident.title}
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg border border-white/10">
                <Newspaper className="w-3 h-3 text-[var(--text-muted)]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">{incident.source}</span>
              </div>
            </div>
          </div>

          {/* Content Preview */}
          <div className="flex-grow mb-8 relative">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--accent-blue)]/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="pl-6 group-hover:pl-8 transition-all duration-300">
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed line-clamp-3 font-medium">
                {analysis?.summary || analysis?.why_it_matters || (
                  <span className="flex items-center gap-3 italic text-[var(--text-muted)]">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-cyan)] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-cyan)]"></span>
                    </span>
                    Analyzing signals...
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Footer Area */}
          <div className="pt-6 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[var(--accent-blue)]/30 group-hover:bg-[var(--accent-blue)]/5 transition-all">
                <Target className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-blue)]" />
              </div>
              <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[var(--accent-purple)]/30 group-hover:bg-[var(--accent-purple)]/5 transition-all">
                <Cpu className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-purple)]" />
              </div>
            </div>

            <div 
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300
                ${isHovered 
                  ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                  : 'bg-white/5 text-[var(--text-muted)] border border-white/10'
                }
              `}
            >
              Analyze
              <ArrowUpRight className={`w-3 h-3 transition-transform duration-300 ${isHovered ? 'translate-x-0.5 -translate-y-0.5' : ''}`} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
