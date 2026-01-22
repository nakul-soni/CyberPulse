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
    ChevronRight,
    Search,
    Lock,
    Unlock,
    Database,
    Globe
  } from 'lucide-react';
import Link from 'next/link';
import ReanalyzeButton from '@/components/ReanalyzeButton';

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

      const ensureArray = (val: any) => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string' && val.trim()) {
          if (val.includes(' → ')) return val.split(' → ').map(s => s.trim());
          if (val.includes('→')) return val.split('→').map(s => s.trim());
          return [val];
        }
        return [];
      };

      // Check if it's the new format
      if (rawAnalysis.snapshot) {
        return {
          ...rawAnalysis,
          facts: ensureArray(rawAnalysis.facts),
          root_cause: ensureArray(rawAnalysis.root_cause),
          attack_path: ensureArray(rawAnalysis.attack_path),
          relevance: ensureArray(rawAnalysis.relevance),
          mistakes: ensureArray(rawAnalysis.mistakes).map((m: any) => 
            typeof m === 'string' ? { title: 'Issue identified', explanation: m } : m
          ),
          actions: {
            user: ensureArray(rawAnalysis.actions?.user),
            organization: ensureArray(rawAnalysis.actions?.organization)
          },
          ongoing_risk: {
            current_risk: rawAnalysis.ongoing_risk?.current_risk || 'Unknown',
            what_to_watch: ensureArray(rawAnalysis.ongoing_risk?.what_to_watch)
          }
        };
      }

      // Map old format to new format for display
      return {
        snapshot: {
          title: `🛑 ${incident.title.toUpperCase()}`,
          date: new Date(incident.published_at).toISOString().split('T')[0],
          affected: rawAnalysis.attack_type || 'Unknown',
          severity: rawAnalysis.severity?.toUpperCase() || 'MEDIUM',
          status: 'Resolved'
        },
        executive_summary: rawAnalysis.summary || 'Summary unavailable',
        facts: ensureArray(rawAnalysis.summary || 'Summary unavailable'),
        relevance: ['Enterprises'],
        impact: {
          data: rawAnalysis.why_it_matters || rawAnalysis.impact || 'Unknown',
          operations: 'None reported',
          legal: 'None reported',
          trust: 'Minimal'
        },
        root_cause: ensureArray(rawAnalysis.root_cause || 'Unknown'),
        attack_path: ['Initial Access', 'Technical Exploitation', 'Business Impact'],
        mistakes: ensureArray(rawAnalysis.mistakes).map((m: string) => ({ title: 'Issue identified', explanation: m })),
        actions: {
          user: [],
          organization: ensureArray(rawAnalysis.mitigation)
        },
        ongoing_risk: {
          current_risk: 'Unknown',
          what_to_watch: []
        }
      };
    };

  const analysis = getAnalysis();

  if (!analysis) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6">
        <p className="text-[var(--text-secondary)] mb-4">Intelligence analysis pending...</p>
        <ReanalyzeButton incidentId={incident.id} />
      </div>
    );
  }

    const { snapshot, executive_summary, facts, relevance, impact, root_cause, attack_path, mistakes, actions, ongoing_risk } = analysis;


  const severityColors: Record<string, string> = {
    'LOW': 'text-blue-400',
    'MEDIUM': 'text-amber-400',
    'HIGH': 'text-orange-500',
    'CRITICAL': 'text-red-500'
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent-cyan)]/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/80 backdrop-blur-xl px-4 py-3 sm:px-8 flex items-center justify-between">
        <Link 
          href="/" 
          className="group flex items-center gap-2 text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-all uppercase tracking-widest"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Dashboard</span>
        </Link>
        <div className="flex items-center gap-4">
          <ReanalyzeButton incidentId={incident.id} />
          <a 
            href={incident.url} 
            target="_blank" 
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[var(--accent-blue)] hover:text-[var(--accent-cyan)] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Original Source</span>
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-12">
        
        {/* 1️⃣ INCIDENT SNAPSHOT (TOP SCREEN) */}
        <section className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[var(--accent-blue)] to-[var(--accent-cyan)]" />
          
          <h1 className="text-2xl sm:text-3xl font-black mb-8 tracking-tight leading-tight">
            {snapshot.title}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Date</span>
              </div>
              <p className="text-sm font-mono">{snapshot.date}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <Target className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Affected</span>
              </div>
              <p className="text-sm font-bold">{snapshot.affected}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Severity</span>
              </div>
              <p className={`text-sm font-black ${severityColors[snapshot.severity] || 'text-white'}`}>
                {snapshot.severity}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <Activity className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Status</span>
              </div>
              <p className="text-sm font-bold">{snapshot.status}</p>
            </div>
          </div>
        </section>

        {/* 2️⃣ WHAT ACTUALLY HAPPENED (FACTS ONLY) */}
        <section className="space-y-4">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--accent-cyan)] flex items-center gap-2">
            <History className="w-4 h-4" /> What Actually Happened
          </h2>
          <div className="bg-[var(--bg-secondary)]/30 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-8">
            {executive_summary && (
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-[var(--accent-cyan)]/30 rounded-full" />
                <p className="text-lg sm:text-xl font-medium text-[var(--text-primary)] leading-relaxed italic opacity-90">
                  "{executive_summary}"
                </p>
              </div>
            )}
            <ul className="space-y-4">
              {facts.map((fact: string, i: number) => (
                <li key={i} className="flex gap-4 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)] mt-2 shrink-0" />
                  <p className="text-[var(--text-secondary)] leading-relaxed text-base">{fact}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 3️⃣ WHO SHOULD CARE (RELEVANCE FILTER) */}
        <section className="space-y-4">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--accent-blue)] flex items-center gap-2">
            <User className="w-4 h-4" /> Who Should Care
          </h2>
          <div className="flex flex-wrap gap-3">
            {relevance.map((r: string, i: number) => (
              <div key={i} className="px-4 py-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-primary)] text-xs font-bold text-[var(--text-secondary)] flex items-center gap-2">
                {r.includes('Individual') && <User className="w-3 h-3" />}
                {r.includes('Enterprises') && <Building2 className="w-3 h-3" />}
                {r.includes('Developers') && <Code2 className="w-3 h-3" />}
                {r.includes('Healthcare') && <Stethoscope className="w-3 h-3" />}
                {r.includes('Finance') && <Landmark className="w-3 h-3" />}
                {r}
              </div>
            ))}
          </div>
        </section>

        {/* 4️⃣ IMPACT & DAMAGE */}
        <section className="space-y-6">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Impact & Damage
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl space-y-2">
              <h3 className="text-[9px] font-black uppercase tracking-widest text-red-400">Data</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{impact.data}</p>
            </div>
            <div className="p-6 bg-orange-500/5 border border-orange-500/10 rounded-2xl space-y-2">
              <h3 className="text-[9px] font-black uppercase tracking-widest text-orange-400">Operations</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{impact.operations}</p>
            </div>
            <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-2">
              <h3 className="text-[9px] font-black uppercase tracking-widest text-amber-400">Legal / Compliance</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{impact.legal}</p>
            </div>
            <div className="p-6 bg-purple-500/5 border border-purple-500/10 rounded-2xl space-y-2">
              <h3 className="text-[9px] font-black uppercase tracking-widest text-purple-400">Trust / Reputation</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{impact.trust}</p>
            </div>
          </div>
        </section>

        {/* 5️⃣ ROOT CAUSE (CONDENSED) */}
        <section className="space-y-4">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-500 flex items-center gap-2">
            <Zap className="w-4 h-4" /> Root Cause
          </h2>
          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 sm:p-8 space-y-4">
            {root_cause.map((rc: string, i: number) => (
              <div key={i} className="flex gap-4">
                <span className="text-amber-500 font-mono text-xs font-bold">{i+1}.</span>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{rc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6️⃣ RISK / ATTACK PATH (VISUAL THINKING) */}
        <section className="space-y-6">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--accent-blue)] flex items-center gap-2">
            <Activity className="w-4 h-4" /> Risk / Attack Path
          </h2>
          
          <div className="relative">
            {/* Desktop Horizontal Path */}
            <div className="hidden lg:flex items-start justify-between gap-4 relative">
              {/* Connecting Line */}
              <div className="absolute top-[22px] left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--accent-blue)]/50 via-[var(--accent-cyan)]/50 to-red-500/50 -z-10" />
              
              {attack_path.map((step: string, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-4 text-center group">
                  <div className="w-12 h-12 rounded-xl bg-[var(--bg-card)] border-2 border-[var(--border-primary)] flex items-center justify-center group-hover:border-[var(--accent-cyan)] transition-all shadow-xl relative z-10 bg-black">
                    {i === 0 && <Search className="w-5 h-5 text-[var(--accent-blue)]" />}
                    {i > 0 && i < attack_path.length - 1 && <Unlock className="w-5 h-5 text-[var(--accent-cyan)]" />}
                    {i === attack_path.length - 1 && <AlertTriangle className="w-5 h-5 text-red-500" />}
                    
                    <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center text-[10px] font-bold">
                      {i + 1}
                    </div>
                  </div>
                  <p className="text-xs font-mono font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors px-2">
                    {step}
                  </p>
                </div>
              ))}
            </div>

            {/* Mobile/Tablet Vertical Path */}
            <div className="lg:hidden space-y-4 relative">
              {/* Vertical Connecting Line */}
              <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[var(--accent-blue)]/50 via-[var(--accent-cyan)]/50 to-red-500/50 -z-10" />
              
              {attack_path.map((step: string, i: number) => (
                <div key={i} className="flex items-center gap-6 group">
                  <div className="w-12 h-12 rounded-xl bg-[var(--bg-card)] border-2 border-[var(--border-primary)] flex items-center justify-center group-hover:border-[var(--accent-cyan)] transition-all shadow-xl relative z-10 bg-black shrink-0">
                    {i === 0 && <Search className="w-5 h-5 text-[var(--accent-blue)]" />}
                    {i > 0 && i < attack_path.length - 1 && <Unlock className="w-5 h-5 text-[var(--accent-cyan)]" />}
                    {i === attack_path.length - 1 && <AlertTriangle className="w-5 h-5 text-red-500" />}
                    
                    <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center text-[10px] font-bold">
                      {i + 1}
                    </div>
                  </div>
                  <div className="bg-[var(--bg-card)]/50 border border-[var(--border-primary)] p-4 rounded-xl flex-1 group-hover:border-[var(--accent-cyan)]/30 transition-all">
                    <p className="text-xs font-mono font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                      {step}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7️⃣ WHAT WENT WRONG (FORMERLY “MISTAKES”) */}
        <section className="space-y-4">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-red-500 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> What Went Wrong
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {mistakes.map((m: any, i: number) => (
              <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-primary)] p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4 group hover:border-red-500/30 transition-colors">
                <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-red-400 font-black text-xs">{i+1}</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-1 group-hover:text-red-400 transition-colors">{m.title}</h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{m.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8️⃣ WHAT USERS SHOULD DO (ACTIONABLE ONLY) */}
        <section className="space-y-6">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> What Users Should Do
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                <User className="w-3 h-3" /> If you are a user
              </h3>
              <div className="space-y-2">
                {actions.user.map((a: string, i: number) => (
                  <div key={i} className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-xs text-[var(--text-secondary)] flex gap-3">
                    <span className="text-emerald-500">•</span> {a}
                  </div>
                ))}
                {actions.user.length === 0 && <p className="text-xs text-[var(--text-muted)] italic">No specific actions for individual users.</p>}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-blue)] flex items-center gap-2">
                <Building2 className="w-3 h-3" /> If you are an organization
              </h3>
              <div className="space-y-2">
                {actions.organization.map((a: string, i: number) => (
                  <div key={i} className="p-4 bg-[var(--accent-blue)]/5 border border-[var(--accent-blue)]/10 rounded-xl text-xs text-[var(--text-secondary)] flex gap-3">
                    <span className="text-[var(--accent-blue)]">•</span> {a}
                  </div>
                ))}
                {actions.organization.length === 0 && <p className="text-xs text-[var(--text-muted)] italic">No specific actions for organizations.</p>}
              </div>
            </div>
          </div>
        </section>

        {/* 9️⃣ ONGOING RISK & NEXT STEPS */}
        <section className="bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-8 sm:p-10 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/20">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-orange-400 mb-1">Ongoing Risk</h2>
              <p className="text-xl font-bold">{ongoing_risk.current_risk}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">What to Watch</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ongoing_risk.what_to_watch.map((item: string, i: number) => (
                <div key={i} className="px-4 py-3 bg-black/20 rounded-lg border border-white/5 text-xs text-[var(--text-secondary)] flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Aesthetic Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-12 border-t border-[var(--border-primary)] mt-12 text-center space-y-4">
        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.5em]">End of Intelligence Briefing</p>
        <div className="flex justify-center gap-6 opacity-30">
          <ShieldAlert className="w-4 h-4" />
          <Activity className="w-4 h-4" />
          <Target className="w-4 h-4" />
        </div>
      </footer>
    </div>
  );
}
