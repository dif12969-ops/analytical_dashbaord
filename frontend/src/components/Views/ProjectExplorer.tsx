import { Building2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DistributionItem } from '../../services/api';

interface ProjectExplorerProps {
  projects: DistributionItem[];
}

const ProjectExplorer = ({ projects }: ProjectExplorerProps) => {
  const totalVolume = projects.reduce((acc, curr) => acc + Number(curr.value || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* High-Density Ranking List */}
        <div className="lg:col-span-8 premium-card !p-0 overflow-hidden">
          <div className="p-6 lg:p-8 flex items-center justify-between" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <div>
              <h3 className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Project Portfolio</h3>
              <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--text-secondary)' }}>Market dominance by individual development</p>
            </div>
          </div>
          
          <div className="divide-y" style={{ borderTopColor: 'var(--card-border)' }}>
             {projects.slice(0, 10).map((item, index) => (
                <div key={item.label} className="group flex items-center gap-6 p-5 hover:bg-white/[0.01] transition-all">
                   <div className="w-8 text-lg font-bold group-hover:text-brand-emerald transition-colors" style={{ color: 'var(--text-secondary)' }}>
                      {(index + 1).toString().padStart(2, '0')}
                   </div>
                   
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2.5">
                         <h4 className="font-bold text-xs truncate uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>{item.label}</h4>
                         <span className="font-bold text-xs tracking-tighter" style={{ color: 'var(--text-primary)' }}>AED {(Number(item.value || 0) / 1e9).toFixed(2)}B</span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden relative" style={{ backgroundColor: 'var(--glass-white)' }}>
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${(Number(item.value || 0) / (Number(projects[0]?.value) || 1)) * 100}%` }}
                           transition={{ duration: 1.2, delay: index * 0.1 }}
                           className="absolute inset-y-0 left-0 bg-brand-emerald rounded-full"
                         />
                      </div>
                   </div>
                   
                   <div className="hidden md:flex flex-col items-end gap-0.5 min-w-[80px]">
                      <div className="flex items-center gap-1.5 text-brand-emerald">
                         <TrendingUp className="w-3 h-3" />
                         <span className="text-[9px] font-bold uppercase tracking-widest">Active</span>
                      </div>
                      <p className="text-[10px] font-bold" style={{ color: 'var(--text-secondary)' }}>{item.count} units</p>
                   </div>
                </div>
             ))}
          </div>
        </div>

        {/* Portfolio Intelligence */}
        <div className="lg:col-span-4 space-y-6">
          <div className="premium-card relative overflow-hidden p-8 border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="relative z-10">
              <div className="w-10 h-10 bg-brand-emerald/10 text-brand-emerald rounded-xl flex items-center justify-center mb-6 border border-brand-emerald/20">
                 <Building2 className="w-4 h-4" />
              </div>
              <h4 className="text-xl font-bold tracking-tight mb-1 leading-none" style={{ color: 'var(--text-primary)' }}>Concentration</h4>
              <p className="font-bold text-[9px] mb-8 uppercase tracking-[0.2em]" style={{ color: 'var(--text-secondary)' }}>Project Volume Split</p>
              
              <div className="space-y-6">
                {projects.slice(0, 4).map((item, i) => (
                  <div key={item.label} className="relative">
                     <div className="flex justify-between items-end mb-2">
                       <span className="font-bold text-[9px] uppercase tracking-widest truncate w-40" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                       <span className="text-sm font-bold leading-none" style={{ color: 'var(--text-primary)' }}>{totalVolume > 0 ? ((Number(item.value || 0) / totalVolume) * 100).toFixed(1) : '0.0'}%</span>
                     </div>
                     <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--glass-white)' }}>
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${totalVolume > 0 ? (Number(item.value || 0) / totalVolume) * 100 : 0}%` }}
                           transition={{ duration: 1, delay: i * 0.2 }}
                           className="h-full bg-brand-emerald rounded-full" 
                        />
                     </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="premium-card relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                 <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald" />
                 Market Metrics
              </h4>
              <div className="grid grid-cols-1 gap-4">
                 <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--glass-white)', border: '1px solid var(--glass-border)' }}>
                    <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Total Nodes</p>
                    <div className="flex items-baseline gap-3">
                       <p className="text-3xl font-bold tracking-tighter" style={{ color: 'var(--text-primary)' }}>{projects.length}</p>
                       <p className="text-brand-emerald text-[10px] font-bold">+4.2%</p>
                    </div>
                 </div>
                 <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--glass-white)', border: '1px solid var(--glass-border)' }}>
                    <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Density Mean</p>
                    <div className="flex items-baseline gap-3">
                        <p className="text-3xl font-bold tracking-tighter" style={{ color: 'var(--text-primary)' }}>{projects.length > 0 ? (projects.reduce((acc, curr) => acc + Number(curr.count || 0), 0) / projects.length).toFixed(0) : '0'}</p>
                       <p className="text-brand-emerald text-[10px] font-bold tracking-widest">STABLE</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProjectExplorer;
