import { expOf, mutate, pinOf, prodOf, type Order } from '@/shared/api';

/** 결과 미확인 주문: tid로 PLUS 발급 결과를 확인해 발급됐으면 쿠폰을 복구한다 */
export const resolveOrder = (oid: string) => mutate(d => {
  const o = d.orders.find(x => x.id === oid)! as Order, p = prodOf(d, o.pid), at = new Date();
  d.seq += 1;
  const cid = `r${d.seq}`;
  d.coupons.push({ id: cid, pid: o.pid, owner: o.owner, oid: o.id, issuedAt: at.toISOString(), exp: expOf(p, at).toISOString(), pin: pinOf(d.seq * 7331 + 11), status: 'ISSUED', usedAt: null, balance: p.type === '잔액권' ? p.list : null, paid: o.amount });
  o.cid = cid; o.status = '완료'; o.unconfirmed = false; o.note = 'tid로 조회해 발급을 확인하고 쿠폰을 복구했어요';
  o.log.push([at.toISOString(), `${d.admin.name} · tid로 PLUS 발급 결과 조회 → 발급 확인, 쿠폰 복구`]);
});
