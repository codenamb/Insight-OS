// Sample retail dataset for Indian stores across major metros (Mumbai, Bengaluru, Delhi, Hyderabad, Chennai)
// Prices and revenues formatted in Indian Rupees (₹).

export const SAMPLE_POS_DATA = [
  // Store 101 - Mumbai Central Flagship (Mumbai, MH - Lat 18.9696, Lng 72.8193)
  { date: '2026-07-01', storeId: 'STR-101', storeName: 'Mumbai Central Flagship', productId: 'PRD-001', productName: 'Pro Wireless Headphones', category: 'Electronics', quantity: 15, revenue: 44985, unitCost: 1650, latitude: 18.9696, longitude: 72.8193 },
  { date: '2026-07-02', storeId: 'STR-101', storeName: 'Mumbai Central Flagship', productId: 'PRD-002', productName: 'Ultra HD Smart TV 55"', category: 'Electronics', quantity: 8, revenue: 359992, unitCost: 25000, latitude: 18.9696, longitude: 72.8193 },
  { date: '2026-07-05', storeId: 'STR-101', storeName: 'Mumbai Central Flagship', productId: 'PRD-003', productName: 'Ergonomic Mesh Office Chair', category: 'Furniture', quantity: 12, revenue: 143988, unitCost: 7200, latitude: 18.9696, longitude: 72.8193 },
  { date: '2026-07-10', storeId: 'STR-101', storeName: 'Mumbai Central Flagship', productId: 'PRD-004', productName: 'Smart Fitness Watch', category: 'Electronics', quantity: 25, revenue: 99975, unitCost: 1800, latitude: 18.9696, longitude: 72.8193 },
  { date: '2026-07-15', storeId: 'STR-101', storeName: 'Mumbai Central Flagship', productId: 'PRD-005', productName: 'Organic South Indian Coffee 1kg', category: 'Grocery', quantity: 40, revenue: 23960, unitCost: 240, latitude: 18.9696, longitude: 72.8193 },
  { date: '2026-07-20', storeId: 'STR-101', storeName: 'Mumbai Central Flagship', productId: 'PRD-006', productName: 'Stainless Steel Thermos Bottle', category: 'Accessories', quantity: 50, revenue: 25000, unitCost: 160, latitude: 18.9696, longitude: 72.8193 },
  { date: '2026-08-01', storeId: 'STR-101', storeName: 'Mumbai Central Flagship', productId: 'PRD-001', productName: 'Pro Wireless Headphones', category: 'Electronics', quantity: 18, revenue: 53982, unitCost: 1650, latitude: 18.9696, longitude: 72.8193 },
  { date: '2026-08-04', storeId: 'STR-101', storeName: 'Mumbai Central Flagship', productId: 'PRD-007', productName: 'Noise Cancelling Earbuds', category: 'Electronics', quantity: 30, revenue: 89970, unitCost: 1500, latitude: 18.9696, longitude: 72.8193 },

  // Store 102 - Bengaluru Tech Park Outlet (Bengaluru, KA - Lat 12.9716, Lng 77.5946)
  { date: '2026-07-02', storeId: 'STR-102', storeName: 'Bengaluru Tech Park Outlet', productId: 'PRD-001', productName: 'Pro Wireless Headphones', category: 'Electronics', quantity: 10, revenue: 29990, unitCost: 1650, latitude: 12.9716, longitude: 77.5946 },
  { date: '2026-07-06', storeId: 'STR-102', storeName: 'Bengaluru Tech Park Outlet', productId: 'PRD-008', productName: 'Premium Leather Laptop Bag', category: 'Accessories', quantity: 14, revenue: 50386, unitCost: 1400, latitude: 12.9716, longitude: 77.5946 },
  { date: '2026-07-12', storeId: 'STR-102', storeName: 'Bengaluru Tech Park Outlet', productId: 'PRD-004', productName: 'Smart Fitness Watch', category: 'Electronics', quantity: 18, revenue: 71982, unitCost: 1800, latitude: 12.9716, longitude: 77.5946 },
  { date: '2026-07-18', storeId: 'STR-102', storeName: 'Bengaluru Tech Park Outlet', productId: 'PRD-009', productName: 'Mechanical RGB Gaming Keyboard', category: 'Electronics', quantity: 20, revenue: 55996, unitCost: 1300, latitude: 12.9716, longitude: 77.5946 },
  { date: '2026-08-02', storeId: 'STR-102', storeName: 'Bengaluru Tech Park Outlet', productId: 'PRD-033', productName: 'Herbal Immunity Green Tea 500g', category: 'Grocery', quantity: 25, revenue: 14975, unitCost: 210, latitude: 12.9716, longitude: 77.5946 },
  { date: '2026-08-05', storeId: 'STR-102', storeName: 'Bengaluru Tech Outlet', productId: 'PRD-010', productName: 'Motorized Standing Desk', category: 'Furniture', quantity: 5, revenue: 149995, unitCost: 16800, latitude: 12.9716, longitude: 77.5946 },

  // Store 103 - Delhi Connaught Place (New Delhi, DL - Lat 28.6315, Lng 77.2167)
  { date: '2026-07-03', storeId: 'STR-103', storeName: 'Delhi Connaught Place', productId: 'PRD-005', productName: 'Organic South Indian Coffee 1kg', category: 'Grocery', quantity: 35, revenue: 20965, unitCost: 240, latitude: 28.6315, longitude: 77.2167 },
  { date: '2026-07-09', storeId: 'STR-103', storeName: 'Delhi Connaught Place', productId: 'PRD-006', productName: 'Stainless Steel Thermos Bottle', category: 'Accessories', quantity: 22, revenue: 11000, unitCost: 160, latitude: 28.6315, longitude: 77.2167 },
  { date: '2026-07-16', storeId: 'STR-103', storeName: 'Delhi Connaught Place', productId: 'PRD-011', productName: 'Premium Wool Winter Coat', category: 'Apparel', quantity: 8, revenue: 47992, unitCost: 2800, latitude: 28.6315, longitude: 77.2167 },
  { date: '2026-07-22', storeId: 'STR-103', storeName: 'Delhi Connaught Place', productId: 'PRD-012', productName: 'Pro Running Sneakers', category: 'Apparel', quantity: 12, revenue: 33596, unitCost: 1200, latitude: 28.6315, longitude: 77.2167 },
  { date: '2026-08-03', storeId: 'STR-103', storeName: 'Delhi Connaught Place', productId: 'PRD-001', productName: 'Pro Wireless Headphones', category: 'Electronics', quantity: 5, revenue: 14995, unitCost: 1650, latitude: 28.6315, longitude: 77.2167 },

  // Store 104 - Hyderabad Hitech City (Hyderabad, TS - Lat 17.4435, Lng 78.3772)
  { date: '2026-07-04', storeId: 'STR-104', storeName: 'Hyderabad Hitech City', productId: 'PRD-002', productName: 'Ultra HD Smart TV 55"', category: 'Electronics', quantity: 4, revenue: 179996, unitCost: 25000, latitude: 17.4435, longitude: 78.3772 },
  { date: '2026-07-11', storeId: 'STR-104', storeName: 'Hyderabad Hitech City', productId: 'PRD-010', productName: 'Motorized Standing Desk', category: 'Furniture', quantity: 4, revenue: 119996, unitCost: 16800, latitude: 17.4435, longitude: 78.3772 },
  { date: '2026-07-19', storeId: 'STR-104', storeName: 'Hyderabad Hitech City', productId: 'PRD-008', productName: 'Premium Leather Laptop Bag', category: 'Accessories', quantity: 10, revenue: 35990, unitCost: 1400, latitude: 17.4435, longitude: 78.3772 },
  { date: '2026-07-28', storeId: 'STR-104', storeName: 'Hyderabad Hitech City', productId: 'PRD-007', productName: 'Noise Cancelling Earbuds', category: 'Electronics', quantity: 15, revenue: 44985, unitCost: 1500, latitude: 17.4435, longitude: 78.3772 },
  { date: '2026-08-06', storeId: 'STR-104', storeName: 'Hyderabad Hitech City', productId: 'PRD-012', productName: 'Pro Running Sneakers', category: 'Apparel', quantity: 16, revenue: 44796, unitCost: 1200, latitude: 17.4435, longitude: 78.3772 },

  // Store 105 - Chennai Express Avenue (Chennai, TN - Lat 13.0604, Lng 80.2642)
  { date: '2026-07-05', storeId: 'STR-105', storeName: 'Chennai Express Avenue', productId: 'PRD-013', productName: 'UV Designer Sunglasses', category: 'Accessories', quantity: 35, revenue: 104990, unitCost: 800, latitude: 13.0604, longitude: 80.2642 },
  { date: '2026-07-14', storeId: 'STR-105', storeName: 'Chennai Express Avenue', productId: 'PRD-006', productName: 'Stainless Steel Thermos Bottle', category: 'Accessories', quantity: 45, revenue: 22500, unitCost: 160, latitude: 13.0604, longitude: 80.2642 },
  { date: '2026-07-21', storeId: 'STR-105', storeName: 'Chennai Express Avenue', productId: 'PRD-007', productName: 'Noise Cancelling Earbuds', category: 'Electronics', quantity: 20, revenue: 59990, unitCost: 1500, latitude: 13.0604, longitude: 80.2642 },
  { date: '2026-07-29', storeId: 'STR-105', storeName: 'Chennai Express Avenue', productId: 'PRD-014', productName: 'Portable Bluetooth Speaker', category: 'Electronics', quantity: 28, revenue: 72772, unitCost: 900, latitude: 13.0604, longitude: 80.2642 },
  { date: '2026-08-07', storeId: 'STR-105', storeName: 'Chennai Express Avenue', productId: 'PRD-013', productName: 'UV Designer Sunglasses', category: 'Accessories', quantity: 40, revenue: 119960, unitCost: 800, latitude: 13.0604, longitude: 80.2642 },
];

