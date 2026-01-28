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
  Sparkles
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 15
    }
  }
};

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
          title: `🛑 ${incident.title.toUpperCase()}`,
          date: new Date(incident.published_at).toISOString().split('T')[0],
          affected: rawAnalysis.attack_type || 'Unknown',
          severity: rawAnalysis.severity?.toUpperCase() || 'MEDIUM',
          status: 'Resolved'
        },
        facts: ensureArray(rawAnalysis.summary || 'Summary unavailable'),
        relevance: ['Enterprises'],
        impact: {
          data: rawAnalysis.why_it_matters || rawAnalysis.impact || 'Unknown',
          operations: 'None reported',
          legal: 'None reported',
          trust: 'Minimal'
        },
        root_cause: ensureArray(rawAnalysis.root_cause || 'Unknown'),
        attack_path: 'Launch → Weak Control → Impact',
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
        <div className="w-16 h-16 border-4 border-[var(--accent-blue)] border-t-transparent rounded-full animate-spin mb-6" />
        <p className="text-[var(--text-secondary)] font-mono text-sm tracking-widest animate-pulse">Scanning Intelligence Databases...</p>
        <div className="mt-8">
          <ReanalyzeButton incidentId={incident.id} />
        </div>
      </div>
    );
  }

  const { snapshot, facts, relevance, impact, root_cause, attack_path, mistakes, actions, ongoing_risk, executive_summary } = analysis;

  const severityColors: Record<string, string> = {
    'LOW': 'text-emerald-400',
    'MEDIUM': 'text-amber-400',
    'HIGH': 'text-orange-500',
    'CRITICAL': 'text-red-500'
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[var(--accent-cyan)]/30">
      {/* Background Decor */}
      <div className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      <div className="fixed inset-0 bg-noise opacity-[0.02] pointer-events-none" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[var(--bg-primary)]/80 backdrop-blur-2xl px-4 py-3 sm:px-6 flex items-center justify-between">
        <Link 
          href="/" 
          className="group flex items-center gap-2.5 text-[10px] font-mono font-bold text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-all uppercase tracking-[0.2em]"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
          <span>Dashboard</span>
        </Link>
        <div className="flex items-center gap-6">
          <ReanalyzeButton incidentId={incident.id} />
          <a 
            href={incident.url} 
            target="_blank" 
            className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--accent-blue)] hover:text-[var(--accent-cyan)] transition-all group"
          >
            <span className="hidden sm:inline">Source Archive</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </header>

      <motion.main 
        className="relative max-w-5xl mx-auto px-4 py-8 sm:py-16 space-y-16 sm:space-y-24"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        
        {/* 1️⃣ INCIDENT SNAPSHOT */}
        <motion.section variants={sectionVariants}>
          <div className="relative glass-dark rounded-3xl p-6 sm:p-12 border border-white/5 overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[var(--accent-blue)] via-[var(--accent-purple)] to-[var(--accent-cyan)]" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full" />
            
            <motion.h1 
              className="text-2xl sm:text-4xl font-black mb-8 tracking-tight leading-[1.1] sm:max-w-4xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {snapshot.title}
            </motion.h1>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
              {[
                { label: 'Date', value: snapshot.date, icon: Calendar, color: 'text-blue-400' },
                { label: 'Affected', value: snapshot.affected, icon: Target, color: 'text-purple-400' },
                { label: 'Severity', value: snapshot.severity, icon: ShieldAlert, color: severityColors[snapshot.severity] || 'text-white' },
                { label: 'Status', value: snapshot.status, icon: Activity, color: 'text-cyan-400' },
              ].map((item, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <item.icon className="w-4 h-4" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]">{item.label}</span>
                  </div>
                  <p className={`text-base sm:text-lg font-bold tracking-tight ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 1.5️⃣ EXECUTIVE SUMMARY */}
        {executive_summary && (
          <motion.section variants={sectionVariants} className="space-y-8">
            <h2 className="text-[11px] font-mono font-bold uppercase tracking-[0.4em] text-[var(--accent-purple)] flex items-center gap-3">
              <Sparkles className="w-5 h-5" /> Executive Intelligence
            </h2>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-purple)]/20 to-transparent blur-3xl opacity-30" />
              <div className="relative glass-dark border-l-[6px] border-[var(--accent-purple)] p-6 sm:p-10 rounded-r-3xl rounded-l-lg shadow-xl">
                <p className="text-lg sm:text-2xl font-bold text-[var(--text-primary)] leading-relaxed italic opacity-90">
                  "{executive_summary}"
                </p>
              </div>
            </div>
          </motion.section>
        )}

        {/* 2️⃣ WHAT ACTUALLY HAPPENED */}
        <motion.section variants={sectionVariants} className="space-y-8">
          <h2 className="text-[11px] font-mono font-bold uppercase tracking-[0.4em] text-[var(--accent-cyan)] flex items-center gap-3">
            <History className="w-5 h-5" /> Timeline Analysis
          </h2>
          <div className="glass-dark border border-white/5 rounded-3xl p-6 sm:p-10 space-y-8">
            {facts.map((fact: string, i: number) => (
              <div key={i} className="flex gap-8 items-start group">
                <div className="flex flex-col items-center shrink-0 mt-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-cyan)] shadow-[0_0_10px_var(--accent-cyan)] group-hover:scale-150 transition-transform" />
                  {i !== facts.length - 1 && <div className="w-px h-16 bg-gradient-to-b from-[var(--accent-cyan)]/50 to-transparent mt-2" />}
                </div>
                <p className="text-[var(--text-secondary)] leading-relaxed text-base sm:text-lg">{fact}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 3️⃣ IMPACT & DAMAGE */}
        <motion.section variants={sectionVariants} className="space-y-10">
          <h2 className="text-[11px] font-mono font-bold uppercase tracking-[0.4em] text-red-400 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" /> Blast Radius
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { label: 'Data Integrity', value: impact.data, color: 'red', icon: ShieldAlert },
              { label: 'Operational Status', value: impact.operations, color: 'orange', icon: Zap },
              { label: 'Legal Liability', value: impact.legal, color: 'amber', icon: Landmark },
              { label: 'Market Reputation', value: impact.trust, color: 'purple', icon: User },
            ].map((item, i) => (
              <div key={i} className={`p-6 sm:p-8 bg-${item.color}-500/5 border border-${item.color}-500/10 rounded-2xl space-y-4 hover:bg-${item.color}-500/10 transition-colors group`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-[10px] font-mono font-bold uppercase tracking-widest text-${item.color}-400`}>{item.label}</h3>
                  <item.icon className={`w-4 h-4 text-${item.color}-400/50 group-hover:text-${item.color}-400 transition-colors`} />
                </div>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 4️⃣ ACTIONABLE STEPS */}
        <motion.section variants={sectionVariants} className="space-y-10">
          <h2 className="text-[11px] font-mono font-bold uppercase tracking-[0.4em] text-emerald-400 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5" /> Mitigation Protocol
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-3 px-4">
                <User className="w-4 h-4" /> Personal Defense
              </h3>
              <div className="space-y-3">
                {actions.user.map((a: string, i: number) => (
                  <div key={i} className="p-4 glass-dark border border-emerald-500/10 rounded-xl text-xs sm:text-sm text-[var(--text-secondary)] flex gap-4 items-start group hover:border-emerald-500/30 transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0 group-hover:scale-125 transition-transform" /> 
                    {a}
                  </div>
                ))}
                {actions.user.length === 0 && <p className="text-sm text-[var(--text-muted)] italic px-4">No specific end-user actions required.</p>}
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--accent-blue)] flex items-center gap-3 px-4">
                <Building2 className="w-4 h-4" /> Enterprise Response
              </h3>
              <div className="space-y-3">
                {actions.organization.map((a: string, i: number) => (
                  <div key={i} className="p-4 glass-dark border border-[var(--accent-blue)]/10 rounded-xl text-xs sm:text-sm text-[var(--text-secondary)] flex gap-4 items-start group hover:border-[var(--accent-blue)]/30 transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)] mt-2 shrink-0 group-hover:scale-125 transition-transform" /> 
                    {a}
                  </div>
                ))}
                {actions.organization.length === 0 && <p className="text-sm text-[var(--text-muted)] italic px-4">No enterprise-level mitigation reported.</p>}
              </div>
            </div>
          </div>
        </motion.section>

        {/* 5️⃣ RISK PROFILE */}
        <motion.section variants={sectionVariants}>
          <div className="relative bg-gradient-to-br from-[#0d0d14] to-[#050508] border border-white/5 rounded-3xl p-6 sm:p-12 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-full h-full bg-grid-pattern opacity-10" />
            <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-orange-500/5 blur-[120px] rounded-full" />
            
            <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-12">
              <div className="shrink-0 w-24 h-24 sm:w-32 sm:h-32 bg-orange-500/10 rounded-[32px] flex items-center justify-center border border-orange-500/20 shadow-2xl shadow-orange-500/10">
                <AlertTriangle className="w-10 h-10 sm:w-16 sm:h-16 text-orange-400" />
              </div>
              <div className="flex-1 space-y-4">
                <h2 className="text-[11px] font-mono font-bold uppercase tracking-[0.4em] text-orange-400">Threat Trajectory</h2>
                <p className="text-xl sm:text-3xl font-black tracking-tight">{ongoing_risk.current_risk}</p>
                
                <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ongoing_risk.what_to_watch.map((item: string, i: number) => (
                    <div key={i} className="px-4 py-3 glass rounded-2xl border border-white/5 text-sm text-[var(--text-secondary)] flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-orange-400 shrink-0 shadow-[0_0_8px_var(--orange-400)]" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

      </motion.main>

      {/* Aesthetic Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-24 border-t border-white/5 mt-32 text-center space-y-8 relative overflow-hidden">
        <p className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-[0.8em]">SECURE INTEL END_TRANSMISSION</p>
        <div className="flex justify-center gap-10 opacity-20">
          <ShieldAlert className="w-6 h-6" />
          <Activity className="w-6 h-6" />
          <Target className="w-6 h-6" />
        </div>
      </footer>
    </div>
  );
}
