// 결제 취소가 막힌 주문을 운영자가 다시 시도한다 (환불·주문 상세)
import { mutate } from '@/shared/api';
import { iso } from '@/shared/lib';

export const retryRefund = (oid: string) => mutate(d => {
  const o = d.orders.find(x => x.id === oid)!;
  o.status = '환불 완료'; o.note = `${d.admin.name}이 다시 시도해 취소 완료`;
  o.log.push([iso(), `${d.admin.name} · 결제 취소 다시 시도 → 환불 완료`]);
  d.refunds.filter(r => r.oid === oid && r.result === '처리 중').forEach(r => { r.result = '완료'; r.memo += ' → 운영자 재시도로 완료'; });
});
