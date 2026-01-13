'use client';

import { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';

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
    <div className="mb-8 space-y-4">
      <div 
        className={`
          relative transition-all duration-300 mb-8 sm:mb-4
          ${isFocused ? 'scale-[1.01]' : ''}
        `}
      >
        <Search className={`absolute left-5 sm:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${isFocused ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-muted)]'}`} />
          <input
            type="text"
            placeholder="Search threats..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`
              w-full pl-12 sm:pl-12 pr-12 sm:pr-12 py-4 sm:py-3.5 
              bg-[var(--bg-card)] border rounded-2xl sm:rounded-xl 
              text-base sm:text-base text-[var(--text-primary)] placeholder-[var(--text-muted)]
              outline-none transition-all duration-200
              ${isFocused 
                ? 'border-[var(--accent-blue)] shadow-lg shadow-[var(--accent-blue)]/10' 
                : 'border-[var(--border-primary)] hover:border-[var(--text-muted)]'}
            `}
          />
        {searchQuery && (
          <button
            onClick={() => handleSearch('')}
            className="absolute right-5 sm:right-4 top-1/2 transform -translate-y-1/2 p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mb-6 sm:mb-0">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            flex items-center gap-2.5 px-6 py-3 sm:px-4 sm:py-2 text-sm font-bold rounded-xl sm:rounded-lg border transition-all duration-200 uppercase tracking-widest
            ${showFilters 
              ? 'bg-[var(--accent-blue)]/10 border-[var(--accent-blue)]/30 text-[var(--accent-cyan)]' 
              : 'bg-[var(--bg-card)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)]'}
          `}
        >
          <Filter className="w-4 h-4" />
          Filters
          {filterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-[var(--accent-blue)] text-white rounded-full">
              {filterCount}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--severity-high)] font-black uppercase tracking-widest transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear all
          </button>
        )}
      </div>

      <div className={`
        overflow-hidden transition-all duration-300 ease-out
        ${showFilters ? 'max-h-[800px] opacity-100 mt-6' : 'max-h-0 opacity-0'}
      `}>
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl sm:rounded-xl p-8 sm:p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-4 mb-10 sm:mb-5">
            <div>
              <label className="block text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 sm:mb-2">
                Severity Level
              </label>
              <select
                value={filters.severity || ''}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                className="w-full px-4 py-3 sm:px-3 sm:py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl sm:rounded-lg text-[var(--text-primary)] outline-none focus:border-[var(--accent-blue)] transition-colors cursor-pointer text-sm sm:text-base"
              >
                <option value="">All Severities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 sm:mb-2">
                Attack Type
              </label>
              <select
                value={filters.attackType || ''}
                onChange={(e) => handleFilterChange('attackType', e.target.value)}
                className="w-full px-4 py-3 sm:px-3 sm:py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl sm:rounded-lg text-[var(--text-primary)] outline-none focus:border-[var(--accent-blue)] transition-colors cursor-pointer text-sm sm:text-base"
              >
                <option value="">All Types</option>
                <option value="Ransomware">Ransomware</option>
                <option value="Data Breach">Data Breach</option>
                <option value="Zero-day">Zero-day</option>
                <option value="Phishing">Phishing</option>
                <option value="APT">APT</option>
                <option value="Malware">Malware</option>
                <option value="DDoS">DDoS</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 sm:mb-2">
                Date
              </label>
              <input
                type="date"
                value={filters.date || ''}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="w-full px-4 py-3 sm:px-3 sm:py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl sm:rounded-lg text-[var(--text-primary)] outline-none focus:border-[var(--accent-blue)] transition-colors cursor-pointer text-sm sm:text-base"
              />
            </div>
          </div>
          
            <div className="flex flex-col sm:flex-row justify-end gap-4 sm:gap-3 pt-8 sm:pt-4 border-t border-[var(--border-primary)]">
              <button
                onClick={() => setFilters({})}
                className="w-full sm:w-auto px-6 py-3 sm:px-4 sm:py-2 text-sm font-bold text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl sm:rounded-lg hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] transition-all uppercase tracking-widest"
              >
                Clear
              </button>
              <button
                onClick={handleApplyFilters}
                className="w-full sm:w-auto px-8 py-3 sm:px-5 sm:py-2 text-sm font-black text-white bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] rounded-xl sm:rounded-lg hover:opacity-90 transition-opacity uppercase tracking-widest"
              >
                Apply Filters
              </button>
            </div>
        </div>
      </div>
    </div>
  );
}
