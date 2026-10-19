// 운영자 쿠폰 취소 (A-03-03-02): 처리자·시각·사유를 남기고, 유료면 결제도 취소한다
import { cancelCouponIn } from '@/entities/coupon';
import { mutate } from '@/shared/api';
import { iso } from '@/shared/lib';

export const adminCancelCoupon = (cid: string, reason: string) => mutate(d => {
  const { c, o } = cancelCouponIn(d, cid);
  c.cancel = { at: iso(), who: d.admin.name, reason };
  if (o) { o.log.push([iso(), `${d.admin.name} · 쿠폰 취소(${reason}) → PLUS 발급 취소 → 결제 취소 완료`]); d.refunds.push({ oid: o.id, at: iso(), result: '완료', memo: `운영자 직접 취소 · ${reason}`, kind: 'ops' }); }
});
