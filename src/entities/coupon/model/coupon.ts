// 쿠폰: 상태(사용 가능·일부 사용·사용 완료·만료·취소), PIN 표기
import type { Coupon } from '@/shared/api';
import { today } from '@/shared/lib';

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
