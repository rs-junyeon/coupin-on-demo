import { beforeEach, describe, expect, it } from 'vitest';
import { resetDB } from '@/shared/api';
import { bulkApply } from './actions';

describe('상품 관리', () => {
  beforeEach(() => resetDB());
  it('일괄 처리: 노출 불가는 게시를 건너뛴다', () => {
    const r = bulkApply(['p14', 'p16', 'p15'], '클래스', true);
    expect(r).toEqual({ count: 3, published: 2, skipped: 1 });
  });
});
