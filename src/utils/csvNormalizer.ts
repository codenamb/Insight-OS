// Smart CSV Column Normalizer for InsightOS
// Automatically maps fuzzy variations of CSV headers to canonical POS and Inventory data structures.

function cleanKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const POS_FIELD_ALIASES: Record<string, string[]> = {
  date: ['date', 'transactiondate', 'transdate', 'time', 'timestamp', 'createdat', 'day', 'orderdate', 'dateofsale'],
  storeId: ['storeid', 'storecode', 'branchid', 'locationid', 'id', 'outletid', 'shopid', 'storeno', 'branchcode'],
  storeName: ['storename', 'store', 'location', 'branch', 'outlet', 'shop', 'site', 'storelocation', 'shoplocation', 'branchname', 'shopname', 'outletname'],
  productId: ['productid', 'sku', 'itemid', 'code', 'barcode', 'upc', 'itemcode', 'productcode', 'skuno'],
  productName: ['productname', 'item', 'itemname', 'name', 'product', 'title', 'description', 'itemdescription', 'producttitle', 'itemtitle', 'productdescription'],
  quantity: ['quantity', 'qty', 'count', 'units', 'unitssold', 'volume', 'qtysold', 'numitems', 'quantitysold', 'itemsold', 'qtyonhand', 'quantityonhand'],
  revenue: ['revenue', 'amount', 'sales', 'total', 'price', 'grossrevenue', 'totalamount', 'val', 'pricetotal', 'subtotal', 'salesamount', 'salesamt', 'totalvalue', 'totalprice'],
  category: ['category', 'dept', 'department', 'group', 'type', 'cat', 'productcategory', 'categorygroup', 'itemgroup', 'catgroup'],
  unitCost: ['unitcost', 'cost', 'costprice', 'cogs', 'buyprice', 'unitpricecost', 'buyingprice', 'purchaseprice', 'itemcost'],
  latitude: ['latitude', 'lat', 'y', 'storelat', 'shoplat', 'latval'],
  longitude: ['longitude', 'lng', 'lon', 'long', 'x', 'storelng', 'shoplng', 'lngval'],
};

const INVENTORY_FIELD_ALIASES: Record<string, string[]> = {
  productId: ['productid', 'sku', 'itemid', 'code', 'barcode', 'itemcode', 'skuno', 'productcode'],
  productName: ['productname', 'item', 'itemname', 'name', 'product', 'title', 'description', 'producttitle', 'itemtitle', 'itemdescription', 'productdescription'],
  category: ['category', 'dept', 'department', 'group', 'type', 'productcategory', 'categorygroup', 'itemgroup', 'catgroup', 'cat'],
  currentStock: ['currentstock', 'stock', 'inventory', 'onhand', 'qtyavailable', 'qty', 'unitsonhand', 'stockqty', 'available', 'qtyonhand', 'quantityonhand', 'stockonhand', 'inhand', 'stocklevel', 'availableqty'],
  reorderLevel: ['reorderlevel', 'reorder', 'minstock', 'threshold', 'reorderpoint', 'safetystock', 'minimumstock', 'minthreshold', 'minimumthreshold', 'reorderthreshold', 'minlevel', 'minqty'],
  unitCost: ['unitcost', 'cost', 'costprice', 'cogs', 'buyprice', 'purchaseprice', 'buyingprice', 'unitbuyprice', 'costperunit', 'itemcost', 'mrp'],
  supplier: ['supplier', 'vendor', 'distributor', 'manufacturer', 'source', 'vendorname', 'suppliername', 'distributorname', 'vender'],
  lastRestocked: ['lastrestocked', 'restockeddate', 'lastreceived', 'restockdate', 'receiveddate', 'date'],
  expiryDate: ['expirydate', 'expiry', 'expirationdate', 'expiration', 'bestbefore', 'useby', 'expiredate', 'expdate', 'shelflife'],
};

export interface NormalizationResult {
  data: any[];
  mappedColumns: Record<string, string>; // original -> mapped
  unmappedColumns: string[];
  totalRows: number;
}

