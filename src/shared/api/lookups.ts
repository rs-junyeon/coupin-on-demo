// 가짜 서버의 조회와 서버가 정하는 값: 지금 로그인한 고객, id로 찾기, 받은 쿠폰의 만료일
import { addDays, startOfDay } from '@/shared/lib';
import type { DB, Product } from './schema';

/** 이 데모의 고객 앱 사용자 (on_user) */
export const ME = 'me';

export const storeOf = (db: Pick<DB, 'stores'>, id: string) => db.stores.find(s => s.id === id)!;
export const prodOf = (db: Pick<DB, 'products'>, id: string) => db.products.find(p => p.id === id)!;
export const myCoupons = (db: Pick<DB, 'coupons'>) => db.coupons.filter(c => c.owner === ME);

/** 만료일: 기간형은 받은 날 포함 여부에 따라, 만료일형은 그날 23:59까지 */
export function expOf(p: Product, at: Date): Date {
  if ('until' in p.val) { const [y, m, d] = p.val.until.split('-').map(Number); return new Date(y, m - 1, d); }
  const d = startOfDay(at);
  return addDays(d, p.val.incl ? p.val.days - 1 : p.val.days);
}
