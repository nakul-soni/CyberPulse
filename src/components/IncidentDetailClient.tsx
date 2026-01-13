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
  MousePointer2,
  BookOpen,
  Clock,
  Zap,
  Award,
  TrendingUp,
  RefreshCw
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
    const [activeSection, setActiveSection] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [caseStudyGenerated, setCaseStudyGenerated] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: containerRef });
  
  // Smooth spring for progress bar
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const rawAnalysis = typeof incident.analysis === 'string' 
    ? JSON.parse(incident.analysis) 
    : incident.analysis;

    const analysis = rawAnalysis ? {
      ...rawAnalysis,
      case_study: {
        title: rawAnalysis.case_study?.title || `Case Study: ${incident.title}`,
        background: rawAnalysis.case_study?.background || 'Analysis pending',
        attack_vector: rawAnalysis.case_study?.attack_vector || 'Analysis pending',
        incident_flow: rawAnalysis.case_study?.incident_flow || ['Analysis pending'],
        outcome: rawAnalysis.case_study?.outcome || 'Analysis pending',
        lessons_learned: rawAnalysis.case_study?.lessons_learned || ['Analysis pending'],
        recommendations: rawAnalysis.case_study?.recommendations || ['Analysis pending'],
      }
    } : null;


    const sections = [
      { id: 'hero', title: 'Introduction' },
      { id: 'overview', title: 'Incident Overview' },
      { id: 'rootcause', title: 'Root Cause' },
      { id: 'mistakes', title: 'Key Mistakes' },
      { id: 'mitigation', title: 'Mitigation Strategy' },
      ...(caseStudyGenerated ? [{ id: 'casestudy', title: 'Case Study' }] : []),
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

  const handleGenerateCaseStudy = () => {
    setIsGenerating(true);
    // Simulate generation for effect
    setTimeout(() => {
      setCaseStudyGenerated(true);
      setIsGenerating(false);
      // Wait for re-render then scroll
      setTimeout(() => {
        scrollToSection(5);
      }, 100);
    }, 1500);
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
        className="z-50 px-6 py-2.5 sm:px-10 flex items-center justify-between border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/80 backdrop-blur-xl"
      >
        <Link 
          href="/" 
          className="group flex items-center gap-2.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-all"
        >
          <div className="p-1.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-primary)] group-hover:border-[var(--accent-cyan)]/30 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="hidden sm:inline uppercase tracking-widest">Back to Dashboard</span>
        </Link>
        
        <div className="flex items-center gap-5">
          <ReanalyzeButton incidentId={incident.id} />
          <div className="flex flex-col items-end leading-none">
            <span className="text-[9px] font-black text-[var(--accent-cyan)] uppercase tracking-[0.2em] mb-0.5">Live Analysis</span>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">SEC. 0{activeSection + 1} / 0{sections.length}</span>
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
            <div className="flex justify-center gap-2 mb-6">
              <SeverityBadge severity={incident.severity} />
              <div className="px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest shadow-sm">
                {incident.attack_type || 'Unknown Threat'}
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--text-primary)] tracking-tight leading-[1.1] mb-8">
              {incident.title}
            </h1>
            
            <div className="flex items-center justify-center gap-6 text-xs text-[var(--text-muted)] flex-wrap mb-12">
              <div className="flex items-center gap-1.5 group cursor-default">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)] group-hover:scale-150 transition-transform" />
                <span className="font-bold text-[var(--text-secondary)]">{incident.source}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--border-primary)]" />
                <span>{new Date(incident.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <a 
                href={incident.url} 
                target="_blank" 
                className="flex items-center gap-1.5 text-[var(--accent-blue)] hover:text-[var(--accent-cyan)] transition-all hover:translate-y-[-1px]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="font-bold underline decoration-2 underline-offset-4 decoration-[var(--accent-blue)]/30 group-hover:decoration-[var(--accent-cyan)] uppercase tracking-tighter">Full Report</span>
              </a>
            </div>

            <motion.div 
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="inline-flex flex-col items-center gap-2.5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => scrollToSection(1)}
            >
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Swipe up to dive in</span>
              <div className="w-5 h-8 rounded-full border-2 border-[var(--border-primary)] flex justify-center p-1">
                <motion.div 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-1 h-1.5 bg-[var(--accent-cyan)] rounded-full"
                />
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* OVERVIEW SECTION */}
        <section className="h-full w-full snap-start snap-always flex items-center justify-center p-6 bg-[var(--bg-secondary)]/10">
          <motion.div 
            {...animationProps}
            className="max-w-4xl w-full bg-[var(--bg-card)] rounded-3xl border border-[var(--border-primary)] p-8 sm:p-12 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[var(--accent-blue)] to-[var(--accent-cyan)] opacity-20" />
            <div className="flex items-start gap-6 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-[var(--accent-blue)]/20 to-[var(--accent-cyan)]/20 rounded-2xl flex items-center justify-center border border-[var(--accent-blue)]/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <Activity className="w-7 h-7 text-[var(--accent-cyan)]" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-[var(--text-primary)] mb-1 tracking-tight">Incident Overview</h2>
                <p className="text-[var(--text-muted)] font-mono text-[10px] uppercase tracking-widest">Executive Intelligence Summary</p>
              </div>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed text-lg sm:text-xl font-medium mb-8">
              {analysis?.summary || 'Synthesizing data...'}
            </p>
            {analysis?.why_it_matters && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="p-6 bg-gradient-to-r from-[var(--accent-blue)]/5 to-transparent border-l-4 border-[var(--accent-blue)] rounded-xl"
              >
                <h4 className="text-[9px] font-black text-[var(--accent-cyan)] mb-2 uppercase tracking-[0.2em]">Strategic Impact</h4>
                <p className="text-[var(--text-secondary)] italic text-base leading-relaxed font-serif">"{analysis.why_it_matters}"</p>
              </motion.div>
            )}
          </motion.div>
        </section>

        {/* ROOT CAUSE SECTION */}
        <section className="h-full w-full snap-start snap-always flex items-center justify-center p-6">
          <motion.div 
            {...animationProps}
            className="max-w-4xl w-full bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-3xl border border-amber-500/20 p-8 sm:p-12 shadow-2xl relative group"
          >
            <div className="flex items-start gap-6 mb-8">
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-inner group-hover:rotate-12 transition-transform duration-500">
                <Target className="w-7 h-7 text-amber-500" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-[var(--text-primary)] mb-1 tracking-tight">Root Cause</h2>
                <p className="text-[var(--text-muted)] font-mono text-[10px] uppercase tracking-widest">Vulnerability Breakdown</p>
              </div>
            </div>
            <div className="bg-[var(--bg-secondary)]/30 backdrop-blur-sm p-6 rounded-2xl border border-white/5">
              <p className="text-[var(--text-secondary)] leading-relaxed text-lg sm:text-xl font-medium">
                {analysis?.root_cause || 'Identifying the gap...'}
              </p>
            </div>
          </motion.div>
        </section>

        {/* KEY MISTAKES SECTION */}
        <section className="h-full w-full snap-start snap-always flex items-center justify-center p-6 bg-[var(--bg-secondary)]/10">
          <motion.div 
            {...animationProps}
            className="max-w-4xl w-full bg-gradient-to-br from-red-500/5 to-rose-500/5 rounded-3xl border border-red-500/20 p-8 sm:p-12 shadow-2xl group"
          >
            <div className="flex items-start gap-6 mb-8">
              <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 shadow-inner group-hover:scale-90 transition-transform duration-500">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-[var(--text-primary)] mb-1 tracking-tight">Key Mistakes</h2>
                <p className="text-[var(--text-muted)] font-mono text-[10px] uppercase tracking-widest">Critical Security Failures</p>
              </div>
            </div>
            <div className="grid gap-4">
              {(analysis?.mistakes || []).map((mistake: string, i: number) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 + 0.3 }}
                  className="flex items-center gap-5 p-4 bg-[var(--bg-secondary)]/50 rounded-xl border border-white/5 hover:border-red-500/30 transition-all group/item"
                >
                  <span className="w-10 h-10 shrink-0 bg-red-500/10 rounded-lg flex items-center justify-center text-red-400 font-black text-base group-hover/item:bg-red-500/20 transition-colors">
                    0{i + 1}
                  </span>
                  <span className="text-[var(--text-secondary)] text-base font-semibold group-hover/item:text-[var(--text-primary)] transition-colors">{mistake}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* MITIGATION SECTION */}
        <section className="h-full w-full snap-start snap-always flex items-center justify-center p-6">
          <motion.div 
            {...animationProps}
            className="max-w-5xl w-full bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-3xl border border-emerald-500/20 p-8 sm:p-12 shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-start gap-6 mb-10">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
                <ShieldCheck className="w-7 h-7 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-[var(--text-primary)] mb-1 tracking-tight">Mitigation Strategy</h2>
                <p className="text-[var(--text-muted)] font-mono text-[10px] uppercase tracking-widest">Hardening Recommendations</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-black text-emerald-400 mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]">
                  <CheckCircle2 className="w-4 h-4" /> Tactical Roadmap
                </h3>
                {(analysis?.mitigation || []).map((step: string, i: number) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 + 0.5 }}
                    className="bg-[var(--bg-secondary)]/50 border border-white/5 p-4 rounded-xl text-[var(--text-secondary)] flex gap-4 hover:bg-emerald-500/5 transition-colors"
                  >
                    <span className="text-emerald-500/50 font-mono font-black mt-0.5 text-sm">0{i+1}</span>
                    <span className="text-base font-medium leading-snug">{step}</span>
                  </motion.div>
                ))}
              </div>
              
              <div className="space-y-4">
                <h3 className="font-black text-[var(--accent-blue)] mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]">
                  <Lightbulb className="w-4 h-4" /> Strategic Insight
                </h3>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    className="bg-gradient-to-br from-[var(--bg-secondary)] to-transparent border border-white/5 p-8 rounded-2xl text-[var(--text-secondary)] leading-relaxed text-lg italic shadow-inner relative mb-6"
                  >
                    <div className="absolute top-3 left-3 text-emerald-500/20 text-4xl font-serif">“</div>
                    <div className="relative z-10">{analysis?.what_to_do_guide || 'Awaiting expert guidance...'}</div>
                    <div className="absolute bottom-3 right-3 text-emerald-500/20 text-4xl font-serif">”</div>
                  </motion.div>

                  {/* Generate Case Study Button */}
                  {!caseStudyGenerated && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGenerateCaseStudy}
                      disabled={isGenerating}
                      className="w-full max-w-xs mx-auto p-3.5 bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-cyan)] rounded-xl text-white font-black uppercase tracking-[0.1em] shadow-lg flex items-center justify-center gap-3 group/btn relative overflow-hidden disabled:opacity-50 transition-all border border-white/10 text-xs"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          <span>Generate Case Study</span>
                          <ChevronDown className="w-3 h-3 group-hover/btn:translate-y-1 transition-transform" />
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </section>

        {/* CASE STUDY SECTION */}
        {caseStudyGenerated && (
          <section className="h-full w-full snap-start snap-always flex items-center justify-center p-6 bg-[var(--bg-secondary)]/10">
            <motion.div 
              {...animationProps}
              className="max-w-6xl w-full bg-[var(--bg-card)] rounded-3xl border border-[var(--border-primary)] p-6 sm:p-10 shadow-2xl relative overflow-hidden group h-[90vh] flex flex-col"
            >
              <div className="flex items-start gap-5 mb-6 shrink-0">
                <div className="w-14 h-14 bg-[var(--accent-cyan)]/10 rounded-2xl flex items-center justify-center border border-[var(--accent-cyan)]/20 shadow-inner">
                  <BookOpen className="w-7 h-7 text-[var(--accent-cyan)]" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[var(--text-primary)] mb-0.5 tracking-tight">Case Study</h2>
                  <p className="text-[var(--text-muted)] font-mono text-[9px] uppercase tracking-widest">{analysis?.case_study?.title || 'Detailed Breakdown'}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-8">
                    <div>
                      <h3 className="flex items-center gap-2.5 text-[10px] font-black text-[var(--accent-blue)] uppercase tracking-widest mb-3">
                        <TrendingUp className="w-3.5 h-3.5" /> Background & Context
                      </h3>
                      <p className="text-[var(--text-secondary)] text-base leading-relaxed bg-[var(--bg-secondary)]/30 p-5 rounded-xl border border-white/5">
                        {analysis?.case_study?.background || 'Loading background...'}
                      </p>
                    </div>

                    <div>
                      <h3 className="flex items-center gap-2.5 text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3">
                        <Zap className="w-3.5 h-3.5" /> Attack Vector
                      </h3>
                      <p className="text-[var(--text-secondary)] text-base leading-relaxed bg-amber-500/5 p-5 rounded-xl border border-amber-500/10 italic">
                        {analysis?.case_study?.attack_vector || 'Analyzing technical breakdown...'}
                      </p>
                    </div>

                    <div>
                      <h3 className="flex items-center gap-2.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">
                        <Award className="w-3.5 h-3.5" /> Outcome & Impact
                      </h3>
                      <p className="text-[var(--text-secondary)] text-base leading-relaxed bg-emerald-500/5 p-5 rounded-xl border border-emerald-500/10">
                        {analysis?.case_study?.outcome || 'Evaluating impact...'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h3 className="flex items-center gap-2.5 text-[10px] font-black text-[var(--accent-cyan)] uppercase tracking-widest mb-4">
                        <Clock className="w-3.5 h-3.5" /> Incident Flow
                      </h3>
                      <div className="space-y-0 pl-3 border-l border-[var(--accent-cyan)]/20">
                        {(analysis?.case_study?.incident_flow || []).map((step: string, i: number) => (
                          <div key={i} className="relative pl-6 pb-6 last:pb-0">
                            <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-[var(--bg-card)] border-2 border-[var(--accent-cyan)] shadow-[0_0_8px_rgba(34,211,238,0.3)]" />
                            <div className="bg-[var(--bg-secondary)]/50 p-3.5 rounded-lg border border-white/5 hover:border-[var(--accent-cyan)]/30 transition-colors">
                              <p className="text-[var(--text-secondary)] text-xs font-semibold">{step}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-red-500/5 p-5 rounded-xl border border-red-500/10">
                        <h4 className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-3">Lessons Learned</h4>
                        <ul className="space-y-2">
                          {(analysis?.case_study?.lessons_learned || []).map((lesson: string, i: number) => (
                            <li key={i} className="text-[11px] text-[var(--text-secondary)] flex gap-1.5">
                              <span className="text-red-400 font-bold">•</span> {lesson}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-[var(--accent-blue)]/5 p-5 rounded-xl border border-[var(--accent-blue)]/10">
                        <h4 className="text-[9px] font-black text-[var(--accent-blue)] uppercase tracking-widest mb-3">Recommendations</h4>
                        <ul className="space-y-2">
                          {(analysis?.case_study?.recommendations || []).map((rec: string, i: number) => (
                            <li key={i} className="text-[11px] text-[var(--text-secondary)] flex gap-1.5">
                              <span className="text-[var(--accent-blue)] font-bold">•</span> {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>
        )}
      </main>


    {/* Floating Dot Navigation */}
    <nav className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-5 z-50">
      {sections.map((section, index) => (
        <button
          key={section.id}
          onClick={() => scrollToSection(index)}
          className="group relative flex items-center justify-center p-1.5"
          aria-label={`Jump to ${section.title}`}
        >
          <motion.div
            animate={{ 
              height: activeSection === index ? 32 : 8,
              width: activeSection === index ? 5 : 8,
              scale: activeSection === index ? 1 : 0.8,
              backgroundColor: activeSection === index ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.15)',
              borderRadius: activeSection === index ? '4px' : '50%'
            }}
            className="transition-all duration-300 group-hover:bg-[var(--text-muted)] group-hover:scale-100"
          />
          <span className="absolute right-full mr-5 px-3 py-1.5 rounded-lg bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border-primary)] text-[9px] font-black text-[var(--text-primary)] uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap shadow-xl">
            {section.title}
          </span>
        </button>
      ))}
    </nav>

    {/* Interactive Footer Overlay */}
    <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <motion.div 
        animate={{ opacity: activeSection === sections.length - 1 ? 0 : 1 }}
        className="flex flex-col items-center gap-2.5"
      >
        <div className="px-5 py-2 rounded-full bg-[var(--bg-card)]/80 backdrop-blur-xl border border-[var(--border-primary)] shadow-2xl flex items-center gap-3">
          <MousePointer2 className="w-2.5 h-2.5 text-[var(--accent-cyan)] animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
            {activeSection === 0 ? 'Start Exploring' : 'Keep Swiping'}
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
