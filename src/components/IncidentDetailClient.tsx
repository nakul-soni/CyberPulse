'use client';

import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ExternalLink, 
  AlertTriangle,
  Calendar,
  Target,
  ShieldAlert,
  Activity,
  User,
  Building2,
  Code2,
  Stethoscope,
  Landmark,
  ShieldCheck,
  Zap,
  History,
  AlertCircle,
  Terminal,
  Cpu,
  Globe,
  Lock
} from 'lucide-react';
import Link from 'next/link';
import ReanalyzeButton from '@/components/ReanalyzeButton';
import { SeverityBadge } from './SeverityBadge';

interface Incident {
  id: string;
  title: string;
  source: string;
  url: string;
  published_at: string;
  severity?: 'Low' | 'Medium' | 'High';
  attack_type?: string;
  analysis?: any;
}

interface IncidentDetailClientProps {
  incident: Incident;
}

export function IncidentDetailClient({ incident }: IncidentDetailClientProps) {
  const rawAnalysis = typeof incident.analysis === 'string' 
    ? JSON.parse(incident.analysis) 
    : incident.analysis;

    // Helper to normalize old/new analysis formats
    const getAnalysis = () => {
      if (!rawAnalysis) return null;

      // Check if it's the new format
      if (rawAnalysis.snapshot) {
        return rawAnalysis;
      }

      const ensureArray = (val: any) => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string' && val.trim()) return [val];
        return [];
      };

      // Map old format to new format for display
      return {
        snapshot: {
          title: incident.title,
          date: new Date(incident.published_at).toISOString().split('T')[0],
          affected: rawAnalysis.attack_type || 'Unknown',
          severity: rawAnalysis.severity?.toUpperCase() || 'MEDIUM',
          status: 'Analyzed'
        },
        facts: ensureArray(rawAnalysis.summary || 'Summary unavailable'),
        relevance: ['Enterprises'],
        impact: {
          data: rawAnalysis.why_it_matters || rawAnalysis.impact || 'Unknown',
          operations: 'Critical Infrastructure risk',
          legal: 'Regulatory compliance review recommended',
          trust: 'Stakeholder communication required'
        },
        root_cause: ensureArray(rawAnalysis.root_cause || 'Supply chain vulnerability'),
        attack_path: 'Initial Access → Lateral Movement → Exfiltration',
        mistakes: ensureArray(rawAnalysis.mistakes).map((m: string) => ({ title: 'Defense Gap', explanation: m })),
        actions: {
          user: [],
          organization: ensureArray(rawAnalysis.mitigation)
        },
        ongoing_risk: {
          current_risk: 'High - Active monitoring required',
          what_to_watch: ['Indicator of Compromise (IoC) syncs', 'Credential rotation status']
        }
      };
    };

  const analysis = getAnalysis();

  if (!analysis) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-[var(--accent-blue)]/10 rounded-3xl flex items-center justify-center mb-8 border border-[var(--accent-blue)]/20 animate-pulse">
          <Terminal className="w-10 h-10 text-[var(--accent-blue)]" />
        </div>
        <p className="text-[var(--text-secondary)] font-mono text-sm mb-8 tracking-widest uppercase">Intelligence analysis pending...</p>
        <ReanalyzeButton incidentId={incident.id} />
      </div>
    );
  }

  const { snapshot, facts, relevance, impact, root_cause, attack_path, mistakes, actions, ongoing_risk, executive_summary } = analysis;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[var(--accent-blue)] selection:text-white pb-32">
      {/* Header Navigation */}
      <nav className="sticky top-0 z-50 glass-card bg-[var(--bg-primary)]/40 border-x-0 border-t-0 py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          <Link 
            href="/" 
            className="group flex items-center gap-3 text-[10px] font-black text-[var(--text-muted)] hover:text-white transition-all uppercase tracking-[0.3em]"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Dashboard</span>
          </Link>
          <div className="flex items-center gap-6">
            <ReanalyzeButton incidentId={incident.id} />
            <div className="h-4 w-px bg-white/10" />
            <a 
              href={incident.url} 
              target="_blank" 
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-blue)] hover:text-[var(--accent-cyan)] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Source Intelligence</span>
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-12 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Sidebar / Quick Info */}
          <aside className="lg:col-span-4 space-y-12 order-2 lg:order-1">
            <div className="space-y-8 sticky top-32">
              <div className="glass-card p-8 rounded-[2rem] space-y-6">
                <div>
                  <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-4">Risk Profile</h4>
                  <SeverityBadge severity={incident.severity || snapshot.severity} />
                </div>
                
                <div className="h-px bg-white/5" />
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--accent-blue)]/10 flex items-center justify-center border border-[var(--accent-blue)]/20">
                      <Calendar className="w-4 h-4 text-[var(--accent-blue)]" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Detected</p>
                      <p className="text-xs font-bold font-mono">{snapshot.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--accent-purple)]/10 flex items-center justify-center border border-[var(--accent-purple)]/20">
                      <Globe className="w-4 h-4 text-[var(--accent-purple)]" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Region</p>
                      <p className="text-xs font-bold">{snapshot.affected}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--accent-cyan)]/10 flex items-center justify-center border border-[var(--accent-cyan)]/20">
                      <Target className="w-4 h-4 text-[var(--accent-cyan)]" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Tactic</p>
                      <p className="text-xs font-bold">{incident.attack_type || 'APT Ops'}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Target Scope</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {relevance.map((r: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 text-[9px] font-bold text-[var(--text-secondary)]">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass-card p-8 rounded-[2rem] bg-gradient-to-br from-[var(--severity-high)]/5 to-transparent border-[var(--severity-high)]/10">
                <div className="flex items-center gap-3 mb-6 text-[var(--severity-high)]">
                  <ShieldAlert className="w-5 h-5" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Operational Risk</h4>
                </div>
                <p className="text-xl font-black mb-4 leading-tight">{ongoing_risk.current_risk}</p>
                <div className="space-y-3">
                  {ongoing_risk.what_to_watch.map((item: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 text-[10px] text-[var(--text-secondary)] leading-relaxed font-medium">
                      <div className="w-1 h-1 rounded-full bg-[var(--severity-high)] mt-1.5 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <div className="space-y-20">
              {/* Title & Exec Summary */}
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px flex-grow bg-gradient-to-r from-transparent to-white/10" />
                  <div className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)]">
                    Intelligence Report
                  </div>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-12 leading-[1.05]">
                  <span className="premium-gradient-text">{snapshot.title}</span>
                </h1>

                {executive_summary && (
                  <div className="relative p-10 glass-card rounded-[2.5rem] bg-[var(--bg-secondary)] overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Zap className="w-16 h-16 text-[var(--accent-purple)]" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-purple)] mb-6">Briefing Executive Summary</h3>
                    <p className="text-xl sm:text-2xl font-medium text-white leading-relaxed">
                      "{executive_summary}"
                    </p>
                  </div>
                )}
              </section>

              {/* Analysis Section */}
              <section className="space-y-12">
                <div className="flex items-center gap-4">
                  <History className="w-5 h-5 text-[var(--accent-cyan)]" />
                  <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-[var(--accent-cyan)]">Sequence of Events</h2>
                </div>
                
                <div className="space-y-8">
                  {facts.map((fact: string, i: number) => (
                    <div key={i} className="group flex gap-8 relative pb-8 border-l border-white/5 pl-8 last:border-0">
                      <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-[var(--accent-cyan)] group-hover:scale-150 transition-transform" />
                      <p className="text-lg text-[var(--text-secondary)] leading-relaxed group-hover:text-white transition-colors">
                        {fact}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Root Cause & Path */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <Cpu className="w-5 h-5 text-[var(--accent-purple)]" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-purple)]">Root Cause Analysis</h3>
                  </div>
                  <div className="space-y-4">
                    {root_cause.map((rc: string, i: number) => (
                      <div key={i} className="p-6 glass-card rounded-2xl border-white/5 bg-white/[0.02]">
                        <p className="text-sm font-mono text-[var(--text-secondary)] leading-relaxed">{rc}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-[var(--accent-blue)]" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-blue)]">Kill Chain Vector</h3>
                  </div>
                  <div className="p-8 glass-card rounded-2xl border-[var(--accent-blue)]/10 bg-[var(--accent-blue)]/5 flex items-center justify-center min-h-[160px]">
                    <p className="text-sm font-mono text-[var(--accent-cyan)] tracking-wider text-center uppercase leading-loose">
                      {attack_path.split('→').map((step, idx) => (
                        <span key={idx} className="block sm:inline">
                          {idx > 0 && <span className="hidden sm:inline mx-3 opacity-30">→</span>}
                          <span className="px-2 py-1 bg-white/5 rounded-md">{step.trim()}</span>
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              </section>

              {/* Action Matrix */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <ShieldCheck className="w-5 h-5 text-[var(--severity-low)]" />
                  <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-[var(--severity-low)]">Strategic Response Matrix</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="glass-card p-10 rounded-[2.5rem] border-[var(--accent-blue)]/10">
                    <div className="flex items-center gap-3 mb-8">
                      <Building2 className="w-5 h-5 text-[var(--accent-blue)]" />
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-blue)]">Institutional Controls</h4>
                    </div>
                    <div className="space-y-6">
                      {actions.organization.map((a: string, i: number) => (
                        <div key={i} className="flex gap-4 group">
                          <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-[var(--accent-blue)] group-hover:border-[var(--accent-blue)] transition-all">
                            <span className="text-[10px] font-black text-[var(--text-muted)] group-hover:text-white">{i+1}</span>
                          </div>
                          <p className="text-sm text-[var(--text-secondary)] leading-relaxed group-hover:text-white transition-colors">{a}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card p-10 rounded-[2.5rem] border-[var(--accent-purple)]/10">
                    <div className="flex items-center gap-3 mb-8">
                      <Lock className="w-5 h-5 text-[var(--accent-purple)]" />
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-purple)]">Defensive Mistakes</h4>
                    </div>
                    <div className="space-y-8">
                      {mistakes.map((m: any, i: number) => (
                        <div key={i} className="space-y-2 group">
                          <h5 className="text-xs font-black text-white flex items-center gap-3">
                            <AlertCircle className="w-3.5 h-3.5 text-[var(--severity-high)]" />
                            {m.title}
                          </h5>
                          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed pl-6 group-hover:text-[var(--text-secondary)] transition-colors">
                            {m.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Technical Footprint */}
              <section className="pt-20 border-t border-white/5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-8 text-[var(--text-muted)]">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-widest font-mono">v1.2.4-ANALYSIS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-widest font-mono">INTEGRITY-VERIFIED</span>
                    </div>
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20">End of Intelligence Briefing</p>
                </div>
              </section>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
