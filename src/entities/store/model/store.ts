// 가게: 가게 안 상품 순서, 대표 카테고리, 거리, 지도·매장 탭에 보일 가게
import type { DB, LatLng, Product, Store } from '@/shared/api';
import { distanceLabel, distanceM } from '@/shared/lib';
import { filterOn, matches, visible, type ListFilter } from '@/entities/product';

/** 가게 안 상품 순서: 조건에 맞는 상품 먼저, 대표 상품, 최근 게시 순 */
export function storeProducts(db: DB, sid: string, f: ListFilter = { cat: '전체', q: '' }) {
  const hit = (p: Product) => (filterOn(f) && matches(db, p, f) ? 1 : 0);
  return db.products.filter(p => p.sid === sid && visible(db, p)).sort((a, b) => (hit(b) - hit(a)) || (+b.rep - +a.rep) || (b.pub - a.pub));
}

/** 가게의 대표 카테고리 = 대표 상품의 카테고리 (핀·가게 카드 아이콘) */
export function storeCat(db: DB, sid: string) {
  const p = storeProducts(db, sid)[0] || db.products.find(x => x.sid === sid && x.cat);
  return p ? p.cat : null;
}

export const distM = (s: Store, origin: LatLng) => (s.pos ? distanceM(origin, s.pos) : Infinity);

export const distTxt = (s: Store, origin: LatLng) => distanceLabel(distM(s, origin));

/** 지도·목록에 보이는 가게: 조건이 켜져 있으면 조건에 맞는 상품이 있는 가게만, 가까운 순 */
export function shownStores(db: DB, f: ListFilter, origin: LatLng) {
  return db.stores.filter(s => s.pos && storeProducts(db, s.id).some(p => !filterOn(f) || matches(db, p, f))).sort((a, b) => distM(a, origin) - distM(b, origin));
}

/** 매장 탭 목록: 거리순. 카테고리는 상품 카테고리, 검색은 가게 이름·상품명 */
export function tabStores(db: DB, f: ListFilter, origin: LatLng) {
  const q = f.q.trim();
  return db.stores.filter(s => {
    const ps = storeProducts(db, s.id).filter(p => f.cat === '전체' || p.cat === f.cat);
    return s.pos && ps.length && (!q || s.name.includes(q) || ps.some(p => p.name.includes(q)));
  }).sort((a, b) => distM(a, origin) - distM(b, origin));
}
