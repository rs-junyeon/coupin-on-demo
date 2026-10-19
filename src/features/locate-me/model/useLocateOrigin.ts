import { useCallback } from 'react';
import type { LatLng } from '@/shared/api';
import { SEONGSU, useMyLocation, useOrigin } from '@/shared/lib';
import { useUi } from '@/shared/ui/mobile';

/** [내 위치]: 실제 위치를 받아 거리 기준점으로 쓴다. 실패하거나 성수동 밖이면 성수역 기준. 새 기준점을 돌려준다 */
export function useLocateOrigin() {
  const { locate, busy } = useMyLocation();
  const run = useCallback(async (): Promise<LatLng> => {
    const r = await locate();
    const { setOrigin } = useOrigin.getState(), { showToast } = useUi.getState();
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
