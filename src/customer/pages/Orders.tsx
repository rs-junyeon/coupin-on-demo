import { useNavigate, useSearchParams } from 'react-router-dom';
import { ME, prodOf, useDB } from '@/shared/api';
import { type MyRefund, myRefunds } from '@/entities/order';
import { won, ymdDot } from '@/shared/lib';
import { TopBar } from '@/shared/ui/mobile';
import { orderChip } from './accountKit';

const PAID_CHIP: Record<MyRefund['result'], [string, string]> = { '완료': ['st-ok', '환불 완료'], '처리 중': ['st-warn', '환불 처리 중'], '거절': ['st-cancel', '환불 불가'] };
const refundChip = (r: MyRefund): [string, string] => (!r.free ? PAID_CHIP[r.result] : r.result === '거절' ? ['st-cancel', '취소 불가'] : ['st-ok', '취소 완료']);

/** 주문·환불 내역: 주문(결제) 탭 | 취소/환불 탭 (?tab=refund) */
export default function Orders() {
  const nav = useNavigate();
  const db = useDB();
  const [sp, setSp] = useSearchParams();
  const tab = sp.get('tab') === 'refund' ? 'refund' : 'order';
  // 고객에게는 '결과 미확인'도 '발급 중'으로 보인다 (주문 상태 그대로)
  const os = db.orders.filter(o => o.owner === ME);
  const rs = myRefunds(db);
  const setTab = (t: 'order' | 'refund') => setSp(t === 'refund' ? { tab: 'refund' } : {}, { replace: true });
  return (
    <div className="c-page">
      <TopBar title="주문·환불 내역" />
      <div className="wtabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'order'} className={tab === 'order' ? 'on' : ''} onClick={() => setTab('order')}>주문(결제) {os.length}</button>
        <button type="button" role="tab" aria-selected={tab === 'refund'} className={tab === 'refund' ? 'on' : ''} onClick={() => setTab('refund')}>취소/환불 {rs.length}</button>
      </div>
      <div className="scroll">
        <div className="olist">
          {tab === 'order' && (os.length ? os.map(o => (
            <button type="button" key={o.id} className="oc btn" onClick={() => nav(`/my/orders/${o.id}`)}>
              <div className="r"><b>{prodOf(db, o.pid).name}</b><span className={`st-chip ${orderChip(o.status)}`}>{o.status}</span></div>
              <div className="r"><span className="s mono">{o.id}</span><span className="num">{won(o.amount)}</span></div>
              <span className="s">{ymdDot(o.at)} 결제</span>
            </button>
          )) : <div className="empty"><b>주문 내역이 없어요</b><span>무료 쿠폰은 주문 내역에 나오지 않아요.</span></div>)}
          {tab === 'refund' && (rs.length ? rs.map(r => {
            const [k, lbl] = refundChip(r), p = prodOf(db, r.pid), rejected = r.result === '거절';
            if (r.free) return (
              <button type="button" key={`c-${r.cid}`} className="oc btn" onClick={() => nav(`/coupons/${r.cid}`)}>
                <div className="r"><b>{p.name}</b><span className={`st-chip ${k}`}>{lbl}</span></div>
                <div className="r"><span className="s">{r.why}</span><span className="num">0원</span></div>
                <span className="s">{ymdDot(r.at)} {rejected ? '요청' : '취소'} · 무료 쿠폰</span>
              </button>
            );
            return (
              <button type="button" key={`o-${r.oid}`} className="oc btn" onClick={() => nav(`/my/orders/${r.oid}`)}>
                <div className="r"><b>{p.name}</b><span className={`st-chip ${k}`}>{lbl}</span></div>
                <div className="r"><span className="s">{r.why}</span><span className="num">{rejected ? '0원' : won(r.amount)}</span></div>
                <span className="s">{ymdDot(r.at)} {rejected ? '요청' : '환불'} · <span className="mono">{r.oid}</span></span>
              </button>
            );
          }) : <div className="empty"><b>취소·환불 내역이 없어요</b><span>쓰지 않은 쿠폰은 쿠폰 화면에서 취소하거나 환불을 요청할 수 있어요.</span></div>)}
        </div>
      </div>
    </div>
  );
}
