// 화면에만 쓰는 상태 (저장하지 않음): 고객 앱 토스트, 처리 중 화면
import { create } from 'zustand';

type Toast = { text: string; id: number; action?: { label: string; to: string } };
type Ui = {
  toast: Toast | null;
  /** 처리 중 화면 문구 (결제 확인, 발급 중 등) */
  busy: string | null;
  showToast(text: string, action?: Toast['action']): void;
  hideToast(): void;
  setBusy(text: string | null): void;
};
export const useUi = create<Ui>()(set => ({
  toast: null, busy: null,
  showToast: (text, action) => set(s => ({ toast: { text, action, id: (s.toast?.id ?? 0) + 1 } })),
  hideToast: () => set({ toast: null }),
  setBusy: busy => set({ busy }),
}));

/** 처리 중 화면을 단계별로 보여 준 뒤 실행한다 */
export async function runBusy<T>(phases: string[], fn: () => T, ms = 800): Promise<T> {
  const { setBusy } = useUi.getState();
  for (const p of phases) { setBusy(p); await new Promise(r => setTimeout(r, ms)); }
  try { return fn(); } finally { setBusy(null); }
}
