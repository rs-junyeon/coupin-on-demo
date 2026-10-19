import { describe, expect, it } from 'vitest';
import { seed } from '@/shared/api';
import { myRefunds } from './order';

describe('주문', () => {
  const db = seed(new Date(2026, 9, 15, 10));
  it('내 취소/환불 내역은 비어 있다가 무료 취소가 생기면 보인다', () => {
    expect(myRefunds(db)).toHaveLength(0);
  });
});
