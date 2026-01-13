import { Product, StockStatus, ExpiryStatus } from "@/types/inventory";

export function getStockStatus(quantity: number, minStock: number): StockStatus {
  if (quantity === 0) return 'out';
  if (quantity <= minStock * 0.25) return 'critical';
  if (quantity <= minStock) return 'low';
  return 'healthy';
}

export function getExpiryStatus(expiryDate: string | null): ExpiryStatus {
  if (!expiryDate) return 'none';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 7) return 'expiring-soon';
  return 'fresh';
}

export function getDaysUntilExpiry(expiryDate: string | null): number | null {
  if (!expiryDate) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Mock data for UI development
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Organic Milk',
    sku: 'MILK-001',
    barcode: '5901234123457',
    quantity: 24,
    minStock: 20,
    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Dairy',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Whole Wheat Bread',
    sku: 'BREAD-002',
    barcode: '4006381333931',
    quantity: 8,
    minStock: 15,
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Bakery',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Fresh Eggs (Dozen)',
    sku: 'EGG-003',
    barcode: null,
    quantity: 0,
    minStock: 10,
    expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Dairy',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Olive Oil 500ml',
    sku: 'OIL-004',
    barcode: '8410660101290',
    quantity: 45,
    minStock: 10,
    expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Pantry',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Greek Yogurt',
    sku: 'YOG-005',
    barcode: null,
    quantity: 3,
    minStock: 12,
    expiryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Dairy',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Canned Tomatoes',
    sku: 'CAN-006',
    barcode: '8718215840961',
    quantity: 32,
    minStock: 15,
    expiryDate: null,
    category: 'Pantry',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
