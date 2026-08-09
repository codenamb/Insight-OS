export interface POSData {
  date: string;
  storeId: string;
  storeName: string;
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
  category?: string;
  unitCost?: number;
  latitude?: number;
  longitude?: number;
}

export interface InventoryData {
  productId: string;
  productName: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
  unitCost: number;
  supplier?: string;
  lastRestocked?: string;
  expiryDate?: string;
}

export interface StorePerformance {
  storeId: string;
  storeName: string;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
  totalSales: number; // units sold
  transactions: number;
  averageOrderValue: number;
  unitsPerTransaction: number;
  growthRate: number;
  latitude?: number;
  longitude?: number;
  topCategory?: string;
  riskStatus: 'healthy' | 'warning' | 'critical';
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  category: string;
  totalRevenue: number;
  totalQuantity: number;
  totalProfit: number;
  currentStock?: number;
  reorderLevel?: number;
  daysOfSupply?: number;
  expiryDate?: string;
  daysToExpiry?: number;
  recommendedDiscount?: number; // e.g. 20 for 20%, 40 for 40%
  abcClass: 'A' | 'B' | 'C'; // A = Top 80% revenue, B = Next 15%, C = Bottom 5%
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  expiryStatus?: 'fresh' | 'expiring_soon' | 'critical_expiry';
}

export interface CategoryPerformance {
  category: string;
  totalRevenue: number;
  totalSales: number;
  totalProfit: number;
  productCount: number;
  shareOfRevenue: number;
}

export type ProblemType = 'inventory' | 'sales' | 'store' | 'profitability' | 'opportunity' | 'expiry';
export type SeverityLevel = 'high' | 'medium' | 'low';

export interface BusinessProblem {
  id: string;
  type: ProblemType;
  severity: SeverityLevel;
  title: string;
  description: string;
  financialImpact?: string;
  affectedStores?: string[];
  affectedProducts?: string[];
  recommendation: string;
  actionSteps?: string[];
  timestamp: string;
  recommendedDiscount?: number;
}

export interface BusinessInsight {
  summary: string;
  totalRevenue: number;
  totalProfit: number;
  profitMargin: number;
  totalUnitsSold: number;
  outOfStockCount: number;
  lowStockCount: number;
  expiringItemsCount: number;
  problems: BusinessProblem[];
  opportunities: BusinessProblem[];
  trends: {
    metric: string;
    direction: 'up' | 'down' | 'stable';
    value: number;
    period: string;
  }[];
  categoryBreakdown: CategoryPerformance[];
  topProducts: ProductPerformance[];
  bottomProducts: ProductPerformance[];
}

export interface FilterOptions {
  storeId?: string;
  category?: string;
  dateRange?: 'all' | '7d' | '30d' | '90d' | 'year';
}
