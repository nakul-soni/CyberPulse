'use client';

import { useState } from 'react';
import { Search, Filter, X, ChevronDown, Sparkles, Command } from 'lucide-react';

interface SearchAndFiltersProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterState) => void;
  onReset: () => void;
}

interface FilterState {
  severity?: string;
  attackType?: string;
  date?: string;
}

export function SearchAndFilters({ onSearch, onFilter, onReset }: SearchAndFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({});
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({});
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    onFilter(filters);
  };

  const handleReset = () => {
    setSearchQuery('');
    setFilters({});
    setAppliedFilters({});
    onSearch('');
    onReset();
  };

  const hasActiveFilters = Object.values(appliedFilters).some(v => v) || searchQuery;
  const filterCount = Object.values(appliedFilters).filter(v => v).length;

  return (
    <div className="space-y-6">
      <div 
        className={`
          relative transition-all duration-500
          ${isFocused ? 'transform scale-[1.01]' : ''}
        `}
      >
        {/* Search Input Container */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <div className={`absolute inset-0 bg-gradient-to-r from-[var(--accent-blue)]/20 to-[var(--accent-purple)]/20 rounded-[1.5rem] blur-xl transition-opacity duration-500 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />
            
            <div className={`
              relative flex items-center glass-card rounded-[1.5rem] px-6 py-4 transition-all duration-300
              ${isFocused ? 'border-[var(--accent-blue)]/50 bg-[var(--bg-card)]' : 'hover:border-white/20'}
            `}>
              <Search className={`w-5 h-5 transition-colors duration-300 ${isFocused ? 'text-[var(--accent-blue)]' : 'text-[var(--text-muted)]'}`} />
              <input
                type="text"
                placeholder="Search global threat intelligence..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="flex-1 bg-transparent border-none outline-none px-4 text-base text-white placeholder-[var(--text-muted)] font-medium"
              />
              <div className="hidden md:flex items-center gap-2 border-l border-white/10 pl-4 ml-4">
                <Command className="w-3 h-3 text-[var(--text-muted)]" />
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">K</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-[1.5rem] glass-card transition-all duration-300 group
              ${showFilters 
                ? 'bg-[var(--accent-blue)] border-[var(--accent-blue)] text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]' 
                : 'text-[var(--text-secondary)] hover:border-[var(--accent-blue)]/50 hover:text-white'}
            `}
          >
            <Filter className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : 'group-hover:rotate-12'}`} />
            <span className="text-sm font-black uppercase tracking-widest">Filter Ops</span>
            {filterCount > 0 && (
              <span className="w-5 h-5 flex items-center justify-center bg-white text-[var(--accent-blue)] rounded-full text-[10px] font-black">
                {filterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Filters Area */}
      <div className={`
        overflow-hidden transition-all duration-500 ease-in-out
        ${showFilters ? 'max-h-[500px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4'}
      `}>
        <div className="glass-card rounded-[2rem] p-8 mt-4 border-dashed">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Severity Matrix</label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['High', 'Medium', 'Low'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => handleFilterChange('severity', filters.severity === sev ? '' : sev)}
                    className={`
                      py-2.5 rounded-xl text-[10px] font-black border transition-all uppercase tracking-widest
                      ${filters.severity === sev 
                        ? 'bg-[var(--accent-blue)]/20 border-[var(--accent-blue)] text-white' 
                        : 'bg-white/5 border-white/5 text-[var(--text-muted)] hover:border-white/10 hover:text-white'}
                    `}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="w-3.5 h-3.5 text-[var(--accent-purple)]" />
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Vector Classification</label>
              </div>
              <select
                value={filters.attackType || ''}
                onChange={(e) => handleFilterChange('attackType', e.target.value)}
                className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[var(--accent-blue)] transition-colors cursor-pointer appearance-none"
              >
                <option value="" className="bg-[var(--bg-primary)]">All Attack Types</option>
                {['Ransomware', 'Data Breach', 'Zero-day', 'Phishing', 'APT', 'Malware', 'DDoS'].map(type => (
                  <option key={type} value={type} className="bg-[var(--bg-primary)]">{type}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-3.5 h-3.5 text-[var(--accent-teal)]" />
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Temporal Filter</label>
              </div>
              <input
                type="date"
                value={filters.date || ''}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[var(--accent-blue)] transition-colors cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/5">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--severity-high)] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Wipe Parameters
            </button>
            <div className="flex gap-4">
              <button
                onClick={() => setShowFilters(false)}
                className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleApplyFilters();
                  setShowFilters(false);
                }}
                className="px-8 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[var(--accent-blue)] hover:text-white transition-all shadow-lg hover:shadow-[var(--accent-blue)]/20"
              >
                Execute Analysis
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
