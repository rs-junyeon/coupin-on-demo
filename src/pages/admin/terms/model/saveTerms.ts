// 판매 조건 (A-02-02). ON 가격 조정은 할인만: 점주 판매가 이하, 유료 상품은 0원 불가
import { addCategoryIn, catName } from '@/entities/category';
import { adminStatus, isFree, limTxt, logTerms, publishIn } from '@/entities/product';
import { mutate, prodOf, useDB, type Result } from '@/shared/api';
import { won } from '@/shared/lib';

export function saveTerms(pid: string, { cat, price, limit }: { cat: string; price: number; limit: number | null }, andPublish: boolean): Result<{ moved: boolean; published: boolean }> {
  const s = useDB.getState(), p = prodOf(s, pid), free = isFree(p);
  if (andPublish && !cat) return { ok: false, error: '게시하려면 카테고리를 골라 주세요' };
  if (!free && !price) return { ok: false, error: '유료 상품은 0원으로 낮출 수 없어요.' };
  if (!free && price > p.own) return { ok: false, error: '점주가 정한 판매가보다 높일 수 없어요 (할인만).' };
  if (!free && limit && limit < price) return { ok: false, error: '한도가 판매가 1장보다 작아요.' };
  const moved = !free && price !== p.price;
  let published = false;
  mutate(d => {
    const q = prodOf(d, pid);
    if (cat && !d.cats[cat]) addCategoryIn(d, cat, 'box');
    const lim = (n: number | null) => (n ? limTxt(q, n) : '전체 한도만'), pt = (n: number) => (free ? '무료' : won(n));
    const before = `판매가 ${pt(q.price)} · 한도 ${lim(q.limit)}`;
    const catMoved = (cat || null) !== q.cat ? ` · 카테고리 ${catName(d, q.cat)} → ${cat || '미분류'}` : '';
    q.cat = cat || null; q.price = free ? 0 : price; q.limit = limit;
    logTerms(q, d.admin.name, `${before} → 판매가 ${pt(q.price)} · 한도 ${lim(q.limit)}${catMoved}${moved ? ' · 점주에게 알림' : ''}`);
    if (andPublish && ['draft', 'hidden'].includes(adminStatus(d, q).k)) { publishIn(d, q); published = true; }
  });
  return { ok: true, moved, published };
}
