import { useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { isFree } from '@/entities/product';
import { won } from '@/shared/lib';
import { useDB } from '@/shared/api';
import { issue, PAY_METHODS, type PayMethod } from '@/features/issue-coupon';
import { purchaseCss as s, runBusy, useUi } from '@/shared/ui/mobile';
import { Icon } from '@/shared/ui/icon';

/** PG 결제창 (C-03-02-01). 쿠핀 ON이 아니라 결제사가 띄우는 화면이라 다른 모양(.ext)으로 보여 준다 */
export default function PgPay() {
  const { pid = '' } = useParams();
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const p = useDB(d => d.products.find(x => x.id === pid));
  const [paying, setPaying] = useState(false);
  const m = sp.get('m');
  const method: PayMethod = m && m in PAY_METHODS ? (m as PayMethod) : 'easy';

  if (!p || isFree(p)) return <Navigate to={p ? `/products/${pid}` : '/'} replace />;

  const pay = async () => {
    setPaying(true);
    const r = await runBusy(['결제를 확인하고 있어요', '쿠폰을 발급하고 있어요'], () => issue(pid, method));
    if (r.ok) nav(`/complete/${r.cid}`, { replace: true });
    else nav(`/fail/${pid}?reason=${encodeURIComponent(r.error)}`, { replace: true });
  };
  const cancel = () => {
    nav(`/checkout/${pid}?m=${method}`, { replace: true, state: { agreed: true } });
    useUi.getState().showToast('결제를 취소했어요');
  };

  return (
    <div className="c-page">
      {/* 처리 중 화면이 결제창 아래에 깔리지 않게, 결제를 누르면 결제창을 닫는다 */}
      {!paying && (
        <div className="ext" role="dialog" aria-label="결제사 결제창">
          <div className="ext-bar">결제사 결제창</div>
          <div className="ext-card">
            <span className="s">쿠핀 ON 주문</span>
            <b className={s.pgName}>{p.name}</b>
            <div className="rows">
              <div><span className="k">결제 금액</span><b className="num">{won(p.price)}</b></div>
              <div><span className="k">결제 수단</span><span>{PAY_METHODS[method]}</span></div>
            </div>
            <button type="button" className="cta dark" onClick={pay}><Icon name="card" size={18} />결제하기</button>
            <button type="button" className="cta line" onClick={cancel}>취소</button>
          </div>
        </div>
      )}
    </div>
  );
}
