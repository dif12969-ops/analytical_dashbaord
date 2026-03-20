import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, TrendingUp, Building } from 'lucide-react';
import type { DistributionItem } from '../../services/api';
import { useState, useEffect, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from 'react-simple-maps';
import { geoCentroid } from 'd3-geo';
import { scaleLinear } from 'd3-scale';
import { interpolateRgb } from 'd3-interpolate';

const GEO_URL = "https://raw.githubusercontent.com/Krishna99008594/MapFiles/main/Community.geojson";

interface MarketMapProps {
  areaData: DistributionItem[];
}

// Helper to normalize names for better matching
const normalizeName = (name: string) =>
  name.trim().toUpperCase()
    .replace(/\s+/g, '')
    .replace(/[^A-Z0-9]/g, '')
    .replace(/FIRST$/, '1')
    .replace(/SECOND$/, '2')
    .replace(/THIRD$/, '3')
    .replace(/FOURTH$/, '4')
    .replace(/FIFTH$/, '5');

const MarketMap = ({ areaData }: MarketMapProps) => {
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);
  const [hoveredData, setHoveredData] = useState<DistributionItem | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetch(GEO_URL)
      .then(res => res.json())
      .then(data => {
        setGeoData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading GeoJSON:", err);
        setLoading(false);
      });
  }, []);

  const dataMap = useMemo(() => {
    const map: Record<string, DistributionItem> = {};
    areaData.forEach(item => {
      const key = normalizeName(item.label);
      map[key] = item;
    });
    return map;
  }, [areaData]);

  const topDistricts = useMemo(() => {
    const totalValue = areaData.reduce((acc, curr) => acc + Number(curr.value || 0), 0);
    return [...areaData]
      .sort((a, b) => Number(b.value || 0) - Number(a.value || 0))
      .slice(0, 5)
      .map(d => {
        const val = Number(d.value || 0);
        const pct = totalValue > 0 ? (val / totalValue) * 100 : 0;
        return {
          ...d,
          percentage: pct.toFixed(1)
        };
      });
  }, [areaData]);

  const maxVal = useMemo(() =>
    Math.max(...areaData.map(d => Number(d.value || 0)), 1),
    [areaData]);

  const colorScale = useMemo(() =>
    scaleLinear<string>()
      .domain([0, maxVal * 0.1, maxVal * 0.5, maxVal])
      .range(["#064e3b", "#065f46", "#059669", "#10b981"])
      .interpolate(interpolateRgb),
    [maxVal]);

  const topDistrictCentroids = useMemo(() => {
    if (!geoData || !geoData.features) return [];
    
    return topDistricts.map((d, index) => {
      const normalizedD = normalizeName(d.label);
      const feature = geoData.features.find((f: any) => 
        normalizeName(f.properties.CNAME_E || f.properties.COMM_EN || f.properties.NAME || '') === normalizedD
      );
      
      if (feature) {
        return {
          rank: index + 1,
          label: d.label,
          data: d,
          coordinates: geoCentroid(feature)
        };
      }
      return null;
    }).filter((m): m is any => m !== null);
  }, [geoData, topDistricts]);

  if (loading) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center rounded-[2.5rem] border backdrop-blur-sm" style={{ backgroundColor: 'var(--glass-white)', borderColor: 'var(--glass-border)' }}>
        <div className="flex flex-col items-center gap-4">
          <MapPin className="w-10 h-10 text-brand-emerald animate-bounce" />
          <p className="text-[10px] font-bold uppercase tracking-widest tracking-[0.3em]" style={{ color: 'var(--text-secondary)' }}>Mapping Transaction Pins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-[3rem] p-4 lg:p-10 backdrop-blur-md shadow-2xl overflow-hidden min-h-[600px]" style={{ backgroundColor: 'var(--glass-white)', borderColor: 'var(--glass-border)' }}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Map Visualization (70%) */}
        <div className="lg:col-span-8 relative">
          <div className="mb-8 pl-4">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-4 h-4 text-brand-emerald" />
              <h3 className="font-bold tracking-tight leading-none uppercase tracking-widest text-[10px]" style={{ color: 'var(--text-secondary)' }}>Real-Time GIS Feed</h3>
            </div>
            <p className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>Geographic Market Analysis</p>
          </div>

          <div
            className="w-full h-[550px] relative rounded-3xl overflow-hidden border"
            style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--glass-border)' }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setMousePos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
              });
            }}
          >
            {/* Dot Matrix Pattern */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
              <defs>
                <pattern id="dotPattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                  <circle cx="1.5" cy="1.5" r="0.8" fill="var(--text-primary)" fillOpacity="0.05" />
                </pattern>
              </defs>
            </svg>

            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                rotate: [-55.3, -25.1, 0],
                scale: 48000
              }}
              style={{ width: "100%", height: "100%" }}
            >
              <ZoomableGroup center={[0, 0]} maxZoom={5}>
                <Geographies geography={geoData}>
                  {({ geographies }: { geographies: any[] }) =>
                    geographies.map((geo: any) => {
                      const rawName = geo.properties.CNAME_E || geo.properties.COMM_EN || geo.properties.NAME || '';
                      const normalized = normalizeName(rawName);
                      const d = dataMap[normalized];
                      const isHovered = hoveredArea === rawName;
                      const isSelected = selectedArea && normalizeName(selectedArea) === normalized;

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={isSelected ? "var(--brand-emerald)" : (d ? colorScale(d.value) : "var(--map-base)")}
                          stroke={isHovered || isSelected ? "var(--brand-emerald)" : "var(--map-stroke)"}
                          strokeWidth={isHovered || isSelected ? 1.5 : 0.5}
                          onMouseEnter={(e) => {
                             if (d) {
                                setHoveredArea(rawName);
                                setHoveredData(d);
                                const rect = e.currentTarget.getBoundingClientRect();
                                const containerRect = e.currentTarget.closest('.relative')?.getBoundingClientRect();
                                if (containerRect) {
                                   setMousePos({ 
                                      x: rect.left - containerRect.left + rect.width / 2, 
                                      y: rect.top - containerRect.top 
                                   });
                                }
                             }
                          }}
                          onMouseLeave={() => {
                            setHoveredArea(null);
                            setHoveredData(null);
                          }}
                          onClick={() => {
                            if (d) {
                              setSelectedArea(selectedArea === rawName ? null : rawName);
                            }
                          }}
                          style={{
                            default: { outline: "none", transition: "all 300ms" },
                            hover: { outline: "none", fillOpacity: 0.8, cursor: "pointer" },
                            pressed: { outline: "none" }
                          }}
                        />
                      );
                    })
                  }
                </Geographies>

                {/* Pin Markers */}
                {geoData && geoData.features && geoData.features.map((feature: any) => {
                   const rawName = feature.properties.CNAME_E || feature.properties.COMM_EN || '';
                   const normalized = normalizeName(rawName);
                  const d = dataMap[normalized];
                  if (!d || d.value === 0) return null;

                  const centroid = geoCentroid(feature);

                  return (
                    <Marker key={feature.properties.OBJECTID || rawName} coordinates={centroid}>
                      <motion.g
                        initial={{ scale: 0, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        whileHover={{ scale: 1.2 }}
                        onMouseEnter={() => {
                          setHoveredArea(rawName);
                          setHoveredData(d);
                        }}
                        onMouseLeave={() => {
                          setHoveredArea(null);
                          setHoveredData(null);
                        }}
                        onClick={() => {
                          setSelectedArea(selectedArea === rawName ? null : rawName);
                        }}
                        className="cursor-pointer"
                      >
                        {/* Pin Shadow */}
                        <circle r={2} fill="black" fillOpacity={0.5} transform="translate(0, 2)" />
                        {/* Pin Icon */}
                        <path
                          d="M0 0 C-4 -6 -6 -8 -6 -12 A6 6 0 0 1 6 -12 C 6 -8 4 -6 0 0 Z"
                          fill={d.value > 1000000000 ? "#10b981" : "#065f46"}
                          stroke="white"
                          strokeWidth={0.5}
                          className="filter drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        />
                        <circle r={2.5} fill="white" transform="translate(0, -12)" />
                      </motion.g>

                      {/* Glow for high activity */}
                      {d.value > 500000000 && (
                        <motion.circle
                          r={8}
                          fill="#10b981"
                          fillOpacity={0.1}
                          animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </Marker>
                  );
                })}
                {/* Numbered Rank Markers (1-5) */}
                {topDistrictCentroids.map((marker) => (
                  <Marker key={`rank-${marker.rank}`} coordinates={marker.coordinates}>
                    <motion.g
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.2 }}
                      className="cursor-pointer"
                      onMouseEnter={(e) => {
                        setHoveredArea(marker.label);
                        setHoveredData(marker.data);
                        const rect = e.currentTarget.getBoundingClientRect();
                        const containerRect = e.currentTarget.closest('.relative')?.getBoundingClientRect();
                        if (containerRect) {
                           setMousePos({ 
                              x: rect.left - containerRect.left, 
                              y: rect.top - containerRect.top 
                           });
                        }
                      }}
                      onMouseLeave={() => {
                        setHoveredArea(null);
                        setHoveredData(null);
                      }}
                      onClick={() => {
                        setSelectedArea(selectedArea === marker.label ? null : marker.label);
                      }}
                    >
                      <circle 
                        r={12} 
                        fill={selectedArea === marker.label ? "var(--brand-emerald)" : "var(--bg-primary)"} 
                        stroke="var(--brand-emerald)" 
                        strokeWidth={2} 
                        className="filter drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                      />
                      <text
                        textAnchor="middle"
                        y={4}
                        style={{ fontSize: "10px", fontWeight: "900", fill: selectedArea === marker.label ? "#000" : "var(--text-primary)" }}
                      >
                        {marker.rank}
                      </text>
                    </motion.g>
                  </Marker>
                ))}
              </ZoomableGroup>
            </ComposableMap>
            {/* Enhanced Tooltip inside the container */}
            <AnimatePresence>
              {hoveredArea && hoveredData && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute border p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[9999] pointer-events-none min-w-[260px] backdrop-blur-xl"
                  style={{
                    left: Math.min(mousePos.x + 20, 480),
                    top: Math.min(mousePos.y + 20, 420),
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--glass-border)'
                  }}
                >
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b" style={{ borderColor: 'var(--glass-border)' }}>
                    <div className="w-10 h-10 rounded-2xl bg-brand-emerald/10 flex items-center justify-center border border-brand-emerald/20">
                      <MapPin className="w-4 h-4 text-brand-emerald" />
                    </div>
                    <div>
                      <p className="font-black text-sm tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>{hoveredArea}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Active Market Hub</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-2xl" style={{ backgroundColor: 'var(--glass-white)' }}>
                      <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>Total Capital</span>
                      <span className="font-black text-brand-emerald text-sm">
                        AED {hoveredData.value >= 1e9 ? (hoveredData.value / 1e9).toFixed(1) + 'B' : (hoveredData.value / 1e6).toFixed(0) + 'M'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-3">
                      <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>Transaction Count</span>
                      <span className="font-black text-xs" style={{ color: 'var(--text-primary)' }}>{hoveredData.count} Deals</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex items-center gap-2" style={{ borderColor: 'var(--glass-border)' }}>
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => <div key={i} className="w-4 h-4 rounded-full border" style={{ borderColor: 'var(--glass-border)', backgroundColor: 'var(--bg-primary)' }} />)}
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Live Activity Detected</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar Statistics (30%) */}
        <div className="lg:col-span-4 mt-8 lg:mt-0 flex flex-col justify-center gap-10 pr-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-4xl font-black" style={{ color: 'var(--text-primary)' }}>{(areaData.reduce((a, b) => a + b.count, 0)).toLocaleString()}</h4>
              <div className="flex items-center gap-2 bg-brand-emerald/10 text-brand-emerald px-3 py-1 rounded-full text-xs font-black ring-1 ring-brand-emerald/20">
                <TrendingUp className="w-3 h-3" />
                LIVE
              </div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-secondary)' }}>Verified Transactions Logged</p>
          </div>

          <div className="space-y-8">
            {topDistricts.map((d, index) => (
              <div
                key={d.label}
                className={`group cursor-pointer p-2 rounded-2xl transition-all ${selectedArea === d.label ? 'bg-brand-emerald/10 ring-1 ring-brand-emerald/30' : 'hover:bg-brand-emerald/5'}`}
                onClick={() => setSelectedArea(selectedArea === d.label ? null : d.label)}
                onMouseEnter={() => {
                  setHoveredArea(d.label);
                  setHoveredData(d);
                }}
                onMouseLeave={() => {
                  setHoveredArea(null);
                  setHoveredData(null);
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-black transition-all ${selectedArea === d.label ? 'bg-brand-emerald border-brand-emerald text-[#0b0f1a]' : 'bg-primary border-glass-border text-secondary'}`}
                      style={selectedArea !== d.label ? { backgroundColor: 'var(--bg-primary)', borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' } : {}}>
                      {index + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm tracking-tight truncate max-w-[150px]" style={{ color: 'var(--text-primary)' }}>{d.label}</span>
                      <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>{d.count} Sales</span>
                    </div>
                  </div>
                  <span className="font-black text-xs" style={{ color: 'var(--text-primary)' }}>{d.percentage}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'var(--glass-white)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${d.percentage}%` }}
                    className="h-full bg-gradient-to-r from-brand-emerald to-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="border p-6 rounded-[2rem] backdrop-blur-sm" style={{ backgroundColor: 'var(--glass-white)', borderColor: 'var(--glass-border)' }}>
            <div className="flex items-center gap-3 mb-4">
              <Building className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Dataset Integrity</span>
            </div>
            <p className="text-xs leading-relaxed font-medium" style={{ color: 'var(--text-secondary)' }}>
              This visualization represents <span style={{ color: 'var(--text-primary)' }}>55,245 confirmed records</span> extracted from the verified transactions CSV. Every pin is mapped to its district centroid based on legal land registration data.
            </p>
          </div>
        </div>
      </div>

    </div>

  );
};

export default MarketMap;
