// 상품: 노출 조건, 받기·구매를 막는 이유, 관리자 노출 상태, 유효기간 표기, 상품변경 이력
import { type DB, expOf, myCoupons, type PlusLogEntry, type Product, storeOf } from '@/shared/api';
import { md, today, won, ymdDot } from '@/shared/lib';

export const isFree = (p: Product) => p.sale === 'FREE';

export const limTxt = (p: Product, v: number) => (isFree(p) ? `${v.toLocaleString()}장` : won(v));

export const pct = (p: Product) => (p.list ? Math.round((1 - p.price / p.list) * 100) : 0);

/** 고객 앱 노출 조건: ON 게시 + PLUS 판매 중 + PLUS 승인 + 가게 위치 + 점주 PLUS 구독 중 */
export function visible(db: Pick<DB, 'stores'>, p: Product) {
  const s = storeOf(db, p.sid);
  return p.on === 'PUBLISHED' && p.plus === 'ON_SALE' && p.appr === 'APPROVED' && !!s.pos && s.sub;
}

export function validityTxt(p: Product, base = today()) {
  if ('until' in p.val) return { main: `${ymdDot(expOf(p, base))}까지`, sub: '만료일 23:59까지 쓸 수 있어요' };
  return { main: `${p.val.incl ? '받은 날 포함 ' : '받은 다음 날부터 '}${p.val.days}일`, sub: `오늘 받으면 ${md(expOf(p, base))} 23:59까지` };
}

/** 받기·구매를 막는 이유. 없으면 null */
export function blockReason(db: DB, p: Product): string | null {
  if (!visible(db, p)) return '지금은 판매하지 않아요';
  if (isFree(p) && myCoupons(db).some(c => c.pid === p.id && c.status !== 'CANCELLED')) return '이미 받은 쿠폰이에요 (1인 1회)';
  if (p.limit && p.limitUsed + (isFree(p) ? 1 : p.price) > p.limit) return '이번 달 준비된 수량이 모두 나갔어요';
  if (isFree(p) ? db.limit.fused + 1 > db.limit.ftotal : db.limit.used + p.price > db.limit.total) return '이번 달 준비된 수량이 모두 나갔어요';
  return null;
}

export type ListFilter = { cat: string; q: string };

export const filterOn = (f: ListFilter) => f.cat !== '전체' || f.q.trim() !== '';

export const matchQ = (db: DB, p: Product, q: string) => !q || p.name.includes(q) || storeOf(db, p.sid).name.includes(q);

export const matches = (db: DB, p: Product, f: ListFilter) => (f.cat === '전체' || p.cat === f.cat) && matchQ(db, p, f.q.trim());

/** 고객 앱 카테고리 칩: 게시 중인 상품이 있는 카테고리만 */
export const catShown = (db: DB, k: string) => db.products.some(p => p.cat === k && visible(db, p));

/** 관리자 노출 상태 */
export type AdminState = { k: 'pub' | 'hidden' | 'draft' | 'block'; t: string; why?: string };

export function adminStatus(db: DB, p: Product): AdminState {
  const s = storeOf(db, p.sid);
  if (!s.sub) return { k: 'block', t: '노출 불가', why: p.on === 'PUBLISHED' ? 'PLUS 구독 종료 · 신규 판매를 멈추고 자동으로 내렸어요. 발급된 쿠폰은 유효기간까지 쓸 수 있어요' : 'PLUS 구독 종료' };
  if (!s.pos) return { k: 'block', t: '노출 불가', why: '가게 위치가 없어요 (점주가 PLUS에서 입력)' };
  if (p.plus === 'STOPPED') return { k: 'block', t: '노출 불가', why: p.on === 'PUBLISHED' ? 'PLUS에서 판매 중지 · 고객 화면에서 자동으로 내렸어요' : 'PLUS에서 판매 중지' };
  if (p.appr !== 'APPROVED') return { k: 'block', t: '노출 불가', why: p.on === 'PUBLISHED' ? 'PLUS 재승인 대기 (점주가 내용을 고침) · 고객 화면에서 자동으로 내렸어요' : 'PLUS 재승인 대기 (점주가 내용을 고침)' };
  if (isFree(p) && p.list == null) return { k: 'block', t: '노출 불가', why: '소비자가가 없는 무료 상품이에요 (점주가 PLUS에서 입력)' };
  if (p.on === 'PUBLISHED') return { k: 'pub', t: '게시 중' };
  if (p.on === 'HIDDEN') return { k: 'hidden', t: '숨김' };
  return { k: 'draft', t: '미게시', why: p.cat ? '' : '카테고리를 골라야 게시할 수 있어요' };
}

