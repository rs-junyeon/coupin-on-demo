import type { CSSProperties } from 'react';
import { catOf } from '../domain/rules';
import { useDB } from '../store/db';
import { Icon } from './Icon';

/** 카테고리 색 원형 아이콘 (목업 .cat-ico). 색은 카테고리마다 달라서 CSS 변수 --c로 넘긴다 */
export function CatIcon({ cat, size = 20, className = '' }: { cat: string | null; size?: number; className?: string }) {
  const c = catOf(useDB(), cat);
  return <span className={`cat-ico ${className}`} style={{ '--c': c.color } as CSSProperties}><Icon name={c.icon} size={size} /></span>;
}
