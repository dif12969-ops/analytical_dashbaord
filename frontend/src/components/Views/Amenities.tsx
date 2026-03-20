import { 
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';
import { motion } from 'framer-motion';
import type { AmenitySummary } from '../../services/api';


interface AmenitiesProps {
  data: AmenitySummary | null;
}

const Amenities = ({ data }: AmenitiesProps) => {
  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Modern Circular Hub Analysis */}
        <div className="lg:col-span-12 premium-card">
          <div className="mb-10">
            <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Proximity Discovery</h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Node density analysis for key geographic landmarks</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
             {data.top_landmarks.slice(0, 5).map((item, index) => (
                <div key={item.label} className="flex flex-col items-center group">
                   <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                         <circle 
                           cx="64" cy="64" r="58" 
                           fill="none" stroke="var(--glass-white)" strokeWidth="8" 
                         />
                         <motion.circle 
                           cx="64" cy="64" r="58" 
                           fill="none" 
                           stroke={index % 2 === 0 ? '#10b981' : '#10b981'} 
                           strokeWidth="8" 
                           strokeDasharray={364}
                           initial={{ strokeDashoffset: 364 }}
                           animate={{ strokeDashoffset: 364 - (364 * (Number(item.count || 0) / (Number(data.top_landmarks[0]?.count) || 1))) }}
                           transition={{ duration: 1, delay: index * 0.1 }}
                           strokeLinecap="round"
                        />
                      </svg>
                      <div className="text-center">
                         <p className="text-2xl font-bold leading-none mb-1" style={{ color: 'var(--text-primary)' }}>{item.count}</p>
                         <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Units</p>
                      </div>
                   </div>
                   <p className="mt-6 text-[11px] font-bold uppercase tracking-wider text-center group-hover:text-brand-emerald transition-colors" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                </div>
             ))}
          </div>
        </div>

        {/* Metro & Malls */}
        {[
          { title: 'Transit Access', data: data.top_metros, color: '#10b981', label: 'Proximity to rail nodes' },
          { title: 'Retail Clusters', data: data.top_malls, color: '#10b981', label: 'Major commercial hubs' }
        ].map((section) => (
          <div key={section.title} className="lg:col-span-6 premium-card relative overflow-hidden">
            <div className="mb-8">
              <h3 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{section.title}</h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{section.label}</p>
            </div>
            
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={section.data.slice(0, 6)}>
                    <CartesianGrid strokeDasharray="0" vertical={false} stroke="var(--glass-border)" />
                    <XAxis 
                      dataKey="label" 
                      stroke="var(--axis-color)" 
                      fontSize={10} 
                      tickFormatter={(val) => val.split(' ')[0]} 
                      tickLine={false} 
                      axisLine={false}
                      dy={10}
                      tick={{ fontWeight: 600 }}
                    />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{ fill: 'var(--glass-white)' }}
                      contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '1rem', padding: '12px' }}
                      itemStyle={{ color: 'var(--text-primary)', fontSize: '11px', fontWeight: 700 }}
                    />
                    <Bar dataKey="count" fill={section.color} radius={[6, 6, 0, 0]} barSize={24}>
                      {section.data.slice(0, 6).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={section.color} fillOpacity={1 - (index * 0.12)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default Amenities;
