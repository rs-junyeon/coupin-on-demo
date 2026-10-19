import { useNavigate, useParams } from 'react-router-dom';
import { blockReason, catName, distTxt, isFree, pct, storeOf, validityTxt } from '../../domain/rules';
import { won } from '../../domain/time';
import { useDB } from '../../store/db';
import { runBusy, useUi } from '../../store/ui';
import { Icon } from '../../ui/Icon';
import { photo } from '../../ui/photos';
import { StoreActions } from '../components/StoreCard';
import { TopBar } from '../components/TopBar';
import styles from './Detail.module.css';
import NotFound from './NotFound';

/** 상품 상세 (목업 mDetail): 가격·유효기간·사용 장소·유의사항, 아래 [무료로 받기]·[구매하기]. 받을 수 없으면 이유를 보여 준다 */
export default function ProductDetail() {
  const { pid } = useParams();
  const nav = useNavigate();
  const db = useDB();
  const origin = useUi(s => s.origin);
  const p = db.products.find(x => x.id === pid);
  if (!p) return <NotFound />;
  const s = storeOf(db, p.sid), v = validityTxt(p), why = blockReason(db, p), free = isFree(p);
  const useFor = 'until' in p.val ? `${v.main} 쓸 수 있어요` : `${v.main} 동안 쓸 수 있어요`;

  const claim = async () => {
    if (!db.account.logged) { nav(`/login?next=${encodeURIComponent(`/products/${p.id}`)}`); return; }
    if (!free) { nav(`/checkout/${p.id}`); return; }
    const r = await runBusy(['쿠폰을 발급하고 있어요'], () => useDB.getState().issue(p.id));
    if (r.ok) nav(`/complete/${r.cid}`);
    else useUi.getState().showToast(r.error);
  };

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
