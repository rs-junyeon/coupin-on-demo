// 카테고리: 색·아이콘 찾기, 미분류 표시
import type { Category, DB } from '@/shared/api';

export const UNCAT: Category = { color: '#8B92A8', icon: 'box' };

export const CAT_ICONS = ['beauty', 'hair', 'fit', 'cafe', 'class', 'photo', 'food', 'pet', 'gift', 'box'] as const;

export const catOf = (db: Pick<DB, 'cats'>, k: string | null) => (k && db.cats[k]) || UNCAT;

export const catName = (db: Pick<DB, 'cats'>, k: string | null) => (k && db.cats[k] ? k : '미분류');
