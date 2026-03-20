import { 
  LayoutDashboard, 
  Map, 
  Table as TableIcon, 
  ChevronRight,
  Home,
  Building,
  Layers,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }: SidebarProps) => {
  const menuItems = [
    { id: 'overview', name: 'Market Overview', icon: LayoutDashboard },
    { id: 'features', name: 'Feature Insights', icon: Layers },
    { id: 'amenities', name: 'Amenity Insights', icon: Map },
    { id: 'projects', name: 'Project Explorer', icon: Building },
    { id: 'data', name: 'Transactional Raw', icon: TableIcon },
  ];

  const sidebarVariants = {
    open: { width: 288, transition: { duration: 0.4 } },
    closed: { width: 80, transition: { duration: 0.4 } }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.div 
        variants={sidebarVariants}
        animate={isOpen ? "open" : "closed"}
        initial={false}
        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--card-border)' }}
        className={`h-screen fixed left-0 top-0 border-r flex flex-col z-[60] overflow-hidden transition-transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Toggle Button (Desktop Only) - Positioned on the edge */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="hidden lg:flex absolute right-[-12px] top-7 w-6 h-6 items-center justify-center rounded-full border shadow-xl z-[70] transition-all hover:scale-110"
          style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--card-border)' }}
        >
          {isOpen ? (
            <ChevronLeft className="w-3 h-3 text-brand-emerald" />
          ) : (
            <ChevronRight className="w-3 h-3 text-brand-emerald" />
          )}
        </button>

        <div className={`transition-all duration-400 ${isOpen ? 'p-6' : 'p-4'}`}>
          <div className={`flex items-center gap-3 mb-10 h-10 ${isOpen ? 'px-1' : 'justify-center'}`}>
            <div className="min-w-[36px] w-9 h-9 bg-brand-emerald rounded-xl flex items-center justify-center shadow-lg shadow-brand-emerald/20">
              <Home className="text-[#09090b] w-5 h-5" />
            </div>
            {isOpen && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="whitespace-nowrap"
              >
                <h2 className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>PropCircle</h2>
                <p className="text-[9px] text-brand-emerald font-bold tracking-widest uppercase">Intelligence</p>
              </motion.div>
            )}
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  className={`w-full flex items-center group relative h-11 rounded-xl transition-all duration-200 ${
                    isActive 
                    ? 'bg-brand-emerald/10 text-brand-emerald' 
                    : 'text-slate-500 hover:text-brand-emerald'
                  }`}
                  style={{ backgroundColor: isActive ? 'transparent' : 'var(--glass-white)', borderColor: 'var(--glass-border)' }}
                >
                  <div className={`flex items-center justify-center h-full transition-all duration-300 ${isOpen ? 'min-w-[44px]' : 'w-full'} ${isActive ? 'text-brand-emerald' : 'group-hover:text-brand-emerald'}`}>
                    <Icon className={`w-4.5 h-4.5 transition-transform duration-300 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`} />
                  </div>
                  
                  {isOpen && (
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-semibold text-xs whitespace-nowrap ml-1 group-hover:text-brand-emerald"
                      >
                      {item.name}
                    </motion.span>
                  )}

                  {isActive && (
                    <motion.div 
                      layoutId="sidebarActive"
                      className="absolute left-0 w-1 h-5 bg-brand-emerald rounded-r-full shadow-[0_0_10px_#10b981]" 
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4">
          {isOpen ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ backgroundColor: 'var(--glass-white)', borderColor: 'var(--glass-border)' }}
              className="p-4 rounded-xl border relative overflow-hidden group"
            >
              <p style={{ color: 'var(--text-primary)' }} className="text-[11px] font-bold mb-1 uppercase tracking-tight">Terminal Status</p>
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-1.5 h-1.5 bg-brand-emerald rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                 <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>Operational</span>
              </div>
              <button 
                style={{ backgroundColor: 'var(--glass-white)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
                className="w-full py-2 hover:bg-brand-emerald/10 text-[10px] font-bold rounded-lg border transition-colors flex items-center justify-center gap-2"
              >
                User Guide
                <ChevronRight className="w-3 h-3" />
              </button>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center gap-4">
               <div className="w-1.5 h-1.5 bg-brand-emerald rounded-full animate-pulse" />
               <div 
                 style={{ backgroundColor: 'var(--glass-white)', borderColor: 'var(--glass-border)' }}
                 className="w-10 h-10 rounded-xl border flex items-center justify-center cursor-pointer hover:bg-black/5"
               >
                  <ChevronRight className="w-4 h-4 text-slate-500" />
               </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
