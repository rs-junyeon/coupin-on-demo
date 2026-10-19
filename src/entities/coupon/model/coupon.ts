// 쿠폰: 상태(사용 가능·일부 사용·사용 완료·만료·취소), PIN 표기
import { type Coupon, type DB, prodOf, type Product } from '@/shared/api';
import { today } from '@/shared/lib';
import { isFree } from '@/entities/product/@x/coupon';

export const fmtPin = (pin: string) => pin.replace(/(\d{4})(?=\d)/g, '$1 ');

export const maskPin = (pin: string) => `${pin.slice(0, 4)} **** **** ${pin.slice(12)}`;

export type CouponState = { t: '사용 가능' | '일부 사용' | '사용 완료' | '만료' | '취소'; k: 'ok' | 'part' | 'used' | 'exp' | 'cancel'; active: boolean };

export function cStatus(c: Coupon, base = today()): CouponState {
  if (c.status === 'CANCELLED') return { t: '취소', k: 'cancel', active: false };
  if (c.status === 'EXCHANGED') return { t: '사용 완료', k: 'used', active: false };
  if (new Date(c.exp) < base) return { t: '만료', k: 'exp', active: false };
  if (c.status === 'IN_USE') return { t: '일부 사용', k: 'part', active: true };
  return { t: '사용 가능', k: 'ok', active: true };
}

/** 발급·취소 수량을 한도에 반영한다 (유료는 판매가 합계, 무료는 장수) */
export function applyLimit(d: DB, p: Product, paid: number, n: number) {
  p.limitUsed += n * (isFree(p) ? 1 : paid);
  if (isFree(p)) d.limit.fused += n; else d.limit.used += n * paid;
}

/** PLUS 발급 취소: 쿠폰을 취소하고, 주문이 있으면 환불 완료로, 수량은 한도로 돌려준다 */
export function cancelCouponIn(d: DB, cid: string) {
  const c = d.coupons.find(x => x.id === cid)!, p = prodOf(d, c.pid);
  c.status = 'CANCELLED';
  const o = d.orders.find(x => x.cid === c.id); if (o) o.status = '환불 완료';
  applyLimit(d, p, c.paid, -1);
  return { c, o };
}
