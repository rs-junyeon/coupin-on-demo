import { describe, expect, it } from 'vitest';
import { seed } from '@/shared/api';
import { settleRows, settleTot } from './settlement';

describe('정산', () => {
  const db = seed(new Date(2026, 9, 15, 10));
  it('정산: 대조 전에는 PLUS와 차이 1건', () => {
    expect(settleRows(db).filter(r => r.plusN).length).toBe(1);
    expect(settleTot(settleRows(db)).pay).toBeGreaterThan(0);
  });
});
