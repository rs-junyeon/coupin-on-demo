// 거리 기준점 (저장하지 않음). 위치 권한이 없거나 성수동 밖이면 성수역
import { create } from 'zustand';
import type { LatLng } from '@/shared/api';
import { SEONGSU } from '../geo';

type Origin = {
  origin: LatLng;
  originAt: string | null;
  originReal: boolean;
  setOrigin(o: LatLng, real: boolean): void;
};
export const useOrigin = create<Origin>()(set => ({
  origin: SEONGSU, originAt: null, originReal: false,
  setOrigin: (origin, originReal) => set({ origin, originReal, originAt: new Date().toISOString() }),
}));
