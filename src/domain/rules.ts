// 노출·상태·한도·정산 계산 (순수 함수). 화면은 여기 값을 그대로 보여 준다
import { expOf, ME, myCoupons, prodOf, storeOf, type Category, type Coupon, type DB, type LatLng, type Order, type PlusLogEntry, type Product, type Store } from '@/shared/api';
import { CAT_COLORS, FEE } from '@/shared/config';
import { digits, distanceLabel, distanceM, dtA, md, monthKey, monthLabel, today, won, ymdDot } from '@/shared/lib';

export { CAT_COLORS, FEE, digits, expOf, ME, myCoupons, prodOf, storeOf };
export const UNCAT: Category = { color: '#8B92A8', icon: 'box' };
export const CAT_ICONS = ['beauty', 'hair', 'fit', 'cafe', 'class', 'photo', 'food', 'pet', 'gift', 'box'] as const;

export const isFree = (p: Product) => p.sale === 'FREE';
export const catOf = (db: Pick<DB, 'cats'>, k: string | null) => (k && db.cats[k]) || UNCAT;
export const catName = (db: Pick<DB, 'cats'>, k: string | null) => (k && db.cats[k] ? k : '미분류');
export const limTxt = (p: Product, v: number) => (isFree(p) ? `${v.toLocaleString()}장` : won(v));
export const pct = (p: Product) => (p.list ? Math.round((1 - p.price / p.list) * 100) : 0);
export const fmtPin = (pin: string) => pin.replace(/(\d{4})(?=\d)/g, '$1 ');
export const maskPin = (pin: string) => `${pin.slice(0, 4)} **** **** ${pin.slice(12)}`;
export const who = (owner: string) => (owner === ME ? '김*온' : owner);
/** 고객 앱 노출 조건: ON 게시 + PLUS 판매 중 + PLUS 승인 + 가게 위치 + 점주 PLUS 구독 중 */
export function visible(db: Pick<DB, 'stores'>, p: Product) {
  const s = storeOf(db, p.sid);
  return p.on === 'PUBLISHED' && p.plus === 'ON_SALE' && p.appr === 'APPROVED' && !!s.pos && s.sub;
}

export function validityTxt(p: Product, base = today()) {
  if ('until' in p.val) return { main: `${ymdDot(expOf(p, base))}까지`, sub: '만료일 23:59까지 쓸 수 있어요' };
  return { main: `${p.val.incl ? '받은 날 포함 ' : '받은 다음 날부터 '}${p.val.days}일`, sub: `오늘 받으면 ${md(expOf(p, base))} 23:59까지` };
}

