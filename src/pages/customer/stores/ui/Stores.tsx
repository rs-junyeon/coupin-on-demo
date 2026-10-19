import type { CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { catName } from '@/entities/category';
import { catShown, isFree, type ListFilter, pct } from '@/entities/product';
import { distTxt, storeCat, storeProducts, tabStores } from '@/entities/store';
import { hm, useOrigin, won } from '@/shared/lib';
import { photo, type Store, useDB } from '@/shared/api';
import { TopBar } from '@/shared/ui/mobile';
import { Icon } from '@/shared/ui/icon';
import styles from './Stores.module.css';
import { useLocateOrigin } from '@/features/locate-me';

/** 매장 탭 (목업 baseStores): 카테고리 칩과 검색으로 거르고, 가까운 순으로 가게 목록. 누르면 매장 상세 */
export default function Stores() {
  const db = useDB();
  const [params, setParams] = useSearchParams();
  const f: ListFilter = { cat: params.get('cat') || '전체', q: params.get('q') ?? '' };
  const origin = useOrigin(s => s.origin), originReal = useOrigin(s => s.originReal), originAt = useOrigin(s => s.originAt);
  const { run, busy } = useLocateOrigin();
  const list = tabStores(db, f, origin);
  const filtered = f.cat !== '전체' || f.q.trim() !== '';

  const setFilter = (next: Partial<ListFilter>) => {
    const n = { ...f, ...next }, p = new URLSearchParams();
    if (n.q) p.set('q', n.q);
    if (n.cat !== '전체') p.set('cat', n.cat);
    setParams(p, { replace: true });
  };
  const chips = ['전체', ...Object.keys(db.cats).filter(k => catShown(db, k) || k === f.cat)];

  return (
    <div className="c-page">
      <TopBar big title="매장" />
      <div className="st-top">
        <form className="sbox" role="search" onSubmit={e => e.preventDefault()}>
          <Icon name="search" size={18} />
          <input type="search" enterKeyHint="search" placeholder="가게나 상품 이름으로 찾기" value={f.q} onChange={e => setFilter({ q: e.target.value })}
            autoComplete="off" aria-label="매장 검색어" />
        </form>
        <div className="chips">
          {chips.map(c => (
            <button key={c} type="button" className={`chip ${f.cat === c ? 'on' : ''}`} onClick={() => setFilter({ cat: c })} aria-pressed={f.cat === c}>
              {c !== '전체' && db.cats[c] && <span className="dot" style={{ '--c': db.cats[c].color } as CSSProperties} />}{c}
            </button>
          ))}
        </div>
      </div>
      <div className="scroll">
        <div className="list-wrap">
          {list.length ? (
            <>
              <div className="list-meta">
                <span>가게 {list.length}곳 · {originReal && originAt ? `${hm(originAt)}에 확인한 위치` : '성수역'}에서 가까운 순</span>
                <button type="button" className={styles.relocate} onClick={() => run()} disabled={busy}><Icon name="locate" size={14} />{busy ? '확인 중' : '다시 찾기'}</button>
              </div>
              {list.map(s => <StoreRow key={s.id} s={s} f={f} />)}
            </>
          ) : (
            <div className="empty">
              {filtered
                ? <><b>조건에 맞는 매장이 없어요</b><span>다른 카테고리를 고르거나 검색어를 바꿔 보세요.</span><button type="button" className="sbtn" onClick={() => setFilter({ cat: '전체', q: '' })}>조건 지우기</button></>
                : <><b>이 지역에는 혜택이 없어요</b><span>다른 지역의 혜택도 둘러보세요.</span></>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** 가게 한 줄 (목업 storeRow): 사진, 이름, 카테고리·거리·쿠폰 수, 소개, 조건에 맞는 대표 혜택 */
function StoreRow({ s, f }: { s: Store; f: ListFilter }) {
  const db = useDB();
  const origin = useOrigin(x => x.origin);
  const ps = storeProducts(db, s.id), q = f.q.trim();
  const best = ps.find(p => (f.cat === '전체' || p.cat === f.cat) && (!q || p.name.includes(q) || s.name.includes(q))) || ps[0];
  return (
    <Link to={`/stores/${s.id}`} className="scard">
      <img className="thumb" src={photo(s.id)} alt="" width={76} height={76} loading="lazy" decoding="async" />
      <span>
        <b>{s.name}</b>
        <span className="meta">{catName(db, storeCat(db, s.id))} · {distTxt(s, origin)} · 쿠폰 {ps.length}</span>
        <span className="intro">{s.intro}</span>
        <span className="best">
          {isFree(best) ? <span className="free">무료</span> : <><span className="pct">{pct(best)}%</span><b className="num">{won(best.price)}</b></>}
          <span className={styles.bestName}>{best.name}</span>
          {!isFree(best) && ps.some(isFree) && <span className="tag free">무료 쿠폰</span>}
        </span>
      </span>
    </Link>
  );
}
