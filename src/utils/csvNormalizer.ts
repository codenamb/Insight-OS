// Smart CSV Column Normalizer for InsightOS
// Automatically maps fuzzy variations of CSV headers to canonical POS and Inventory data structures.

function cleanKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const POS_FIELD_ALIASES: Record<string, string[]> = {
  date: ['date', 'transactiondate', 'transdate', 'time', 'timestamp', 'createdat', 'day', 'orderdate'],
  storeId: ['storeid', 'storecode', 'branchid', 'locationid', 'id', 'outletid'],
  storeName: ['storename', 'store', 'location', 'branch', 'outlet', 'shop', 'site', 'storelocation'],
  productId: ['productid', 'sku', 'itemid', 'code', 'barcode', 'upc', 'itemcode'],
  productName: ['productname', 'item', 'itemname', 'name', 'product', 'title', 'description', 'itemdescription'],
  quantity: ['quantity', 'qty', 'count', 'units', 'unitssold', 'volume', 'qtysold', 'numitems'],
  revenue: ['revenue', 'amount', 'sales', 'total', 'price', 'grossrevenue', 'totalamount', 'val', 'pricetotal', 'subtotal'],
  category: ['category', 'dept', 'department', 'group', 'type', 'cat', 'productcategory'],
  unitCost: ['unitcost', 'cost', 'costprice', 'cogs', 'buyprice', 'unitpricecost'],
  latitude: ['latitude', 'lat', 'y', 'storelat'],
  longitude: ['longitude', 'lng', 'lon', 'long', 'x', 'storelng'],
};

const INVENTORY_FIELD_ALIASES: Record<string, string[]> = {
  productId: ['productid', 'sku', 'itemid', 'code', 'barcode', 'itemcode'],
  productName: ['productname', 'item', 'itemname', 'name', 'product', 'title', 'description'],
  category: ['category', 'dept', 'department', 'group', 'type', 'productcategory'],
  currentStock: ['currentstock', 'stock', 'inventory', 'onhand', 'qtyavailable', 'qty', 'unitsonhand', 'stockqty', 'available'],
  reorderLevel: ['reorderlevel', 'reorder', 'minstock', 'threshold', 'reorderpoint', 'safetystock', 'minimumstock'],
  unitCost: ['unitcost', 'cost', 'costprice', 'cogs', 'buyprice', 'purchaseprice'],
  supplier: ['supplier', 'vendor', 'distributor', 'manufacturer', 'source'],
  lastRestocked: ['lastrestocked', 'restockeddate', 'lastreceived', 'restockdate'],
};

export interface NormalizationResult {
  data: any[];
  mappedColumns: Record<string, string>; // original -> mapped
  unmappedColumns: string[];
  totalRows: number;
}