function matchHeaders(rawHeaders: string[], fieldAliases: Record<string, string[]>): { headerMap: Map<string, string>; mappedColumns: Record<string, string>; unmappedColumns: string[] } {
  const headerMap = new Map<string, string>(); // canonicalField -> rawHeader
  const mappedColumns: Record<string, string> = {};
  const usedHeaders = new Set<string>();

  // Pass 1: Exact cleaned match
  Object.entries(fieldAliases).forEach(([canonicalField, aliases]) => {
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

  // Pass 2: Substring token fuzzy match for any unmapped fields
  Object.entries(fieldAliases).forEach(([canonicalField, aliases]) => {
    if (headerMap.has(canonicalField)) return;
    for (const rawHeader of rawHeaders) {
      if (usedHeaders.has(rawHeader)) continue;
      const cleaned = cleanKey(rawHeader);
      if (!cleaned) continue;
      const hasMatch = aliases.some(alias => cleaned.includes(alias) || alias.includes(cleaned));
      if (hasMatch) {
        headerMap.set(canonicalField, rawHeader);
        mappedColumns[rawHeader] = canonicalField;
        usedHeaders.add(rawHeader);
        break;
      }
    }
  });

  const unmappedColumns = rawHeaders.filter((h) => !usedHeaders.has(h));
  return { headerMap, mappedColumns, unmappedColumns };
}

export function normalizePOSCSV(rawRows: any[]): NormalizationResult {
  if (!rawRows || rawRows.length === 0) {
    return { data: [], mappedColumns: {}, unmappedColumns: [], totalRows: 0 };
  }

  const sampleRow = rawRows[0];
  const rawHeaders = Object.keys(sampleRow);
  const { headerMap, mappedColumns, unmappedColumns } = matchHeaders(rawHeaders, POS_FIELD_ALIASES);

  const data = rawRows
    .map((row, idx) => {
      const dateVal = row[headerMap.get('date') || ''] || new Date().toISOString().slice(0, 10);

      const rawStoreName = row[headerMap.get('storeName') || ''];
      const storeNameVal = (rawStoreName && String(rawStoreName).trim()) ? String(rawStoreName).trim() : undefined;

      const rawStoreId = row[headerMap.get('storeId') || ''];
      const storeIdVal = (rawStoreId && String(rawStoreId).trim()) 
        ? String(rawStoreId).trim() 
        : (storeNameVal ? `STR-${cleanKey(storeNameVal).toUpperCase().slice(0, 12)}` : `STR-01`);

      const finalStoreName = storeNameVal || `Store ${storeIdVal}`;

      const productIdVal = row[headerMap.get('productId') || ''] || `PRD-${idx + 1}`;
      const productNameVal = row[headerMap.get('productName') || ''] || `Product ${productIdVal}`;
      const categoryVal = row[headerMap.get('category') || ''] || 'General';

      const rawQty = row[headerMap.get('quantity') || ''];
      const quantityVal = (rawQty !== undefined && rawQty !== null && rawQty !== '' && !isNaN(parseFloat(rawQty)))
        ? parseFloat(rawQty)
        : 1;

      const rawRev = row[headerMap.get('revenue') || ''];
      let revenueVal = (rawRev !== undefined && rawRev !== null && rawRev !== '' && !isNaN(parseFloat(rawRev)))
        ? parseFloat(rawRev)
        : 0;

      const rawUnitCost = row[headerMap.get('unitCost') || ''];
      const unitCostVal = (rawUnitCost !== undefined && rawUnitCost !== null && rawUnitCost !== '' && !isNaN(parseFloat(rawUnitCost)))
        ? parseFloat(rawUnitCost)
        : (revenueVal * 0.6) / Math.max(1, quantityVal);

      // If revenue is 0 but quantity and cost are present
      if (revenueVal === 0 && unitCostVal > 0) {
        revenueVal = unitCostVal * 1.5 * quantityVal;
      }

      const rawLat = row[headerMap.get('latitude') || ''];
      const rawLng = row[headerMap.get('longitude') || ''];
      const latVal = (rawLat !== undefined && rawLat !== null && rawLat !== '' && !isNaN(parseFloat(rawLat))) ? parseFloat(rawLat) : undefined;
      const lngVal = (rawLng !== undefined && rawLng !== null && rawLng !== '' && !isNaN(parseFloat(rawLng))) ? parseFloat(rawLng) : undefined;

      return {
        date: String(dateVal).trim(),
        storeId: String(storeIdVal).trim(),
        storeName: String(finalStoreName).trim(),
        productId: String(productIdVal).trim(),
        productName: String(productNameVal).trim(),
        category: String(categoryVal).trim(),
        quantity: quantityVal,
        revenue: revenueVal,
        unitCost: unitCostVal,
        latitude: latVal,
        longitude: lngVal,
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
  const { headerMap, mappedColumns, unmappedColumns } = matchHeaders(rawHeaders, INVENTORY_FIELD_ALIASES);

  const data = rawRows
    .map((row, idx) => {
      const productIdVal = row[headerMap.get('productId') || ''] || `PRD-${idx + 1}`;
      const productNameVal = row[headerMap.get('productName') || ''] || `Item ${productIdVal}`;
      const categoryVal = row[headerMap.get('category') || ''] || 'General';

      const rawStock = row[headerMap.get('currentStock') || ''];
      const currentStockVal = (rawStock !== undefined && rawStock !== null && rawStock !== '' && !isNaN(parseFloat(rawStock)))
        ? parseFloat(rawStock)
        : 0;

      const rawReorder = row[headerMap.get('reorderLevel') || ''];
      const reorderLevelVal = (rawReorder !== undefined && rawReorder !== null && rawReorder !== '' && !isNaN(parseFloat(rawReorder)))
        ? parseFloat(rawReorder)
        : 10;

      const rawCost = row[headerMap.get('unitCost') || ''];
      const unitCostVal = (rawCost !== undefined && rawCost !== null && rawCost !== '' && !isNaN(parseFloat(rawCost)))
        ? parseFloat(rawCost)
        : 10.0;

      const supplierVal = row[headerMap.get('supplier') || ''] || 'Primary Vendor';
      const lastRestockedVal = row[headerMap.get('lastRestocked') || ''] || new Date().toISOString().slice(0, 10);
      const expiryDateVal = row[headerMap.get('expiryDate') || ''] || undefined;

      return {
        productId: String(productIdVal).trim(),
        productName: String(productNameVal).trim(),
        category: String(categoryVal).trim(),
        currentStock: currentStockVal,
        reorderLevel: reorderLevelVal,
        unitCost: unitCostVal,
        supplier: String(supplierVal).trim(),
        lastRestocked: String(lastRestockedVal).trim(),
        expiryDate: expiryDateVal ? String(expiryDateVal).trim() : undefined,
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
