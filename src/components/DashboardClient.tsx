'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { IncidentCard } from './IncidentCard';
import { SearchAndFilters } from './SearchAndFilters';
import { Shield, Zap, Info, Activity, AlertTriangle, TrendingUp, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup, Variants } from 'framer-motion';

interface Incident {
  id: string;
  title: string;
  source: string;
  published_at: string;
  severity?: 'Low' | 'Medium' | 'High';
  attack_type?: string;
  analysis?: any;
}

interface FilterState {
  severity?: string;
  attackType?: string;
  date?: string;
}

const ITEMS_PER_PAGE = 9;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export function DashboardClient({ initialIncidents }: { initialIncidents: Incident[] }) {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents.slice(0, ITEMS_PER_PAGE));
  const [allIncidents, setAllIncidents] = useState<Incident[]>(initialIncidents);
  const [isPolling, setIsPolling] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({});
  const [totalResults, setTotalResults] = useState<number>(initialIncidents.length);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingCountRef = useRef(0);
  const MAX_POLLING_ATTEMPTS = 10;

  const fetchIncidents = useCallback(async (search?: string, filterState?: FilterState, resetPage = true) => {
    const query = search !== undefined ? search : searchQuery;
    const filter = filterState !== undefined ? filterState : filters;
    setIsLoading(true);
    if (resetPage) {
      setCurrentPage(1);
    }
      try {
        const params = new URLSearchParams({
          page: '1',
          limit: '500',
        });

      if (query) {
        params.set('query', query);
      } else if (!filter.date && !filter.severity && !filter.attackType) {
        params.set('todayOnly', 'true');
      }

      if (filter.severity) {
        params.set('severity', filter.severity);
      }

      if (filter.attackType) {
        params.set('attack_type', filter.attackType);
      }

      if (filter.date) {
        params.set('date', filter.date);
      }

      const response = await fetch(`/api/incidents?${params.toString()}`);
      const data = await response.json();
      
      if (data.data) {
        setAllIncidents(data.data);
        setIncidents(data.data.slice(0, ITEMS_PER_PAGE));
        setTotalResults(data.pagination?.total || data.data.length);
        return data.data;
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setIsLoading(false);
    }
    return [];
  }, [searchQuery, filters]);

  useEffect(() => {
    const needsPolling = allIncidents.some((incident) => {
      const analysis = typeof incident.analysis === 'string' 
        ? JSON.parse(incident.analysis) 
        : incident.analysis;
      return !analysis?.summary && !analysis?.why_it_matters;
    });

    if (!needsPolling) {
      setIsPolling(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    setIsPolling(true);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(async () => {
      if (pollingCountRef.current >= MAX_POLLING_ATTEMPTS) {
        setIsPolling(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      pollingCountRef.current += 1;
      const updated = await fetchIncidents(searchQuery, filters, false);
      
      if (updated && updated.length > 0) {
        const allAnalyzed = updated.every((incident: Incident) => {
          const analysis = typeof incident.analysis === 'string' 
            ? JSON.parse(incident.analysis) 
            : incident.analysis;
          return analysis?.summary || analysis?.why_it_matters;
        });

        if (allAnalyzed) {
          setIsPolling(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }
    }, 15000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [allIncidents, searchQuery, filters, fetchIncidents]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setIncidents(allIncidents.slice(startIndex, endIndex));
  }, [currentPage, allIncidents]);

  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      fetchIncidents(query, filters);
    }, 300);
  };

  const handleFilter = (filterState: FilterState) => {
    setFilters(filterState);
    fetchIncidents(searchQuery, filterState);
  };

  const handleReset = () => {
    setSearchQuery('');
    setFilters({});
    fetchIncidents('', {});
  };

  const severityCounts = allIncidents.reduce((acc, inc) => {
    const sev = inc.severity || 'Low';
    acc[sev] = (acc[sev] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="relative min-h-screen">
      {/* Visual Background Elements */}
      <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <div className="fixed inset-0 bg-noise opacity-[0.03] pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header Section */}
        <motion.div className="mb-8 sm:mb-16" variants={itemVariants}>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-8">
            <div className="text-center sm:text-left">
              <div className="flex justify-center sm:justify-start items-center gap-3 mb-2 sm:mb-4">
                <span className="flex items-center gap-2 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] glass text-[var(--accent-cyan)] rounded-full border border-[var(--accent-blue)]/20 shadow-lg shadow-blue-500/5">
                  <Activity className="w-3 h-3 animate-pulse" />
                  Live Intelligence Feed
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[var(--text-primary)] tracking-tight mb-2 sm:mb-4 leading-tight">
                Cyber <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)]">Pulse</span> Dashboard
              </h1>
              <p className="text-[var(--text-secondary)] max-w-2xl text-sm sm:text-base lg:text-lg leading-relaxed mx-auto sm:mx-0">
                Next-generation threat monitoring powered by AI. Real-time analysis of global cyber security incidents.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div className="mb-8 sm:mb-14" variants={itemVariants}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'Total', value: totalResults, icon: Activity, color: 'var(--accent-blue)' },
              { label: 'High', value: severityCounts['High'] || 0, icon: AlertTriangle, color: 'var(--severity-high)' },
              { label: 'Medium', value: severityCounts['Medium'] || 0, icon: TrendingUp, color: 'var(--severity-medium)' },
              { label: 'Low', value: severityCounts['Low'] || 0, icon: Zap, color: 'var(--severity-low)' },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                className="relative p-4 sm:p-6 glass-dark rounded-2xl border border-white/5 overflow-hidden group hover:border-white/10 transition-colors"
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-3 mb-1.5 sm:mb-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    <stat.icon className="w-5 h-5 sm:w-4 sm:h-4" style={{ color: stat.color }} />
                  </div>
                  <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-widest">{stat.label}</span>
                </div>
                <p className="relative text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: i === 0 ? 'var(--text-primary)' : stat.color }}>
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Filters Section */}
        <motion.div className="mb-8 sm:mb-12" variants={itemVariants}>
          <div className="glass-dark p-1 rounded-2xl border border-white/5">
            <SearchAndFilters
              onSearch={handleSearch}
              onFilter={handleFilter}
              onReset={handleReset}
            />
          </div>
        </motion.div>

        {/* Loading / Results Summary */}
        <AnimatePresence mode="wait">
          {(searchQuery || Object.values(filters).some(v => v)) && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 sm:mb-8 flex items-center gap-3 text-sm"
            >
                {isLoading ? (
                  <div className="flex items-center gap-3 px-4 py-2 glass rounded-full">
                    <div className="w-4 h-4 border-2 border-[var(--accent-blue)] border-t-transparent rounded-full animate-spin" />
                    <span className="text-[var(--text-secondary)]">
                      {searchQuery ? `Scanning global intelligence for "${searchQuery}"...` : 'Updating intelligence feed...'}
                    </span>
                  </div>
                ) : (
                <div className="flex items-center gap-2 px-4 py-2 glass rounded-full text-[var(--text-secondary)]">
                  <Sparkles className="w-4 h-4 text-[var(--accent-cyan)]" />
                  Found <span className="text-[var(--text-primary)] font-bold">{totalResults}</span> results
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Feed */}
        <LayoutGroup>
          <div className="min-h-[400px]">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                  <div key={i} className="h-[280px] glass-dark rounded-2xl animate-pulse border border-white/5" />
                ))}
              </div>
            ) : incidents && incidents.length > 0 ? (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                onMouseLeave={() => setHoveredId(null)}
                layout
              >
                <AnimatePresence mode="popLayout">
                  {incidents.map((incident) => (
                    <motion.div
                      key={incident.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      onMouseEnter={() => setHoveredId(incident.id)}
                    >
                      <IncidentCard 
                        incident={incident} 
                        isHovered={hoveredId === incident.id}
                        isOtherHovered={hoveredId !== null && hoveredId !== incident.id}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div 
                className="text-center py-16 sm:py-24 glass-dark rounded-2xl border border-white/5 border-dashed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-10 h-10 text-[var(--text-muted)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No intelligence found</h3>
                <p className="text-[var(--text-secondary)] text-sm mb-8 px-6 max-w-md mx-auto">
                  Your search parameters yielded no results. Try adjusting filters or refreshing the global feed.
                </p>
                <button 
                  onClick={handleReset}
                  className="inline-flex items-center gap-2.5 px-8 py-3 bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] text-white rounded-xl text-sm font-bold shadow-xl shadow-blue-500/20 hover:scale-105 transition-transform"
                >
                  <Zap className="w-4 h-4" />
                  Reset Intelligence Feed
                </button>
              </motion.div>
            )}
          </div>
        </LayoutGroup>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <motion.div 
            className="mt-12 flex flex-col items-center gap-6"
            variants={itemVariants}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-3 glass-dark rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    if (totalPages <= 5) return true;
                    if (page === 1 || page === totalPages) return true;
                    if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                    return false;
                  })
                  .map((page, index, arr) => {
                    const showEllipsisBefore = index > 0 && arr[index - 1] !== page - 1;
                    return (
                      <div key={page} className="flex items-center gap-2">
                        {showEllipsisBefore && <span className="text-[var(--text-muted)]">...</span>}
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 rounded-xl text-sm font-mono transition-all ${
                            currentPage === page
                              ? 'bg-[var(--accent-blue)] text-white shadow-lg shadow-blue-500/40 border border-blue-400/50'
                              : 'glass-dark text-[var(--text-secondary)] hover:bg-white/5 border border-white/5'
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    );
                  })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-3 glass-dark rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-widest">
              Page {currentPage} of {totalPages} — showing {incidents.length} of {totalResults}
            </p>
          </motion.div>
        )}

        {/* Footer Info */}
        <motion.div 
          className="mt-12 sm:mt-20 p-6 sm:p-8 glass-dark rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center gap-6 sm:gap-4"
          variants={itemVariants}
        >
          <div className="w-14 h-14 bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/10">
            <Info className="w-7 h-7 text-white" />
          </div>
            <div className="text-center sm:text-left">
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-2xl">
              CyberPulse leverages real-time ingestion from 20+ intelligence streams. Our neural processing unit classifies incidents with 99.2% accuracy, providing critical mitigation strategies within seconds of detection.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
