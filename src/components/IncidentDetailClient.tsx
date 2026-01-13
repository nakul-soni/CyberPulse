'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { SeverityBadge } from '@/components/SeverityBadge';
import { 
  ShieldCheck, 
  AlertTriangle, 
  ArrowLeft, 
  ExternalLink, 
  Activity, 
  Target, 
  Lightbulb,
  CheckCircle2,
  ChevronDown,
  MousePointer2
} from 'lucide-react';
import Link from 'next/link';

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
  const [activeSection, setActiveSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: containerRef });
  
  // Smooth spring for progress bar
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const analysis = typeof incident.analysis === 'string' 
    ? JSON.parse(incident.analysis) 
    : incident.analysis;

  const sections = [
    { id: 'hero', title: 'Introduction' },
    { id: 'overview', title: 'Incident Overview' },
    { id: 'rootcause', title: 'Root Cause' },
    { id: 'mistakes', title: 'Key Mistakes' },
    { id: 'mitigation', title: 'Mitigation Strategy' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const { scrollTop, clientHeight } = containerRef.current;
      const index = Math.round(scrollTop / clientHeight);
      if (index !== activeSection) {
        setActiveSection(index);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [activeSection]);

  const scrollToSection = (index: number) => {
    if (!containerRef.current) return;
    const height = containerRef.current.clientHeight;
    containerRef.current.scrollTo({
      top: index * height,
      behavior: 'smooth'
    });
  };

  const animationProps = {
    initial: { opacity: 0, y: 30, scale: 0.98 },
    whileInView: { opacity: 1, y: 0, scale: 1 },
    viewport: { once: false, amount: 0.3 },
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  };

  return (
    <div className="fixed inset-0 bg-[var(--bg-primary)] overflow-hidden flex flex-col font-sans selection:bg-[var(--accent-cyan)]/30">
      {/* Dynamic Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="z-50 px-6 py-4 sm:px-10 flex items-center justify-between border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/80 backdrop-blur-xl"
      >
        <Link 
          href="/" 
          className="group flex items-center gap-3 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-all"
        >
          <div className="p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] group-hover:border-[var(--accent-cyan)]/30 transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="hidden sm:inline">Back to Dashboard</span>
        </Link>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-[var(--accent-cyan)] uppercase tracking-[0.2em]">Live Analysis</span>
            <span className="text-xs font-mono text-[var(--text-muted)]">SECTION 0{activeSection + 1} / 0{sections.length}</span>
          </div>
        </div>
      </motion.header>

      {/* Modern Progress Bar */}
      <div className="relative h-[2px] w-full bg-[var(--bg-secondary)] z-50 overflow-hidden">
        <motion.div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-cyan)] shadow-[0_0_10px_rgba(34,211,238,0.5)]" 
          style={{ scaleX, width: '100%', originX: 0 }} 
        />
      </div>

      {/* Main Snap Scroll Content */}
      <main 
        ref={containerRef}
        className="flex-1 overflow-y-auto snap-y snap-mandatory scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* HERO SECTION */}
        <section className="h-full w-full snap-start snap-always flex items-center justify-center p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.05),transparent_70%)]" />
          
          <motion.div 
            {...animationProps}
            className="max-w-4xl w-full text-center relative z-10"
          >
            <div className="flex justify-center gap-3 mb-8">
              <SeverityBadge severity={incident.severity} />
              <div className="px-4 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest shadow-sm">
                {incident.attack_type || 'Unknown Threat'}
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[var(--text-primary)] tracking-tight leading-[1.1] mb-10">
              {incident.title}
            </h1>
            
            <div className="flex items-center justify-center gap-8 text-sm text-[var(--text-muted)] flex-wrap mb-16">
              <div className="flex items-center gap-2 group cursor-default">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)] group-hover:scale-150 transition-transform" />
                <span className="font-bold text-[var(--text-secondary)]">{incident.source}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--border-primary)]" />
                <span>{new Date(incident.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <a 
                href={incident.url} 
                target="_blank" 
                className="flex items-center gap-2 text-[var(--accent-blue)] hover:text-[var(--accent-cyan)] transition-all hover:translate-y-[-1px]"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="font-bold underline decoration-2 underline-offset-4 decoration-[var(--accent-blue)]/30 group-hover:decoration-[var(--accent-cyan)]">Full Report</span>
              </a>
            </div>

            <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="inline-flex flex-col items-center gap-3 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => scrollToSection(1)}
            >
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Swipe up to dive in</span>
              <div className="w-6 h-10 rounded-full border-2 border-[var(--border-primary)] flex justify-center p-1.5">
                <motion.div 
                  animate={{ y: [0, 12, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-1 h-2 bg-[var(--accent-cyan)] rounded-full"
                />
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* OVERVIEW SECTION */}
        <section className="h-full w-full snap-start snap-always flex items-center justify-center p-6 bg-[var(--bg-secondary)]/10">
          <motion.div 
            {...animationProps}
            className="max-w-4xl w-full bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-primary)] p-10 sm:p-16 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[var(--accent-blue)] to-[var(--accent-cyan)] opacity-20" />
            <div className="flex items-start gap-8 mb-10">
              <div className="w-20 h-20 bg-gradient-to-br from-[var(--accent-blue)]/20 to-[var(--accent-cyan)]/20 rounded-3xl flex items-center justify-center border border-[var(--accent-blue)]/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <Activity className="w-10 h-10 text-[var(--accent-cyan)]" />
              </div>
              <div>
                <h2 className="text-4xl font-black text-[var(--text-primary)] mb-2 tracking-tight">Incident Overview</h2>
                <p className="text-[var(--text-muted)] font-mono text-xs uppercase tracking-widest">Executive Intelligence Summary</p>
              </div>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed text-xl sm:text-2xl font-medium mb-10">
              {analysis?.summary || 'Synthesizing data...'}
            </p>
            {analysis?.why_it_matters && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="p-8 bg-gradient-to-r from-[var(--accent-blue)]/5 to-transparent border-l-4 border-[var(--accent-blue)] rounded-xl"
              >
                <h4 className="text-[10px] font-black text-[var(--accent-cyan)] mb-3 uppercase tracking-[0.2em]">Strategic Impact</h4>
                <p className="text-[var(--text-secondary)] italic text-lg leading-relaxed font-serif">"{analysis.why_it_matters}"</p>
              </motion.div>
            )}
          </motion.div>
        </section>

        {/* ROOT CAUSE SECTION */}
        <section className="h-full w-full snap-start snap-always flex items-center justify-center p-6">
          <motion.div 
            {...animationProps}
            className="max-w-4xl w-full bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-[2.5rem] border border-amber-500/20 p-10 sm:p-16 shadow-2xl relative group"
          >
            <div className="flex items-start gap-8 mb-10">
              <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center border border-amber-500/20 shadow-inner group-hover:rotate-12 transition-transform duration-500">
                <Target className="w-10 h-10 text-amber-500" />
              </div>
              <div>
                <h2 className="text-4xl font-black text-[var(--text-primary)] mb-2 tracking-tight">Root Cause</h2>
                <p className="text-[var(--text-muted)] font-mono text-xs uppercase tracking-widest">Vulnerability Breakdown</p>
              </div>
            </div>
            <div className="bg-[var(--bg-secondary)]/30 backdrop-blur-sm p-8 rounded-3xl border border-white/5">
              <p className="text-[var(--text-secondary)] leading-relaxed text-xl sm:text-2xl font-medium">
                {analysis?.root_cause || 'Identifying the gap...'}
              </p>
            </div>
          </motion.div>
        </section>

        {/* KEY MISTAKES SECTION */}
        <section className="h-full w-full snap-start snap-always flex items-center justify-center p-6 bg-[var(--bg-secondary)]/10">
          <motion.div 
            {...animationProps}
            className="max-w-4xl w-full bg-gradient-to-br from-red-500/5 to-rose-500/5 rounded-[2.5rem] border border-red-500/20 p-10 sm:p-16 shadow-2xl group"
          >
            <div className="flex items-start gap-8 mb-10">
              <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20 shadow-inner group-hover:scale-90 transition-transform duration-500">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <div>
                <h2 className="text-4xl font-black text-[var(--text-primary)] mb-2 tracking-tight">Key Mistakes</h2>
                <p className="text-[var(--text-muted)] font-mono text-xs uppercase tracking-widest">Critical Security Failures</p>
              </div>
            </div>
            <div className="grid gap-6">
              {(analysis?.mistakes || []).map((mistake: string, i: number) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 + 0.3 }}
                  className="flex items-center gap-6 p-6 bg-[var(--bg-secondary)]/50 rounded-2xl border border-white/5 hover:border-red-500/30 transition-all group/item"
                >
                  <span className="w-12 h-12 shrink-0 bg-red-500/10 rounded-xl flex items-center justify-center text-red-400 font-black text-lg group-hover/item:bg-red-500/20 transition-colors">
                    0{i + 1}
                  </span>
                  <span className="text-[var(--text-secondary)] text-lg font-semibold group-hover/item:text-[var(--text-primary)] transition-colors">{mistake}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* MITIGATION SECTION */}
        <section className="h-full w-full snap-start snap-always flex items-center justify-center p-6">
          <motion.div 
            {...animationProps}
            className="max-w-5xl w-full bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-[2.5rem] border border-emerald-500/20 p-10 sm:p-16 shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-start gap-8 mb-12">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
                <ShieldCheck className="w-10 h-10 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-4xl font-black text-[var(--text-primary)] mb-2 tracking-tight">Mitigation Strategy</h2>
                <p className="text-[var(--text-muted)] font-mono text-xs uppercase tracking-widest">Hardening Recommendations</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h3 className="font-black text-emerald-400 mb-6 flex items-center gap-3 text-sm uppercase tracking-[0.2em]">
                  <CheckCircle2 className="w-6 h-6" /> Tactical Roadmap
                </h3>
                {(analysis?.mitigation || []).map((step: string, i: number) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 + 0.5 }}
                    className="bg-[var(--bg-secondary)]/50 border border-white/5 p-6 rounded-2xl text-[var(--text-secondary)] flex gap-5 hover:bg-emerald-500/5 transition-colors"
                  >
                    <span className="text-emerald-500/50 font-mono font-black mt-1">0{i+1}</span>
                    <span className="text-lg font-medium leading-snug">{step}</span>
                  </motion.div>
                ))}
              </div>
              
              <div className="space-y-6">
                <h3 className="font-black text-[var(--accent-blue)] mb-6 flex items-center gap-3 text-sm uppercase tracking-[0.2em]">
                  <Lightbulb className="w-6 h-6" /> Strategic Insight
                </h3>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="bg-gradient-to-br from-[var(--bg-secondary)] to-transparent border border-white/5 p-10 rounded-3xl text-[var(--text-secondary)] leading-relaxed text-xl italic shadow-inner relative"
                >
                  <div className="absolute top-4 left-4 text-emerald-500/20 text-6xl font-serif">“</div>
                  <div className="relative z-10">{analysis?.what_to_do_guide || 'Awaiting expert guidance...'}</div>
                  <div className="absolute bottom-4 right-4 text-emerald-500/20 text-6xl font-serif">”</div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Floating Dot Navigation */}
      <nav className="fixed right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6 z-50">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(index)}
            className="group relative flex items-center justify-center p-2"
            aria-label={`Jump to ${section.title}`}
          >
            <motion.div
              animate={{ 
                height: activeSection === index ? 40 : 10,
                width: activeSection === index ? 6 : 10,
                scale: activeSection === index ? 1 : 0.8,
                backgroundColor: activeSection === index ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.15)',
                borderRadius: activeSection === index ? '6px' : '50%'
              }}
              className="transition-all duration-300 group-hover:bg-[var(--text-muted)] group-hover:scale-100"
            />
            <span className="absolute right-full mr-6 px-4 py-2 rounded-xl bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border-primary)] text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap shadow-2xl">
              {section.title}
            </span>
          </button>
        ))}
      </nav>

      {/* Interactive Footer Overlay */}
      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <motion.div 
          animate={{ opacity: activeSection === sections.length - 1 ? 0 : 1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="px-6 py-2.5 rounded-full bg-[var(--bg-card)]/80 backdrop-blur-xl border border-[var(--border-primary)] shadow-2xl flex items-center gap-4">
            <MousePointer2 className="w-3 h-3 text-[var(--accent-cyan)] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
              {activeSection === 0 ? 'Start Exploring' : 'Continue Swiping'}
            </span>
          </div>
        </motion.div>
      </footer>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @media (max-height: 800px) {
          section { padding: 2rem 1rem !important; }
          h1 { font-size: 2.5rem !important; }
          h2 { font-size: 2rem !important; }
          p { font-size: 1rem !important; }
        }
      `}</style>
    </div>
  );
}
