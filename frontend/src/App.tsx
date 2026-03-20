import { useEffect, useState, useCallback } from 'react';
import { 
  Filter, 
  RefreshCw,
  Menu,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyticsService } from './services/api';
import type { SummaryStats, TrendData, DistributionItem, AmenitySummary, FilterParams } from './services/api';

// Components
import Sidebar from './components/Layout/Sidebar';
import Overview from './components/Views/Overview';
import Amenities from './components/Views/Amenities';
import DataExplorer from './components/Views/DataExplorer';
import FeatureInsights from './components/Views/FeatureInsights';
import ProjectExplorer from './components/Views/ProjectExplorer';
import GlobalFilters from './components/Dashboard/GlobalFilters';

const App = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterParams>({});
  
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [trendsMonth, setTrendsMonth] = useState<TrendData[]>([]);
  const [trendsDay, setTrendsDay] = useState<TrendData[]>([]);
  const [propMix, setPropMix] = useState<DistributionItem[]>([]);
  const [groupDist, setGroupDist] = useState<DistributionItem[]>([]);
  const [offplanDist, setOffplanDist] = useState<DistributionItem[]>([]);
  const [topAreas, setTopAreas] = useState<DistributionItem[]>([]);
  const [mapData, setMapData] = useState<DistributionItem[]>([]);
  const [roomDist, setRoomDist] = useState<DistributionItem[]>([]);
  const [parkingDist, setParkingDist] = useState<DistributionItem[]>([]);
  const [projects, setProjects] = useState<DistributionItem[]>([]);
  const [amenities, setAmenities] = useState<AmenitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('dashboard-theme') as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
    } else {
      root.classList.remove('light-theme');
    }
    localStorage.setItem('dashboard-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        summaryData, 
        monthlyTrends, 
        dailyTrends,
        propData, 
        groupData,
        offplanData,
        topAreaData,
        mapAreaData, 
        amenityData, 
        roomData, 
        parkingData, 
        projectData
      ] = await Promise.all([
        analyticsService.getSummary(filters),
        analyticsService.getTrends(filters, 'month'),
        analyticsService.getTrends(filters, 'day'),
        analyticsService.getDistribution('prop_type_en', filters),
        analyticsService.getDistribution('group_en', filters),
        analyticsService.getDistribution('is_offplan_en', filters),
        analyticsService.getDistribution('area_en', filters, 12),
        analyticsService.getDistribution('area_en', filters, 1000), // Get all areas for map
        analyticsService.getAmenities(filters),
        analyticsService.getDistribution('rooms_en', filters),
        analyticsService.getDistribution('parking', filters),
        analyticsService.getProjects(filters)
      ]);
      setSummary(summaryData);
      setTrendsMonth(monthlyTrends);
      setTrendsDay(dailyTrends);
      setPropMix(propData);
      setGroupDist(groupData);
      setOffplanDist(offplanData);
      setTopAreas(topAreaData);
      setMapData(mapAreaData);
      setAmenities(amenityData);
      setRoomDist(roomData);
      setParkingDist(parkingData);
      setProjects(projectData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-brand-bg text-slate-200 flex overflow-x-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />
      
      <main className={`flex-1 transition-all duration-300 min-w-0 ${isSidebarOpen ? 'lg:ml-72' : 'lg:ml-20'} p-4 lg:p-8 relative`}>
        <GlobalFilters 
          filters={filters} 
          setFilters={setFilters} 
          isOpen={isFilterOpen} 
          setIsOpen={setIsFilterOpen} 
        />

        <header className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
             <div className="flex items-center justify-between lg:block">
              <div className="flex-1 min-w-0">
                 <div className="flex items-center gap-2 mb-1">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Insight Protocol</p>
                    <div className="w-1 h-1 bg-brand-emerald rounded-full" />
                 </div>
                 <h1 className="text-3xl lg:text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Analytical Intelligence</h1>
              </div>
                
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-3 border rounded-xl"
                  style={{ backgroundColor: 'var(--glass-white)', borderColor: 'var(--glass-border)' }}
                >
                  <Menu className="w-5 h-5 text-brand-emerald" />
                </button>
             </div>

             <div className="flex items-center gap-3 lg:gap-4 ml-auto">
                 <button 
                  onClick={fetchData}
                  className="p-3 lg:p-2.5 border rounded-xl hover:bg-brand-emerald/10 transition-all group"
                  style={{ backgroundColor: 'var(--glass-white)', borderColor: 'var(--glass-border)' }}
                >
                  <RefreshCw className={`w-4 h-4 text-slate-400 group-hover:text-brand-emerald transition-opacity ${loading ? 'animate-spin opacity-40' : ''}`} />
                </button>

                <button 
                  onClick={toggleTheme}
                  className="p-3 lg:p-2.5 border rounded-xl hover:bg-brand-emerald/10 transition-all group"
                  style={{ backgroundColor: 'var(--glass-white)', borderColor: 'var(--glass-border)' }}
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400 group-hover:text-amber-300 transition-all" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 transition-all" />
                  )}
                </button>

                <div className="h-8 w-px mx-1 hidden sm:block" style={{ backgroundColor: 'var(--glass-border)' }} />

                <button 
                  onClick={() => setIsFilterOpen(true)}
                  className="bg-brand-emerald hover:bg-brand-emerald/90 text-[#09090b] h-10 lg:h-11 px-4 lg:px-6 rounded-xl transition-all font-bold text-xs shadow-lg shadow-brand-emerald/20 flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden xs:inline">Filters</span>
                  {Object.keys(filters).length > 0 && (
                    <span className="bg-black/20 px-2 py-0.5 rounded-full text-[10px]">
                       {Object.keys(filters).length}
                    </span>
                  )}
                </button>
             </div>
          </div>
        </header>

        {/* Floating WhatsApp Support Button */}
        <motion.a
          href="https://wa.me/918802945034"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1, y: -5 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-8 right-8 w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] z-[100] cursor-pointer group"
        >
          <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20 group-hover:opacity-40" />
          <svg 
            viewBox="0 0 24 24" 
            className="w-7 h-7 fill-white drop-shadow-md"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.393 0 12.03c0 2.12.54 4.19 1.563 6.04L0 24l6.102-1.6c1.78.97 3.79 1.48 5.8 1.48h.005c6.635 0 12.032-5.391 12.036-12.028a11.82 11.82 0 00-3.522-8.483" />
          </svg>
        </motion.a>

        {/* Dynamic Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {activeTab === 'overview' && (
              <Overview 
                summary={summary} 
                trendsMonth={trendsMonth} 
                trendsDay={trendsDay} 
                propMix={propMix} 
                groupDist={groupDist}
                offplanDist={offplanDist}
                topAreas={topAreas}
                roomDist={roomDist}
                projects={projects}
                mapData={mapData}
              />
            )}
            {activeTab === 'features' && (
              <FeatureInsights roomDist={roomDist} parkingDist={parkingDist} />
            )}
            {activeTab === 'amenities' && (
              <Amenities data={amenities} />
            )}
            {activeTab === 'data' && (
              <DataExplorer filters={filters} />
            )}
            {activeTab === 'projects' && (
              <ProjectExplorer projects={projects} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* <footer className="mt-20 pt-10 border-t border-white/5 flex items-center justify-between text-[11px] font-bold text-slate-600 uppercase tracking-[0.2em]">
          <div>System Engine Active • {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-brand-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-brand-400 transition-colors">Endpoint Status</a>
          </div>
        </footer> */}
      </main>
    </div>
  );
};

export default App;
