import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import type { StorePerformance } from '../types';
import 'leaflet/dist/leaflet.css';
import { MapPin, Store, Layers, TrendingUp } from 'lucide-react';

interface HeatmapProps {
  storePerformance: StorePerformance[];
}

const CITY_COORDS: Record<string, [number, number]> = {
  Mumbai: [18.9696, 72.8193],
  Bengaluru: [12.9716, 77.5946],
  Delhi: [28.6315, 77.2167],
  Hyderabad: [17.4435, 78.3772],
  Chennai: [13.0604, 80.2642],
  Kolkata: [22.5726, 88.3639],
  Kochi: [9.9658, 76.2422],
  Ahmedabad: [23.0304, 72.5108],
  Pune: [18.5362, 73.8938],
};

export default function Heatmap({ storePerformance }: HeatmapProps) {
  const [mapTheme, setMapTheme] = useState<'dark' | 'light'>('dark');
  const [viewMode, setViewMode] = useState<'revenue' | 'risk'>('revenue');

  const storesWithLocation = storePerformance.map((store, idx) => {
    let lat = store.latitude;
    let lng = store.longitude;

    if (lat === undefined || lng === undefined) {
      const cityKey = Object.keys(CITY_COORDS).find(c => 
        store.storeName.toLowerCase().includes(c.toLowerCase())
      );
      if (cityKey) {
        [lat, lng] = CITY_COORDS[cityKey];
      } else {
        const keys = Object.keys(CITY_COORDS);
        const fallbackKey = keys[idx % keys.length];
        [lat, lng] = CITY_COORDS[fallbackKey];
      }
    }

    return {
      ...store,
      latitude: lat,
      longitude: lng,
    };
  });

  const centerLat = storesWithLocation.length > 0 ? storesWithLocation[0].latitude! : 20.5937;
  const centerLng = storesWithLocation.length > 0 ? storesWithLocation[0].longitude! : 78.9629;

  const maxRevenue = Math.max(...storesWithLocation.map((s) => s.totalRevenue), 1);

  const tileUrl =
    mapTheme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div className="webstacked-card rounded-3xl p-6 lg:p-8 space-y-6 text-slate-100">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2 font-['Geist']">
            <MapPin className="w-5 h-5 text-[#8cff2e]" /> Geographic Store Location & Performance Heatmap
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Geospatial visualization of multi-store sales volume, profitability, and operational risk across store locations.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-[#12141a] p-1.5 rounded-2xl border border-white/10 text-xs">
            <button
              onClick={() => setViewMode('revenue')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                viewMode === 'revenue' ? 'bg-[#8cff2e] text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Revenue Heatmap
            </button>
            <button
              onClick={() => setViewMode('risk')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                viewMode === 'risk' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Store Health Risk
            </button>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={() => setMapTheme(mapTheme === 'dark' ? 'light' : 'dark')}
            className="px-3.5 py-1.5 rounded-2xl bg-[#12141a] hover:bg-[#1a1d26] text-slate-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            {mapTheme === 'dark' ? 'Light Map' : 'Dark Map'}
          </button>
        </div>
      </div>

      {/* Leaflet Map Frame */}
      <div className="h-[480px] rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl">
        <MapContainer center={[centerLat, centerLng]} zoom={5} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution="&copy; OpenStreetMap & CartoDB" url={tileUrl} />
          {storesWithLocation.map((store) => {
            const radius = 14 + (store.totalRevenue / maxRevenue) * 22;
            const markerColor =
              viewMode === 'revenue'
                ? getRevenueColor(store.totalRevenue, maxRevenue)
                : getRiskColor(store.riskStatus);

            return (
              <CircleMarker
                key={store.storeId}
                center={[store.latitude!, store.longitude!]}
                radius={radius}
                pathOptions={{
                  color: markerColor,
                  fillColor: markerColor,
                  fillOpacity: 0.75,
                  weight: 2,
                }}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-3.5 bg-[#08090c] text-slate-100 rounded-2xl max-w-xs text-xs space-y-2.5 border border-white/10 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-bold text-sm text-[#8cff2e] flex items-center gap-1">
                        <Store className="w-4 h-4" /> {store.storeName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          store.riskStatus === 'healthy'
                            ? 'webstacked-badge-lime'
                            : store.riskStatus === 'warning'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {store.riskStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Total Revenue</span>
                        <span className="font-bold text-[#8cff2e] text-sm">₹{store.totalRevenue.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Net Margin</span>
                        <span className="font-bold text-purple-300 text-sm">{store.profitMargin.toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Sales Volume</span>
                        <span className="font-semibold text-slate-200">{store.totalSales.toLocaleString('en-IN')} units</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Top Category</span>
                        <span className="font-semibold text-cyan-300">{store.topCategory}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Growth Rate:</span>
                      <span className={`font-bold flex items-center gap-0.5 ${store.growthRate >= 0 ? 'text-[#8cff2e]' : 'text-rose-400'}`}>
                        <TrendingUp className="w-3 h-3" /> {(store.growthRate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {/* Legend Footer */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2">
        <span className="font-medium">Circle size proportional to total sales volume (₹)</span>
        {viewMode === 'revenue' ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#8cff2e]" />
              <span>High Revenue ({'>'}66%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Medium Revenue (33-66%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <span>Low Revenue ({'<'}33%)</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#8cff2e]" />
              <span>Healthy Margin & Growth</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Moderate Risk / Warning</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <span>Critical Performance Risk</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getRevenueColor(revenue: number, maxRevenue: number): string {
  const ratio = revenue / maxRevenue;
  if (ratio < 0.33) return '#f43f5e';
  if (ratio < 0.66) return '#f59e0b';
  return '#8cff2e';
}

function getRiskColor(riskStatus: string): string {
  if (riskStatus === 'critical') return '#f43f5e';
  if (riskStatus === 'warning') return '#f59e0b';
  return '#8cff2e';
}
