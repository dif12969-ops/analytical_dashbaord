import React, { useState, useMemo } from 'react';
import { 
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, ComposedChart, Line, PieChart, Pie
} from 'recharts';
import { motion } from 'framer-motion';
import { BarChart3, Activity, CircleDollarSign, Zap } from 'lucide-react';
import MarketMap from '../Dashboard/MarketMap';
import type { SummaryStats, TrendData, DistributionItem } from '../../services/api';

const EMERALD_PRIMARY = '#10b981';

const formatValue = (val: number) => {
  if (val >= 1e9) return `${(val / 1e9).toFixed(1)}B`;
  if (val >= 1e6) return `${(val / 1e6).toFixed(1)}M`;
  if (val >= 1e3) return `${(val / 1e3).toFixed(1)}K`;
  return val.toLocaleString();
};

interface OverviewProps {
  summary: SummaryStats | null;
  trendsMonth: TrendData[];
  trendsDay: TrendData[];
  propMix: DistributionItem[];
  groupDist: DistributionItem[];
  offplanDist: DistributionItem[];
  topAreas: DistributionItem[];
  roomDist: DistributionItem[];
  projects: DistributionItem[];
  mapData: DistributionItem[];
}

const MetricCard = ({ title, value, change, icon, trend, subtitle }: { title: string, value: string, change: string | number, icon: React.ReactNode, trend?: 'up' | 'down' | 'neutral', subtitle?: string }) => {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="premium-card flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div className="p-2 bg-white/5 border border-white/10 rounded-xl text-brand-emerald">
          {icon}
        </div>
        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
          trend === 'up' ? 'text-brand-emerald bg-brand-emerald/10' : 
          trend === 'down' ? 'text-rose-400 bg-rose-400/10' : 
          'text-slate-400 bg-slate-400/10'
        }`}>
          {change}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--text-secondary)' }}>{title}</p>
        <h4 className="text-xl sm:text-2xl font-bold tracking-tighter" style={{ color: 'var(--text-primary)' }}>{value}</h4>
        {subtitle && <p className="text-[9px] font-bold uppercase mt-1 tracking-widest" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
      </div>
    </motion.div>
  );
};

const ChartCard = ({ title, subtitle, children, className = "", action }: { title: string, subtitle?: string, children: React.ReactNode, className?: string, action?: React.ReactNode }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
    className={`premium-card p-6 flex flex-col transition-all ${className}`}
  >
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h3 className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        {subtitle && <p className="text-[10px] font-bold mt-1 uppercase tracking-widest opacity-60" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
    <div className="flex-1 min-h-[280px]">
      {children}
    </div>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div 
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--card-border)' }}
        className="border p-4 rounded-xl shadow-2xl backdrop-blur-xl min-w-[240px] max-w-[320px]"
      >
        <p className="text-[10px] font-bold mb-3 uppercase tracking-widest leading-none border-b border-white/5 pb-2" style={{ color: 'var(--text-secondary)' }}>
          {label && !isNaN(Date.parse(label)) 
            ? new Date(label).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: label.length > 10 ? 'numeric' : undefined })
            : label}
        </p>
        <div className="space-y-2">
          {payload.map((item: any, index: number) => {
            const isCurrency = item.name.toLowerCase().includes('value') || 
                               item.name.toLowerCase().includes('aed') || 
                               item.name.toLowerCase().includes('sqft') ||
                               item.name.toLowerCase().includes('price');
            const numericValue = Number(item.value);
            
            return (
              <div key={index} className="flex items-center justify-between gap-4">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate max-w-[120px]" title={item.name}>
                  {item.name}
                </span>
                <span className="text-white font-black text-xs tracking-tight whitespace-nowrap">
                  {isCurrency 
                    ? `AED ${formatValue(numericValue)}` 
                    : numericValue.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

const Overview = ({ 
  summary, trendsMonth, trendsDay, propMix: _propMix, groupDist, offplanDist, topAreas, roomDist, projects, mapData 
}: OverviewProps) => {
  const [heroTab, setHeroTab] = useState<'volume' | 'avg_price_per_sqft'>('volume');
  const [timePeriod, setTimePeriod] = useState<'1W' | '1M' | '3M' | '1Y' | 'ALL'>('1M');

  // Filter trends based on selected period
  const filteredTrends = useMemo(() => {
    if (timePeriod === 'ALL') return trendsDay;
    
    // Use the latest date in the dataset as "now" instead of a hardcoded value
    const latestDateStr = trendsDay.length > 0 ? trendsDay[trendsDay.length - 1].date : '2024-03-20';
    const now = new Date(latestDateStr);
    
    let days = 30;
    if (timePeriod === '1W') days = 7;
    if (timePeriod === '3M') days = 90;
    if (timePeriod === '1Y') days = 365;
    
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - days);
    
    return trendsDay.filter(t => new Date(t.date) >= cutoff);
  }, [trendsDay, timePeriod]);

  // Calculate period statistics for the rectangular blocks
  const periodStats = useMemo(() => {
    if (!filteredTrends.length) return { vol: 0, avgPrice: 0 };
    const vol = filteredTrends.reduce((acc, curr) => acc + (Number(curr.volume) || 0), 0);
    const totalAvgPrice = filteredTrends.reduce((acc, curr) => acc + (Number(curr.avg_price_per_sqft) || 0), 0);
    const avgPrice = totalAvgPrice / filteredTrends.length;
    return { vol, avgPrice: isNaN(avgPrice) ? 0 : avgPrice };
  }, [filteredTrends]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Main Metric Section Header */}
      <div className="mb-10">
        <h2 className="text-lg font-bold tracking-tight mb-0.5" style={{ color: 'var(--text-primary)' }}>Market Performance Summary</h2>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gross Volume & Transactional Liquidity Protocol</p>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <MetricCard 
          title="Gross Market Volume" 
          value={`AED ${(Number(summary?.total_value || 0) / 1e9).toFixed(1)}B`}
          change="+12.4%"
          icon={<BarChart3 className="w-4 h-4" />}
          trend="up"
        />
        <MetricCard 
          title="Transaction Volume" 
          value={summary?.transaction_count?.toLocaleString() || '0'}
          change="+8.2%"
          icon={<Zap className="w-4 h-4" />}
          trend="up"
        />
        <MetricCard 
          title="Price Performance" 
          value={`AED ${Math.round(summary?.price_per_sqft || 0).toLocaleString()}`}
          subtitle="per square foot"
          change="+4.1%"
          icon={<Activity className="w-4 h-4" />}
          trend="up"
        />
        <MetricCard 
          title="Avg Transaction" 
          value={`AED ${(Number(summary?.avg_price || 0) / 1e6).toFixed(1)}M`}
          change="-2.4%"
          icon={<CircleDollarSign className="w-4 h-4" />}
          trend="down"
        />
      </div>

      {/* Hero Chart Section - Tabbed Interface */}
      <div className="mt-6">
        <ChartCard 
          title="Market Trends" 
          subtitle="Real-time frequency & valuation tracking"
          className="h-[520px]"
          action={
             <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                {/* Time Period Filter */}
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
                   {['1W', '1M', '3M', '1Y', 'ALL'].map((p) => (
                      <button
                         key={p}
                         onClick={() => setTimePeriod(p as any)}
                         className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${timePeriod === p ? 'bg-white/10 text-brand-emerald' : 'text-slate-500 hover:text-brand-emerald'}`}
                      >
                         {p}
                      </button>
                   ))}
                </div>

                {/* Metric Toggle */}
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md min-w-[180px]">
                   <button 
                     onClick={() => setHeroTab('volume')}
                     className={`flex-1 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${heroTab === 'volume' ? 'bg-brand-emerald text-[#0b0f1a]' : 'text-slate-500 hover:text-brand-emerald'}`}
                   >
                     Volume
                   </button>
                   <button 
                     onClick={() => setHeroTab('avg_price_per_sqft')}
                     className={`flex-1 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${heroTab === 'avg_price_per_sqft' ? 'bg-brand-emerald text-[#0b0f1a]' : 'text-slate-500 hover:text-brand-emerald'}`}
                   >
                     Price/Sqft
                   </button>
                </div>
             </div>
          }
        >
          {/* Rectangular Stat Blocks */}
          <div className="flex gap-4 mb-6">
             <div className="flex-1 rounded-2xl p-4 backdrop-blur-sm group hover:border-brand-emerald/30 transition-colors" style={{ backgroundColor: 'var(--glass-white)', border: '1px solid var(--glass-border)' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Period Volume</p>
                <div className="flex items-baseline gap-2">
                   <h4 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{periodStats.vol.toLocaleString()}</h4>
                   <span className="text-[10px] font-bold text-brand-emerald/80">DEALS</span>
                </div>
             </div>
             <div className="flex-1 rounded-2xl p-4 backdrop-blur-sm group hover:border-brand-emerald/30 transition-colors" style={{ backgroundColor: 'var(--glass-white)', border: '1px solid var(--glass-border)' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Avg. Valuation</p>
                <div className="flex items-baseline gap-2">
                   <h4 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>AED {Math.round(periodStats.avgPrice).toLocaleString()}</h4>
                   <span className="text-[10px] font-bold text-brand-emerald/80">/SQFT</span>
                </div>
             </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={filteredTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis 
                dataKey="date" 
                fontSize={9} 
                fontWeight={700} 
                stroke="#475569" 
                tickLine={false} 
                axisLine={false}
                minTickGap={40}
                tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
              />
              <YAxis 
                width={50}
                fontSize={9} 
                fontWeight={700} 
                stroke="#475569" 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => heroTab === 'volume' ? val.toLocaleString() : `AED ${val.toLocaleString()}`}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ fill: 'var(--brand-emerald)', opacity: 0.05 }}
              />
              <Bar 
                dataKey={heroTab === 'volume' ? 'volume' : 'avg_price_per_sqft'} 
                name={heroTab === 'volume' ? 'transactions' : 'AED/sqft'}
                fill={EMERALD_PRIMARY}
                radius={[4, 4, 0, 0]}
                barSize={timePeriod === '1W' ? 40 : timePeriod === '1M' ? 12 : 6}
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Content Grid - Responsive spans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 mt-6">
        
        <div className="lg:col-span-4 md:col-span-2">
            <ChartCard title="Top Sectors" subtitle="Market value distribution" className="h-[480px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topAreas} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                   <XAxis 
                     dataKey="label" 
                     fontSize={8} 
                     fontWeight={700} 
                     stroke="var(--axis-color)" 
                     tickLine={false} 
                     axisLine={{ stroke: 'var(--glass-border)' }}
                     tickFormatter={(val) => val.length > 8 ? val.slice(0, 8) + '..' : val}
                   />
                   <YAxis 
                     fontSize={8} 
                     fontWeight={700} 
                     stroke="var(--axis-color)" 
                     tickLine={false} 
                     axisLine={{ stroke: 'var(--glass-border)' }}
                     tickFormatter={(val) => formatValue(val)}
                   />
                   <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--glass-white)' }} />
                   <Bar dataKey="value" name="Value" fill={EMERALD_PRIMARY} radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
        </div>

        <div className="lg:col-span-4 md:col-span-2">
           <ChartCard title="Strategic Split" subtitle="Sales, Mortgage & Gifts" className="h-[480px]">
              <div className="h-full relative px-4 flex flex-col">
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={groupDist}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        strokeWidth={0}
                      >
                        {groupDist.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? EMERALD_PRIMARY : '#064e3b'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 py-4">
                   {groupDist.map((item, index) => (
                      <div key={item.label} className="flex items-center gap-1.5">
                         <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: index === 0 ? EMERALD_PRIMARY : '#064e3b' }} />
                         <span className="text-[9px] font-bold uppercase tracking-widest leading-none" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                       </div>
                    ))}
                 </div>
              </div>
            </ChartCard>
        </div>

        <div className="lg:col-span-4 md:col-span-2">
           <ChartCard title="Portfolio Focus" subtitle="Leading projects by dominance" className="h-[480px]">
              <div className="space-y-4 pr-1 overflow-y-auto h-full pb-4 no-scrollbar">
                 {projects.slice(0, 10).map((project, index) => (
                    <div key={project.label} className="flex items-center justify-between p-3 rounded-xl hover:border-brand-emerald/30 transition-all cursor-pointer group" style={{ backgroundColor: 'var(--glass-white)', borderColor: 'var(--glass-border)', border: '1px solid' }}>
                       <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-brand-emerald/10 flex items-center justify-center text-brand-emerald font-black text-[10px] border border-brand-emerald/20 group-hover:bg-brand-emerald group-hover:text-[#0b0f1a] transition-all flex-shrink-0">
                             {index + 1}
                          </div>
                          <div className="min-w-0">
                             <p className="font-bold text-[10px] truncate uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>{project.label}</p>
                             <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">{project.count} sales</p>
                          </div>
                       </div>
                       <div className="text-right flex-shrink-0">
                          <p className="font-bold text-[10px] tracking-tighter" style={{ color: 'var(--text-primary)' }}>AED {(project.value / 1e9).toFixed(1)}B</p>
                          <div className="w-16 h-1 rounded-full mt-1.5 overflow-hidden" style={{ backgroundColor: 'var(--glass-white)' }}>
                             <div className="h-full bg-brand-emerald" style={{ width: `${(project.value / (projects[0]?.value || 1)) * 100}%` }} />
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </ChartCard>
        </div>

        {/* Third Row - Secondary Analytics */}
        <div className="lg:col-span-4 md:col-span-2">
           <ChartCard title="Monthly Pulse" subtitle="Volume & value velocity" className="h-[480px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendsMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-border)" />
                <XAxis 
                  dataKey="date" 
                  fontSize={9} 
                  fontWeight={700} 
                  stroke="var(--axis-color)" 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  yAxisId="left"
                  orientation="left"
                  fontSize={8}
                  fontWeight={700}
                  stroke={EMERALD_PRIMARY}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  fontSize={8}
                  fontWeight={700}
                  stroke="#065f46"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => val >= 1e9 ? `${(val / 1e9).toFixed(1)}B` : `${(val / 1e6).toFixed(0)}M`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--glass-white)' }} />
                <Bar yAxisId="left" dataKey="volume" name="Volume" fill={EMERALD_PRIMARY} radius={[2, 2, 0, 0]} barSize={12} />
                <Line yAxisId="right" type="monotone" dataKey="value" name="Value (AED)" stroke="#065f46" strokeWidth={3} dot={{ r: 3, fill: '#065f46' }} />
              </ComposedChart>
            </ResponsiveContainer>
            </ChartCard>
        </div>

        <div className="lg:col-span-4 md:col-span-2">
           <ChartCard title="Room Allocation" subtitle="Bedroom type distribution" className="h-[480px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roomDist} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <XAxis 
                    dataKey="label" 
                    fontSize={8} 
                    fontWeight={700} 
                    stroke="var(--axis-color)" 
                    tickLine={false} 
                    axisLine={{ stroke: 'var(--glass-border)' }}
                  />
                  <YAxis 
                    fontSize={8} 
                    fontWeight={700} 
                    stroke="var(--axis-color)" 
                    tickLine={false} 
                    axisLine={{ stroke: 'var(--glass-border)' }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--glass-white)' }} />
                  <Bar dataKey="count" name="Transactions" fill={EMERALD_PRIMARY} radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
        </div>

        <div className="lg:col-span-4 md:col-span-2">
           <ChartCard title="Market Composition" subtitle="Off-Plan vs Ready status" className="h-[480px]">
               <div className="h-full relative px-4 flex flex-col">
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={offplanDist}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        strokeWidth={0}
                        cx="50%"
                        cy="50%"
                      >
                        {offplanDist.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? EMERALD_PRIMARY : '#064e3b'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 py-6 mt-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
                   {offplanDist.map((item, index) => (
                     <div key={item.label} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: index === 0 ? EMERALD_PRIMARY : '#064e3b' }} />
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>{item.label} {(Number(item.value || 0) / (offplanDist.reduce((a, b) => a + Number(b.value || 0), 0) || 1) * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                 </div>
              </div>
            </ChartCard>
        </div>

      </div>

      <div className="pt-6">
         <MarketMap areaData={mapData} />
      </div>

    </div>
  );
};

export default Overview;
