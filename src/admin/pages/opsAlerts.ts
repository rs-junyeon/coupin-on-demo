// 운영 알림 (A-00-03·04): 판매 현황 화면에서만 쓴다
import type { DB } from '@/shared/api';

/** 운영 알림: 결제 취소 실패, 결과 미확인 주문 (A-00-03) / 한도 80%, 동기화 실패 (A-00-04) */
export function opsAlerts(db: DB) {
  return {
    stuck: db.orders.filter(o => o.status === '환불 처리 중'),
    unconfirmed: db.orders.filter(o => o.unconfirmed),
    near: db.products.filter(p => p.limit && p.limitUsed / p.limit >= 0.8),
    syncFails: db.syncLog.filter(x => !x.ok),
  };
}