export function normalizePOSCSV(rawRows: any[]): NormalizationResult {
  if (!rawRows || rawRows.length === 0) {
    return { data: [], mappedColumns: {}, unmappedColumns: [], totalRows: 0 };
  }

  const sampleRow = rawRows[0];
  const rawHeaders = Object.keys(sampleRow);
  const headerMap = new Map<string, string>(); // canonicalField -> rawHeader
  const mappedColumns: Record<string, string> = {};
  const usedHeaders = new Set<string>();

  // Find best header match for each target POS field
  Object.entries(POS_FIELD_ALIASES).forEach(([canonicalField, aliases]) => {
    for (const rawHeader of rawHeaders) {
      if (usedHeaders.has(rawHeader)) continue;
      const cleaned = cleanKey(rawHeader);
      if (aliases.includes(cleaned)) {
        headerMap.set(canonicalField, rawHeader);
        mappedColumns[rawHeader] = canonicalField;
        usedHeaders.add(rawHeader);
        break;
      }
    }
  });

  const unmappedColumns = rawHeaders.filter((h) => !usedHeaders.has(h));

  // Transform and normalize each row
  const data = rawRows
    .map((row, idx) => {
      const dateVal = row[headerMap.get('date') || ''] || new Date().toISOString().slice(0, 10);
      const storeIdVal = row[headerMap.get('storeId') || ''] || 'STR-01';
      const storeNameVal = row[headerMap.get('storeName') || ''] || `Store ${storeIdVal}`;
      const productIdVal = row[headerMap.get('productId') || ''] || `PRD-${idx + 1}`;
      const productNameVal = row[headerMap.get('productName') || ''] || `Product ${productIdVal}`;
      const categoryVal = row[headerMap.get('category') || ''] || 'General';

      const quantityVal = parseFloat(row[headerMap.get('quantity') || '']) || 1;
      let revenueVal = parseFloat(row[headerMap.get('revenue') || '']) || 0;

      const unitCostRaw = parseFloat(row[headerMap.get('unitCost') || '']);
      const unitCostVal = !isNaN(unitCostRaw) ? unitCostRaw : (revenueVal * 0.6) / Math.max(1, quantityVal);

      // If revenue is 0 but quantity and cost are present
      if (revenueVal === 0 && unitCostVal > 0) {
        revenueVal = unitCostVal * 1.5 * quantityVal;
      }

      const latVal = parseFloat(row[headerMap.get('latitude') || '']);
      const lngVal = parseFloat(row[headerMap.get('longitude') || '']);

      return {
        date: String(dateVal).trim(),
        storeId: String(storeIdVal).trim(),
        storeName: String(storeNameVal).trim(),
        productId: String(productIdVal).trim(),
        productName: String(productNameVal).trim(),
        category: String(categoryVal).trim(),
        quantity: quantityVal,
        revenue: revenueVal,
        unitCost: unitCostVal,
        latitude: !isNaN(latVal) ? latVal : undefined,
        longitude: !isNaN(lngVal) ? lngVal : undefined,
      };
    })
    .filter((r) => r.productName && (r.revenue > 0 || r.quantity > 0));

  return {
    data,
    mappedColumns,
    unmappedColumns,
    totalRows: data.length,
  };
}

export function normalizeInventoryCSV(rawRows: any[]): NormalizationResult {
  if (!rawRows || rawRows.length === 0) {
    return { data: [], mappedColumns: {}, unmappedColumns: [], totalRows: 0 };
  }

  const sampleRow = rawRows[0];
  const rawHeaders = Object.keys(sampleRow);
  const headerMap = new Map<string, string>();
  const mappedColumns: Record<string, string> = {};
  const usedHeaders = new Set<string>();

  Object.entries(INVENTORY_FIELD_ALIASES).forEach(([canonicalField, aliases]) => {
    for (const rawHeader of rawHeaders) {
      if (usedHeaders.has(rawHeader)) continue;
      const cleaned = cleanKey(rawHeader);
      if (aliases.includes(cleaned)) {
        headerMap.set(canonicalField, rawHeader);
        mappedColumns[rawHeader] = canonicalField;
        usedHeaders.add(rawHeader);
        break;
      }
    }
  });

  const unmappedColumns = rawHeaders.filter((h) => !usedHeaders.has(h));

  const data = rawRows
    .map((row, idx) => {
      const productIdVal = row[headerMap.get('productId') || ''] || `PRD-${idx + 1}`;
      const productNameVal = row[headerMap.get('productName') || ''] || `Item ${productIdVal}`;
      const categoryVal = row[headerMap.get('category') || ''] || 'General';

      const currentStockVal = parseFloat(row[headerMap.get('currentStock') || '']) || 0;
      const reorderLevelVal = parseFloat(row[headerMap.get('reorderLevel') || '']) || 10;
      const unitCostVal = parseFloat(row[headerMap.get('unitCost') || '']) || 10.0;

      const supplierVal = row[headerMap.get('supplier') || ''] || 'Primary Vendor';
      const lastRestockedVal = row[headerMap.get('lastRestocked') || ''] || new Date().toISOString().slice(0, 10);

      return {
        productId: String(productIdVal).trim(),
        productName: String(productNameVal).trim(),
        category: String(categoryVal).trim(),
        currentStock: currentStockVal,
        reorderLevel: reorderLevelVal,
        unitCost: unitCostVal,
        supplier: String(supplierVal).trim(),
        lastRestocked: String(lastRestockedVal).trim(),
      };
    })
    .filter((r) => r.productName);

  return {
    data,
    mappedColumns,
    unmappedColumns,
    totalRows: data.length,
  };
}
