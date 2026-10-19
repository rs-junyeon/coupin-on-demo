// 판매 현황·정산: 누적 발급·판매액·수수료, 월별 정산과 대사
import { type DB, prodOf } from '@/shared/api';
import { FEE } from '@/shared/config';
import { dtA, monthKey, monthLabel, today } from '@/shared/lib';

/** 판매 현황: 어제까지 누적 + 이 앱에서 오늘 발급한 쿠폰 */
export function stats(db: DB) {
  let issued = db.base.issued, gmv = db.base.gmv;
  db.coupons.filter(c => c.live && c.status !== 'CANCELLED').forEach(c => { issued++; gmv += c.paid; });
  return { issued, gmv, fee: Math.round(gmv * FEE) };
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
