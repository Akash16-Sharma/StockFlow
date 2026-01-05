import { describe, it, expect } from 'vitest';
import { productSchema } from './product';

describe('productSchema', () => {
  it('validates a valid product', () => {
    const result = productSchema.safeParse({
      name: 'Test Product',
      sku: 'TEST-001',
      quantity: 10,
      minStock: 5,
      expiryDate: '2024-12-31',
      category: 'Test',
    });
    expect(result.success).toBe(true);
  });

  it('requires name to be non-empty', () => {
    const result = productSchema.safeParse({
      name: '',
      sku: 'TEST-001',
      quantity: 10,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('required');
    }
  });

  it('requires SKU to match pattern', () => {
    const result = productSchema.safeParse({
      name: 'Test',
      sku: 'invalid sku!',
      quantity: 10,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('letters, numbers');
    }
  });

  it('requires quantity to be non-negative', () => {
    const result = productSchema.safeParse({
      name: 'Test',
      sku: 'TEST-001',
      quantity: -5,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('negative');
    }
  });

  it('defaults minStock to 10 and category to General', () => {
    const result = productSchema.safeParse({
      name: 'Test',
      sku: 'TEST-001',
      quantity: 5,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.minStock).toBe(10);
      expect(result.data.category).toBe('General');
    }
  });

  it('allows optional expiryDate', () => {
    const result = productSchema.safeParse({
      name: 'Test',
      sku: 'TEST-001',
      quantity: 5,
      expiryDate: '',
    });
    expect(result.success).toBe(true);
  });
});
