// 가짜 서버의 데이터. 브라우저 저장소에 저장하고, 다른 탭(관리자 ↔ 고객 앱)과 storage 이벤트로 맞춘다
// 동작(받기·환불·게시 등)은 features와 각 화면 model에 있고, mutate로 데이터를 고친다
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import type { DB } from './schema';
import { seed, STORAGE_KEY } from './seed';

const safeStorage: StateStorage = {
  getItem: n => { try { return localStorage.getItem(n); } catch { return null; } },
  setItem: (n, v) => { try { localStorage.setItem(n, v); } catch { /* 저장 불가: 메모리로만 */ } },
  removeItem: n => { try { localStorage.removeItem(n); } catch { /* 저장 불가 */ } },
};

/** 동작의 결과: 성공이면 ok와 값, 실패면 고객·운영자에게 보여 줄 문구 */
export type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

export const useDB = create<DB>()(
  persist(() => seed(), { name: STORAGE_KEY, version: 1, storage: createJSONStorage(() => safeStorage) }),
);

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
/** 데이터를 복사해 고치고 한 번에 반영한다 */
export const mutate = (fn: (d: DB) => void) => useDB.setState(s => { const d = clone(s); fn(d); return d; });
/** 처음 상태로 (테스트·데모 초기화) */
export const resetDB = () => useDB.setState(seed());

/** 관리자 탭에서 게시하면 고객 앱 탭에도 바로 반영되게, 다른 탭의 저장을 다시 읽는다 */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', e => { if (e.key === STORAGE_KEY) void useDB.persist.rehydrate(); });
}
