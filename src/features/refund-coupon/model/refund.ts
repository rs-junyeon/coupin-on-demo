// 고객 환불 요청·무료 쿠폰 취소 (사용 전 쿠폰만)
import { cancelCouponIn } from '@/entities/coupon';
import { ME, mutate, useDB, type Result } from '@/shared/api';
import { iso } from '@/shared/lib';

/** 서버가 바로 처리한다: PLUS 발급 취소 → 결제 취소. reason은 관리자 환불 기록에 남는다 */
export function requestRefund(cid: string, reason?: string): Result<{ amount: number }> {
  const c = useDB.getState().coupons.find(x => x.id === cid);
  if (!c || c.owner !== ME || c.paid === 0 || c.status !== 'ISSUED') return { ok: false, error: '환불할 수 없는 쿠폰이에요' };
  mutate(d => {
    const { o } = cancelCouponIn(d, cid);
    const why = reason ? ` (${reason})` : '';
    if (o) { o.log.push([iso(), `고객 환불 요청${why} → PLUS 발급 취소 → 결제 취소 완료`]); d.refunds.push({ oid: o.id, at: iso(), result: '완료', memo: `고객 요청${why} · 자동 처리`, kind: 'req' }); }
  });
  return { ok: true, amount: c.paid };
}

/** 무료 쿠폰 취소: PLUS 발급 취소만 한다. 결제가 없어 관리자 환불 기록은 없고, 무료 월 한도로 수량이 돌아간다 */
export function cancelFree(cid: string): Result {
  const c = useDB.getState().coupons.find(x => x.id === cid);
  if (!c || c.owner !== ME || c.paid !== 0 || c.status !== 'ISSUED') return { ok: false, error: '취소할 수 없는 쿠폰이에요' };
  mutate(d => { const { c: x } = cancelCouponIn(d, cid); x.selfCancel = { at: iso() }; });
  return { ok: true };
}