/** 판매 조건을 열 수 있는 상품 (위치·소비자가가 있어야 한다) */
export const editable = (db: DB, p: Product) => !!storeOf(db, p.sid).pos && p.list != null;

/** 상품 이력 (상품변경 이력 탭): 동기화 때마다 저장한 PLUS 값을 시점별 한 줄로. 바로 앞 줄과 달라진 칸을 표시 */
const PLOG_F: Record<string, 'name' | 'own' | 'val' | 'restr' | 'notes'> = { '상품명': 'name', '점주 판매가': 'own', '유효기간': 'val', '사용 제한': 'restr', '유의사항': 'notes' };

export type PlusSnap = { no: number; at: string; by: string; v: Record<'name' | 'own' | 'list' | 'val' | 'restr' | 'notes' | 'plus', string>; on: string[]; chg: string[] };

export function plusSnaps(p: Product): PlusSnap[] {
  const log: PlusLogEntry[] = p.plusLog;
  const cur = { name: p.name, own: isFree(p) ? '무료' : won(p.own), list: p.list != null ? won(p.list) : '없음', val: validityTxt(p).main, restr: p.restr || '없음', notes: p.notes.length ? p.notes.join(' ') : '없음', plus: '판매 중' };
  const v: PlusSnap['v'] = { ...cur }, seen: Record<string, boolean> = {}, lastAt: Record<string, number> = {};
  log.forEach(e => { const k = e.f && PLOG_F[e.f]; if (e.k === 'edit' && k && !seen[k]) { v[k] = e.from ?? ''; seen[k] = true; } });
  log.forEach((e, i) => { const k = e.f && PLOG_F[e.f]; if (e.k === 'edit' && k) lastAt[k] = i; });
  const rows: Omit<PlusSnap, 'no' | 'chg'>[] = [];
  log.forEach((e, i) => {
    const k = e.f && PLOG_F[e.f];
    if (e.k === 'edit' && k) v[k] = lastAt[k] === i ? cur[k] : e.to;
    if (e.on?.includes('재승인 대기')) v.plus = '재승인 대기';
    if (e.f === 'PLUS 재승인 완료') v.plus = '판매 중';
    if (e.f === 'PLUS 판매 중지') v.plus = '판매 중지';
    if (e.f === 'PLUS 구독 종료') v.plus = '구독 종료';
    const by = e.k === 'start' ? '점주 (처음 내보냄)' : e.f === 'PLUS 재승인 완료' ? 'PLUS 승인' : e.f === 'PLUS 구독 종료' ? 'PLUS (구독 만료)' : '점주';
    const prev = rows[rows.length - 1];
    if (prev && prev.at === e.at) { Object.assign(prev.v, v); if (e.on) prev.on.push(e.on); return; }
    rows.push({ at: e.at, by, v: { ...v }, on: e.on ? [e.on] : [] });
  });
  return rows.map((r, i) => ({ ...r, no: i + 1, chg: i ? Object.keys(r.v).filter(k => r.v[k as keyof PlusSnap['v']] !== rows[i - 1].v[k as keyof PlusSnap['v']]) : [] })).reverse();
}
