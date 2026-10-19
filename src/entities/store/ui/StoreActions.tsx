import type { Store } from '@/shared/api';
import { Icon } from '@/shared/ui/icon';

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
