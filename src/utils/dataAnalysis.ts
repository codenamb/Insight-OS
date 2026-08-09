import type { 
  StorePerformance, 
  BusinessProblem, 
  BusinessInsight, 
  ProductPerformance, 
  CategoryPerformance,
  FilterOptions
} from '../types';

export function filterPOSData(posData: any[], filters?: FilterOptions): any[] {
  if (!posData || posData.length === 0) return [];
  let filtered = [...posData];

  if (filters?.storeId && filters.storeId !== 'all') {
    filtered = filtered.filter((row) => row.storeId === filters.storeId);
  }

  if (filters?.category && filters.category !== 'all') {
    filtered = filtered.filter((row) => row.category === filters.category);
  }

  if (filters?.dateRange && filters.dateRange !== 'all') {
    const dates = filtered.map(r => new Date(r.date).getTime()).filter(d => !isNaN(d));
    if (dates.length > 0) {
      const maxDate = Math.max(...dates);
      let days = 365;
      if (filters.dateRange === '7d') days = 7;
      if (filters.dateRange === '30d') days = 30;
      if (filters.dateRange === '90d') days = 90;
      if (filters.dateRange === 'year') days = 365;

      const cutoff = maxDate - days * 24 * 60 * 60 * 1000;
      filtered = filtered.filter((row) => new Date(row.date).getTime() >= cutoff);
    }
  }

  return filtered;
}

