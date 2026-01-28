'use client';

import { useState } from 'react';
import { Search, Filter, X, ChevronDown, Calendar, Sparkles, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="space-y-4">
      <div className="relative flex items-center gap-3">
        <div className={`relative flex-1 group transition-all duration-300 ${isFocused ? 'scale-[1.01]' : ''}`}>
          <div className={`absolute inset-0 bg-gradient-to-r from-[var(--accent-blue)]/20 to-[var(--accent-purple)]/20 rounded-2xl blur-xl transition-opacity duration-500 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />
          <div className="relative">
            <Search className={`absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${isFocused ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-muted)]'}`} />
            <input
              type="text"
              placeholder="Search intelligence (e.g. Ransomware, Microsoft, APT28)..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`
                w-full pl-14 pr-14 py-4.5 bg-[#0d0d14] border-2 rounded-2xl 
                text-base text-[var(--text-primary)] placeholder-[var(--text-muted)]/50
                outline-none transition-all duration-300
                ${isFocused 
                  ? 'border-[var(--accent-blue)]/50 shadow-2xl shadow-blue-500/10' 
                  : 'border-white/5 hover:border-white/10'}
              `}
            />
            {searchQuery && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-5 top-1/2 transform -translate-y-1/2 p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            hidden sm:flex items-center gap-3 px-6 py-4.5 rounded-2xl border-2 font-mono font-bold text-xs uppercase tracking-widest transition-all duration-300
            ${showFilters 
              ? 'bg-[var(--accent-blue)]/10 border-[var(--accent-blue)]/50 text-[var(--accent-cyan)] shadow-lg shadow-blue-500/10' 
              : 'bg-[#0d0d14] border-white/5 text-[var(--text-muted)] hover:border-white/10 hover:text-[var(--text-primary)]'}
          `}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filter
          {filterCount > 0 && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--accent-blue)] text-white text-[10px] shadow-lg shadow-blue-500/20">
              {filterCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setShowFilters(true)}
          className="sm:hidden p-4.5 bg-[#0d0d14] border-2 border-white/5 rounded-2xl text-[var(--text-secondary)] relative active:scale-95 transition-transform"
        >
          <Filter className="w-5 h-5" />
          {filterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-[var(--accent-blue)] text-white rounded-full border-2 border-[var(--bg-primary)]">
              {filterCount}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="hidden sm:block overflow-hidden"
          >
            <div className="mt-4 p-8 bg-[#0d0d14]/50 backdrop-blur-xl border-2 border-white/5 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <SlidersHorizontal className="w-32 h-32" />
              </div>
              
              <div className="relative grid grid-cols-3 gap-8">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    <Sparkles className="w-3 h-3 text-[var(--accent-blue)]" />
                    Severity
                  </label>
                  <select
                    value={filters.severity || ''}
                    onChange={(e) => handleFilterChange('severity', e.target.value)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-xl text-[var(--text-primary)] outline-none focus:border-[var(--accent-blue)]/50 transition-all cursor-pointer appearance-none"
                  >
                    <option value="">All Levels</option>
                    <option value="High">High Severity</option>
                    <option value="Medium">Medium Severity</option>
                    <option value="Low">Low Severity</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    <Filter className="w-3 h-3 text-[var(--accent-purple)]" />
                    Attack Type
                  </label>
                  <select
                    value={filters.attackType || ''}
                    onChange={(e) => handleFilterChange('attackType', e.target.value)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-xl text-[var(--text-primary)] outline-none focus:border-[var(--accent-blue)]/50 transition-all cursor-pointer appearance-none"
                  >
                    <option value="">All Vectors</option>
                    <option value="Ransomware">Ransomware</option>
                    <option value="Data Breach">Data Breach</option>
                    <option value="Zero-day">Zero-day</option>
                    <option value="Phishing">Phishing</option>
                    <option value="APT">Advanced Persistent Threat</option>
                    <option value="Malware">Malware Analysis</option>
                    <option value="DDoS">DDoS Attack</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    <Calendar className="w-3 h-3 text-[var(--accent-cyan)]" />
                    Timeline
                  </label>
                  <input
                    type="date"
                    value={filters.date || ''}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-xl text-[var(--text-primary)] outline-none focus:border-[var(--accent-blue)]/50 transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  Advanced Intelligence Filtering v2.0
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setFilters({}); setAppliedFilters({}); onReset(); }}
                    className="px-6 py-2.5 text-[10px] font-mono font-bold text-[var(--text-secondary)] hover:text-white transition-colors uppercase tracking-widest"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleApplyFilters}
                    className="px-8 py-2.5 bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] text-white text-[10px] font-mono font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:scale-105 transition-all uppercase tracking-widest"
                  >
                    Apply Analysis Filters
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Filters Bottom Sheet */}
      <AnimatePresence>
        {showFilters && (
          <div className="sm:hidden fixed inset-0 z-[100] flex flex-col justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              onClick={() => setShowFilters(false)}
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative bg-[#0a0a0f] border-t border-white/10 rounded-t-[40px] p-8 pb-12 shadow-[0_-20px_50px_rgba(0,0,0,0.8)]"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-10" />
              
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Analysis Filters</h3>
                <button 
                  onClick={handleReset}
                  className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--accent-blue)]"
                >
                  Reset All
                </button>
              </div>

              <div className="space-y-10 max-h-[60vh] overflow-y-auto no-scrollbar pb-6">
                <div className="space-y-5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Severity Index</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['High', 'Medium', 'Low'].map((sev) => (
                      <button
                        key={sev}
                        onClick={() => handleFilterChange('severity', filters.severity === sev ? '' : sev)}
                        className={`
                          py-4 px-2 rounded-2xl text-xs font-bold border transition-all
                          ${filters.severity === sev 
                            ? 'bg-[var(--accent-blue)]/20 border-[var(--accent-blue)]/50 text-[var(--accent-cyan)] shadow-lg shadow-blue-500/10' 
                            : 'bg-white/5 border-white/5 text-[var(--text-muted)]'}
                        `}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Attack Vector</label>
                  <div className="flex flex-wrap gap-2.5">
                    {['Ransomware', 'Data Breach', 'Zero-day', 'Phishing', 'APT', 'Malware', 'DDoS'].map((type) => (
                      <button
                        key={type}
                        onClick={() => handleFilterChange('attackType', filters.attackType === type ? '' : type)}
                        className={`
                          py-3 px-5 rounded-2xl text-xs font-bold border transition-all
                          ${filters.attackType === type 
                            ? 'bg-[var(--accent-blue)]/20 border-[var(--accent-blue)]/50 text-[var(--accent-cyan)] shadow-lg shadow-blue-500/10' 
                            : 'bg-white/5 border-white/5 text-[var(--text-muted)]'}
                        `}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Intelligence Timeline</label>
                  <input
                    type="date"
                    value={filters.date || ''}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                    className="w-full px-6 py-4.5 bg-white/5 border-2 border-white/5 rounded-2xl text-[var(--text-primary)] outline-none focus:border-[var(--accent-blue)]/50 transition-all"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  handleApplyFilters();
                  setShowFilters(false);
                }}
                className="w-full mt-10 py-5 bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] text-white font-mono font-bold uppercase tracking-[0.2em] rounded-[24px] shadow-2xl shadow-blue-500/30 active:scale-[0.98] transition-transform"
              >
                Apply Analysis
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
