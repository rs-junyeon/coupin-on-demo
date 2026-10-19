import { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { catShown, matchQ, visible } from '@/entities/product';
import { distTxt } from '@/entities/store';
import { storeOf, useDB } from '@/shared/api';
import { useOrigin } from '@/shared/lib';
import { CatIcon } from '@/ui/CatIcon';
import { Icon } from '@/shared/ui/icon';
import { ProductRow } from '../components/ProductRow';

/** 검색 (목업 mSearch): 검색어가 없으면 카테고리로 찾기, 있으면 상품 결과. 고르면 둘러보기 지도에 적용한다 */
export default function Search() {
  const db = useDB();
  const nav = useNavigate();
  const loc = useLocation();
  const [params] = useSearchParams();
  const [text, setText] = useState(params.get('q') ?? '');
  const origin = useOrigin(s => s.origin);
  const q = text.trim();

  const apply = (o: { q?: string; cat?: string }) => {
    const p = new URLSearchParams();
    if (o.q) p.set('q', o.q);
    if (o.cat && o.cat !== '전체') p.set('cat', o.cat);
    nav(`/${p.toString() ? `?${p}` : ''}`, { replace: true });
  };
  const applyQ = () => { if (q) apply({ q, cat: params.get('cat') ?? undefined }); };
  const close = () => (loc.key !== 'default' ? nav(-1) : nav('/'));
  const res = q ? db.products.filter(p => visible(db, p) && matchQ(db, p, q)) : [];

  return (
    <div className="c-page">
      <header className="bar">
        <button type="button" className="ib" onClick={close} aria-label="닫기"><Icon name="x" size={22} /></button>
        <h1 className="sr-only">검색</h1>
        <form className="sbox" role="search" onSubmit={e => { e.preventDefault(); applyQ(); }}>
          <Icon name="search" size={18} />
          <input type="search" enterKeyHint="search" placeholder="가게나 상품 이름으로 찾기" value={text} onChange={e => setText(e.target.value)}
            autoComplete="off" aria-label="검색어" autoFocus />
        </form>
      </header>
      <div className="scroll">
        <div className="sbody">
          {!q ? (
            <div>
              <h3>카테고리로 찾기</h3>
              <div className="cats">
                {Object.keys(db.cats).filter(k => catShown(db, k)).map(c => (
                  <button key={c} type="button" onClick={() => apply({ cat: c })}><CatIcon cat={c} size={18} />{c}</button>
                ))}
              </div>
            </div>
          ) : !res.length ? (
            <div className="empty"><b>'{q}'에 맞는 혜택이 없어요</b><span>가게 이름이나 상품 이름으로 찾아보세요.</span></div>
          ) : (
            <>
              <div className="sres">
                {res.map(p => { const s = storeOf(db, p.sid); return <ProductRow key={p.id} p={p} icon sub={`${s.name} · ${distTxt(s, origin)}`} />; })}
              </div>
              <div className="sfoot">
                <button type="button" className="cta dark" onClick={applyQ}><Icon name="map" size={18} />'{q}' 지도에서 보기</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
