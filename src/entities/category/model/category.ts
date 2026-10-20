// 카테고리: 색·아이콘 찾기, 미분류 표시
import type { Category, DB, IconName } from '@/shared/api';
import { CAT_COLORS } from '@/shared/config';

export const UNCAT: Category = { color: '#8B92A8', icon: 'box' };

/** 운영자가 고르는 카테고리 아이콘: 기본 10개 + antd에 없어 직접 그린 3개 (DESIGN.md 7.7) */
export const CAT_ICONS = ['cafe', 'dessert', 'hair', 'beauty', 'fit', 'class', 'experiment', 'photo', 'pet', 'shopping', 'dumbbell', 'food', 'nail'] as const;

export const catOf = (db: Pick<DB, 'cats'>, k: string | null) => (k && db.cats[k]) || UNCAT;

export const catName = (db: Pick<DB, 'cats'>, k: string | null) => (k && db.cats[k] ? k : '미분류');

/** 새 카테고리가 받을 색: 아직 쓰지 않은 색을 앞에서부터 */
export function nextCatColor(cats: DB['cats']) {
  const used = Object.values(cats).map(c => c.color);
  return CAT_COLORS.find(c => !used.includes(c)) ?? CAT_COLORS[Object.keys(cats).length % CAT_COLORS.length];
}

/** 카테고리 추가. img(올린 아이콘)가 있으면 icon 대신 쓴다 */
export function addCategoryIn(d: DB, name: string, icon: IconName, img?: string) {
  d.cats[name] = { color: nextCatColor(d.cats), icon, ...(img ? { img } : {}) };
}
