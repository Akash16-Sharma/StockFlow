export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  quantity: number;
  minStock: number;
  expiryDate: string | null;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export type StockStatus = 'healthy' | 'low' | 'critical' | 'out';

export type ExpiryStatus = 'fresh' | 'expiring-soon' | 'expired' | 'none';

export interface InventoryStats {
  totalProducts: number;
  lowStockCount: number;
  expiringCount: number;
  outOfStockCount: number;
}

export type MovementType = 'stock_in' | 'stock_out' | 'adjustment' | 'stock_take' | 'initial';

export interface StockMovement {
  id: string;
  productId: string;
  userId: string;
  movementType: MovementType;
  quantityChange: number;
  quantityBefore: number;
  quantityAfter: number;
  notes: string | null;
  createdAt: string;
}

export type AppRole = 'admin' | 'staff';

export interface UserRole {
  id: string;
  userId: string;
  role: AppRole;
  createdAt: string;
}

export interface Profile {
  id: string;
  email: string | null;
  fullName: string | null;
  invitedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StockTakeItem {
  productId: string;
  productName: string;
  sku: string;
  systemQuantity: number;
  countedQuantity: number | null;
  discrepancy: number | null;
  notes: string;
}
