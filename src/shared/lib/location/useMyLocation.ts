import { useCallback, useState } from 'react';
import { SEONGSU, withinKm } from '../geo';
import type { LatLng } from '@/shared/api';

const TIMEOUT_MS = 8000;

export type LocateResult = { kind: 'ok'; origin: LatLng } | { kind: 'far' | 'denied' };

export function useMyLocation() {
  const [busy, setBusy] = useState(false);
  const locate = useCallback(() => new Promise<LocateResult>(resolve => {
    const geo = typeof navigator !== 'undefined' ? navigator.geolocation : undefined;
    if (!geo) { resolve({ kind: 'denied' }); return; }
    setBusy(true);
    let settled = false;
    const finish = (r: LocateResult) => { if (settled) return; settled = true; clearTimeout(timer); setBusy(false); resolve(r); };
    // 브라우저 timeout은 권한을 허용한 뒤부터 세므로, 권한 창에 응답이 없을 때를 직접 끊는다
    const timer = setTimeout(() => finish({ kind: 'denied' }), TIMEOUT_MS);
    geo.getCurrentPosition(
      pos => {
        const origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        finish(withinKm(SEONGSU, origin, 5) ? { kind: 'ok', origin } : { kind: 'far' });
      },
      () => finish({ kind: 'denied' }),
      { timeout: TIMEOUT_MS, maximumAge: 60000 },
    );
  }), []);
  return { locate, busy };
}
