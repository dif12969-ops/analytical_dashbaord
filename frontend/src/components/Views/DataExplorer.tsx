import { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../../services/api';
import type { TransactionResponse, FilterParams } from '../../services/api';
import { Search, ChevronLeft, ChevronRight, FileText, Download } from 'lucide-react';

interface DataExplorerProps {
  filters: FilterParams;
}

const DataExplorer = ({ filters }: DataExplorerProps) => {
  const [data, setData] = useState<TransactionResponse[]>([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await analyticsService.getTransactions(skip, limit, filters);
      setData(result);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  }, [skip, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="premium-card !p-0 overflow-hidden animate-in fade-in duration-500">
      <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
        <div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Market Intelligence</h3>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Analyze granular transaction protocols</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-brand-emerald transition-colors" />
            <input 
              type="text" 
              placeholder="Search area/project..."
              className="input-glass pl-9 pr-4 py-2 w-64 focus:border-brand-emerald/50"
            />
          </div>
          <button className="bg-brand-emerald text-[#0f172a] hover:bg-emerald-400 px-4 py-2 rounded-xl transition-all font-bold text-xs flex items-center gap-2 shadow-lg shadow-brand-emerald/10">
            <Download className="w-3.5 h-3.5" />
            Export Protocol
          </button>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ backgroundColor: 'var(--glass-white)', color: 'var(--text-secondary)' }}>
              <th className="px-6 py-5">Reference ID</th>
              <th className="px-6 py-5">Strategic Area</th>
              <th className="px-6 py-5">Asset Classification</th>
              <th className="px-6 py-5 text-right">Valuation (AED)</th>
              <th className="px-6 py-5 text-center">Status</th>
              <th className="px-6 py-5 text-center">Protocol</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${loading ? 'opacity-40' : ''} transition-opacity`}>
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-brand-emerald/[0.03] transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center border group-hover:border-brand-emerald/30 transition-all" style={{ backgroundColor: 'var(--glass-white)', borderColor: 'var(--glass-border)' }}>
                      <FileText className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-emerald" />
                    </div>
                    <div>
                       <p className="font-bold text-[11px] tracking-tight" style={{ color: 'var(--text-primary)' }}>#{item.id.toString().slice(-6)}</p>
                       <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{new Date(item.instance_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                   <span className="text-[11px] font-bold uppercase tracking-tight" style={{ color: 'var(--text-secondary)' }}>{item.area_en}</span>
                </td>
                <td className="px-6 py-5">
                   <div className="flex flex-col">
                      <span className="text-[11px] font-bold" style={{ color: 'var(--text-primary)' }}>{item.prop_type_en}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{item.rooms_en}</span>
                   </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <span className="text-brand-emerald font-bold text-sm tracking-tighter">
                    {(Number(item.trans_value) / 1e6).toFixed(1)}M
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                   <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-bold border transition-all ${
                     item.is_offplan_en === 'Off-Plan' 
                     ? 'bg-amber-400/5 text-amber-400 border-amber-400/20' 
                     : 'bg-brand-emerald/5 text-brand-emerald border-brand-emerald/20'
                   }`}>
                     <div className={`w-1 h-1 rounded-full ${item.is_offplan_en === 'Off-Plan' ? 'bg-amber-400' : 'bg-brand-emerald'} animate-pulse`} />
                     {item.is_offplan_en.toUpperCase()}
                   </span>
                </td>
                <td className="px-6 py-5 text-center">
                   <button className="p-1.5 hover:bg-brand-emerald/10 rounded-lg transition-colors text-slate-500 hover:text-brand-emerald">
                      <ChevronRight className="w-4 h-4" />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-5 border-t flex items-center justify-between" style={{ backgroundColor: 'var(--glass-white)', borderColor: 'var(--card-border)' }}>
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
          Showing <span style={{ color: 'var(--text-primary)' }}>{skip + 1}</span> - <span style={{ color: 'var(--text-primary)' }}>{skip + data.length}</span> entries
        </p>
        
        <div className="flex items-center gap-2">
          <button 
            disabled={skip === 0}
            onClick={() => setSkip(Math.max(0, skip - limit))}
            style={{ backgroundColor: 'var(--glass-white)', borderColor: 'var(--glass-border)' }}
            className="p-2 border rounded-xl hover:bg-black/5 disabled:opacity-20 transition-all text-slate-400 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:text-brand-emerald" />
          </button>
          <div className="px-4 py-2 rounded-xl text-[10px] font-bold border tracking-widest uppercase" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--card-border)' }}>
            PAGE {(skip / limit) + 1}
          </div>
          <button 
            onClick={() => setSkip(skip + limit)}
            style={{ backgroundColor: 'var(--glass-white)', borderColor: 'var(--glass-border)' }}
            className="p-2 border rounded-xl hover:bg-black/5 transition-all text-slate-400 group"
          >
            <ChevronRight className="w-4 h-4 group-hover:text-brand-emerald" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataExplorer;
