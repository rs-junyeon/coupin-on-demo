// 무료 받기·유료 구매: 한도·1인 1회를 확인하고 PLUS 발급, 유료면 주문을 남긴다
import { applyLimit } from '@/entities/coupon';
import { blockReason } from '@/entities/product';
import { expOf, ME, mutate, pinOf, prodOf, useDB, type Result } from '@/shared/api';
import { p2 } from '@/shared/lib';

export const PAY_METHODS = { easy: '간편결제', card: '신용·체크카드', phone: '휴대폰 결제' } as const;
export type PayMethod = keyof typeof PAY_METHODS;

const ymdC = (d: Date) => `${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}`;

export function issue(pid: string, method: PayMethod = 'easy'): Result<{ cid: string; oid: string | null }> {
  const s = useDB.getState(), p = prodOf(s, pid);
  const why = blockReason(s, p);
  if (why) return { ok: false, error: why };
  let cid = '', oid: string | null = null;
  mutate(d => {
    const q = prodOf(d, pid), at = new Date();
    d.seq += 1;
    const id = `ON-${ymdC(at)}-${String(d.seq).padStart(4, '0')}`;
    cid = `n${d.seq}`;
    d.coupons.push({ id: cid, pid, owner: ME, oid: id, issuedAt: at.toISOString(), exp: expOf(q, at).toISOString(), pin: pinOf(d.seq * 104729 + 7), status: 'ISSUED', usedAt: null, balance: q.type === '잔액권' ? q.list : null, paid: q.price, live: true });
    if (q.price > 0) { oid = id; d.orders.unshift({ id, cid, pid, owner: ME, amount: q.price, at: at.toISOString(), status: '완료', method: PAY_METHODS[method], log: [], live: true }); }
    applyLimit(d, q, q.price, 1);
  });
  return { ok: true, cid, oid };
}
