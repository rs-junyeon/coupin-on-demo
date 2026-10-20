// 가짜 서버의 데이터. 브라우저 저장소에 저장하고, 다른 탭(관리자 ↔ 고객 앱)과 storage 이벤트로 맞춘다
// 동작(받기·환불·게시 등)은 features와 각 화면 model에 있고, mutate로 데이터를 고친다
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { CAT_COLORS } from '@/shared/config';
import type { DB } from './schema';
import { seed, STORAGE_KEY } from './seed';

const safeStorage: StateStorage = {
  getItem: n => { try { return localStorage.getItem(n); } catch { return null; } },
  setItem: (n, v) => { try { localStorage.setItem(n, v); } catch { /* 저장 불가: 메모리로만 */ } },
  removeItem: n => { try { localStorage.removeItem(n); } catch { /* 저장 불가 */ } },
};

/** 동작의 결과: 성공이면 ok와 값, 실패면 고객·운영자에게 보여 줄 문구 */
export type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

/** 버전 1의 카테고리 팔레트. 이미 저장된 카테고리 색을 옮길 때만 쓴다 */
const V1_CAT_COLORS = ['#D9779F', '#2A7D72', '#3F82BC', '#B07F2E', '#8C79D6', '#5A7A3A', '#C8664B', '#4C6FA8', '#9A6B9E', '#3D8F86'];

/** 버전 2의 카테고리 팔레트 (2026-10-20 톤 업 전). 이미 저장된 카테고리 색을 옮길 때만 쓴다 */
const V2_CAT_COLORS = ['#468E53', '#098E8B', '#2C84B9', '#7272BE', '#9864A8', '#B05D7F', '#B65F54', '#AC6A28'];

/** 저장된 데이터 옮기기. v1 → v2: 카테고리 색을 ON 팔레트로 바꾼다 (예전 팔레트 몇 번째 색이었는지 그대로). v2 → v3: 톤 업한 팔레트의 같은 자리 색으로 바꾼다 */
function migrateDB(saved: unknown, version: number) {
  const d = saved as DB;
  if (version < 2) {
    Object.values(d.cats).forEach((c, n) => {
      const i = V1_CAT_COLORS.indexOf(c.color);
      c.color = CAT_COLORS[(i < 0 ? n : i) % CAT_COLORS.length];
    });
  }
  if (version < 3) {
    Object.values(d.cats).forEach(c => {
      const i = V2_CAT_COLORS.indexOf(c.color);
      if (i >= 0) c.color = CAT_COLORS[i];
    });
  }
  return d;
}

export const useDB = create<DB>()(
  persist(() => seed(), { name: STORAGE_KEY, version: 3, storage: createJSONStorage(() => safeStorage), migrate: migrateDB }),
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
