// 상품 관리 (A-02-06): 게시·숨김·일괄 처리
import { addCategoryIn, catName } from '@/entities/category';
import { adminStatus, logTerms, publishIn } from '@/entities/product';
import { mutate, prodOf, useDB, type Result } from '@/shared/api';

export function publish(pid: string): Result<{ needCat?: boolean }> {
  const s = useDB.getState(), p = prodOf(s, pid);
  if (!p.cat) return { ok: false, error: '게시하려면 카테고리를 먼저 골라 주세요' };
  if (adminStatus(s, p).k === 'block') return { ok: false, error: '노출 조건이 맞지 않아 게시할 수 없어요' };
  mutate(d => publishIn(d, prodOf(d, pid)));
  return { ok: true };
}
export const hide = (pid: string) => mutate(d => { prodOf(d, pid).on = 'HIDDEN'; });

/** 일괄 처리 (A-02-06-01): 카테고리를 한 번에 지정하고, 원하면 게시할 수 있는 상품(미게시·숨김)만 게시한다 */
export function bulkApply(pids: string[], cat: string, andPublish: boolean) {
  let published = 0;
  mutate(d => {
    if (!d.cats[cat]) addCategoryIn(d, cat, 'box');
    pids.forEach(id => {
      const q = prodOf(d, id);
      if (q.cat !== cat) { logTerms(q, d.admin.name, `카테고리 ${catName(d, q.cat)} → ${cat} (일괄 지정)`); q.cat = cat; }
      if (andPublish && ['draft', 'hidden'].includes(adminStatus(d, q).k)) { publishIn(d, q); published++; }
    });
  });
  return { count: pids.length, published, skipped: andPublish ? pids.length - published : 0 };
}
