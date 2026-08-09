import { useState } from 'react';
import type { BusinessInsight, StorePerformance, BusinessProblem } from '../types';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  AlertTriangle, 
  Store as StoreIcon, 
  ShieldAlert, 
  Sparkles,
  Download,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  X,
  Clock,
  Tag
} from 'lucide-react';

interface DashboardProps {
  insight: BusinessInsight | null;
  storePerformance: StorePerformance[];
  posData: any[];
  inventoryData: any[];
  onOpenUpload: () => void;
}

export default function Dashboard({
  insight,
  storePerformance,
  onOpenUpload,
}: DashboardProps) {
  const [selectedAlert, setSelectedAlert] = useState<BusinessProblem | null>(null);

  if (!insight) {
    return (
      <div className="webstacked-card rounded-3xl p-12 text-center max-w-2xl mx-auto space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#8cff2e]/10 border border-[#8cff2e]/30 flex items-center justify-center mx-auto">
          <Layers className="w-8 h-8 text-[#8cff2e]" />
        </div>
        <h2 className="text-2xl font-extrabold text-white">No Active Retail Dataset Loaded</h2>
        <p className="text-slate-400 text-sm">Upload your POS sales and Inventory CSV files to activate InsightOS intelligence.</p>
        <button
          onClick={onOpenUpload}
          className="px-6 py-3 rounded-2xl webstacked-button-primary text-sm font-bold shadow-xl cursor-pointer"
        >
          Upload CSV Files
        </button>
      </div>
    );
  }

  const exportExecutiveReport = () => {
    const report = 
      `INSIGHTOS EXECUTIVE RETAIL OPERATIONS REPORT\n` +
      `=============================================\n` +
      `Generated: ${new Date().toLocaleDateString()}\n\n` +
      `FINANCIAL SUMMARY:\n` +
      `- Total Revenue: ₹${insight.totalRevenue.toLocaleString('en-IN')}\n` +
      `- Net Profit: ₹${insight.totalProfit.toLocaleString('en-IN')}\n` +
      `- Net Margin: ${insight.profitMargin.toFixed(1)}%\n` +
      `- Units Sold: ${insight.totalUnitsSold.toLocaleString('en-IN')}\n\n` +
      `OPERATIONAL ALERTS:\n` +
      `- Out of Stock Items: ${insight.outOfStockCount}\n` +
      `- Low Stock Warnings: ${insight.lowStockCount}\n` +
      `- Expiring Stock Alerts: ${insight.expiringItemsCount}\n` +
      `- Active Operational Issues: ${insight.problems.length}\n\n` +
      `TOP PERFORMING STORES:\n` +
      storePerformance.slice(0, 3).map(s => `- ${s.storeName}: ₹${s.totalRevenue.toLocaleString('en-IN')} (${s.profitMargin.toFixed(1)}% margin)`).join('\n');

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `InsightOS_Executive_Report_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
  };

  return (
    <div className="space-y-8 text-slate-100">
      
      {/* WebStacked Hero Header Banner */}
      <div className="webstacked-card rounded-3xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8cff2e]/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold webstacked-badge-lime flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> WebStacked Executive Operations
              </span>
              <span className="text-xs text-slate-400">Live Multi-Store Monitoring</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight font-['Geist']">
              Multi-Store Performance & Intelligence Overview
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              {insight.summary}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportExecutiveReport}
              className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#8cff2e]" /> Export Executive Summary
            </button>
          </div>
        </div>
      </div>

      {/* WebStacked KPI Grid (5 Cards in 5 Cols or 4 Cols) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* KPI 1: Gross Revenue */}
        <div className="webstacked-card rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Gross Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-[#8cff2e]/10 border border-[#8cff2e]/30 flex items-center justify-center text-[#8cff2e]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl lg:text-2xl font-black text-white font-['Geist']">
              ₹{insight.totalRevenue.toLocaleString('en-IN')}
            </h3>
            <div className="flex items-center gap-1 text-[11px] text-[#8cff2e] font-semibold mt-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12.4% vs benchmark</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Net Profit & Margin */}
        <div className="webstacked-card rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Net Profit</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl lg:text-2xl font-black text-white font-['Geist']">
              ₹{insight.totalProfit.toLocaleString('en-IN')}
            </h3>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-1.5">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
                {insight.profitMargin.toFixed(1)}% Margin
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Total Sales Volume */}
        <div className="webstacked-card rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Units Sold</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl lg:text-2xl font-black text-white font-['Geist']">
              {insight.totalUnitsSold.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1.5">{storePerformance.length} Indian Outlets</p>
          </div>
        </div>

        {/* KPI 4: Operational Stockout Risk */}
        <div className="webstacked-card rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Stockout Risk</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl lg:text-2xl font-black text-rose-400 font-['Geist']">
              {insight.outOfStockCount} <span className="text-xs text-slate-400 font-normal">out</span>
            </h3>
            <div className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold mt-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{insight.lowStockCount} below reorder</span>
            </div>
          </div>
        </div>

        {/* NEW KPI 5: Expiry & Discount Opportunity */}
        <div className="webstacked-card rounded-2xl p-5 relative overflow-hidden group border-purple-500/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Expiry Risk</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl lg:text-2xl font-black text-purple-300 font-['Geist']">
              {insight.expiringItemsCount} <span className="text-xs text-slate-400 font-normal">items near expiry</span>
            </h3>
            <div className="flex items-center gap-1 text-[11px] text-[#8cff2e] font-semibold mt-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>Dynamic discount ready</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: Stores Performance & Alert Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Multi-Store Breakdown Matrix */}
        <div className="lg:col-span-2 webstacked-card rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <StoreIcon className="w-5 h-5 text-[#8cff2e]" /> Multi-Store Operations Matrix
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Financial margins, sales volume, and risk evaluation by store location</p>
            </div>
            <span className="text-xs text-[#8cff2e] font-semibold">{storePerformance.length} Stores Tracked</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-semibold">
                  <th className="pb-3">Store Location</th>
                  <th className="pb-3">Gross Revenue</th>
                  <th className="pb-3">Net Margin</th>
                  <th className="pb-3">Top Category</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {storePerformance.map((store) => (
                  <tr key={store.storeId} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 font-bold text-white">
                      {store.storeName}
                      <span className="text-[10px] text-slate-400 block font-normal">{store.totalSales.toLocaleString('en-IN')} units sold</span>
                    </td>
                    <td className="py-3.5 font-semibold text-[#8cff2e]">
                      ₹{store.totalRevenue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 font-semibold">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] ${store.profitMargin >= 30 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                        {store.profitMargin.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3.5 text-cyan-300 font-medium">{store.topCategory}</td>
                    <td className="py-3.5 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        store.riskStatus === 'healthy' 
                          ? 'webstacked-badge-lime' 
                          : store.riskStatus === 'warning' 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {store.riskStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: AI Intelligent Alert Center */}
        <div className="webstacked-card rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" /> AI Actionable Alert Center
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Prioritized operational warnings requiring remediation</p>
            </div>
          </div>

          <div className="space-y-3.5 max-h-[440px] overflow-y-auto pr-1">
            {insight.problems.map((prob) => (
              <div
                key={prob.id}
                onClick={() => setSelectedAlert(prob)}
                className={`p-4 rounded-2xl bg-[#12141a] hover:bg-[#1a1d26] border transition-all cursor-pointer group space-y-2 ${
                  prob.type === 'expiry' 
                    ? 'border-purple-500/40 hover:border-purple-400' 
                    : 'border-white/10 hover:border-[#8cff2e]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    prob.type === 'expiry'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : prob.severity === 'high' 
                      ? 'bg-rose-500/20 text-rose-300' 
                      : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {prob.type === 'expiry' ? 'EXPIRY RISK' : `${prob.severity} severity`}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-[#8cff2e] transition-colors" />
                </div>
                <h4 className="font-bold text-white text-xs leading-snug flex items-center gap-1.5">
                  {prob.type === 'expiry' && <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                  {prob.title}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2">{prob.description}</p>

                {prob.recommendedDiscount && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md w-fit">
                    <Tag className="w-3 h-3 text-[#8cff2e]" />
                    <span>Apply {prob.recommendedDiscount}% Discount Recommendation</span>
                  </div>
                )}

                {prob.financialImpact && (
                  <span className="inline-block text-[10px] text-[#8cff2e] font-semibold bg-[#8cff2e]/10 px-2 py-0.5 rounded-md">
                    {prob.financialImpact}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Strategic Remediation Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="webstacked-card rounded-3xl p-6 lg:p-8 max-w-xl w-full space-y-6 relative border border-white/20 shadow-2xl">
            <button
              onClick={() => setSelectedAlert(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                selectedAlert.type === 'expiry'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : selectedAlert.severity === 'high' 
                  ? 'bg-rose-500/20 text-rose-300' 
                  : 'bg-amber-500/20 text-amber-300'
              }`}>
                {selectedAlert.type === 'expiry' ? 'Perishable Expiry Risk Alert' : `${selectedAlert.severity} Severity Alert`}
              </span>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {selectedAlert.type === 'expiry' && <Clock className="w-5 h-5 text-purple-400" />}
                {selectedAlert.title}
              </h3>
            </div>

            <div className="space-y-3 bg-[#08090c] p-4 rounded-2xl border border-white/10 text-xs">
              <p className="text-slate-300">{selectedAlert.description}</p>
              {selectedAlert.financialImpact && (
                <div className="text-[#8cff2e] font-bold">
                  Financial Impact: {selectedAlert.financialImpact}
                </div>
              )}
            </div>

            {selectedAlert.recommendedDiscount && (
              <div className="p-3.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-xs text-purple-200 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold">
                  <Tag className="w-4 h-4 text-[#8cff2e]" />
                  <span>Dynamic Clearance Discount:</span>
                </div>
                <span className="px-3 py-1 rounded-xl bg-[#8cff2e] text-black font-extrabold text-xs">
                  {selectedAlert.recommendedDiscount}% OFF
                </span>
              </div>
            )}

            {selectedAlert.recommendation && (
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#8cff2e]" /> AI Strategy & Recommendation
                </h4>
                <p className="text-slate-300 bg-[#12141a] p-3 rounded-xl border border-white/10">{selectedAlert.recommendation}</p>
              </div>
            )}

            {selectedAlert.actionSteps && (
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-white">Action Steps:</h4>
                <ul className="space-y-1.5">
                  {selectedAlert.actionSteps.map((step, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-[#8cff2e]/20 text-[#8cff2e] font-bold text-[10px] flex items-center justify-center">{idx + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setSelectedAlert(null)}
              className="w-full py-3 rounded-2xl webstacked-button-primary text-xs font-bold shadow-xl cursor-pointer"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
