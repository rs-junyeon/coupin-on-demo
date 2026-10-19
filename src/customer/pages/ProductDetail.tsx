import { useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { blockReason, isFree, pct, validityTxt } from '@/entities/product';
import { catName } from '@/entities/category';
import { distTxt, StoreActions } from '@/entities/store';
import { storeOf, useDB } from '@/shared/api';
import { useOrigin, won } from '@/shared/lib';
import { detailCss as styles, runBusy, TopBar, useUi } from '@/shared/ui/mobile';
import { Icon } from '@/shared/ui/icon';
import { photo } from '@/shared/assets';
import NotFound from './NotFound';

/** 상품 상세 (목업 mDetail): 가격·유효기간·사용 장소·유의사항, 아래 [무료로 받기]·[구매하기]. 받을 수 없으면 이유를 보여 준다 */
export default function ProductDetail() {
  const { pid } = useParams();
  const nav = useNavigate();
  const db = useDB();
  const origin = useOrigin(s => s.origin);
  const [sp, setSp] = useSearchParams();
  const p = db.products.find(x => x.id === pid);
  // 로그인하러 갔다가 돌아오면 하려던 무료 받기를 이어서 한다 (?claim=1, 한 번만)
  const resumed = useRef(false);
  const resume = sp.get('claim') === '1' && db.account.logged && !!p;
  useEffect(() => {
    if (!resume || resumed.current) return;
    resumed.current = true;
    setSp({}, { replace: true });
    void claimRef.current?.();
  }, [resume, setSp]);
  const claimRef = useRef<(() => Promise<void>) | null>(null);
  if (!p) return <NotFound />;
  const s = storeOf(db, p.sid), v = validityTxt(p), why = blockReason(db, p), free = isFree(p);
  const useFor = 'until' in p.val ? `${v.main} 쓸 수 있어요` : `${v.main} 동안 쓸 수 있어요`;

  const claim = async () => {
    // 로그인을 결제보다 먼저 끝낸다. 로그인하면 유료는 결제 화면으로, 무료는 이 화면에서 바로 받기를 이어 간다
    if (!db.account.logged) { nav(`/login?next=${encodeURIComponent(free ? `/products/${p.id}?claim=1` : `/checkout/${p.id}`)}`); return; }
    if (!free) { nav(`/checkout/${p.id}`); return; }
    const r = await runBusy(['쿠폰을 발급하고 있어요'], () => useDB.getState().issue(p.id));
    if (r.ok) nav(`/complete/${r.cid}`);
    else useUi.getState().showToast(r.error);
  };
  claimRef.current = claim;

  return (
    <div className="c-page">
      <TopBar close title={s.name} />
      <div className="scroll">
        <div className="hero"><img src={photo(p.id)} alt={`${p.name} 상품 이미지`} decoding="async" /></div>
        <div className="dsec">
          <div className="tags">
            <span className={`tag ${free ? 'free' : 'sale'}`}>{free ? '무료로 받기' : '구매'}</span>
            <span className="tag">{p.type}</span>
            <span className="tag">{catName(db, p.cat)}</span>
          </div>
          <h2>{p.name}</h2>
          <div className="st"><Icon name="place" size={15} />{s.name}{s.pos ? ` · ${distTxt(s, origin)}` : ''}</div>
          <div className="price">
            {free
              ? <>{p.list != null && <s>정가 {won(p.list)}</s>}<div className="row"><span className="free">무료</span></div></>
              : <>{p.list != null && <s>소비자가 {won(p.list)}</s>}<div className="row"><span className="pct">{pct(p)}%</span><span className="amt num">{won(p.price)}</span></div></>}
          </div>
        </div>
        <div className="dsec">
          <dl className="info">
            <div><dt>유효기간</dt><dd>{v.main}<small>{v.sub}</small></dd></div>
            <div><dt>쿠폰 유형</dt><dd>{p.type === '잔액권' ? `잔액권 · ${won(p.list ?? p.price)} 안에서 나눠 쓰기` : '교환권 · 한 번에 사용'}</dd></div>
            <div><dt>사용 장소</dt><dd>{s.name}<small>{s.addr}</small></dd></div>
            <div><dt>사용 제한</dt><dd>{p.restr || '없어요'}</dd></div>
          </dl>
          <StoreActions store={s} />
          {p.resv && <div className="callout"><Icon name="phone" size={16} /><span><b>예약이 필요해요.</b> {p.resv}</span></div>}
        </div>
        <div className={`dsec ${styles.last}`}>
          <h3>유의사항</h3>
          <ul className="notes">
            {p.notes.map(n => <li key={n}>{n}</li>)}
            <li>매장에서 바코드나 PIN을 보여 주면 직원이 확인해요.</li>
          </ul>
        </div>
      </div>
      <div className="cta-bar">
        {why ? (
          <><div className="cta-why">{why}</div><button type="button" className="cta" disabled>지금 받을 수 없어요</button></>
        ) : free ? (
          <><div className="cta-note">1인 1회 · {useFor}</div><button type="button" className="cta claim" onClick={claim}><Icon name="ticket" size={20} />무료로 받기</button></>
        ) : (
          <><div className="cta-note">{useFor}</div><button type="button" className="cta buy" onClick={claim}><span className="num">{won(p.price)}</span> 구매하기</button></>
        )}
      </div>
    </div>
  );
}
