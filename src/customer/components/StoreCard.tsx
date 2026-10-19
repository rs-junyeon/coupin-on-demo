import { Link } from 'react-router-dom';
import { catName, distTxt, storeCat, storeProducts, type ListFilter } from '@/domain/rules';
import { type Store, useDB } from '@/shared/api';
import { useOrigin } from '@/shared/lib';
import { CatIcon } from '@/ui/CatIcon';
import { Icon } from '@/shared/ui/icon';
import { ProductRow } from './ProductRow';

/** 가게 카드 (목업 storeCard): 대표 상품 한 줄, [더보기]로 나머지 상품, [가게 정보]로 매장 상세 */
export function StoreCard({ store, f, full, onMore, onClose }: { store: Store; f: ListFilter; full: boolean; onMore: () => void; onClose?: () => void }) {
  const db = useDB();
  const origin = useOrigin(s => s.origin);
  const ps = storeProducts(db, store.id, f);
  if (!ps.length) return null;
  const cat = storeCat(db, store.id), rest = ps.slice(1);
  return (
    <div className="store">
      <div className="store-h">
        <CatIcon cat={cat} />
        <div><b>{store.name}</b><span>{catName(db, cat)} · {distTxt(store, origin)} · 쿠폰 {ps.length}</span></div>
        {onClose ? <button type="button" className="ib" onClick={onClose} aria-label="닫기"><Icon name="x" size={18} /></button> : <span />}
      </div>
      <ProductRow p={ps[0]} rep />
      {full && rest.map(p => <ProductRow key={p.id} p={p} />)}
      {rest.length > 0 && (
        <button type="button" className="more" onClick={onMore} aria-expanded={full}>
          {full ? <>접기<Icon name="up" size={16} /></> : <>쿠폰 {rest.length}개 더보기<Icon name="down" size={16} /></>}
        </button>
      )}
      <Link to={`/stores/${store.id}`} className="sbtn line">가게 정보<Icon name="chev" size={16} /></Link>
    </div>
  );
}

/** 매장 상세·상품 상세의 [길찾기](카카오맵 길찾기)·[전화](tel:) */
export function StoreActions({ store }: { store: Store }) {
  return (
    <div className="dacts">
      {store.pos && (
        <a className="sbtn line" href={`https://map.kakao.com/link/to/${encodeURIComponent(store.name)},${store.pos.lat},${store.pos.lng}`} target="_blank" rel="noopener noreferrer">
          <Icon name="place" size={16} />길찾기
        </a>
      )}
      <a className="sbtn line" href={`tel:${store.phone.replace(/[^\d+]/g, '')}`}><Icon name="phone" size={16} />전화</a>
    </div>
  );
}
