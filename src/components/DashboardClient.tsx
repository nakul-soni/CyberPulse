'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { IncidentCard } from './IncidentCard';
import { SearchAndFilters } from './SearchAndFilters';
import { Shield, Zap, Info, Activity, AlertTriangle, TrendingUp, ChevronLeft, ChevronRight, Terminal, Lock } from 'lucide-react';

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
        limit: '200',
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
        const newDataStr = JSON.stringify(data.data);
        setAllIncidents(prev => {
          if (JSON.stringify(prev) === newDataStr) return prev;
          return data.data;
        });
        setIncidents(prev => {
          const sliced = data.data.slice(0, ITEMS_PER_PAGE);
          if (JSON.stringify(prev) === JSON.stringify(sliced)) return prev;
          return sliced;
        });
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Section */}
      <div className="relative mb-16 opacity-0 animate-fade-in-up">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[var(--bg-primary)] bg-[var(--bg-card)] flex items-center justify-center overflow-hidden">
                    <Shield className="w-4 h-4 text-[var(--accent-blue)]" />
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--accent-blue)] py-1 px-3 bg-[var(--accent-blue)]/5 rounded-full border border-[var(--accent-blue)]/10">
                Strategic Intelligence
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 leading-[1.1]">
              <span className="premium-gradient-text">Real-time Threat</span><br />
              <span className="accent-gradient-text">Command Center</span>
            </h1>
            
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed font-light">
              Autonomous security intelligence platform monitoring global attack vectors. 
              Converting massive data streams into actionable defensive insights.
            </p>
          </div>

          <div className="flex items-center gap-6 lg:self-end">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-1">Response Time</span>
              <span className="text-2xl font-bold font-mono text-white">42ms</span>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-1">Active Nodes</span>
              <span className="text-2xl font-bold font-mono text-white">1,204</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 opacity-0 animate-fade-in-up stagger-2">
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-12 h-12" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Total Signals</p>
          <p className="text-3xl font-black text-white group-hover:text-[var(--accent-blue)] transition-colors">{totalResults}</p>
          <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-[var(--accent-blue)] w-3/4 animate-pulse" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertTriangle className="w-12 h-12" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">High Severity</p>
          <p className="text-3xl font-black text-[var(--severity-high)] group-hover:scale-110 transition-transform origin-left">{severityCounts['High'] || 0}</p>
          <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-[var(--severity-high)] w-1/4" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-12 h-12" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Medium Risk</p>
          <p className="text-3xl font-black text-[var(--severity-medium)] group-hover:scale-110 transition-transform origin-left">{severityCounts['Medium'] || 0}</p>
          <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-[var(--severity-medium)] w-2/4" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="w-12 h-12" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Low Priority</p>
          <p className="text-3xl font-black text-[var(--severity-low)] group-hover:scale-110 transition-transform origin-left">{severityCounts['Low'] || 0}</p>
          <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-[var(--severity-low)] w-full opacity-30" />
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-12 opacity-0 animate-fade-in-up stagger-3">
        <SearchAndFilters
          onSearch={handleSearch}
          onFilter={handleFilter}
          onReset={handleReset}
        />
      </div>

      {/* Results Info */}
      {(searchQuery || Object.values(filters).some(v => v)) && (
        <div className="mb-8 flex items-center justify-between opacity-0 animate-fade-in">
          <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
            {isLoading ? (
              <div className="flex items-center gap-3 bg-[var(--bg-card)] px-4 py-2 rounded-full border border-white/5">
                <div className="w-2 h-2 bg-[var(--accent-blue)] rounded-full animate-ping" />
                <span>Decrypting intelligence for <span className="text-white font-mono">"{searchQuery}"</span>...</span>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
                  <span className="text-white font-bold">{totalResults}</span> signals found
                </span>
                {searchQuery && (
                  <span className="text-[var(--accent-blue)] font-mono">/ filter: {searchQuery}</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card p-8 rounded-3xl animate-pulse">
              <div className="flex justify-between mb-8">
                <div className="h-6 w-24 bg-white/5 rounded-full" />
                <div className="h-6 w-16 bg-white/5 rounded-full" />
              </div>
              <div className="h-8 w-3/4 bg-white/5 rounded-xl mb-6" />
              <div className="space-y-3 mb-8">
                <div className="h-4 w-full bg-white/5 rounded-lg" />
                <div className="h-4 w-5/6 bg-white/5 rounded-lg" />
                <div className="h-4 w-2/3 bg-white/5 rounded-lg" />
              </div>
              <div className="pt-8 border-t border-white/5 flex justify-between">
                <div className="h-5 w-20 bg-white/5 rounded-lg" />
                <div className="h-5 w-24 bg-white/5 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : incidents && incidents.length > 0 ? (
        <>
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            onMouseLeave={() => setHoveredId(null)}
          >
            {incidents.map((incident, index) => (
              <div
                key={incident.id}
                className={`opacity-0 animate-fade-in-up stagger-${Math.min(index % 6 + 1, 6)} h-full`}
                onMouseEnter={() => setHoveredId(incident.id)}
              >
                <IncidentCard 
                  incident={incident} 
                  isHovered={hoveredId === incident.id}
                  isOtherHovered={hoveredId !== null && hoveredId !== incident.id}
                />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-20 flex flex-col items-center gap-8">
              <div className="flex items-center gap-2 p-1.5 bg-[var(--bg-secondary)] border border-white/5 rounded-2xl">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-3 bg-[var(--bg-card)] border border-white/10 rounded-xl text-[var(--text-secondary)] hover:text-white hover:border-[var(--accent-blue)] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-1 px-4">
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
                        <div key={page} className="flex items-center">
                          {showEllipsisBefore && (
                            <span className="px-3 text-[var(--text-muted)] font-mono">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`w-12 h-12 rounded-xl text-sm font-bold font-mono transition-all ${
                              currentPage === page
                                ? 'bg-[var(--accent-blue)] text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                                : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {page.toString().padStart(2, '0')}
                          </button>
                        </div>
                      );
                    })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-3 bg-[var(--bg-card)] border border-white/10 rounded-xl text-[var(--text-secondary)] hover:text-white hover:border-[var(--accent-blue)] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-[10px] font-bold font-mono text-[var(--text-muted)] uppercase tracking-[0.4em]">
                Page {currentPage} of {totalPages} // {totalResults} signals logged
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-32 glass-card rounded-3xl border-dashed">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/5">
            <Shield className="w-10 h-10 text-[var(--text-muted)] opacity-20" />
          </div>
          <h3 className="text-2xl font-black text-white mb-4">No Signals Detected</h3>
          <p className="text-[var(--text-secondary)] text-sm mb-12 max-w-sm mx-auto">The search criteria did not match any historical or live intelligence records in our database.</p>
          <button 
            onClick={handleReset}
            className="px-8 py-4 bg-white text-black rounded-2xl text-sm font-black hover:bg-[var(--accent-blue)] hover:text-white transition-all transform hover:-translate-y-1"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Info Panel */}
      <div className="mt-32 p-12 glass-card rounded-[3rem] relative overflow-hidden group">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[var(--accent-blue)]/10 rounded-full blur-[100px] group-hover:bg-[var(--accent-blue)]/20 transition-colors" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="w-16 h-16 bg-[var(--accent-blue)]/10 rounded-2xl flex items-center justify-center mb-8 border border-[var(--accent-blue)]/20">
              <Terminal className="w-8 h-8 text-[var(--accent-blue)]" />
            </div>
            <h4 className="text-3xl font-black text-white mb-6">Autonomous Analysis Engine</h4>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-8">
              Every signal is processed through our multi-layered AI pipeline. We analyze TTPs (Tactics, Techniques, and Procedures), correlate with known threat actors, and generate technical remediation paths automatically.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-xs font-bold text-white uppercase tracking-widest">
                <Lock className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
                AES-256 Analysis
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-xs font-bold text-white uppercase tracking-widest">
                <Activity className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
                Real-time Sync
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
              <p className="text-4xl font-black text-white mb-2">99.9%</p>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Precision Rate</p>
            </div>
            <div className="p-8 bg-white/5 rounded-3xl border border-white/10 mt-8">
              <p className="text-4xl font-black text-white mb-2">24/7</p>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Active Monitor</p>
            </div>
            <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
              <p className="text-4xl font-black text-white mb-2">ML-X</p>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Core Engine</p>
            </div>
            <div className="p-8 bg-white/5 rounded-3xl border border-white/10 mt-8">
              <p className="text-4xl font-black text-white mb-2">API-v2</p>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Integration</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
