// 카테고리: 색·아이콘 찾기, 미분류 표시
import type { Category, DB, IconName } from '@/shared/api';
import { CAT_COLORS } from '@/shared/config';

export const UNCAT: Category = { color: '#8B92A8', icon: 'box' };

export const CAT_ICONS = ['beauty', 'hair', 'fit', 'cafe', 'class', 'photo', 'food', 'pet', 'gift', 'box'] as const;

export const catOf = (db: Pick<DB, 'cats'>, k: string | null) => (k && db.cats[k]) || UNCAT;

export const catName = (db: Pick<DB, 'cats'>, k: string | null) => (k && db.cats[k] ? k : '미분류');

/** 카테고리 추가: 아직 쓰지 않은 색을 앞에서부터 준다 */
export function addCategoryIn(d: DB, name: string, icon: IconName) {
  const used = Object.values(d.cats).map(c => c.color);
  d.cats[name] = { color: CAT_COLORS.find(c => !used.includes(c)) ?? CAT_COLORS[Object.keys(d.cats).length % CAT_COLORS.length], icon };
}
