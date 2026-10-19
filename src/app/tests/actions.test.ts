import { beforeEach, describe, expect, it } from 'vitest';
import { login } from '@/features/auth';
import { issue } from '@/features/issue-coupon';
import { cancelFree, requestRefund } from '@/features/refund-coupon';
import { resetDB, useDB } from '@/shared/api';

const S = () => useDB.getState();
describe('받기·구매·환불', () => {
  beforeEach(() => resetDB());
  it('무료 쿠폰 받기 → 1인 1회 → 취소하면 한도가 돌아간다', () => {
    login();
    const before = S().limit.fused;
    const r = issue('p6');
    expect(r.ok).toBe(true);
    expect(S().limit.fused).toBe(before + 1);
    expect(issue('p6').ok).toBe(false);
    if (r.ok) expect(cancelFree(r.cid).ok).toBe(true);
    expect(S().limit.fused).toBe(before);
  });
  it('유료 구매 → 환불 요청하면 관리자 환불 기록이 남는다', () => {
    const r = issue('p4', 'card');
    expect(r.ok && r.oid).toBeTruthy();
    if (!r.ok) return;
    expect(requestRefund(r.cid, '단순 변심').ok).toBe(true);
    expect(S().refunds.some(x => x.oid === r.oid && x.result === '완료' && x.memo.includes('단순 변심'))).toBe(true);
  });
});