export type CouponState = { t: '사용 가능' | '일부 사용' | '사용 완료' | '만료' | '취소'; k: 'ok' | 'part' | 'used' | 'exp' | 'cancel'; active: boolean };
export function cStatus(c: Coupon, base = today()): CouponState {
  if (c.status === 'CANCELLED') return { t: '취소', k: 'cancel', active: false };
  if (c.status === 'EXCHANGED') return { t: '사용 완료', k: 'used', active: false };
  if (new Date(c.exp) < base) return { t: '만료', k: 'exp', active: false };
  if (c.status === 'IN_USE') return { t: '일부 사용', k: 'part', active: true };
  return { t: '사용 가능', k: 'ok', active: true };
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

/** 결과 미확인은 고객에게는 '발급 중'으로, 관리자에게만 따로 보인다 */
export const oStatus = (o: Order) => (o.unconfirmed ? '결과 미확인' : o.status);

/** 판매 현황: 어제까지 누적 + 이 앱에서 오늘 발급한 쿠폰 */
export function stats(db: DB) {
  let issued = db.base.issued, gmv = db.base.gmv;
  db.coupons.filter(c => c.live && c.status !== 'CANCELLED').forEach(c => { issued++; gmv += c.paid; });
  return { issued, gmv, fee: Math.round(gmv * FEE) };
}

/** 운영 알림: 결제 취소 실패, 결과 미확인 주문 (A-00-03) / 한도 80%, 동기화 실패 (A-00-04) */
export function opsAlerts(db: DB) {
  return {
    stuck: db.orders.filter(o => o.status === '환불 처리 중'),
    unconfirmed: db.orders.filter(o => o.unconfirmed),
    near: db.products.filter(p => p.limit && p.limitUsed / p.limit >= 0.8),
    syncFails: db.syncLog.filter(x => !x.ok),
  };
}

/** 고객 주문·환불 내역의 취소/환불 탭: 유료 환불·자동 취소 + 무료 쿠폰 취소 */
export type MyRefund = { oid?: string; cid?: string; free?: boolean; at: string; result: '완료' | '처리 중' | '거절'; why: string; amount: number; pid: string };
export function myRefunds(db: DB): MyRefund[] {
  const rs: MyRefund[] = [];
  db.orders.filter(o => o.owner === ME).forEach(o => {
    const r = db.refunds.find(x => x.oid === o.id);
    if (r) rs.push({ oid: o.id, at: r.at, result: r.result, why: r.result === '거절' ? '매장에서 이미 사용돼 환불하지 않았어요' : r.kind === 'ops' ? '운영자 취소' : '환불 요청', amount: o.amount, pid: o.pid });
    else if (o.status === '실패(결제 취소됨)') rs.push({ oid: o.id, at: o.at, result: '완료', why: '발급 실패로 자동 취소', amount: o.amount, pid: o.pid });
    else if (o.status === '환불 처리 중' && !r) rs.push({ oid: o.id, at: o.at, result: '처리 중', why: '결제 취소 처리 중', amount: o.amount, pid: o.pid });
  });
  myCoupons(db).filter(c => c.paid === 0 && (c.selfCancel || c.selfCancelRejected)).forEach(c => rs.push(c.selfCancel
    ? { cid: c.id, free: true, at: c.selfCancel.at, result: '완료', why: '무료 쿠폰 취소', amount: 0, pid: c.pid }
    : { cid: c.id, free: true, at: c.selfCancelRejected!.at, result: '거절', why: '매장에서 이미 사용돼 취소하지 않았어요', amount: 0, pid: c.pid }));
  return rs.sort((a, b) => +new Date(b.at) - +new Date(a.at));
}
export const unseenAnswer = (db: DB) => db.inquiries.some(q => q.owner === ME && !!q.answer && !q.seen);

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

/** 지난달 정산 (A-04-01-01): [상품, 발급, 취소·환불, 판매가(무료 0원), PLUS 발급(차이 있을 때)] */
const SETTLE_P: [string, number, number, number, number?][] = [['p1', 30, 1, 15000], ['p2', 8, 0, 0], ['p3', 2, 0, 39000], ['p4', 14, 0, 19900], ['p5', 9, 0, 9900], ['p6', 61, 0, 0], ['p8', 6, 0, 25000, 7], ['p9', 14, 2, 12000], ['p10', 12, 0, 0], ['p11', 5, 0, 49000], ['p12', 9, 0, 25000]];
export type SettleRow = { pid: string; sid: string; n: number; cx: number; gross: number; ded: number; plusN: number | null };
export function settleRows(db: DB): SettleRow[] {
  const diff = !db.settle.checked;
  return SETTLE_P.map(([pid, n, cx, pr, plusN]) => {
    const nn = !diff && plusN ? plusN : n;
    return { pid, sid: prodOf(db, pid).sid, n: nn, cx, gross: nn * pr, ded: cx * pr, plusN: diff && plusN ? plusN : null };
  });
}
/** 수수료는 취소·환불분을 뺀 판매가에만 붙는다 */
export const settleCalc = (t: { gross: number; ded: number }) => { const net = t.gross - t.ded, fee = Math.round(net * FEE); return { net, fee, pay: net - fee }; };
export function settleTot(rows: SettleRow[]) {
  const t = rows.reduce((a, r) => ({ n: a.n + r.n, cx: a.cx + r.cx, gross: a.gross + r.gross, ded: a.ded + r.ded }), { n: 0, cx: 0, gross: 0, ded: 0 });
  return { ...t, ...settleCalc(t) };
}
export type SettleMonth = { key: string; label: string; st: '확정' | '대사 중' | '차이 있음'; n: number; amt: number; at: string };
export function settleMonths(db: DB, base = today()): SettleMonth[] {
  const t = settleTot(settleRows(db)), st = stats(db);
  const m = (k: number) => new Date(base.getFullYear(), base.getMonth() - k, 1);
  const sep = db.settle.done ? '확정' : !db.settle.checked ? '차이 있음' : '대사 중';
  return [
    { key: monthKey(m(0)), label: monthLabel(m(0)), st: '대사 중', n: st.issued, amt: st.gmv - st.fee, at: db.settle.runAt ? `${dtA(db.settle.runAt)} (수동)` : `${monthKey(m(0))}-${String(base.getDate()).padStart(2, '0')} 06:00 (자동)` },
    { key: monthKey(m(1)), label: monthLabel(m(1)), st: sep, n: t.n, amt: t.pay, at: `${monthKey(m(0))}-01 06:00 (자동)` },
    { key: monthKey(m(2)), label: monthLabel(m(2)), st: '확정', n: 152, amt: 1782450, at: `${monthKey(m(1))}-01 06:00 (자동)` },
    { key: monthKey(m(3)), label: monthLabel(m(3)), st: '확정', n: 128, amt: 1515600, at: `${monthKey(m(2))}-01 06:00 (자동)` },
  ];
}
