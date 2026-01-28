'use client';

import Link from 'next/link';
import { SeverityBadge } from './SeverityBadge';
import { Calendar, ArrowUpRight, Newspaper, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

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
    'Ransomware': 'bg-red-500/10 text-red-400 border-red-500/20',
    'Data Breach': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'Zero-day': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'Phishing': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'APT': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    'Malware': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    'DDoS': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  };

  const getAttackTypeStyle = (type?: string) => {
    if (!type) return 'bg-white/5 text-[var(--text-muted)] border-white/10';
    return attackTypeColors[type] || 'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] border-[var(--accent-blue)]/20';
  };

  return (
    <Link href={`/incident/${incident.id}`} className="block h-full outline-none">
      <motion.div 
        className={`
          relative h-full p-4 sm:p-6 glass-dark rounded-2xl border border-white/5 
          transition-all duration-500 ease-out cursor-pointer group overflow-hidden
          ${isOtherHovered ? 'opacity-40 grayscale-[0.5] scale-[0.98]' : 'opacity-100 grayscale-0 scale-100'}
        `}
        whileHover={{ 
          y: -8,
          borderColor: "rgba(255, 255, 255, 0.15)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(59, 130, 246, 0.1)"
        }}
      >
        {/* Animated Background Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/20 transition-colors" />
        
        <div className="relative z-10 flex flex-col h-full">
          {/* Top Row: Badges and Date */}
          <div className="flex items-start justify-between mb-3 gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <SeverityBadge severity={incident.severity} />
              {incident.attack_type && (
                <span className={`text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-1 rounded-lg border shadow-sm ${getAttackTypeStyle(incident.attack_type)}`}>
                  {incident.attack_type}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[var(--text-muted)] shrink-0 font-mono text-[10px] uppercase tracking-wider bg-white/5 px-2 py-1 rounded-md">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-bold leading-snug mb-2 text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors line-clamp-2">
            {incident.title}
          </h3>

          {/* Summary / Analysis */}
          <div className="text-[var(--text-secondary)] text-sm sm:text-xs line-clamp-3 mb-4 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity flex-grow">
            {analysis?.summary || analysis?.why_it_matters || (
              <div className="flex items-center gap-2 text-[var(--text-muted)] italic">
                <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
                Processing intelligence...
              </div>
            )}
          </div>

          {/* Bottom Row: Source and Read Button */}
          <div className="pt-3 mt-auto border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[var(--accent-blue)]/30 transition-colors">
                <Newspaper className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-blue)] transition-colors" />
              </div>
              <span className="text-[11px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest truncate max-w-[120px]">
                {incident.source}
              </span>
            </div>
            
            <motion.div 
              className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--accent-blue)]"
              animate={isHovered ? { x: 0, opacity: 1 } : { x: 5, opacity: 0.8 }}
            >
              Intelligence
              <ArrowUpRight className="w-3 h-3" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

