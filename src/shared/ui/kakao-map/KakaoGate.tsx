import { useEffect, type ReactNode } from 'react';
import { useKakaoLoader } from 'react-kakao-maps-sdk';
import styles from './KakaoGate.module.css';
import { useMapStatus, type MapStatus } from './status';

/** 앱에 한 번만 둔다. SDK 로딩 결과를 useMapStatus에 기록 */
export function KakaoLoader() {
  const key = import.meta.env.VITE_KAKAO_JS_KEY ?? '';
  const set = useMapStatus(s => s.set);
  useEffect(() => { if (!key) set('missing'); }, [key, set]);
  return key ? <Load appkey={key} /> : null;
}

function Load({ appkey }: { appkey: string }) {
  const [loading, error] = useKakaoLoader({ appkey, libraries: ['services'] });
  const set = useMapStatus(s => s.set);
  useEffect(() => { set(error ? 'error' : loading ? 'loading' : 'ready'); }, [loading, error, set]);
  return null;
}

export const useKakaoReady = (): MapStatus => useMapStatus(s => s.status);

const MESSAGE: Record<Exclude<MapStatus, 'ready'>, { title: string; hint?: string }> = {
  missing: { title: '카카오 JavaScript 키를 .env의 VITE_KAKAO_JS_KEY에 넣어 주세요', hint: '카카오 디벨로퍼스에서 Web 사이트 도메인으로 http://localhost:5173 을 등록해야 지도가 떠요.' },
  error: { title: '지도를 불러오지 못했어요. 키와 등록 도메인(http://localhost:5173)을 확인해 주세요', hint: '카카오 디벨로퍼스에서 카카오맵 사용 설정이 켜져 있는지도 확인해 주세요.' },
  loading: { title: '지도를 불러오고 있어요' },
};

/** 지도 자리만 감싼다. 준비되지 않았으면 안내 카드를 보여 준다 */
export function KakaoGate({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  const status = useKakaoReady();
  if (status === 'ready') return <>{children}</>;
  const m = MESSAGE[status];
  return (
    <div className={`${styles.card} ${compact ? styles.compact : ''}`} role="status">
      <b>{m.title}</b>
      {m.hint && <span>{m.hint}</span>}
    </div>
  );
}
