import { useState, useMemo } from 'react';
import { SAMPLE_POS_DATA, SAMPLE_INVENTORY_DATA } from './utils/sampleData';
import { analyzeBusinessData, analyzeStorePerformance, calculateMonthlySales } from './utils/dataAnalysis';
import Dashboard from './components/Dashboard';
import Charts from './components/Charts';
import Heatmap from './components/Heatmap';
import AIChat from './components/AIChat';
import DataExplorer from './components/DataExplorer';
import CSVUpload from './components/CSVUpload';
import type { BusinessInsight, StorePerformance, FilterOptions } from './types';
import { 
  BarChart3, 
  MapPin, 
  Bot, 
  Database, 
  LayoutDashboard, 
  Upload, 
  Filter, 
  Sparkles,
  RefreshCw,
  Layers
} from 'lucide-react';

export default function App() {
  const [posData, setPosData] = useState<any[]>(SAMPLE_POS_DATA);
  const [inventoryData, setInventoryData] = useState<any[]>(SAMPLE_INVENTORY_DATA);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'charts' | 'heatmap' | 'ai' | 'explorer'>('dashboard');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Global Filter State
  const [filters, setFilters] = useState<FilterOptions>({
    storeId: 'all',
    category: 'all',
    dateRange: 'all',
  });

  // Calculate Enriched Analytics Context
  const insight: BusinessInsight | null = useMemo(() => {
    if (posData.length === 0 && inventoryData.length === 0) return null;
    return analyzeBusinessData(posData, inventoryData, filters);
  }, [posData, inventoryData, filters]);

  const storePerformance: StorePerformance[] = useMemo(() => {
    return analyzeStorePerformance(posData);
  }, [posData]);

  const monthlyData = useMemo(() => {
    return calculateMonthlySales(posData);
  }, [posData]);

  // Unique stores & categories for filter bar
  const storeOptions = useMemo(() => {
    const map = new Map<string, string>();
    SAMPLE_POS_DATA.forEach((r: any) => {
      if (r.storeId && r.storeName) map.set(r.storeId, r.storeName);
    });
    return Array.from(map.entries());
  }, []);

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    SAMPLE_POS_DATA.forEach((r: any) => r.category && set.add(r.category));
    SAMPLE_INVENTORY_DATA.forEach((r: any) => r.category && set.add(r.category));
    return Array.from(set);
  }, []);

  const handleDataLoaded = (newPosData: any[], newInventoryData: any[]) => {
    if (newPosData.length > 0) setPosData(newPosData);
    if (newInventoryData.length > 0) setInventoryData(newInventoryData);
  };

  const handleResetData = () => {
    setPosData(SAMPLE_POS_DATA);
    setInventoryData(SAMPLE_INVENTORY_DATA);
    setFilters({ storeId: 'all', category: 'all', dateRange: 'all' });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 selection:bg-[#8cff2e] selection:text-black">
      {/* WebStacked Sleek Floating Navbar */}
      <header className="sticky top-0 z-40 bg-[#08090c]/90 backdrop-blur-xl border-b border-white/10 px-4 lg:px-8 py-3.5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Platform Tag */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8cff2e] to-emerald-500 p-0.5 shadow-lg shadow-[#8cff2e]/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#050505] rounded-[10px] flex items-center justify-center">
                <Layers className="w-5 h-5 text-[#8cff2e]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg text-white tracking-tight font-['Geist']">
                  Insight<span className="text-[#8cff2e]">OS</span>
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold webstacked-badge-lime uppercase tracking-wider">
                  v2.5 Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Intelligent Retail Operations & AI Intelligence Platform</p>
            </div>
          </div>

          {/* Primary Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-[#12141a]/90 p-1.5 rounded-2xl border border-white/10 shadow-inner overflow-x-auto text-xs">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'charts', label: 'Analytics Studio', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'heatmap', label: 'Store Heatmap', icon: <MapPin className="w-4 h-4" /> },
              { id: 'ai', label: 'AI Copilot', icon: <Bot className="w-4 h-4" /> },
              { id: 'explorer', label: 'Data Matrix', icon: <Database className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-[#8cff2e] text-black shadow-lg shadow-[#8cff2e]/25 scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Right Actions Toolbar */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-4 py-2 rounded-xl webstacked-button-primary text-xs flex items-center gap-2 font-bold cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload CSV</span>
            </button>
            <button
              onClick={handleResetData}
              className="p-2.5 rounded-xl bg-[#12141a] hover:bg-[#1a1d26] text-slate-400 hover:text-white border border-white/10 text-xs transition-colors"
              title="Reset to Preset Indian Retail Dataset"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* WebStacked Global Filter Control Bar */}
      <div className="bg-[#0a0b0e] border-b border-white/5 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          
          <div className="flex items-center gap-2 text-slate-400 font-semibold">
            <Filter className="w-4 h-4 text-[#8cff2e]" />
            <span>Global Slice & Dice Filters:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Store Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#12141a] border border-white/10 px-3 py-1.5 rounded-xl">
              <span className="text-slate-400">Store:</span>
              <select
                value={filters.storeId}
                onChange={(e) => setFilters((f) => ({ ...f, storeId: e.target.value }))}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#12141a] text-white">All Indian Outlets (5)</option>
                {storeOptions.map(([id, name]) => (
                  <option key={id} value={id} className="bg-[#12141a] text-white">
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#12141a] border border-white/10 px-3 py-1.5 rounded-xl">
              <span className="text-slate-400">Category:</span>
              <select
                value={filters.category}
                onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#12141a] text-white">All Categories</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#12141a] text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#12141a] border border-white/10 px-3 py-1.5 rounded-xl">
              <span className="text-slate-400">Period:</span>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters((f) => ({ ...f, dateRange: e.target.value as any }))}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#12141a] text-white">All Transactions</option>
                <option value="7d" className="bg-[#12141a] text-white">Last 7 Days</option>
                <option value="30d" className="bg-[#12141a] text-white">Last 30 Days</option>
                <option value="90d" className="bg-[#12141a] text-white">Last 90 Days</option>
              </select>
            </div>

            {(filters.storeId !== 'all' || filters.category !== 'all' || filters.dateRange !== 'all') && (
              <button
                onClick={() => setFilters({ storeId: 'all', category: 'all', dateRange: 'all' })}
                className="text-[11px] text-[#8cff2e] hover:underline font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#8cff2e]" />
            <span>Active POS records: <strong className="text-white">{posData.length}</strong></span>
          </div>

        </div>
      </div>

      {/* Main View Container */}
      <main className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            insight={insight}
            storePerformance={storePerformance}
            posData={posData}
            inventoryData={inventoryData}
            onOpenUpload={() => setIsUploadOpen(true)}
          />
        )}

        {activeTab === 'charts' && (
          <Charts
            storePerformance={storePerformance}
            monthlyData={monthlyData}
            inventoryData={inventoryData}
          />
        )}

        {activeTab === 'heatmap' && (
          <Heatmap storePerformance={storePerformance} />
        )}

        {activeTab === 'ai' && (
          <AIChat
            insight={insight}
            storePerformance={storePerformance}
            monthlyData={monthlyData}
          />
        )}

        {activeTab === 'explorer' && (
          <DataExplorer
            posData={posData}
            inventoryData={inventoryData}
            productPerformance={insight?.topProducts || []}
          />
        )}
      </main>

      {/* Upload Modal */}
      <CSVUpload
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDataLoaded={handleDataLoaded}
      />
    </div>
  );
}
