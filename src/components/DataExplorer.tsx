import { useState } from 'react';
import { Search, Download, Database, Tag, Clock } from 'lucide-react';
import type { ProductPerformance } from '../types';

interface DataExplorerProps {
  posData: any[];
  inventoryData: any[];
  productPerformance: ProductPerformance[];
}

export default function DataExplorer({ posData, inventoryData, productPerformance }: DataExplorerProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'pos' | 'inventory'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  const categories = Array.from(
    new Set([
      ...posData.map((r) => r.category).filter(Boolean),
      ...inventoryData.map((r) => r.category).filter(Boolean),
    ])
  );

  const filteredProducts = productPerformance.filter((prd) => {
    const matchesSearch =
      prd.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prd.productId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || prd.category === categoryFilter;
    const matchesStock = stockFilter === 'all' || prd.stockStatus === stockFilter;
    return matchesSearch && matchesCategory && matchesStock;
  });

  const filteredPOS = posData.filter((row) => {
    const matchesSearch =
      (row.productName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (row.storeName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (row.productId || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || row.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredInventory = inventoryData.filter((row) => {
    const matchesSearch =
      (row.productName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (row.supplier || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (row.productId || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || row.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const exportFilteredCSV = () => {
    let csvData = '';
    let filename = 'insightos_export.csv';

    if (activeTab === 'products') {
      filename = 'product_performance_analytics_inr.csv';
      csvData =
        'ProductId,ProductName,Category,GrossRevenue_INR,UnitsSold,NetProfit_INR,ABCClass,StockStatus,CurrentStock,ExpiryDate,DaysToExpiry,RecommendedDiscount_Pct\n' +
        filteredProducts
          .map(
            (p) =>
              `"${p.productId}","${p.productName}","${p.category}",${p.totalRevenue},${p.totalQuantity},${p.totalProfit},"${p.abcClass}","${p.stockStatus}",${p.currentStock ?? 0},"${p.expiryDate || ''}",${p.daysToExpiry ?? ''},${p.recommendedDiscount ?? 0}`
          )
          .join('\n');
    } else if (activeTab === 'pos') {
      filename = 'pos_sales_transactions_inr.csv';
      csvData =
        'Date,StoreId,StoreName,ProductId,ProductName,Category,Quantity,Revenue_INR\n' +
        filteredPOS
          .map(
            (r) =>
              `"${r.date}","${r.storeId}","${r.storeName}","${r.productId}","${r.productName}","${r.category}",${r.quantity},${r.revenue}`
          )
          .join('\n');
    } else {
      filename = 'inventory_stock_levels_inr.csv';
      csvData =
        'ProductId,ProductName,Category,CurrentStock,ReorderLevel,UnitCost_INR,Supplier,ExpiryDate\n' +
        filteredInventory
          .map(
            (r) =>
              `"${r.productId}","${r.productName}","${r.category}",${r.currentStock},${r.reorderLevel},${r.unitCost},"${r.supplier || ''}","${r.expiryDate || ''}"`
          )
          .join('\n');
    }

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="webstacked-card rounded-3xl p-6 lg:p-8 space-y-6 text-slate-100">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2 font-['Geist']">
            <Database className="w-5 h-5 text-[#8cff2e]" /> Data Explorer & Inventory Matrix (INR)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Search, sort, filter, and export enriched product analytics & raw record logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportFilteredCSV}
            className="px-4 py-2.5 rounded-2xl webstacked-button-primary font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Filtered CSV
          </button>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#08090c] p-4 rounded-2xl border border-white/10">
        <div className="flex items-center gap-1.5 bg-[#12141a] p-1.5 rounded-2xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'products' ? 'bg-[#8cff2e] text-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Product ABC Matrix ({filteredProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'pos' ? 'bg-[#8cff2e] text-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            POS Sales Logs ({filteredPOS.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'inventory' ? 'bg-[#8cff2e] text-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Inventory Stock ({filteredInventory.length})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product, store..."
              className="w-full bg-[#12141a] border border-white/10 rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8cff2e]"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#12141a] border border-white/10 text-slate-300 rounded-2xl px-3 py-2 text-xs focus:outline-none focus:border-[#8cff2e]"
          >
            <option value="all" className="bg-[#12141a]">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-[#12141a]">
                {cat}
              </option>
            ))}
          </select>

          {activeTab === 'products' && (
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="bg-[#12141a] border border-white/10 text-slate-300 rounded-2xl px-3 py-2 text-xs focus:outline-none focus:border-[#8cff2e]"
            >
              <option value="all" className="bg-[#12141a]">All Stock Statuses</option>
              <option value="in_stock" className="bg-[#12141a]">In Stock</option>
              <option value="low_stock" className="bg-[#12141a]">Low Stock Warning</option>
              <option value="out_of_stock" className="bg-[#12141a]">Out of Stock</option>
            </select>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 text-xs">
        {activeTab === 'products' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#08090c] text-slate-400 border-b border-white/10 font-semibold">
                <th className="p-3.5">SKU / Product</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Gross Revenue (₹)</th>
                <th className="p-3.5">Units Sold</th>
                <th className="p-3.5">Net Profit (₹)</th>
                <th className="p-3.5">ABC Class</th>
                <th className="p-3.5">Stock Status</th>
                <th className="p-3.5">Expiry / Discount Rec</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredProducts.map((p) => (
                <tr key={p.productId} className="hover:bg-white/5 transition-colors">
                  <td className="p-3.5">
                    <span className="font-bold text-white block">{p.productName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{p.productId}</span>
                  </td>
                  <td className="p-3.5 font-medium text-cyan-300">{p.category}</td>
                  <td className="p-3.5 font-semibold text-[#8cff2e]">₹{p.totalRevenue.toLocaleString('en-IN')}</td>
                  <td className="p-3.5">{p.totalQuantity.toLocaleString('en-IN')}</td>
                  <td className="p-3.5 font-semibold text-emerald-400">₹{p.totalProfit.toLocaleString('en-IN')}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.abcClass === 'A'
                          ? 'webstacked-badge-lime'
                          : p.abcClass === 'B'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Class {p.abcClass}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        p.stockStatus === 'in_stock'
                          ? 'webstacked-badge-lime'
                          : p.stockStatus === 'low_stock'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {p.stockStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {p.expiryDate ? (
                      <div className="space-y-1">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 w-fit ${
                          p.expiryStatus === 'critical_expiry' 
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {p.daysToExpiry}d left ({p.expiryDate})
                        </span>
                        {p.recommendedDiscount && (
                          <span className="px-2 py-0.5 rounded-md bg-[#8cff2e]/20 text-[#8cff2e] text-[10px] font-extrabold flex items-center gap-1 w-fit">
                            <Tag className="w-3 h-3" />
                            Apply {p.recommendedDiscount}% Discount
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[11px]">No Expiry</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'pos' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#08090c] text-slate-400 border-b border-white/10 font-semibold">
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Store Name</th>
                <th className="p-3.5">Product Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Quantity</th>
                <th className="p-3.5">Revenue (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredPOS.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="p-3.5 font-medium text-slate-400">{row.date}</td>
                  <td className="p-3.5 font-bold text-white">{row.storeName}</td>
                  <td className="p-3.5 text-purple-300">{row.productName}</td>
                  <td className="p-3.5 text-cyan-300">{row.category}</td>
                  <td className="p-3.5">{row.quantity}</td>
                  <td className="p-3.5 font-semibold text-[#8cff2e]">₹{parseFloat(row.revenue).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'inventory' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#08090c] text-slate-400 border-b border-white/10 font-semibold">
                <th className="p-3.5">Product Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Current Stock</th>
                <th className="p-3.5">Reorder Threshold</th>
                <th className="p-3.5">Expiry Date</th>
                <th className="p-3.5">Supplier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredInventory.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="p-3.5 font-bold text-white">{row.productName}</td>
                  <td className="p-3.5 text-cyan-300">{row.category}</td>
                  <td className="p-3.5">
                    <span
                      className={`font-bold ${
                        parseFloat(row.currentStock) === 0
                          ? 'text-rose-400'
                          : parseFloat(row.currentStock) <= parseFloat(row.reorderLevel)
                          ? 'text-amber-400'
                          : 'text-[#8cff2e]'
                      }`}
                    >
                      {row.currentStock} units
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400">{row.reorderLevel} units</td>
                  <td className="p-3.5 font-medium">
                    {row.expiryDate ? (
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-[11px] border border-purple-500/30">
                        {row.expiryDate}
                      </span>
                    ) : (
                      <span className="text-slate-500">N/A</span>
                    )}
                  </td>
                  <td className="p-3.5 text-purple-300">{row.supplier || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
