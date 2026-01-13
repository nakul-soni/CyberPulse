'use client';

import { useState, useEffect } from 'react';
import { SeverityBadge } from '@/components/SeverityBadge';
import { 
  ShieldCheck, 
  AlertTriangle, 
  ArrowLeft, 
  ExternalLink, 
  Activity, 
  Target, 
  Lightbulb,
  CheckCircle2
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
  const [currentSection, setCurrentSection] = useState(-1);
  const [isVisible, setIsVisible] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const analysis = typeof incident.analysis === 'string' 
    ? JSON.parse(incident.analysis) 
    : incident.analysis;

  const sections = [
    { id: 'overview', title: 'Incident Overview', icon: Activity, color: 'blue' },
    { id: 'rootcause', title: 'Root Cause', icon: Target, color: 'amber' },
    { id: 'mistakes', title: 'Key Mistakes', icon: AlertTriangle, color: 'red' },
    { id: 'mitigation', title: 'Mitigation Strategy', icon: ShieldCheck, color: 'emerald' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [currentSection]);

  const goToNext = () => {
    if (currentSection < sections.length - 1) {
      setDirection('next');
      setCurrentSection(prev => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentSection > -1) {
      setDirection('prev');
      setCurrentSection(prev => prev - 1);
    }
  };

  const goToSection = (index: number) => {
    setDirection(index > currentSection ? 'next' : 'prev');
    setCurrentSection(index);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        goToNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        goToPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSection]);

  useEffect(() => {
    let touchStartY = 0;
    let touchEndY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndY = e.changedTouches[0].screenY;
      const diff = touchStartY - touchEndY;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goToNext();
        } else {
          goToPrev();
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentSection]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 30) {
        if (e.deltaY > 0) {
          goToNext();
        } else {
          goToPrev();
        }
      }
    };

    let wheelTimeout: NodeJS.Timeout | null = null;
    const throttledWheel = (e: WheelEvent) => {
      if (!wheelTimeout) {
        handleWheel(e);
        wheelTimeout = setTimeout(() => {
          wheelTimeout = null;
        }, 500);
      }
    };

    window.addEventListener('wheel', throttledWheel, { passive: true });
    return () => window.removeEventListener('wheel', throttledWheel);
  }, [currentSection]);

  const renderHeroSection = () => (
    <div 
      className={`
        transition-all duration-500 ease-out
        ${isVisible 
          ? 'opacity-100 scale-100 translate-y-0' 
          : direction === 'next' 
            ? 'opacity-0 scale-95 translate-y-8' 
            : 'opacity-0 scale-95 -translate-y-8'}
      `}
    >
      <div className="min-h-[60vh] flex flex-col justify-center">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <SeverityBadge severity={incident.severity} />
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest bg-[var(--bg-card-hover)] px-3 py-1.5 rounded-lg border border-[var(--border-primary)]">
              {incident.attack_type || 'Unclassified'}
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] tracking-tight leading-tight mb-6 max-w-3xl mx-auto">
            {incident.title}
          </h1>
          
          <div className="flex items-center justify-center gap-4 text-sm text-[var(--text-secondary)] flex-wrap">
            <span className="font-semibold text-[var(--accent-cyan)]">{incident.source}</span>
            <span className="text-[var(--text-muted)]">•</span>
            <span>{new Date(incident.published_at).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}</span>
            <span className="text-[var(--text-muted)]">•</span>
            <a 
              href={incident.url} 
              target="_blank" 
              className="flex items-center gap-1 text-[var(--accent-blue)] hover:text-[var(--accent-cyan)] transition-colors"
            >
              View Source <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="flex justify-center mt-12">
          <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
            <span className="text-sm font-medium">Swipe up to explore analysis</span>
            <div className="flex flex-col items-center animate-bounce">
              <div className="w-6 h-10 rounded-full border-2 border-[var(--border-primary)] flex items-start justify-center p-1">
                <div className="w-1.5 h-3 bg-[var(--accent-cyan)] rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOverviewSection = () => (
    <div 
      className={`
        transition-all duration-500 ease-out w-full
        ${isVisible 
          ? 'opacity-100 scale-100 translate-y-0' 
          : direction === 'next' 
            ? 'opacity-0 scale-95 translate-y-12' 
            : 'opacity-0 scale-95 -translate-y-12'}
      `}
    >
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-primary)] p-8 shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-[var(--accent-blue)]/10 rounded-2xl flex items-center justify-center border border-[var(--accent-blue)]/20">
            <Activity className="w-7 h-7 text-[var(--accent-blue)]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Incident Overview</h2>
            <p className="text-sm text-[var(--text-muted)]">AI-generated summary of the security incident</p>
          </div>
        </div>
        <p className="text-[var(--text-secondary)] leading-relaxed text-lg">
          {analysis?.summary || 'AI analysis is currently being generated for this incident.'}
        </p>
        {analysis?.why_it_matters && (
          <div className="mt-6 p-4 bg-[var(--accent-blue)]/5 border border-[var(--accent-blue)]/20 rounded-xl">
            <p className="text-sm font-medium text-[var(--accent-cyan)] mb-2">Why It Matters</p>
            <p className="text-[var(--text-secondary)]">{analysis.why_it_matters}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderRootCauseSection = () => (
    <div 
      className={`
        transition-all duration-500 ease-out w-full
        ${isVisible 
          ? 'opacity-100 scale-100 translate-y-0' 
          : direction === 'next' 
            ? 'opacity-0 scale-95 translate-y-12' 
            : 'opacity-0 scale-95 -translate-y-12'}
      `}
    >
      <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-2xl border border-amber-500/20 p-8 shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
            <Target className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Root Cause</h2>
            <p className="text-sm text-[var(--text-muted)]">What allowed this incident to happen</p>
          </div>
        </div>
        <p className="text-[var(--text-secondary)] leading-relaxed text-lg">
          {analysis?.root_cause || 'Analyzing root cause...'}
        </p>
      </div>
    </div>
  );

  const renderMistakesSection = () => (
    <div 
      className={`
        transition-all duration-500 ease-out w-full
        ${isVisible 
          ? 'opacity-100 scale-100 translate-y-0' 
          : direction === 'next' 
            ? 'opacity-0 scale-95 translate-y-12' 
            : 'opacity-0 scale-95 -translate-y-12'}
      `}
    >
      <div className="bg-gradient-to-br from-red-500/10 to-rose-500/5 rounded-2xl border border-red-500/20 p-8 shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Key Mistakes</h2>
            <p className="text-sm text-[var(--text-muted)]">Critical errors that led to the breach</p>
          </div>
        </div>
        <ul className="space-y-4">
          {(analysis?.mistakes || ['Analyzing key mistakes...']).map((mistake: string, i: number) => (
            <li 
              key={i} 
              className="flex items-start gap-4 p-4 bg-[var(--bg-secondary)]/50 rounded-xl border border-red-500/10"
              style={{ 
                animationDelay: `${i * 100}ms`,
                animation: isVisible ? 'fadeInUp 0.5s ease-out forwards' : 'none'
              }}
            >
              <span className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 text-sm font-bold shrink-0">
                {i + 1}
              </span>
              <span className="text-[var(--text-secondary)]">{mistake}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderMitigationSection = () => (
    <div 
      className={`
        transition-all duration-500 ease-out w-full
        ${isVisible 
          ? 'opacity-100 scale-100 translate-y-0' 
          : direction === 'next' 
            ? 'opacity-0 scale-95 translate-y-12' 
            : 'opacity-0 scale-95 -translate-y-12'}
      `}
    >
      <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-2xl border border-emerald-500/20 p-8 shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck className="w-7 h-7 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Mitigation Strategy</h2>
            <p className="text-sm text-[var(--text-muted)]">Recommended actions to prevent similar incidents</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-emerald-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" /> Recommended Steps
            </h3>
            <ul className="space-y-3">
              {(analysis?.mitigation || ['Analyzing mitigation steps...']).map((step: string, i: number) => (
                <li 
                  key={i} 
                  className="bg-[var(--bg-secondary)]/50 border border-emerald-500/10 p-4 rounded-xl text-[var(--text-secondary)]"
                >
                  <span className="font-bold text-emerald-400 mr-2">0{i+1}.</span> {step}
                </li>
              ))}
            </ul>
          </div>
          
          {analysis?.what_to_do_guide && (
            <div>
              <h3 className="font-bold text-emerald-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Lightbulb className="w-4 h-4" /> Personal Action Guide
              </h3>
              <div className="bg-[var(--bg-secondary)]/50 border border-emerald-500/10 p-5 rounded-xl text-[var(--text-secondary)] leading-relaxed h-full">
                {analysis.what_to_do_guide}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCurrentSection = () => {
    switch (currentSection) {
      case -1:
        return renderHeroSection();
      case 0:
        return renderOverviewSection();
      case 1:
        return renderRootCauseSection();
      case 2:
        return renderMistakesSection();
      case 3:
        return renderMitigationSection();
      default:
        return renderHeroSection();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
          
          <div className="text-xs text-[var(--text-muted)] font-mono">
            {currentSection === -1 ? 'INTRO' : `${currentSection + 1} / ${sections.length}`}
          </div>
        </div>

        <div className="min-h-[70vh] flex items-center justify-center">
          {renderCurrentSection()}
        </div>

        {currentSection >= 0 && (
          <div className="fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-50">
            {sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => goToSection(index)}
                className={`
                  transition-all duration-300 group relative
                  ${currentSection === index 
                    ? 'w-3 h-8 bg-[var(--accent-cyan)] rounded-full' 
                    : 'w-2 h-2 bg-[var(--border-primary)] hover:bg-[var(--text-muted)] rounded-full'}
                `}
                aria-label={`Go to ${section.title}`}
              >
                <span className={`
                  absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap
                  text-xs font-medium px-2 py-1 rounded bg-[var(--bg-card)] border border-[var(--border-primary)]
                  opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                  ${currentSection === index ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-muted)]'}
                `}>
                  {section.title}
                </span>
              </button>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-[var(--text-muted)] mt-8">
          Scroll or swipe up/down to navigate
        </p>
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
