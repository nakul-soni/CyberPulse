'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { IncidentCard } from './IncidentCard';
import { SearchAndFilters } from './SearchAndFilters';
import { Shield, Zap, Info } from 'lucide-react';

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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch incidents with current search and filters
  const fetchIncidents = useCallback(async (search?: string, filterState?: FilterState) => {
    const query = search !== undefined ? search : searchQuery;
    const filter = filterState !== undefined ? filterState : filters;
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
      });

      // Only apply todayOnly if no date filter is set
      if (!filter.date) {
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
    }
    return [];
  }, [searchQuery, filters]);

  useEffect(() => {
    // Check if we need to poll (any incidents still processing)
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

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Poll every 5 seconds for updates (with current search/filters applied)
    intervalRef.current = setInterval(async () => {
      const updated = await fetchIncidents(searchQuery, filters);
      
      if (updated) {
        // Check if all incidents now have analysis
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
    }, 5000); // Poll every 5 seconds

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Intelligence Dashboard</h1>
          <p className="text-slate-500 max-w-2xl">
            Real-time cyber threat intelligence powered by AI. We monitor global news feeds and provide actionable analysis for every incident.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-blue-50 border border-blue-100 p-4 rounded-xl">
          <Zap className="text-blue-600 w-5 h-5" />
          <div>
            <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">System Status</p>
            <p className="text-sm text-blue-700">
              AI Analysis Engine: <span className="font-semibold text-blue-900">Online</span>
              {isPolling && (
                <span className="ml-2 text-xs text-blue-600">(Updating...)</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchAndFilters
        onSearch={handleSearch}
        onFilter={handleFilter}
        onReset={handleReset}
      />

      {/* Results Count */}
      {(searchQuery || Object.values(filters).some(v => v)) && (
        <div className="mb-6 text-sm text-slate-600">
          Found <span className="font-semibold text-slate-900">{totalResults}</span> incident{totalResults !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      )}

      {incidents && incidents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {incidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl border-dashed">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No incidents found</h3>
          <p className="text-slate-500 mb-6">Start by refreshing the news feed to fetch the latest intelligence.</p>
          <a href="/api/ingest" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Refresh Now
          </a>
        </div>
      )}

      <div className="mt-16 p-6 bg-slate-900 rounded-2xl text-white flex items-start gap-5">
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
          <Info className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h4 className="font-bold text-lg mb-1">About CyberPulse AI</h4>
          <p className="text-slate-400 text-sm leading-relaxed">
            CyberPulse uses advanced LLMs to process raw technical data into structured intelligence. Our models classify attack types, determine severity, and generate step-by-step mitigation guides tailored for both technical and non-technical stakeholders.
          </p>
        </div>
      </div>
    </div>
  );
}
