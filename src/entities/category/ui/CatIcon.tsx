import type { CSSProperties } from 'react';
import { useDB, type Category } from '@/shared/api';
import { Icon, MaskIcon } from '@/shared/ui/icon';
import { catOf } from '../model/category';

/** 카테고리 그림: 올린 아이콘이 있으면 그 모양을, 없으면 기본 선 아이콘을 글자색으로 그린다 */
export function CatGlyph({ c, size = 20 }: { c: Pick<Category, 'icon' | 'img'>; size?: number }) {
  return c.img ? <MaskIcon src={c.img} size={size} /> : <Icon name={c.icon} size={size} />;
}

/** 카테고리 색 사각형 아이콘. 저장 전 미리보기처럼 색·그림을 직접 넘길 때 쓴다. 색은 CSS 변수 --c로 넘긴다 */
export function CatSwatch({ c, size = 20, className = '' }: { c: Category; size?: number; className?: string }) {
  return <span className={`cat-ico ${className}`} style={{ '--c': c.color } as CSSProperties}><CatGlyph c={c} size={size} /></span>;
}

/** 카테고리 색 원형 아이콘 (목업 .cat-ico) */
export function CatIcon({ cat, size = 20, className = '' }: { cat: string | null; size?: number; className?: string }) {
  return <CatSwatch c={catOf(useDB(), cat)} size={size} className={className} />;
}
