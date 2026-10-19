import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CatSwatch } from './CatIcon';

describe('카테고리 아이콘', () => {
  it('올린 이미지가 있으면 그 모양(마스크)으로, 없으면 기본 선 아이콘으로 그린다', () => {
    const { container, rerender } = render(<CatSwatch c={{ color: '#123456', icon: 'pet', img: 'data:image/png;base64,AAAA' }} />);
    const mask = container.querySelector('.cat-ico > span') as HTMLElement;
    expect(mask.style.getPropertyValue('--m')).toContain('data:image/png;base64,AAAA');
    expect(container.querySelector('svg')).toBeNull();
    rerender(<CatSwatch c={{ color: '#123456', icon: 'pet' }} />);
    expect(container.querySelector('.cat-ico svg')).not.toBeNull();
  });
});
