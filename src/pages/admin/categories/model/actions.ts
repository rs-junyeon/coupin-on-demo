// 카테고리 (A-02-05): 추가·수정·삭제
import { addCategoryIn } from '@/entities/category';
import { mutate, useDB, type DB, type IconName, type Result } from '@/shared/api';

export function addCat(name: string, icon: IconName): Result {
  const n = name.trim();
  if (!n) return { ok: false, error: '카테고리 이름을 적어 주세요' };
  if (useDB.getState().cats[n]) return { ok: false, error: '이미 있는 카테고리예요' };
  mutate(d => addCategoryIn(d, n, icon));
  return { ok: true };
}
/** 이름이 바뀌면 순서를 지키며 다시 만들고, 상품에도 새 이름을 반영한다 */
export function editCat(old: string, name: string, icon: IconName): Result {
  const n = name.trim();
  if (!n) return { ok: false, error: '카테고리 이름을 적어 주세요' };
  if (n !== old && useDB.getState().cats[n]) return { ok: false, error: '이미 있는 카테고리예요' };
  mutate(d => {
    const next: DB['cats'] = {};
    Object.keys(d.cats).forEach(k => { next[k === old ? n : k] = k === old ? { ...d.cats[k], icon } : d.cats[k]; });
    d.cats = next;
    d.products.forEach(p => { if (p.cat === old) p.cat = n; });
  });
  return { ok: true };
}
export function deleteCat(name: string): Result {
  if (useDB.getState().products.some(p => p.cat === name)) return { ok: false, error: '쓰는 상품이 있으면 지울 수 없어요' };
  mutate(d => { delete d.cats[name]; });
  return { ok: true };
}
