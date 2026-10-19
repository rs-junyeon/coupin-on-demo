import { useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { blockReason, isFree, validityTxt } from '@/entities/product';
import { PAY_METHODS, type PayMethod, storeOf, useDB } from '@/shared/api';
import { won } from '@/shared/lib';
import { CatIcon } from '@/ui/CatIcon';
import { TopBar } from '@/shared/ui/mobile';
import s from './purchase.module.css';

const payMethodOf = (m: string | null): PayMethod => (m && m in PAY_METHODS ? (m as PayMethod) : 'easy');

/** 결제하기 (C-03-02): 주문 요약 · 결제 금액 · 결제 수단 · 구매 조건 동의 → PG 결제창 */
export default function Checkout() {
  const { pid = '' } = useParams();
  const [sp] = useSearchParams();
  const loc = useLocation();
  const nav = useNavigate();
  const db = useDB();
  const [method, setMethod] = useState<PayMethod>(payMethodOf(sp.get('m')));
  // PG 결제창에서 취소하고 돌아오면 동의한 상태를 그대로 둔다
  const [agree, setAgree] = useState(!!(loc.state as { agreed?: boolean } | null)?.agreed);
  const p = db.products.find(x => x.id === pid);

  if (!p) return <div className="c-page"><TopBar title="결제하기" /><div className="scroll"><div className="empty"><b>상품을 찾을 수 없어요</b></div></div></div>;
  if (isFree(p)) return <Navigate to={`/products/${pid}`} replace />;

  const st = storeOf(db, p.sid);
  const why = blockReason(db, p);
  const list = p.list ?? p.price;
  // PG 결제창은 결제 화면 자리에 띄운다 (결제창에서 취소하면 다시 이 화면으로)
  const pay = () => nav(`/pay/${pid}?m=${method}`, { replace: true });

  return (
    <div className="c-page">
      <TopBar title="결제하기" />
      <div className="scroll">
        <div className="ck">
          <div className="box">
            <div className="osum"><CatIcon cat={p.cat} size={24} /><div><b>{p.name}</b><span>{st.name} · {validityTxt(p).main}</span></div></div>
          </div>
          <div className="box">
            <h3>결제 금액</h3>
            <div className="rows">
              <div><span className="k">소비자가</span><span className="num">{won(list)}</span></div>
              <div><span className="k">쿠핀 ON 할인</span><span className="num disc">-{won(list - p.price)}</span></div>
              <div className="tot"><span>결제할 금액</span><span className="num">{won(p.price)}</span></div>
            </div>
          </div>
          <div className="box">
            <h3>결제 수단</h3>
            <div className="pay" role="radiogroup" aria-label="결제 수단">
              {(Object.keys(PAY_METHODS) as PayMethod[]).map(k => (
                <label key={k} className={method === k ? 'on' : ''}>
                  <input type="radio" name="pay" value={k} checked={method === k} onChange={() => setMethod(k)} />{PAY_METHODS[k]}
                </label>
              ))}
            </div>
          </div>
          <label className="agree">
            <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
            <span>구매 조건과 환불 규정을 확인했어요 (필수)<small className={s.agreeNote}>쓰지 않은 쿠폰은 유효기간 안에 환불을 요청할 수 있어요.</small></span>
          </label>
        </div>
      </div>
      <div className="cta-bar">
        {why && <div className="cta-why" role="alert">{why}</div>}
        <button type="button" className="cta buy" disabled={!agree || !!why} onClick={pay}><span className="num">{won(p.price)}</span> 결제하기</button>
      </div>
    </div>
  );
}
