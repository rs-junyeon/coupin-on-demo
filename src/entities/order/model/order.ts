// 주문: 관리자 상태 표기, 고객 주문·환불 내역의 취소/환불 탭
import { type DB, ME, myCoupons, type Order, type OrderStatus, type Refund } from '@/shared/api';
import type { TagKind } from '@/shared/ui/admin';

/** 결과 미확인은 고객에게는 '발급 중'으로, 관리자에게만 따로 보인다 */
export const oStatus = (o: Order) => (o.unconfirmed ? '결과 미확인' : o.status);

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

/** 주문 상태 칩 색 (DESIGN.md 3.6): 결제 확인·발급 중 info, 완료 success, 실패 danger, 환불 처리 중 warning, 환불 완료 회색.
 *  결과 미확인(관리자만 보임)은 운영자가 확인해야 해서 warning */
const ORDER_TAG: Record<string, TagKind> = {
  '결제 확인 중': 'part', '발급 중': 'part', '완료': 'ok', '실패(결제 취소됨)': 'cancel', '환불 처리 중': 'warn', '환불 완료': 'used', '결과 미확인': 'warn',
};
export const orderTag = (st: string): TagKind => ORDER_TAG[st] ?? 'warn';
/** 고객 앱 상태 칩 클래스 (.st-*) */
export const orderChip = (st: OrderStatus) => `st-${orderTag(st)}`;
export const refundTag = (r: Refund['result']): TagKind => (r === '완료' ? 'ok' : r === '거절' ? 'cancel' : 'warn');
