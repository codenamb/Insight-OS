import { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import type { StorePerformance } from '../types';
import { BarChart3, TrendingUp, PieChart as PieIcon, Layers, ShieldAlert } from 'lucide-react';

interface ChartsProps {
  storePerformance: StorePerformance[];
  monthlyData: any[];
  inventoryData?: any[];
  categoryBreakdown?: any[];
  posData?: any[];
  categoryFilter?: string;
}

const PALETTE = ['#8cff2e', '#00f0ff', '#a855f7', '#f59e0b', '#ec4899', '#3b82f6', '#14b8a6', '#f43f5e'];

interface StockDeficitData {
  name: string;
  stock: number;
  reorder: number;
  deficit: number;
}

function formatINRCurrencyTick(val: number): string {
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(1)}L`;
  }
  if (val >= 1000) {
    return `₹${(val / 1000).toFixed(0)}k`;
  }
  return `₹${val}`;
}

export default function Charts({ 
  storePerformance, 
  monthlyData, 
  inventoryData = [], 
  categoryBreakdown = [], 
  posData = [],
  categoryFilter = 'all'
}: ChartsProps) {
  const [chartView, setChartView] = useState<'all' | 'trend' | 'stores' | 'category' | 'inventory'>('all');

  const storeChartData = storePerformance.map(store => ({
    name: store.storeName.replace(/\s*\(.*?\)\s*/g, ''),
    revenue: Math.round(store.totalRevenue),
    profit: Math.round(store.totalProfit),
    sales: store.totalSales,
    margin: parseFloat(store.profitMargin.toFixed(1)),
  }));

  // Build accurate category revenue pie data from categoryBreakdown or posData
  let categoryPieData: { name: string; value: number }[] = [];

  if (categoryBreakdown && categoryBreakdown.length > 0) {
    categoryPieData = categoryBreakdown.map(c => ({
      name: c.category,
      value: Math.round(c.totalRevenue),
    }));
  } else if (posData && posData.length > 0) {
    const catMap = new Map<string, number>();
    posData.forEach((row: any) => {
      const cat = row.category || 'General';
      const rev = parseFloat(row.revenue) || 0;
      catMap.set(cat, (catMap.get(cat) || 0) + rev);
    });
    categoryPieData = Array.from(catMap.entries())
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  } else {
    const categoryDataMap = new Map<string, number>();
    storePerformance.forEach(s => {
      const cat = s.topCategory || 'General';
      categoryDataMap.set(cat, (categoryDataMap.get(cat) || 0) + s.totalRevenue);
    });
    categoryPieData = Array.from(categoryDataMap.entries()).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));
  }

  // Filter inventory data by category if category filter is active
  const categoryFilteredInventory = (categoryFilter && categoryFilter !== 'all')
    ? inventoryData.filter(item => item.category && item.category.toLowerCase() === categoryFilter.toLowerCase())
    : inventoryData;

  // Inventory deficit chart data (ALL items where stock <= reorder level)
  const filteredLowStock = categoryFilteredInventory
    .filter(item => (parseFloat(item.currentStock) || 0) <= (parseFloat(item.reorderLevel) || 0))
    .map(item => ({
      name: item.productName || item.productId || 'Unknown Item',
      stock: parseFloat(item.currentStock) || 0,
      reorder: parseFloat(item.reorderLevel) || 0,
      deficit: Math.max(0, (parseFloat(item.reorderLevel) || 0) - (parseFloat(item.currentStock) || 0)),
    }));

  const lowStockItemsData: StockDeficitData[] = filteredLowStock.length > 0 
    ? filteredLowStock 
    : [{ name: 'All Items Fully Stocked', stock: 100, reorder: 50, deficit: 0 }];

  const isDailyView = monthlyData.length > 0 && monthlyData[0].month.includes('-');

  return (
    <div className="space-y-6 text-slate-100">
      {/* View Switcher Header */}
      <div className="webstacked-card rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white font-['Geist']">
            Interactive Analytics & Visualization Studio
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-dimensional BI charts for revenue trajectory, store efficiency, & inventory risks.
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs bg-[#12141a] p-1.5 rounded-2xl border border-white/10">
          {[
            { id: 'all', label: 'All Charts', icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'trend', label: 'Revenue Trend', icon: <TrendingUp className="w-3.5 h-3.5" /> },
            { id: 'stores', label: 'Store Comparison', icon: <BarChart3 className="w-3.5 h-3.5" /> },
            { id: 'category', label: 'Category Share', icon: <PieIcon className="w-3.5 h-3.5" /> },
            { id: 'inventory', label: 'Stock Deficit', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setChartView(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                chartView === tab.id
                  ? 'bg-[#8cff2e] text-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Chart Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Revenue & Net Profit Trend Area Chart */}
        {(chartView === 'all' || chartView === 'trend') && (
          <div className="webstacked-card rounded-3xl p-6 lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#8cff2e]" />
                  {isDailyView ? 'Daily Revenue & Profit Trajectory' : 'Monthly Revenue & Profit Trajectory (MoM)'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isDailyView 
                    ? 'Daily sales trajectory breakdown across active dates in INR (₹)' 
                    : 'Comparing gross revenue vs net profitability over time in INR (₹)'}
                </p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8cff2e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8cff2e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={formatINRCurrencyTick} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#cbd5e1', fontSize: '12px' }} />
                <Area type="monotone" dataKey="total" stroke="#8cff2e" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Gross Revenue (₹)" />
                <Area type="monotone" dataKey="profit" stroke="#00f0ff" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProfit)" name="Net Profit (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 2. Store Comparison Multi-Bar Chart */}
        {(chartView === 'all' || chartView === 'stores') && (
          <div className="webstacked-card rounded-3xl p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" /> Multi-Store Financial Comparison
              </h3>
              <p className="text-xs text-slate-400">Revenue & Profit breakdown across store locations</p>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={storeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={formatINRCurrencyTick} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#cbd5e1', fontSize: '12px' }} />
                <Bar dataKey="revenue" fill="#8cff2e" name="Revenue (₹)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="#00f0ff" name="Net Profit (₹)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 3. Category Revenue Share Donut Chart */}
        {(chartView === 'all' || chartView === 'category') && (
          <div className="webstacked-card rounded-3xl p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-purple-400" /> Revenue Distribution by Category
              </h3>
              <p className="text-xs text-slate-400">Market share proportion across top categories</p>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name || ''} ${percent !== undefined ? (percent * 100).toFixed(0) : 0}%`
                  }
                >
                  {categoryPieData.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={PALETTE[idx % PALETTE.length]} stroke="#050505" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 4. Stock Deficit vs Threshold Chart */}
        {(chartView === 'all' || chartView === 'inventory') && (
          <div className="webstacked-card rounded-3xl p-6 lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" /> Inventory Stock Deficit (Below Reorder Point)
                </h3>
                <p className="text-xs text-slate-400">Current on-hand inventory vs minimum required stock threshold</p>
              </div>
              {categoryFilter !== 'all' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Category: {categoryFilter}
                </span>
              )}
            </div>

            <ResponsiveContainer width="100%" height={lowStockItemsData.length > 6 ? 340 : 280}>
              <BarChart data={lowStockItemsData} margin={{ top: 10, right: 20, left: 0, bottom: lowStockItemsData.length > 6 ? 45 : 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  angle={lowStockItemsData.length > 6 ? -25 : 0} 
                  textAnchor={lowStockItemsData.length > 6 ? "end" : "middle"} 
                  interval={0}
                  tickFormatter={(val: string) => val.length > 18 ? val.slice(0, 18) + '...' : val}
                />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#cbd5e1', fontSize: '12px' }} />
                <Bar dataKey="stock" fill="#8cff2e" name="Current Stock" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reorder" fill="#f59e0b" name="Reorder Point Threshold" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#08090c] border border-white/15 p-3.5 rounded-2xl shadow-2xl text-xs space-y-1.5">
        <p className="font-bold text-white border-b border-white/10 pb-1.5">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} className="flex items-center gap-2 font-medium" style={{ color: entry.color }}>
            <span>{entry.name}:</span>
            <span className="font-bold">
              {typeof entry.value === 'number' && (entry.name.toLowerCase().includes('revenue') || entry.name.toLowerCase().includes('profit'))
                ? `₹${entry.value.toLocaleString('en-IN')}`
                : entry.value}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
}
