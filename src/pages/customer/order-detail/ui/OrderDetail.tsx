import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cStatus } from '@/entities/coupon';
import { ME, prodOf, storeOf, useDB } from '@/shared/api';
import { hm, won, ymdDot } from '@/shared/lib';
import { accountCss as s, NotFound, runBusy, Sheet, TopBar, useUi } from '@/shared/ui/mobile';
import { CatIcon } from '@/entities/category';
import { orderChip } from '@/entities/order';

const REASONS = ['단순 변심', '매장 방문이 어려워요', '다른 상품으로 바꾸고 싶어요', '기타'];

/** 주문 상세: 결제 정보와 쿠폰 상태. 쓰지 않은 유료 쿠폰은 여기서 환불을 요청한다 */
export default function OrderDetail() {
  const { oid } = useParams();
  const nav = useNavigate();
  const db = useDB();
  const toast = useUi(st => st.showToast);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const o = db.orders.find(x => x.id === oid && x.owner === ME);
  if (!o) return <NotFound />;
  const p = prodOf(db, o.pid), st = storeOf(db, p.sid);
  const c = o.cid ? db.coupons.find(x => x.id === o.cid) ?? null : null;
  const cs = c ? cStatus(c) : null;
  const canRefund = !!c && c.paid > 0 && c.status === 'ISSUED' && cs?.k === 'ok';
  const refund = () => {
    if (!c) return;
    setOpen(false);
    void runBusy(['쿠폰을 취소하고 있어요', '결제를 취소하고 있어요'], () => db.requestRefund(c.id, reason)).then(r => {
      toast(r.ok ? `${won(r.amount)} 환불을 요청했어요. 카드사에 따라 3~5영업일 걸려요` : r.error);
    });
  };
  return (
    <div className="c-page">
      <TopBar title="주문 상세" />
      <div className="scroll">
        <div className="ck">
          <div className="box"><div className="osum"><CatIcon cat={p.cat} size={24} /><div><b>{p.name}</b><span>{st.name}</span></div></div></div>
          <div className="box">
            <h3>결제</h3>
            <div className="rows">
              <div><span className="k">주문번호</span><span className={`mono ${s.mono}`}>{o.id}</span></div>
              <div><span className="k">결제 일시</span><span>{ymdDot(o.at)} {hm(o.at)}</span></div>
              <div><span className="k">결제 수단</span><span>{o.method}</span></div>
              <div><span className="k">결제 금액</span><b className="num">{won(o.amount)}</b></div>
              <div><span className="k">주문 상태</span><span className={`st-chip ${orderChip(o.status)}`}>{o.status}</span></div>
            </div>
            {o.note && !o.unconfirmed && <p className={s.boxNote}>{o.note}</p>}
          </div>
          {c && cs && (
            <div className="box">
              <h3>쿠폰</h3>
              <div className="rows">
                <div><span className="k">쿠폰 상태</span><span className={`st-chip st-${cs.k}`}>{cs.t}</span></div>
                <div><span className="k">유효기간</span><span>{ymdDot(c.exp)}까지</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
      {c && (
        <div className="cta-bar">
          <button type="button" className="cta dark" onClick={() => nav(`/coupons/${c.id}`)}>쿠폰 보기</button>
          {canRefund && <button type="button" className="cta line" onClick={() => { setReason(REASONS[0]); setOpen(true); }}>환불 요청</button>}
        </div>
      )}
      <Sheet open={open} onClose={() => setOpen(false)} label="환불 확인">
        <h3>환불을 요청할까요?</h3>
        <p className="sub">{p.name}</p>
        <div className="box"><div className="rows">
          <div><span className="k">환불 금액</span><b className="num">{won(c?.paid ?? 0)}</b></div>
          <div><span className="k">돌려받는 곳</span><span>결제한 수단</span></div>
        </div></div>
        <div className="reasons" role="radiogroup" aria-label="환불 사유">
          {REASONS.map(r => <button type="button" key={r} role="radio" aria-checked={reason === r} className={reason === r ? 'on' : ''} onClick={() => setReason(r)}>{r}</button>)}
        </div>
        <p className={s.note}>환불하면 쿠폰은 바로 쓸 수 없게 돼요. 카드 취소는 카드사에 따라 3~5영업일 걸려요.</p>
        <button type="button" className="cta dark" onClick={refund}>환불 요청하기</button>
      </Sheet>
    </div>
  );
}
