import type { CSSProperties } from 'react';
import { CustomOverlayMap } from 'react-kakao-maps-sdk';
import { catOf } from '@/entities/category';
import { isFree, type ListFilter } from '@/entities/product';
import { storeProducts } from '@/entities/store';
import { won } from '@/shared/lib';
import { type Store, useDB } from '@/shared/api';
import { Icon } from '@/shared/ui/icon';
import styles from './StoreMap.module.css';

/** 가게 핀 (목업 .pin): 대표 상품 카테고리 색, 무료·쿠폰 수 태그. 고르면 대표 상품 가격을 보여 준다 */
export function StorePin({ store, f, sel, onClick }: { store: Store; f: ListFilter; sel: boolean; onClick: () => void }) {
  const db = useDB();
  const ps = storeProducts(db, store.id, f);
  if (!store.pos || !ps.length) return null;
  const rep = ps[0], k = catOf(db, rep.cat);
  return (
    <CustomOverlayMap position={store.pos} xAnchor={0.5} yAnchor={0} zIndex={sel ? 4 : 2} clickable>
      <button type="button" className={`${styles.pin} ${sel ? styles.on : ''}`} style={{ '--c': k.color } as CSSProperties}
        onClick={onClick} aria-label={store.name} aria-pressed={sel}>
        <span className={styles.head}><Icon name={k.icon} size={17} /></span>
        <span className={styles.tags}>
          {sel
            ? <i className={styles.price}>{isFree(rep) ? '무료' : won(rep.price)}</i>
            : <>{ps.some(isFree) && <i className={styles.free}>무료</i>}{ps.length >= 2 && <i>쿠폰 {ps.length}</i>}</>}
        </span>
      </button>
    </CustomOverlayMap>
  );
}
