import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { motion } from 'framer-motion';
import type { DistributionItem } from '../../services/api';

const EMERALD_PRIMARY = '#10b981';

interface FeatureInsightsProps {
  roomDist: DistributionItem[];
  parkingDist: DistributionItem[];
}

const FeatureInsights = ({ roomDist, parkingDist }: FeatureInsightsProps) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Structural Metrics */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 premium-card flex flex-col h-[480px]"
        >
          <div className="mb-8">
            <h3 className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Supply Distribution</h3>
            <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--text-secondary)' }}>Market inventory split by architectural configuration</p>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roomDist}>
                <XAxis dataKey="label" stroke="var(--axis-color)" fontSize={9} fontWeight={700} tickLine={false} axisLine={false} dy={5} />
                <YAxis stroke="var(--axis-color)" fontSize={9} fontWeight={700} tickLine={false} axisLine={false} dx={-5} />
                <Tooltip
                  cursor={{ fill: 'var(--glass-white)' }}
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={32}>
                  {roomDist.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? EMERALD_PRIMARY : 'var(--glass-border)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Parking Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 premium-card flex flex-col h-[480px]"
        >
          <div className="mb-8">
            <h3 className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Logistics Index</h3>
            <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--text-secondary)' }}>Connectivity/Parking ratio analysis</p>
          </div>
          <div className="h-[200px] w-full relative mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={parkingDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  strokeWidth={0}
                >
                   {parkingDist.map((_, index) => (
                    <Cell key={`cell-p-${index}`} fill={index === 0 ? EMERALD_PRIMARY : 'var(--glass-white)'} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <p className="text-3xl font-bold tracking-tighter" style={{ color: 'var(--text-primary)' }}>{parkingDist[0]?.count || 0}</p>
               <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Allocated</p>
            </div>
          </div>
          <div className="space-y-2.5 overflow-y-auto pr-1 no-scrollbar">
            {parkingDist.slice(0, 4).map((item, index) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl hover:bg-brand-emerald/10 transition-colors" style={{ backgroundColor: 'var(--glass-white)', borderColor: 'var(--glass-border)', border: '1px solid' }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: index === 0 ? EMERALD_PRIMARY : 'var(--text-secondary)' }} />
                  <span className="text-xs font-bold leading-none" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                </div>
                <span className="font-bold text-sm leading-none" style={{ color: 'var(--text-primary)' }}>{item.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Strategic Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-12 relative overflow-hidden rounded-2xl border p-8 lg:p-12"
          style={{
            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
            borderColor: 'var(--card-border)'
          }}
        >
           <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-emerald/10 border border-brand-emerald/20 mb-6">
                   <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
                   <span className="text-[10px] font-bold text-brand-emerald uppercase tracking-widest">Market Intelligence Feed</span>
                </div>
                 <h3 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4 leading-tight" style={{ color: 'var(--text-primary)' }}>
                    Yield Optimization <span className="text-brand-emerald">Strategies</span>
                 </h3>
                 <p className="font-medium leading-relaxed text-sm mb-10" style={{ color: 'var(--text-secondary)' }}>
                   Data indicates that assets with dedicated parking command a 18.4% premium. Focus clusters for the next quarter should prioritize 1-Bedroom units in high-mobility transit corridors for optimal capital appreciation.
                 </p>
                 <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--glass-white)', borderColor: 'var(--glass-border)' }}>
                    <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Primary Focus</p>
                    <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Studio / 1BR</p>
                  </div>
                  <div className="p-5 rounded-2xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--brand-emerald-20)' }}>
                    <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Yield Target</p>
                    <p className="font-bold text-lg" style={{ color: 'var(--brand-emerald)' }}>6.8% - 8.2%</p>
                  </div>
                </div>
              </div>
              
              <div className="w-72 h-72 rounded-full border-[12px] flex items-center justify-center relative" style={{ borderColor: 'var(--glass-white)' }}>
                 <div className="w-56 h-56 rounded-full border flex items-center justify-center bg-brand-emerald/5" style={{ borderColor: 'var(--brand-emerald-20)' }}>
                    <div className="text-center">
                       <p className="text-7xl font-bold tracking-tighter" style={{ color: 'var(--text-primary)' }}>ROI</p>
                       <p className="text-brand-emerald font-bold tracking-[0.2em] text-[10px] uppercase">Alpha Protocol</p>
                    </div>
                 </div>
                 {/* Decorative elements */}
                 <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-brand-emerald blur-md opacity-50" />
                 <div className="absolute bottom-12 left-0 w-8 h-8 rounded-full border border-brand-emerald/30" />
              </div>
           </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FeatureInsights;
