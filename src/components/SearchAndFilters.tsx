'use client';

import { useState } from 'react';
import { Search, Filter, X, ChevronDown, Calendar } from 'lucide-react';

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
    <div className="mb-10 sm:mb-8 space-y-4">
      <div 
        className={`
          sticky top-14 sm:static z-40 -mx-6 px-6 sm:mx-0 sm:px-0 py-3 sm:py-0
          bg-[var(--bg-primary)]/80 sm:bg-transparent backdrop-blur-xl sm:backdrop-blur-none
          transition-all duration-300 mb-8 sm:mb-4
          ${isFocused ? 'scale-[1.01]' : ''}
        `}
      >
        <div className="relative flex items-center gap-3">
            <div className="relative flex-1 group">
              <Search className={`absolute left-5 sm:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${isFocused ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-muted)]'}`} />
                <input
                  type="text"
                  placeholder="Search any attack or case (e.g. Stuxnet, WannaCry)..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className={`
                    w-full pl-12 pr-32 py-4 sm:py-3.5 
                    bg-[var(--bg-card)] border rounded-2xl sm:rounded-xl 
                    text-base text-[var(--text-primary)] placeholder-[var(--text-muted)]
                    outline-none transition-all duration-200
                    ${isFocused 
                      ? 'border-[var(--accent-blue)] shadow-lg shadow-[var(--accent-blue)]/10' 
                      : 'border-[var(--border-primary)] hover:border-[var(--text-muted)]'}
                  `}
                />
              <div className="absolute right-12 top-1/2 transform -translate-y-1/2 hidden sm:flex items-center gap-2">
                <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest bg-[var(--accent-blue)]/10 text-[var(--accent-cyan)] rounded border border-[var(--accent-blue)]/20">
                  Global Search
                </span>
              </div>
            {searchQuery && (

              <button
                onClick={() => handleSearch('')}
                className="absolute right-5 top-1/2 transform -translate-y-1/2 p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowFilters(true)}
            className="sm:hidden p-4 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl text-[var(--text-secondary)] relative"
          >
            <Filter className="w-5 h-5" />
            {filterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-[var(--accent-blue)] text-white rounded-full border-2 border-[var(--bg-primary)]">
                {filterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="hidden sm:flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            flex items-center gap-2.5 px-4 py-2 text-sm font-bold rounded-lg border transition-all duration-200 uppercase tracking-widest
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

      {/* Desktop Filters Dropdown */}
      <div className={`
        hidden sm:block overflow-hidden transition-all duration-300 ease-out
        ${showFilters ? 'max-h-[800px] opacity-100 mt-6' : 'max-h-0 opacity-0'}
      `}>
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-5">
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Severity</label>
              <select
                value={filters.severity || ''}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                className="w-full px-3 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] outline-none focus:border-[var(--accent-blue)] transition-colors cursor-pointer text-sm"
              >
                <option value="">All Severities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Attack Type</label>
              <select
                value={filters.attackType || ''}
                onChange={(e) => handleFilterChange('attackType', e.target.value)}
                className="w-full px-3 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] outline-none focus:border-[var(--accent-blue)] transition-colors cursor-pointer text-sm"
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
              <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Date</label>
              <input
                type="date"
                value={filters.date || ''}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="w-full px-3 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] outline-none focus:border-[var(--accent-blue)] transition-colors cursor-pointer text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-primary)]">
            <button
              onClick={() => setFilters({})}
              className="px-4 py-2 text-sm font-bold text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] transition-all uppercase tracking-widest"
            >
              Clear
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-5 py-2 text-sm font-black text-white bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] rounded-lg hover:opacity-90 transition-opacity uppercase tracking-widest"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet Filters */}
      {showFilters && (
        <div className="sm:hidden fixed inset-0 z-[100] flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowFilters(false)}
          />
          <div className="relative bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] rounded-t-[32px] p-8 pb-10 animate-slide-up shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
            <div className="w-12 h-1.5 bg-[var(--border-primary)] rounded-full mx-auto mb-8" />
            
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-wider">Filters</h3>
              <button 
                onClick={handleReset}
                className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-blue)]"
              >
                Reset All
              </button>
            </div>

            <div className="space-y-8 max-h-[60vh] overflow-y-auto no-scrollbar pb-6">
              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Severity Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {['High', 'Medium', 'Low'].map((sev) => (
                    <button
                      key={sev}
                      onClick={() => handleFilterChange('severity', filters.severity === sev ? '' : sev)}
                      className={`
                        py-3 px-2 rounded-xl text-xs font-bold border transition-all
                        ${filters.severity === sev 
                          ? 'bg-[var(--accent-blue)]/20 border-[var(--accent-blue)] text-[var(--accent-cyan)]' 
                          : 'bg-[var(--bg-card)] border-[var(--border-primary)] text-[var(--text-secondary)]'}
                      `}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Attack Type</label>
                <div className="flex flex-wrap gap-2">
                  {['Ransomware', 'Data Breach', 'Zero-day', 'Phishing', 'APT', 'Malware', 'DDoS'].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleFilterChange('attackType', filters.attackType === type ? '' : type)}
                      className={`
                        py-2.5 px-4 rounded-xl text-xs font-bold border transition-all
                        ${filters.attackType === type 
                          ? 'bg-[var(--accent-blue)]/20 border-[var(--accent-blue)] text-[var(--accent-cyan)]' 
                          : 'bg-[var(--bg-card)] border-[var(--border-primary)] text-[var(--text-secondary)]'}
                      `}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Date Filter</label>
                <input
                  type="date"
                  value={filters.date || ''}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                  className="w-full px-5 py-4 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => {
                handleApplyFilters();
                setShowFilters(false);
              }}
              className="w-full mt-8 py-4 bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-[var(--accent-blue)]/20"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
