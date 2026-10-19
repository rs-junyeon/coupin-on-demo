import { useRef, useState, type CSSProperties } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { hm, inBounds, useOrigin } from '@/shared/lib';
import { catShown, filterOn, type ListFilter } from '@/entities/product';
import { shownStores } from '@/entities/store';
import { type Bounds, type Store, useDB } from '@/shared/api';
import { KakaoGate, useKakaoReady } from '@/shared/ui/kakao-map';
import { StoreMap } from '@/map/StoreMap';
import { Icon } from '@/shared/ui/icon';
import { StoreCard } from '../components/StoreCard';
import styles from './Home.module.css';
import { useLocateOrigin } from '@/features/locate-me';

/** 둘러보기 탭 (목업 baseHome): 지도에 가게 핀, 핀을 누르면 아래 가게 시트. 지도를 쓸 수 없으면 가까운 가게 목록 */
export default function Home() {
  const db = useDB();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const f: ListFilter = { cat: params.get('cat') || '전체', q: params.get('q') ?? '' };
  const origin = useOrigin(s => s.origin), originReal = useOrigin(s => s.originReal), originAt = useOrigin(s => s.originAt);
  const ready = useKakaoReady() === 'ready';
  const { run, busy } = useLocateOrigin();

  const [sel, setSel] = useState<string | null>(null);
  const [full, setFull] = useState(false);
  /** 지도를 옮긴 뒤 아직 적용하지 않은 범위 / [이 지역에서 다시 찾기]로 적용한 범위 */
  const [moved, setMoved] = useState<Bounds | null>(null);
  const [area, setArea] = useState<Bounds | null>(null);
  const [focus, setFocus] = useState({ pos: origin });

  const all = shownStores(db, f, origin);
  const list = area ? all.filter(s => s.pos && inBounds(s.pos, area)) : all;
  const selStore = list.find(s => s.id === sel) ?? null;

  const setFilter = (next: Partial<ListFilter>) => {
    const n = { ...f, ...next }, p = new URLSearchParams();
    if (n.q) p.set('q', n.q);
    if (n.cat !== '전체') p.set('cat', n.cat);
    setParams(p, { replace: true });
    setSel(null); setFull(false);
  };
  const clearAll = () => { setFilter({ cat: '전체', q: '' }); setArea(null); setMoved(null); };
  const locateMe = async () => {
    const pos = await run();
    setArea(null); setMoved(null); setFocus({ pos });
  };
  const pin = (sid: string) => { setSel(sel === sid ? null : sid); setFull(false); };
  const searchArea = () => { setArea(moved); setMoved(null); setSel(null); setFull(false); };

  const chips = ['전체', ...Object.keys(db.cats).filter(k => catShown(db, k) || k === f.cat)];
  const top = (
    <div className={`home-top ${ready ? '' : styles.static}`}>
      <div className={styles.searchWrap}>
        <button type="button" className="search" onClick={() => nav(`/search${params.toString() ? `?${params}` : ''}`)}>
          <Icon name="search" size={18} /><span className={`t ${f.q ? 'has' : ''}`}>{f.q || '가게나 상품 이름으로 찾기'}</span>
        </button>
        {f.q && <button type="button" className={styles.clear} onClick={() => setFilter({ q: '' })} aria-label="검색어 지우기"><Icon name="x" size={16} /></button>}
      </div>
      <div className="chips">
        {chips.map(c => (
          <button key={c} type="button" className={`chip ${f.cat === c ? 'on' : ''}`} onClick={() => setFilter({ cat: c })} aria-pressed={f.cat === c}>
            {c !== '전체' && db.cats[c] && <span className="dot" style={{ '--c': db.cats[c].color } as CSSProperties} />}{c}
          </button>
        ))}
      </div>
      {ready && <span className="base-note">{originReal && originAt ? `${hm(originAt)}에 확인한 내 위치 기준` : '성수역 기준'}</span>}
      {ready && moved && <button type="button" className={styles.area} onClick={searchArea}><Icon name="locate" size={16} />이 지역에서 다시 찾기</button>}
      {ready && !moved && area && <button type="button" className={styles.area} onClick={() => setArea(null)}><Icon name="map" size={16} />전체 보기</button>}
    </div>
  );
  const empty = (Tag: 'p' | 'span') => filterOn(f)
    ? <><b>조건에 맞는 혜택이 없어요</b><Tag>다른 카테고리를 고르거나 검색어를 바꿔 보세요.</Tag><button type="button" className="sbtn" onClick={clearAll}>조건 지우기</button></>
    : <><b>이 지역에는 혜택이 없어요</b><Tag>다른 지역의 혜택도 둘러보세요.</Tag>{area && <button type="button" className="sbtn" onClick={() => setArea(null)}>전체 보기</button>}</>;

  if (!ready) {
    return (
      <div className="c-page">
        <div className="scroll">
          {top}
          <div className="list-wrap">
            <KakaoGate compact>{null}</KakaoGate>
            {list.length ? (
              <>
                <div className="list-meta"><span>가게 {list.length}곳 · {originReal && originAt ? `${hm(originAt)}에 확인한 위치` : '성수역'}에서 가까운 순</span></div>
                {list.map(s => <ListCard key={s.id} store={s} f={f} />)}
              </>
            ) : <div className="empty">{empty('span')}</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="c-page">
      <div className="map">
        <StoreMap stores={list} f={f} sel={selStore?.id ?? null} onPin={pin} origin={origin} originReal={originReal} focus={focus} onMoved={setMoved} />
        {top}
        {!list.length && <div className="map-empty">{empty('p')}</div>}
        {selStore
          ? <StoreSheet key={selStore.id} store={selStore} f={f} full={full} setFull={setFull} onClose={() => { setSel(null); setFull(false); }} />
          : (
            <button type="button" className={`fab locate ${styles.locate}`} onClick={locateMe} disabled={busy}>
              {busy ? <><span className="spin sm" />위치 확인 중</> : <><Icon name="locate" size={18} />내 위치</>}
            </button>
          )}
      </div>
    </div>
  );
}

/** 지도 가게 시트: 처음엔 절반 높이, [더보기]·손잡이(누르거나 위로 끌기)로 전체 높이. 아래로 끌면 줄이거나 닫는다 */
function StoreSheet({ store, f, full, setFull, onClose }: { store: Store; f: ListFilter; full: boolean; setFull: (v: boolean) => void; onClose: () => void }) {
  const drag = useRef<{ y: number; moved: boolean } | null>(null);
  return (
    <div className={`sheet-store enter ${full ? 'full' : ''}`} role="dialog" aria-label={`${store.name} 가게 정보`}>
      <button type="button" className="sheet-grab" aria-label={full ? '시트 줄이기' : '시트 펼치기'}
        onPointerDown={e => { drag.current = { y: e.clientY, moved: false }; e.currentTarget.setPointerCapture?.(e.pointerId); }}
        onPointerUp={e => {
          const d = drag.current; if (!d) return;
          const dy = e.clientY - d.y;
          if (Math.abs(dy) < 24) return;
          d.moved = true;
          if (dy < 0) setFull(true); else if (full) setFull(false); else onClose();
        }}
        onClick={() => { const d = drag.current; drag.current = null; if (!d?.moved) setFull(!full); }}>
        <span className="grabber" />
        {!full && <div className="sheet-hint">위로 끌어 펼치기</div>}
      </button>
      <div className="sheet-body"><StoreCard store={store} f={f} full={full} onMore={() => setFull(!full)} onClose={onClose} /></div>
    </div>
  );
}

/** 지도를 쓸 수 없을 때 목록의 가게 카드. 카드마다 [더보기]를 따로 연다 */
function ListCard({ store, f }: { store: Store; f: ListFilter }) {
  const [full, setFull] = useState(false);
  return <div className={styles.card}><StoreCard store={store} f={f} full={full} onMore={() => setFull(!full)} /></div>;
}