export function analyzeBusinessData(
  rawPOS: any[],
  rawInventory: any[],
  filters?: FilterOptions
): BusinessInsight {
  const problems: BusinessProblem[] = [];
  const opportunities: BusinessProblem[] = [];
  const trends: any[] = [];

  const posData = filterPOSData(rawPOS, filters);
  const inventoryData = rawInventory.filter(row => row.productId);

  // Map inventory cost per product
  const inventoryCostMap = new Map<string, number>();
  inventoryData.forEach(item => {
    if (item.productId && item.unitCost) {
      inventoryCostMap.set(item.productId, parseFloat(item.unitCost) || 0);
    }
  });

  // Calculate Product Performance
  const productPerformance = analyzeProductSales(posData, inventoryData);
  
  // Inventory Risk & Expiry Analysis
  let outOfStockCount = 0;
  let lowStockCount = 0;
  let expiringItemsCount = 0;

  const referenceDate = new Date('2026-08-09').getTime();

  inventoryData.forEach((item: any, idx: number) => {
    const currentStock = parseFloat(item.currentStock) || 0;
    const reorderLevel = parseFloat(item.reorderLevel) || 0;
    const unitCost = parseFloat(item.unitCost) || 0;
    const matchedProduct = productPerformance.find(p => p.productId === item.productId);
    const estLoss = matchedProduct ? matchedProduct.totalRevenue / Math.max(1, matchedProduct.totalQuantity) * reorderLevel : unitCost * 10;

    // Expiry Date Evaluation
    if (item.expiryDate) {
      const expTime = new Date(item.expiryDate).getTime();
      if (!isNaN(expTime)) {
        const daysLeft = Math.ceil((expTime - referenceDate) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 15 && currentStock > 0) {
          expiringItemsCount++;
          const recAmount = currentStock * unitCost * 0.6;
          problems.push({
            id: `prob-expiry-critical-${item.productId}-${idx}`,
            type: 'expiry',
            severity: 'high',
            title: `CRITICAL EXPIRY RISK: ${item.productName}`,
            description: `${item.productName} (${currentStock} units) expires in ${daysLeft} days (${item.expiryDate}). Without intervention, stock value of ₹${(currentStock * unitCost).toLocaleString('en-IN')} will be lost.`,
            financialImpact: `Estimated capital recovery: ~₹${recAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })} via 40% Flash Discount`,
            affectedProducts: [item.productId],
            recommendation: `Apply 40% Flash Clearance Discount immediately on POS to liquidate stock before expiry date.`,
            recommendedDiscount: 40,
            actionSteps: [
              `Apply 40% clearance discount flag on store POS terminals`,
              `Place promotional end-cap banner near store entrance`,
              `Send push notification or SMS alert to local loyalty members`
            ],
            timestamp: new Date().toISOString(),
          });
        } else if (daysLeft > 15 && daysLeft <= 45 && currentStock > 0) {
          expiringItemsCount++;
          const recAmount = currentStock * unitCost * 0.8;
          problems.push({
            id: `prob-expiry-warning-${item.productId}-${idx}`,
            type: 'expiry',
            severity: 'medium',
            title: `Near Expiry Warning: ${item.productName}`,
            description: `${item.productName} (${currentStock} units on-hand) is approaching expiry in ${daysLeft} days (${item.expiryDate}).`,
            financialImpact: `Estimated capital recovery: ~₹${recAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })} via 20% Bundle Discount`,
            affectedProducts: [item.productId],
            recommendation: `Apply 20% Promotional Bundle Discount with fast-moving complementary items.`,
            recommendedDiscount: 20,
            actionSteps: [
              `Bundle item with high-volume Class-A products at 20% discount`,
              `Monitor daily sell-through rate over next 7 days`
            ],
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    if (currentStock === 0) {
      outOfStockCount++;
      problems.push({
        id: `prob-stockout-${item.productId}-${idx}`,
        type: 'inventory',
        severity: 'high',
        title: `CRITICAL: Stockout on ${item.productName}`,
        description: `Product ${item.productName} (${item.category || 'General'}) is completely out of stock with zero inventory remaining.`,
        financialImpact: `Estimated lost revenue: ~₹${estLoss.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/period`,
        affectedProducts: [item.productId],
        recommendation: `Issue urgent restock purchase order to supplier (${item.supplier || 'Primary Supplier'}).`,
        actionSteps: [
          `Contact supplier ${item.supplier || 'vendor'} for rush delivery`,
          `Set emergency reorder buffer for high-velocity items`,
          `Notify affected store managers to adjust displays`
        ],
        timestamp: new Date().toISOString(),
      });
    } else if (currentStock <= reorderLevel) {
      lowStockCount++;
      problems.push({
        id: `prob-lowstock-${item.productId}-${idx}`,
        type: 'inventory',
        severity: 'medium',
        title: `Low Stock Warning: ${item.productName}`,
        description: `Current stock (${currentStock} units) is below reorder threshold (${reorderLevel} units).`,
        financialImpact: `Risk of stockout within ${matchedProduct?.daysOfSupply || 3} days based on sales velocity.`,
        affectedProducts: [item.productId],
        recommendation: `Initiate standard reorder of at least ${reorderLevel * 2} units.`,
        actionSteps: [
          `Review reorder lead times with supplier`,
          `Reallocate stock from nearby overstocked store if available`
        ],
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Analyze store performance
  const storePerformance = analyzeStorePerformance(posData, inventoryCostMap);
  const totalRevenue = storePerformance.reduce((sum, s) => sum + s.totalRevenue, 0);
  const totalProfit = storePerformance.reduce((sum, s) => sum + s.totalProfit, 0);
  const totalUnitsSold = storePerformance.reduce((sum, s) => sum + s.totalSales, 0);
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const avgRevenue = storePerformance.length > 0 ? totalRevenue / storePerformance.length : 0;

  storePerformance.forEach((store, idx) => {
    if (store.profitMargin < 15 && store.totalRevenue > 0) {
      problems.push({
        id: `prob-margin-${store.storeId}-${idx}`,
        type: 'profitability',
        severity: 'high',
        title: `Low Profit Margin at ${store.storeName}`,
        description: `${store.storeName} has a low profit margin of ${store.profitMargin.toFixed(1)}% (below target 20%).`,
        financialImpact: `Profit loss of ~₹${(store.totalRevenue * 0.1).toLocaleString('en-IN', { maximumFractionDigits: 0 })} compared to benchmark stores.`,
        affectedStores: [store.storeId],
        recommendation: `Review discount policies, high-cost merchandise mix, and local overheads.`,
        actionSteps: [
          `Audit localized product pricing and discounts`,
          `Promote higher-margin accessories and premium items`
        ],
        timestamp: new Date().toISOString(),
      });
    }

    if (store.totalRevenue < avgRevenue * 0.7 && storePerformance.length > 1) {
      problems.push({
        id: `prob-underperform-${store.storeId}-${idx}`,
        type: 'store',
        severity: 'medium',
        title: `Underperforming Store: ${store.storeName}`,
        description: `Revenue (₹${store.totalRevenue.toLocaleString('en-IN')}) is 30% below store chain average (₹${avgRevenue.toLocaleString('en-IN')}).`,
        financialImpact: `Underperforming average by ₹${(avgRevenue - store.totalRevenue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
        affectedStores: [store.storeId],
        recommendation: `Audit foot traffic, store layout, staff training, and inventory localized fit.`,
        timestamp: new Date().toISOString(),
      });
    }

    if (store.growthRate > 0.15) {
      opportunities.push({
        id: `opp-growth-${store.storeId}-${idx}`,
        type: 'opportunity',
        severity: 'high',
        title: `High Growth Store: ${store.storeName}`,
        description: `Store is expanding rapidly with a ${(store.growthRate * 100).toFixed(1)}% sales surge.`,
        financialImpact: `Generates +₹${(store.totalProfit * 0.25).toLocaleString('en-IN', { maximumFractionDigits: 0 })} extra monthly profit`,
        affectedStores: [store.storeId],
        recommendation: `Capitalize on high demand by increasing inventory allocation and running cross-promotions.`,
        actionSteps: [
          `Increase stock cap for top 5 category items at this location`,
          `Document best-practice store merchandising to replicate chain-wide`
        ],
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Category Performance Analysis
  const categoryBreakdown = analyzeCategoryPerformance(posData, inventoryCostMap, totalRevenue);

  // Top Category Opportunity
  if (categoryBreakdown.length > 0) {
    const topCat = categoryBreakdown[0];
    opportunities.push({
      id: `opp-cat-${topCat.category}`,
      type: 'opportunity',
      severity: 'medium',
      title: `Dominant Category: ${topCat.category}`,
      description: `${topCat.category} represents ${topCat.shareOfRevenue.toFixed(1)}% of total business revenue (₹${topCat.totalRevenue.toLocaleString('en-IN')}).`,
      financialImpact: `High margin sector generating ₹${topCat.totalProfit.toLocaleString('en-IN')} net profit`,
      recommendation: `Expand product depth in ${topCat.category} with premium variants and accessory bundles.`,
      timestamp: new Date().toISOString(),
    });
  }

  // Sales Trend Analysis
  const monthlySales = calculateMonthlySales(posData);
  if (monthlySales.length >= 2) {
    const recent = monthlySales[monthlySales.length - 1].total;
    const previous = monthlySales[monthlySales.length - 2].total;
    const growth = previous > 0 ? ((recent - previous) / previous) * 100 : 0;

    trends.push({
      metric: 'Total Revenue',
      direction: growth > 0.5 ? 'up' : growth < -0.5 ? 'down' : 'stable',
      value: growth,
      period: 'Period Comparison',
    });
  }

  // Top Products Opportunities
  const topProducts = productPerformance.filter(p => p.abcClass === 'A');
  const bottomProducts = productPerformance.filter(p => p.abcClass === 'C');

  if (topProducts.length > 0) {
    opportunities.push({
      id: `opp-top-prd-${topProducts[0].productId}`,
      type: 'opportunity',
      severity: 'high',
      title: `Hero Product: ${topProducts[0].productName}`,
      description: `Class-A revenue generator with ₹${topProducts[0].totalRevenue.toLocaleString('en-IN')} in gross sales (${topProducts[0].totalQuantity} units).`,
      financialImpact: `Generates ₹${topProducts[0].totalProfit.toLocaleString('en-IN')} in total gross profit`,
      affectedProducts: [topProducts[0].productId],
      recommendation: `Protect safety stock and run featured marketing banner campaigns.`,
      timestamp: new Date().toISOString(),
    });
  }

  const summary = generateSummary(problems, opportunities, storePerformance, totalRevenue, totalProfit);

  return {
    summary,
    totalRevenue,
    totalProfit,
    profitMargin,
    totalUnitsSold,
    outOfStockCount,
    lowStockCount,
    expiringItemsCount,
    problems,
    opportunities,
    trends,
    categoryBreakdown,
    topProducts: productPerformance.slice(0, 10),
    bottomProducts: bottomProducts.slice(-10),
  };
}

export function analyzeStorePerformance(
  posData: any[],
  inventoryCostMap?: Map<string, number>
): StorePerformance[] {
  const storeMap = new Map<string, any>();

  posData.forEach((row) => {
    const storeId = row.storeId || 'STR-00';
    const storeName = row.storeName || `Store ${storeId}`;
    const revenue = parseFloat(row.revenue) || 0;
    const quantity = parseFloat(row.quantity) || 0;
    const unitCost = row.unitCost 
      ? parseFloat(row.unitCost) 
      : (inventoryCostMap?.get(row.productId) || revenue * 0.6 / Math.max(1, quantity));
    const cost = unitCost * quantity;
    const profit = revenue - cost;

    if (!storeMap.has(storeId)) {
      storeMap.set(storeId, {
        storeId,
        storeName,
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0,
        totalSales: 0,
        transactions: 0,
        categories: new Map<string, number>(),
        latitude: row.latitude ? parseFloat(row.latitude) : undefined,
        longitude: row.longitude ? parseFloat(row.longitude) : undefined,
      });
    }

    const store = storeMap.get(storeId);
    store.totalRevenue += revenue;
    store.totalCost += cost;
    store.totalProfit += profit;
    store.totalSales += quantity;
    store.transactions += 1;

    if (store.latitude === undefined && row.latitude !== undefined && !isNaN(parseFloat(row.latitude))) {
      store.latitude = parseFloat(row.latitude);
    }
    if (store.longitude === undefined && row.longitude !== undefined && !isNaN(parseFloat(row.longitude))) {
      store.longitude = parseFloat(row.longitude);
    }

    if (row.category) {
      store.categories.set(row.category, (store.categories.get(row.category) || 0) + revenue);
    }
  });

  const stores = Array.from(storeMap.values()).map((store) => {
    const profitMargin = store.totalRevenue > 0 ? (store.totalProfit / store.totalRevenue) * 100 : 0;
    const averageOrderValue = store.transactions > 0 ? store.totalRevenue / store.transactions : 0;
    const unitsPerTransaction = store.transactions > 0 ? store.totalSales / store.transactions : 0;
    const growthRate = calculateGrowthRate(posData, store.storeId);

    // Top Category
    let topCategory = 'General';
    let maxCatRev = 0;
    store.categories.forEach((rev: number, cat: string) => {
      if (rev > maxCatRev) {
        maxCatRev = rev;
        topCategory = cat;
      }
    });

    // Risk Status
    let riskStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (profitMargin < 15 || growthRate < -0.1) riskStatus = 'critical';
    else if (profitMargin < 22 || growthRate < 0) riskStatus = 'warning';

    return {
      storeId: store.storeId,
      storeName: store.storeName,
      totalRevenue: store.totalRevenue,
      totalCost: store.totalCost,
      totalProfit: store.totalProfit,
      profitMargin,
      totalSales: store.totalSales,
      transactions: store.transactions,
      averageOrderValue,
      unitsPerTransaction,
      growthRate,
      latitude: store.latitude,
      longitude: store.longitude,
      topCategory,
      riskStatus,
    };
  });

  return stores.sort((a, b) => b.totalRevenue - a.totalRevenue);
}

function calculateGrowthRate(posData: any[], storeId: string): number {
  const storeData = posData.filter((row) => row.storeId === storeId && row.date);
  if (storeData.length < 2) return 0;

  const sorted = [...storeData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const mid = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, mid);
  const secondHalf = sorted.slice(mid);

  const firstRevenue = firstHalf.reduce((sum, row) => sum + (parseFloat(row.revenue) || 0), 0);
  const secondRevenue = secondHalf.reduce((sum, row) => sum + (parseFloat(row.revenue) || 0), 0);

  if (firstRevenue === 0) return 0;
  return (secondRevenue - firstRevenue) / firstRevenue;
}

export function calculateMonthlySales(posData: any[]): any[] {
  const monthKeys = new Set<string>();
  posData.forEach((row) => {
    if (!row.date) return;
    const date = new Date(row.date);
    if (!isNaN(date.getTime())) {
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthKeys.add(monthKey);
    }
  });

  const isSingleMonth = monthKeys.size <= 1;
  const timeMap = new Map<string, { total: number; profit: number; sales: number }>();

  posData.forEach((row) => {
    if (!row.date) return;
    const date = new Date(row.date);
    if (isNaN(date.getTime())) return;

    const key = isSingleMonth
      ? row.date
      : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    const revenue = parseFloat(row.revenue) || 0;
    const quantity = parseFloat(row.quantity) || 0;
    const unitCost = row.unitCost ? parseFloat(row.unitCost) : revenue * 0.6 / Math.max(1, quantity);
    const profit = revenue - (unitCost * quantity);

    const curr = timeMap.get(key) || { total: 0, profit: 0, sales: 0 };
    curr.total += revenue;
    curr.profit += profit;
    curr.sales += quantity;
    timeMap.set(key, curr);
  });

  return Array.from(timeMap.entries())
    .map(([month, data]) => ({
      month,
      total: data.total,
      profit: data.profit,
      sales: data.sales,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function analyzeCategoryPerformance(
  posData: any[],
  inventoryCostMap: Map<string, number>,
  totalRevenue: number
): CategoryPerformance[] {
  const catMap = new Map<string, any>();

  posData.forEach((row) => {
    const cat = row.category || 'Uncategorized';
    const revenue = parseFloat(row.revenue) || 0;
    const quantity = parseFloat(row.quantity) || 0;
    const unitCost = row.unitCost 
      ? parseFloat(row.unitCost) 
      : (inventoryCostMap.get(row.productId) || revenue * 0.6 / Math.max(1, quantity));
    const profit = revenue - (unitCost * quantity);

    if (!catMap.has(cat)) {
      catMap.set(cat, {
        category: cat,
        totalRevenue: 0,
        totalSales: 0,
        totalProfit: 0,
        productIds: new Set<string>(),
      });
    }

    const c = catMap.get(cat);
    c.totalRevenue += revenue;
    c.totalSales += quantity;
    c.totalProfit += profit;
    if (row.productId) c.productIds.add(row.productId);
  });

  return Array.from(catMap.values())
    .map((c) => ({
      category: c.category,
      totalRevenue: c.totalRevenue,
      totalSales: c.totalSales,
      totalProfit: c.totalProfit,
      productCount: c.productIds.size,
      shareOfRevenue: totalRevenue > 0 ? (c.totalRevenue / totalRevenue) * 100 : 0,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}

export function analyzeProductSales(posData: any[], inventoryData: any[]): ProductPerformance[] {
  const productMap = new Map<string, any>();
  const referenceDate = new Date('2026-08-09').getTime();

  // Map inventory data first
  const invMap = new Map<string, any>();
  inventoryData.forEach(inv => {
    if (inv.productId) {
      invMap.set(inv.productId, inv);
    }
  });

  posData.forEach((row) => {
    const productId = row.productId || 'unknown';
    const productName = row.productName || `Product ${productId}`;
    const category = row.category || invMap.get(productId)?.category || 'General';
    const revenue = parseFloat(row.revenue) || 0;
    const quantity = parseFloat(row.quantity) || 0;
    const inv = invMap.get(productId);
    const unitCost = row.unitCost ? parseFloat(row.unitCost) : (parseFloat(inv?.unitCost) || revenue * 0.6 / Math.max(1, quantity));
    const profit = revenue - (unitCost * quantity);

    if (!productMap.has(productId)) {
      productMap.set(productId, {
        productId,
        productName,
        category,
        totalRevenue: 0,
        totalQuantity: 0,
        totalProfit: 0,
      });
    }

    const prd = productMap.get(productId);
    prd.totalRevenue += revenue;
    prd.totalQuantity += quantity;
    prd.totalProfit += profit;
  });

  const grandTotalRev = Array.from(productMap.values()).reduce((sum, p) => sum + p.totalRevenue, 0);
  const products: ProductPerformance[] = Array.from(productMap.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  let cumulative = 0;
  return products.map((prd) => {
    cumulative += prd.totalRevenue;
    const cumPct = grandTotalRev > 0 ? (cumulative / grandTotalRev) * 100 : 100;
    const inv = invMap.get(prd.productId);

    let abcClass: 'A' | 'B' | 'C' = 'C';
    if (cumPct <= 80) abcClass = 'A';
    else if (cumPct <= 95) abcClass = 'B';

    const currentStock = inv ? parseFloat(inv.currentStock) || 0 : undefined;
    const reorderLevel = inv ? parseFloat(inv.reorderLevel) || 0 : undefined;
    const expiryDate = inv?.expiryDate || undefined;
    
    let daysToExpiry: number | undefined = undefined;
    let recommendedDiscount: number | undefined = undefined;
    let expiryStatus: 'fresh' | 'expiring_soon' | 'critical_expiry' = 'fresh';

    if (expiryDate) {
      const expTime = new Date(expiryDate).getTime();
      if (!isNaN(expTime)) {
        daysToExpiry = Math.ceil((expTime - referenceDate) / (1000 * 60 * 60 * 24));
        if (daysToExpiry <= 15) {
          expiryStatus = 'critical_expiry';
          recommendedDiscount = 40;
        } else if (daysToExpiry <= 45) {
          expiryStatus = 'expiring_soon';
          recommendedDiscount = 20;
        }
      }
    }

    const dailyAvgSales = prd.totalQuantity / 30;
    const daysOfSupply = currentStock !== undefined && dailyAvgSales > 0 ? Math.round(currentStock / dailyAvgSales) : undefined;

    let stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
    if (currentStock === 0) stockStatus = 'out_of_stock';
    else if (currentStock !== undefined && reorderLevel !== undefined && currentStock <= reorderLevel) stockStatus = 'low_stock';

    return {
      productId: prd.productId,
      productName: prd.productName,
      category: prd.category,
      totalRevenue: prd.totalRevenue,
      totalQuantity: prd.totalQuantity,
      totalProfit: prd.totalProfit,
      currentStock,
      reorderLevel,
      daysOfSupply,
      expiryDate,
      daysToExpiry,
      recommendedDiscount,
      abcClass,
      stockStatus,
      expiryStatus,
    };
  });
}

function generateSummary(
  problems: BusinessProblem[],
  opportunities: BusinessProblem[],
  stores: StorePerformance[],
  totalRevenue: number,
  totalProfit: number
): string {
  const highSeverityCount = problems.filter((p) => p.severity === 'high').length;
  const expiryRiskCount = problems.filter((p) => p.type === 'expiry').length;
  const margin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0';

  return `InsightOS Analysis Complete across ${stores.length} active stores. Total Revenue: ₹${totalRevenue.toLocaleString('en-IN')} with a ${margin}% net margin (₹${totalProfit.toLocaleString('en-IN')} profit). Detected ${problems.length} operational issues (${highSeverityCount} high severity, ${expiryRiskCount} expiring stock alerts) and ${opportunities.length} growth opportunities.`;
}
