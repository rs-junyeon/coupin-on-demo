import type { CSSProperties } from 'react';
import s from './MaskIcon.module.css';

/** 올린 이미지를 선 아이콘처럼 그린다: 모양만 따서 글자색(currentColor)으로 칠한다. 크기·이미지는 CSS 변수로 넘긴다 */
export function MaskIcon({ src, size = 20 }: { src: string; size?: number }) {
  return <span className={s.mask} aria-hidden="true" style={{ '--m': `url("${src}")`, '--s': `${size}px` } as CSSProperties} />;
}
