import { describe, it, expect } from 'vitest';
import { getStockStatus, getExpiryStatus, getDaysUntilExpiry } from './inventory';

describe('getStockStatus', () => {
  it('returns "out" when quantity is 0', () => {
    expect(getStockStatus(0, 10)).toBe('out');
  });

  it('returns "critical" when quantity is 25% or less of minStock', () => {
    expect(getStockStatus(2, 10)).toBe('critical');
    expect(getStockStatus(2, 8)).toBe('critical');
  });

  it('returns "low" when quantity is at or below minStock', () => {
    expect(getStockStatus(10, 10)).toBe('low');
    expect(getStockStatus(8, 10)).toBe('low');
  });

  it('returns "healthy" when quantity is above minStock', () => {
    expect(getStockStatus(50, 10)).toBe('healthy');
  });
});

describe('getExpiryStatus', () => {
  it('returns "none" for null expiryDate', () => {
    expect(getExpiryStatus(null)).toBe('none');
  });

  it('returns "expired" for past dates', () => {
    const pastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(getExpiryStatus(pastDate)).toBe('expired');
  });

  it('returns "expiring-soon" for dates within 7 days', () => {
    const soonDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(getExpiryStatus(soonDate)).toBe('expiring-soon');
  });

  it('returns "fresh" for dates more than 7 days away', () => {
    const freshDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    expect(getExpiryStatus(freshDate)).toBe('fresh');
  });
});

describe('getDaysUntilExpiry', () => {
  it('returns null for null expiryDate', () => {
    expect(getDaysUntilExpiry(null)).toBe(null);
  });

  it('returns correct days for future dates', () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 5);
    const result = getDaysUntilExpiry(date.toISOString());
    expect(result).toBe(5);
  });

  it('returns negative days for past dates', () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 3);
    const result = getDaysUntilExpiry(date.toISOString());
    expect(result).toBe(-3);
  });
});
