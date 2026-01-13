'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { IncidentCard } from './IncidentCard';
import { SearchAndFilters } from './SearchAndFilters';
import { Shield, Zap, Info, Activity, AlertTriangle, TrendingUp, Server } from 'lucide-react';

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

export function DashboardClient({ initialIncidents }: { initialIncidents: Incident[] }) {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [isPolling, setIsPolling] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({});
  const [totalResults, setTotalResults] = useState<number>(initialIncidents.length);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchIncidents = useCallback(async (search?: string, filterState?: FilterState) => {
    const query = search !== undefined ? search : searchQuery;
    const filter = filterState !== undefined ? filterState : filters;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
      });

      if (!query && !filter.date && !filter.severity && !filter.attackType) {
        params.set('todayOnly', 'true');
      }

      if (query) {
        params.set('query', query);
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
        setIncidents(data.data);
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
    const needsPolling = incidents.some((incident) => {
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
      const updated = await fetchIncidents(searchQuery, filters);
      
      if (updated) {
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
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [incidents, searchQuery, filters, fetchIncidents]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchIncidents(query, filters);
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

  const severityCounts = incidents.reduce((acc, inc) => {
    const sev = inc.severity || 'Low';
    acc[sev] = (acc[sev] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6 opacity-0 animate-fade-in-up stagger-1">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest bg-[var(--accent-blue)]/10 text-[var(--accent-cyan)] rounded border border-[var(--accent-blue)]/20">
                Live Feed
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-2">
              Threat Intelligence Dashboard
            </h1>
            <p className="text-[var(--text-secondary)] max-w-2xl text-xs sm:text-sm">
              Real-time cyber threat intelligence powered by AI. Monitoring global feeds with actionable analysis.
            </p>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-lg">
            <div className="relative">
              <div className="w-9 h-9 bg-[var(--severity-low)]/10 rounded-lg flex items-center justify-center">
                <Server className="w-4 h-4 text-[var(--severity-low)]" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[var(--severity-low)] rounded-full animate-pulse" />
            </div>
            <div>
              <p className="text-[9px] font-mono uppercase tracking-wider text-[var(--text-muted)]">System Status</p>
              <p className="text-xs font-medium text-[var(--text-primary)]">
                AI Engine: <span className="text-[var(--severity-low)]">Online</span>
                {isPolling && (
                  <span className="ml-1.5 text-[10px] text-[var(--accent-cyan)]">(Processing...)</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 opacity-0 animate-fade-in-up stagger-2">
        <div className="p-3.5 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <Activity className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
            <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">Total</span>
          </div>
          <p className="text-xl font-bold text-[var(--text-primary)]">{totalResults}</p>
        </div>
        <div className="p-3.5 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-[var(--severity-high)]" />
            <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">High</span>
          </div>
          <p className="text-xl font-bold text-[var(--severity-high)]">{severityCounts['High'] || 0}</p>
        </div>
        <div className="p-3.5 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[var(--severity-medium)]" />
            <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">Medium</span>
          </div>
          <p className="text-xl font-bold text-[var(--severity-medium)]">{severityCounts['Medium'] || 0}</p>
        </div>
        <div className="p-3.5 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <Zap className="w-3.5 h-3.5 text-[var(--severity-low)]" />
            <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">Low</span>
          </div>
          <p className="text-xl font-bold text-[var(--severity-low)]">{severityCounts['Low'] || 0}</p>
        </div>
      </div>

      <div className="opacity-0 animate-fade-in-up stagger-3">
        <SearchAndFilters
          onSearch={handleSearch}
          onFilter={handleFilter}
          onReset={handleReset}
        />
      </div>

      {(searchQuery || Object.values(filters).some(v => v)) && (
        <div className="mb-6 text-sm text-[var(--text-secondary)] opacity-0 animate-fade-in-up">
          Found <span className="font-semibold text-[var(--text-primary)]">{totalResults}</span> incident{totalResults !== 1 ? 's' : ''}
          {searchQuery && <span className="text-[var(--accent-cyan)]"> matching "{searchQuery}"</span>}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-4 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl animate-pulse">
              <div className="flex gap-2 mb-3">
                <div className="h-4 w-14 bg-[var(--bg-card-hover)] rounded-full" />
                <div className="h-4 w-16 bg-[var(--bg-card-hover)] rounded" />
              </div>
              <div className="h-5 w-3/4 bg-[var(--bg-card-hover)] rounded mb-2" />
              <div className="h-3.5 w-full bg-[var(--bg-card-hover)] rounded mb-1.5" />
              <div className="h-3.5 w-2/3 bg-[var(--bg-card-hover)] rounded mb-3" />
              <div className="flex justify-between pt-3 border-t border-[var(--border-primary)]">
                <div className="h-4 w-20 bg-[var(--bg-card-hover)] rounded" />
                <div className="h-4 w-16 bg-[var(--bg-card-hover)] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : incidents && incidents.length > 0 ? (
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          onMouseLeave={() => setHoveredId(null)}
        >
          {incidents.map((incident, index) => (
            <div
              key={incident.id}
              className={`opacity-0 animate-fade-in-up stagger-${Math.min(index % 6 + 1, 6)}`}
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
      ) : (
        <div className="text-center py-16 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl border-dashed opacity-0 animate-fade-in-up">
          <div className="w-14 h-14 bg-[var(--bg-card-hover)] rounded-full flex items-center justify-center mx-auto mb-3">
            <Shield className="w-7 h-7 text-[var(--text-muted)]" />
          </div>
          <h3 className="text-base font-semibold text-[var(--text-primary)]">No incidents found</h3>
          <p className="text-[var(--text-secondary)] text-xs mb-5">Start by refreshing the news feed to fetch the latest intelligence.</p>
          <a 
            href="/api/ingest" 
            className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Zap className="w-3.5 h-3.5" />
            Refresh Now
          </a>
        </div>
      )}

      <div className="mt-10 p-5 bg-gradient-to-r from-[var(--bg-card)] to-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl flex items-start gap-4 opacity-0 animate-fade-in-up">
        <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent-blue)]/20 to-[var(--accent-purple)]/20 rounded-lg flex items-center justify-center shrink-0">
          <Info className="w-5 h-5 text-[var(--accent-cyan)]" />
        </div>
        <div>
          <h4 className="font-bold text-base mb-1 text-[var(--text-primary)]">About CyberPulse AI</h4>
          <p className="text-[var(--text-secondary)] text-xs leading-relaxed max-w-3xl">
            CyberPulse uses advanced LLMs to process raw technical data into structured intelligence. Our models classify attack types, determine severity, and generate step-by-step mitigation guides tailored for both technical and non-technical stakeholders.
          </p>
        </div>
      </div>
    </div>
  );
}
