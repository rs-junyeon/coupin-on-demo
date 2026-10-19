import { describe, expect, it } from 'vitest';
import { seed } from '@/shared/api';
import { cStatus } from './coupon';

describe('쿠폰', () => {
  const db = seed(new Date(2026, 9, 15, 10));
  it('쿠폰 상태', () => {
    expect(cStatus(db.coupons.find(c => c.id === 'c7')!).t).toBe('취소');
    expect(cStatus(db.coupons.find(c => c.id === 'c6')!).t).toBe('일부 사용');
  });
});
