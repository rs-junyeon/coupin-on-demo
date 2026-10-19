import { useNavigate, useParams } from 'react-router-dom';
import { isFree, ME, prodOf, storeOf } from '@/domain/rules';
import { md, won } from '@/shared/lib';
import { useDB } from '@/shared/api';
import { CatIcon } from '@/ui/CatIcon';
import { Icon } from '@/shared/ui/icon';
import { TopBar } from '@/shared/ui/mobile';
import s from './purchase.module.css';

/** 발급·구매 완료 (C-03-04) */
export default function Complete() {
  const { cid = '' } = useParams();
  const nav = useNavigate();
  const db = useDB();
  const c = db.coupons.find(x => x.id === cid && x.owner === ME);
  const home = () => nav('/', { replace: true });

  if (!c) return <div className="c-page"><TopBar title="쿠폰" close onBack={home} /><div className="scroll"><div className="empty"><b>쿠폰을 찾을 수 없어요</b></div></div></div>;

  const p = prodOf(db, c.pid), st = storeOf(db, p.sid), free = isFree(p);
  // 내 쿠폰 탭(사용 가능)을 아래에 두고 쿠폰 화면을 연다. 뒤로 가면 내 쿠폰으로
  const toCoupon = () => { nav('/wallet?tab=active', { replace: true }); nav(`/coupons/${c.id}`); };

  return (
    <div className="c-page">
      <TopBar title={free ? '발급 완료' : '구매 완료'} close onBack={home} />
      <div className="scroll">
        <div className="done">
          <div className="done-ic"><Icon name="check" size={36} stroke={2.6} /></div>
          <h2>{free ? '쿠폰을 받았어요' : '구매가 끝났어요'}</h2>
          <p>내 쿠폰에서 바로 꺼내 쓸 수 있어요.</p>
          <div className="box">
            <div className="osum"><CatIcon cat={p.cat} size={24} /><div><b>{p.name}</b><span>{st.name} · {md(c.exp)}까지</span></div></div>
            {!free && (
              <div className={`rows ${s.rowsGap}`}>
                <div><span className="k">주문번호</span><span className={`mono ${s.oid}`}>{c.oid}</span></div>
                <div><span className="k">결제 금액</span><span className="num">{won(c.paid)}</span></div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="cta-bar">
        <button type="button" className="cta dark" onClick={toCoupon}>내 쿠폰에서 보기</button>
        <button type="button" className="cta line" onClick={home}>계속 둘러보기</button>
      </div>
    </div>
  );
}
