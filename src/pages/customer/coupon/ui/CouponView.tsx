import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { cStatus, fmtPin } from '@/entities/coupon';
import { ME, prodOf, storeOf, useDB } from '@/shared/api';
import { daysLeft, hm, won, ymdDot } from '@/shared/lib';
import { Barcode, purchaseCss as s, runBusy, Sheet, TopBar, useUi } from '@/shared/ui/mobile';
import { Icon } from '@/shared/ui/icon';
import { cancelFree as cancelFreeCoupon, requestRefund } from '@/features/refund-coupon';

const REASONS = ['단순 변심', '매장 방문이 어려워요', '다른 상품으로 바꾸고 싶어요', '기타'];

/** 쿠폰 (C-04-02): 바코드·PIN, 남은 기간·잔액, 사용 장소·유의사항. 쓰기 전이면 유료는 환불 요청, 무료는 쿠폰 취소 */
export default function CouponView() {
  const { cid = '' } = useParams();
  const db = useDB();
  const [sheet, setSheet] = useState<'refund' | 'cancel' | null>(null);
  const [reason, setReason] = useState(REASONS[0]);
  const c = db.coupons.find(x => x.id === cid && x.owner === ME);

  if (!c) return <div className="c-page"><TopBar title="쿠폰" /><div className="scroll"><div className="empty"><b>쿠폰을 찾을 수 없어요</b></div></div></div>;

  const p = prodOf(db, c.pid), st = storeOf(db, p.sid), cs = cStatus(c), dd = daysLeft(c.exp);
  const order = db.orders.find(o => o.cid === c.id);
  const canRefund = cs.t === '사용 가능' && c.paid > 0;
  // 무료 쿠폰도 쓰기 전이면 직접 취소할 수 있다 (C-04-02-01). 돌려줄 금액이 없어 '쿠폰 취소'로 부른다
  const canCancelFree = cs.t === '사용 가능' && c.paid === 0;
  const toast = useUi.getState().showToast;

  const copyPin = () => {
    navigator.clipboard?.writeText(c.pin).catch(() => {});
    toast('PIN을 복사했어요');
  };
  const openRefund = () => { setReason(REASONS[0]); setSheet('refund'); };
  const refund = async () => {
    setSheet(null);
    const r = await runBusy(['쿠폰을 취소하고 있어요', '결제를 취소하고 있어요'], () => requestRefund(c.id, reason));
    toast(r.ok ? `${won(r.amount)} 환불을 요청했어요. 카드사에 따라 3~5영업일 걸려요` : r.error);
  };
  const cancelFree = async () => {
    setSheet(null);
    const r = await runBusy(['쿠폰을 취소하고 있어요'], () => cancelFreeCoupon(c.id));
    toast(r.ok ? '쿠폰을 취소했어요' : r.error);
  };

  return (
    <div className="c-page">
      <TopBar title="쿠폰" />
      <div className="scroll">
        <div className="cview">
          <div className="ticket">
            <div className="ticket-top"><span className="s">{st.name}</span><b>{p.name}</b><span className={`st-chip st-${cs.k}`}>{cs.t}</span></div>
            <div className="ticket-cut"><i /></div>
            <div className={`ticket-code ${cs.active ? '' : 'dim'}`}>
              <Barcode pin={c.pin} />
              <div className="pin-row">
                <span className="pin-no" aria-label="PIN 번호">{fmtPin(c.pin)}</span>
                {cs.active && <button type="button" className="pin-copy" onClick={copyPin}>PIN 복사</button>}
              </div>
              {cs.active && <span className="bright"><Icon name="info" size={16} />화면 밝기를 최대로 올리면 잘 읽혀요</span>}
              {!cs.active && <span className={`stamp ${cs.k === 'cancel' ? s.stampCancel : s.stampPast}`}>{cs.t}</span>}
              {cs.active && <div className="dline"><span>남은 기간</span><b>{dd === 0 ? 'D-day' : `D-${dd}`} · {ymdDot(c.exp)} 23:59까지</b></div>}
              {c.balance != null && cs.k !== 'cancel' && <div className="bal"><span>남은 금액</span><b className="num">{won(c.balance)} / {won(p.list ?? c.balance)}</b></div>}
            </div>
          </div>
          <div className="cinfo">
            <dl className="info">
              <div><dt>사용 장소</dt><dd>{st.name}<small>{st.addr}</small></dd></div>
              <div><dt>받은 날</dt><dd>{ymdDot(c.issuedAt)}</dd></div>
              {c.usedAt && <div><dt>사용한 날</dt><dd>{ymdDot(c.usedAt)} {hm(c.usedAt)}</dd></div>}
              {order
                ? <div><dt>결제</dt><dd className="num">{won(order.amount)} · {order.status}<small className="mono">{order.id}</small></dd></div>
                : <div><dt>결제</dt><dd>무료 쿠폰</dd></div>}
              <div><dt>사용 제한</dt><dd>{p.restr || '없어요'}</dd></div>
            </dl>
          </div>
          <div className="cinfo">
            <h3 className={s.infoTitle}>유의사항</h3>
            <ul className="notes">{p.notes.map(n => <li key={n}>{n}</li>)}<li>매장에서 바코드나 PIN을 보여 주면 직원이 확인해요.</li></ul>
          </div>
          {canRefund && <button type="button" className="sbtn warn" onClick={openRefund}><Icon name="refund" size={16} /> 환불 요청</button>}
          {canCancelFree && <button type="button" className="sbtn warn" onClick={() => setSheet('cancel')}><Icon name="x" size={16} /> 쿠폰 취소</button>}
          {cs.k === 'used' && <p className={s.usedNote}>{c.paid > 0 ? '사용한 쿠폰은 환불할 수 없어요.' : '사용한 쿠폰은 취소할 수 없어요.'}</p>}
        </div>
      </div>

      <Sheet open={sheet === 'refund'} onClose={() => setSheet(null)} label="환불 요청">
        <h3>환불을 요청할까요?</h3>
        <p className="sub">{p.name}</p>
        <div className="box">
          <div className="rows">
            <div><span className="k">환불 금액</span><span className={`num ${s.amt}`}>{won(c.paid)}</span></div>
            <div><span className="k">돌려받는 곳</span><span>결제한 수단</span></div>
          </div>
        </div>
        <div className="reasons" role="radiogroup" aria-label="환불 사유">
          {REASONS.map(r => <button key={r} type="button" role="radio" aria-checked={reason === r} className={reason === r ? 'on' : ''} onClick={() => setReason(r)}>{r}</button>)}
        </div>
        <p className={`sub ${s.fine}`}>환불하면 쿠폰은 바로 쓸 수 없게 돼요. 카드 취소는 카드사에 따라 3~5영업일 걸려요.</p>
        <button type="button" className="cta danger" onClick={refund}>환불 요청하기</button>
      </Sheet>

      <Sheet open={sheet === 'cancel'} onClose={() => setSheet(null)} label="쿠폰 취소">
        <h3>쿠폰을 취소할까요?</h3>
        <p className="sub">{p.name}</p>
        <div className="box">
          <div className="rows">
            <div><span className="k">돌려받는 금액</span><span>없어요 (무료 쿠폰)</span></div>
            <div><span className="k">취소 후</span><span>바로 쓸 수 없어요</span></div>
          </div>
        </div>
        <p className={`sub ${s.fine}`}>취소한 쿠폰은 되살릴 수 없어요. 혜택이 남아 있으면 다시 받을 수 있어요.</p>
        <button type="button" className="cta danger" onClick={cancelFree}>쿠폰 취소하기</button>
      </Sheet>
    </div>
  );
}
