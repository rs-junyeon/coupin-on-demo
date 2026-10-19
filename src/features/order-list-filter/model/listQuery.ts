// 주문·환불·발급 내역이 같이 쓰는 검색조건: 기간, 상품 카테고리, 가게 이름·상품명·고객 이름 (여러 칸에 적으면 모두 맞는 건만)
import { type DB, type Product, storeOf } from '@/shared/api';
import { who } from '@/entities/account';
import { addDays, today } from '@/shared/lib';

export type Period = 'all' | 'today' | '7';
export type ListQ = { per: Period; cat: string; qs: string; qp: string; qc: string };
export const Q0: ListQ = { per: 'all', cat: '전체', qs: '', qp: '', qc: '' };

/** 기간은 오늘(0시) 기준: 오늘, 오늘 포함 최근 7일 */
export const inPeriod = (at: string, per: Period) => per === 'all' || new Date(at) >= (per === 'today' ? today() : addDays(today(), -6));
export const catHit = (p: Product, v: string) => v === '전체' || (v === 'none' ? !p.cat : p.cat === v);
export const qHit = (db: Pick<DB, 'stores'>, f: ListQ, p: Product, owner: string) =>
  storeOf(db, p.sid).name.includes(f.qs.trim()) && p.name.includes(f.qp.trim()) && who(owner).includes(f.qc.trim());
/** 기간·카테고리·검색칸을 모두 통과하는지 */
export const listHit = (db: Pick<DB, 'stores'>, f: ListQ, p: Product, owner: string, at: string) => inPeriod(at, f.per) && catHit(p, f.cat) && qHit(db, f, p, owner);
