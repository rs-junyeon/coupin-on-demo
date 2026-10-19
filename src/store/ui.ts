// 화면에만 쓰는 상태 (저장하지 않음): 고객 앱 토스트, 처리 중 화면, 내 위치
import { create } from 'zustand';
import { SEONGSU } from '../domain/geo';
import type { LatLng } from '../domain/types';

type Toast = { text: string; id: number; action?: { label: string; to: string } };
type Ui = {
  toast: Toast | null;
  /** 처리 중 화면 문구 (결제 확인, 발급 중 등) */
  busy: string | null;
  /** 거리 기준점. 위치 권한이 없거나 성수동 밖이면 성수역 */
  origin: LatLng;
  originAt: string | null;
  originReal: boolean;
  showToast(text: string, action?: Toast['action']): void;
  hideToast(): void;
  setBusy(text: string | null): void;
  setOrigin(o: LatLng, real: boolean): void;
};
export const useUi = create<Ui>()(set => ({
  toast: null, busy: null, origin: SEONGSU, originAt: null, originReal: false,
  showToast: (text, action) => set(s => ({ toast: { text, action, id: (s.toast?.id ?? 0) + 1 } })),
  hideToast: () => set({ toast: null }),
  setBusy: busy => set({ busy }),
  setOrigin: (origin, originReal) => set({ origin, originReal, originAt: new Date().toISOString() }),
}));

/** 처리 중 화면을 단계별로 보여 준 뒤 실행한다 */
export async function runBusy<T>(phases: string[], fn: () => T, ms = 800): Promise<T> {
  const { setBusy } = useUi.getState();
  for (const p of phases) { setBusy(p); await new Promise(r => setTimeout(r, ms)); }
  try { return fn(); } finally { setBusy(null); }
}
