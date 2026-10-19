import { useEffect, useState } from 'react';
import { CustomOverlayMap, Map as KakaoMap } from 'react-kakao-maps-sdk';
import { type ListFilter } from '@/entities/product';
import type { Bounds, LatLng, Store } from '@/shared/api';
import styles from './StoreMap.module.css';
import { StorePin } from './StorePin';

type Props = {
  stores: Store[];
  f: ListFilter;
  sel: string | null;
  onPin: (sid: string) => void;
  origin: LatLng;
  originReal: boolean;
  /** 새 값이 오면 pos로 지도를 옮긴다 (내 위치 다시 찾기) */
  focus: { pos: LatLng };
  /** 사용자가 지도를 끌거나 확대·축소해 보이는 범위가 바뀌었을 때 */
  onMoved: (b: Bounds) => void;
};

const boundsOf = (m: kakao.maps.Map): Bounds => {
  const b = m.getBounds(), sw = b.getSouthWest(), ne = b.getNorthEast();
  return { sw: { lat: sw.getLat(), lng: sw.getLng() }, ne: { lat: ne.getLat(), lng: ne.getLng() } };
};

/** 둘러보기 지도: 가게 핀, 선택 핀 강조, 내 위치 점. KakaoGate 안에서만 그린다 */
export function StoreMap({ stores, f, sel, onPin, origin, originReal, focus, onMoved }: Props) {
  const [map, setMap] = useState<kakao.maps.Map | null>(null);
  const [center] = useState(focus.pos);
  useEffect(() => { map?.panTo(new kakao.maps.LatLng(focus.pos.lat, focus.pos.lng)); }, [map, focus]);
  const moved = (m: kakao.maps.Map) => onMoved(boundsOf(m));
  return (
    <KakaoMap center={center} level={5} className={styles.canvas} onCreate={setMap} onDragEnd={moved} onZoomChanged={moved}>
      <CustomOverlayMap position={origin} xAnchor={0.5} yAnchor={0} zIndex={1}>
        <div className={styles.origin}><span className={styles.dot} /><span className={styles.olabel}>{originReal ? '내 위치' : '기준점'}</span></div>
      </CustomOverlayMap>
      {stores.map(s => <StorePin key={s.id} store={s} f={f} sel={sel === s.id} onClick={() => onPin(s.id)} />)}
    </KakaoMap>
  );
}
