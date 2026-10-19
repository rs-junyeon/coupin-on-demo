import { beforeEach, describe, expect, it } from 'vitest';
import { resetDB, useDB } from '@/shared/api';
import { saveTerms } from './saveTerms';

const S = () => useDB.getState();
describe('판매 조건', () => {
  beforeEach(() => resetDB());
  it('판매 조건: 점주 판매가보다 높일 수 없고, 카테고리를 고르면 게시된다', () => {
    expect(saveTerms('p14', { cat: '사진', price: 60000, limit: null }, true).ok).toBe(false);
    const r = saveTerms('p14', { cat: '사진', price: 45000, limit: null }, true);
    expect(r.ok && r.published).toBe(true);
    expect(S().products.find(p => p.id === 'p14')!.on).toBe('PUBLISHED');
  });
});
