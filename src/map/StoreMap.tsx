import { useCallback, useEffect, useState } from 'react';
import { CustomOverlayMap, Map as KakaoMap } from 'react-kakao-maps-sdk';
import { SEONGSU } from '../domain/geo';
import type { ListFilter } from '../domain/rules';
import type { Bounds, LatLng, Store } from '../domain/types';
import { useUi } from '../store/ui';
import styles from './StoreMap.module.css';
import { StorePin } from './StorePin';
import { useMyLocation } from './useMyLocation';

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

/** [내 위치]: 실제 위치를 받아 거리 기준점으로 쓴다. 실패하거나 성수동 밖이면 성수역 기준. 새 기준점을 돌려준다 */
export function useLocateOrigin() {
  const { locate, busy } = useMyLocation();
  const run = useCallback(async (): Promise<LatLng> => {
    const r = await locate();
    const { setOrigin, showToast } = useUi.getState();
    if (r.kind === 'ok') {
      setOrigin(r.origin, true);
      showToast('지금 있는 곳 근처 가게로 다시 찾았어요');
      return r.origin;
    }
    setOrigin(SEONGSU, false);
    showToast('위치를 가져오지 못해 성수역 기준으로 보여 드려요');
    return SEONGSU;
  }, [locate]);
  return { run, busy };
}