export const SAMPLE_INVENTORY_DATA = [
  { productId: 'PRD-001', productName: 'Pro Wireless Headphones', category: 'Electronics', currentStock: 8, reorderLevel: 25, unitCost: 1650.00, supplier: 'AudioTech India', lastRestocked: '2026-06-15' },
  { productId: 'PRD-002', productName: 'Ultra HD Smart TV 55"', category: 'Electronics', currentStock: 3, reorderLevel: 10, unitCost: 25000.00, supplier: 'Vision Corp India', lastRestocked: '2026-06-01' },
  { productId: 'PRD-003', productName: 'Ergonomic Mesh Office Chair', category: 'Furniture', currentStock: 0, reorderLevel: 15, unitCost: 7200.00, supplier: 'Nilkamal Ergonomics', lastRestocked: '2026-05-20' },
  { productId: 'PRD-004', productName: 'Smart Fitness Watch', category: 'Electronics', currentStock: 45, reorderLevel: 20, unitCost: 1800.00, supplier: 'Titan Pulse', lastRestocked: '2026-07-10' },
  { productId: 'PRD-005', productName: 'Organic South Indian Coffee 1kg', category: 'Grocery', currentStock: 42, reorderLevel: 30, unitCost: 240.00, supplier: 'Tata Coffee Co', lastRestocked: '2026-07-01', expiryDate: '2026-08-20' }, // Expiring in 11 days!
  { productId: 'PRD-006', productName: 'Stainless Steel Thermos Bottle', category: 'Accessories', currentStock: 85, reorderLevel: 25, unitCost: 160.00, supplier: 'Milton Hydro', lastRestocked: '2026-07-15', expiryDate: '2026-09-15' }, // Expiring in 37 days!
  { productId: 'PRD-007', productName: 'Noise Cancelling Earbuds', category: 'Electronics', currentStock: 5, reorderLevel: 20, unitCost: 1500.00, supplier: 'AudioTech India', lastRestocked: '2026-06-25' },
  { productId: 'PRD-008', productName: 'Premium Leather Laptop Bag', category: 'Accessories', currentStock: 18, reorderLevel: 12, unitCost: 1400.00, supplier: 'Hidesign Leather', lastRestocked: '2026-07-05' },
  { productId: 'PRD-009', productName: 'Mechanical RGB Gaming Keyboard', category: 'Electronics', currentStock: 2, reorderLevel: 15, unitCost: 1300.00, supplier: 'TVS Peripherals', lastRestocked: '2026-06-10' },
  { productId: 'PRD-010', productName: 'Motorized Standing Desk', category: 'Furniture', currentStock: 0, reorderLevel: 8, unitCost: 16800.00, supplier: 'Nilkamal Ergonomics', lastRestocked: '2026-05-15' },
  { productId: 'PRD-011', productName: 'Premium Wool Winter Coat', category: 'Apparel', currentStock: 35, reorderLevel: 10, unitCost: 2800.00, supplier: 'Monte Carlo Wear', lastRestocked: '2026-07-08', expiryDate: '2026-08-28' }, // Expiring in 19 days!
  { productId: 'PRD-012', productName: 'Pro Running Sneakers', category: 'Apparel', currentStock: 4, reorderLevel: 20, unitCost: 1200.00, supplier: 'Campus Athletic', lastRestocked: '2026-06-30' },
  { productId: 'PRD-013', productName: 'UV Designer Sunglasses', category: 'Accessories', currentStock: 60, reorderLevel: 25, unitCost: 800.00, supplier: 'Lenskart Optics', lastRestocked: '2026-07-12' },
  { productId: 'PRD-014', productName: 'Portable Bluetooth Speaker', category: 'Electronics', currentStock: 22, reorderLevel: 15, unitCost: 900.00, supplier: 'AudioTech India', lastRestocked: '2026-07-02' },
  { productId: 'PRD-033', productName: 'Herbal Immunity Green Tea 500g', category: 'Grocery', currentStock: 50, reorderLevel: 15, unitCost: 210.00, supplier: 'Organic India', lastRestocked: '2026-07-15', expiryDate: '2026-08-18' }, // Expiring in 9 days!
];
