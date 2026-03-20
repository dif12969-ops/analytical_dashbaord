import { Filter, X, Calendar, MapPin, Building, ToggleLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FilterParams } from '../../services/api';

interface GlobalFiltersProps {
  filters: FilterParams;
  setFilters: (filters: FilterParams) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const GlobalFilters = ({ filters, setFilters, isOpen, setIsOpen }: GlobalFiltersProps) => {
  const updateFilter = (key: keyof FilterParams, value: string | undefined) => {
    setFilters({ ...filters, [key]: value || undefined });
  };

  const clearFilters = () => {
    setFilters({});
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 z-[55]"
          />
        )}
      </AnimatePresence>

      <div className={`fixed right-0 top-0 h-screen w-80 backdrop-blur-2xl border-l z-[60] p-8 transform transition-transform duration-500 shadow-3xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--card-border)' }}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-emerald/10 rounded-lg flex items-center justify-center border border-brand-emerald/20">
              <Filter className="w-4 h-4 text-brand-emerald" />
            </div>
            <h3 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Market Filters</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-8">
          {/* Time Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              <Calendar className="w-3 h-3" />
              Time Horizon
            </div>
            <div className="grid grid-cols-1 gap-3">
              <input 
                type="date" 
                className="input-glass !w-full"
                onChange={(e) => updateFilter('start_date', e.target.value)}
              />
              <input 
                type="date" 
                className="input-glass !w-full"
                onChange={(e) => updateFilter('end_date', e.target.value)}
              />
            </div>
          </div>

          {/* Location Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              <MapPin className="w-3 h-3" />
              Market Area
            </div>
            <select 
              className="input-glass !w-full appearance-none"
              onChange={(e) => updateFilter('area', e.target.value)}
            >
              <option value="">All Locations</option>
              <option value="Dubai Marina">Dubai Marina</option>
              <option value="Palm Jumeirah">Palm Jumeirah</option>
              <option value="Downtown Dubai">Downtown Dubai</option>
              <option value="Business Bay">Business Bay</option>
            </select>
          </div>

          {/* Property Type */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              <Building className="w-3 h-3" />
              Asset Class
            </div>
            <div className="flex flex-wrap gap-2">
              {['Flat', 'Villa', 'Office', 'Land'].map(type => (
                <button 
                  key={type}
                  onClick={() => updateFilter('prop_type', filters.prop_type === type ? undefined : type)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                    filters.prop_type === type 
                    ? 'bg-brand-emerald border-brand-emerald text-[#09090b] shadow-lg shadow-brand-emerald/20' 
                    : 'text-slate-500 hover:text-brand-emerald'
                  }`}
                  style={{ backgroundColor: 'var(--glass-white)', borderColor: 'var(--glass-border)' }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Off-Plan Toggle */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              <ToggleLeft className="w-3 h-3" />
              Completion Status
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => updateFilter('is_offplan', 'Off-Plan')}
                className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold border transition-all uppercase tracking-wider ${filters.is_offplan === 'Off-Plan' ? 'bg-amber-400/10 border-amber-400/30 text-amber-400' : 'text-slate-500'}`}
                style={{ backgroundColor: filters.is_offplan === 'Off-Plan' ? 'transparent' : 'var(--glass-white)', borderColor: filters.is_offplan === 'Off-Plan' ? 'rgba(251, 191, 36, 0.3)' : 'var(--glass-border)' }}
              >
                Off-Plan
              </button>
              <button 
                 onClick={() => updateFilter('is_offplan', 'Ready')}
                  className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold border transition-all uppercase tracking-wider ${filters.is_offplan === 'Ready' ? 'bg-brand-emerald/10 border-brand-emerald/30 text-brand-emerald' : 'text-slate-500'}`}
                  style={{ backgroundColor: filters.is_offplan === 'Ready' ? 'transparent' : 'var(--glass-white)', borderColor: filters.is_offplan === 'Ready' ? 'rgba(16, 185, 129, 0.3)' : 'var(--glass-border)' }}
              >
                Ready
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-8 right-8 flex gap-3">
          <button 
            onClick={clearFilters}
            className="flex-1 py-3 hover:bg-brand-emerald/10 text-slate-400 rounded-xl border transition-all font-bold text-[11px] uppercase"
            style={{ backgroundColor: 'var(--glass-white)', borderColor: 'var(--glass-border)' }}
          >
            Reset
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="bg-brand-emerald hover:bg-brand-emerald/90 text-[#09090b] flex-1 !rounded-xl !text-[11px] uppercase py-3 font-bold transition-all"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
};

export default GlobalFilters;
