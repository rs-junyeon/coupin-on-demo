import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { isFree } from '@/entities/product';
import { won } from '@/shared/lib';
import { useDB } from '@/shared/api';
import { runBusy, TopBar } from '@/shared/ui/mobile';
import { Icon } from '@/shared/ui/icon';
import { issue } from '@/features/issue-coupon';

/** 받기·결제 실패 (C-03-05). 유료는 결제를 자동으로 취소했다고 알린다 */
export default function Fail() {
  const { pid = '' } = useParams();
  const [sp] = useSearchParams();
  const loc = useLocation();
  const nav = useNavigate();
  const p = useDB(d => d.products.find(x => x.id === pid));
  const reason = sp.get('reason') || '지금은 이 쿠폰을 발급할 수 없어요';
  // 실패 화면은 결제·받기 화면 자리에 열린다. 닫으면 그 앞 화면(상품 상세)으로
  const close = () => (loc.key !== 'default' ? nav(-1) : nav(p ? `/products/${pid}` : '/', { replace: true }));

  if (!p) return <div className="c-page"><TopBar title="결과" close onBack={close} /><div className="scroll"><div className="empty"><b>상품을 찾을 수 없어요</b></div></div></div>;

  const free = isFree(p);
  // 무료는 바로 다시 받고, 유료는 결제 화면부터 다시
  const retry = async () => {
    if (!free) { nav(`/checkout/${pid}`, { replace: true }); return; }
    const r = await runBusy(['쿠폰을 발급하고 있어요'], () => issue(pid));
    if (r.ok) nav(`/complete/${r.cid}`, { replace: true });
    else nav(`/fail/${pid}?reason=${encodeURIComponent(r.error)}`, { replace: true });
  };

  return (
    <div className="c-page">
      <TopBar title={free ? '발급 결과' : '결제 결과'} close onBack={close} />
      <div className="scroll">
        <div className="done">
          <div className="done-ic fail"><Icon name="x" size={32} /></div>
          {free ? (
            <><h2>쿠폰을 받지 못했어요</h2><p>다시 시도하거나 다른 혜택을 둘러보세요.</p></>
          ) : (
            <><h2>쿠폰을 발급하지 못했어요</h2><p>결제한 {won(p.price)}은 자동으로 취소했어요.<br />카드사에 따라 3~5영업일 걸려요.</p></>
          )}
          <div className="box">
            <div className="rows">
              <div><span className="k">상품</span><span>{p.name}</span></div>
              {!free && <div><span className="k">상태</span><span className="st-chip st-cancel">결제 취소됨</span></div>}
              <div><span className="k">사유</span><span>{reason}</span></div>
            </div>
          </div>
        </div>
      </div>
      <div className="cta-bar">
        <button type="button" className="cta primary" onClick={retry}>다시 시도</button>
        <button type="button" className="cta line" onClick={close}>닫기</button>
      </div>
    </div>
  );
}
