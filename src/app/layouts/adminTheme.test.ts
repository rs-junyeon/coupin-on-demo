// 관리자 antd 테마의 색이 디자인 토큰(tokens.css)에 있는 값인지 확인한다
import { describe, expect, it } from 'vitest';
import tokens from '../styles/tokens.css?raw';
import { adminTheme } from './adminTheme';

describe('관리자 테마', () => {
  it('antd 테마의 hex 색은 모두 tokens.css에 있는 값이다', () => {
    const hex = JSON.stringify(adminTheme).match(/#[0-9A-F]{6}\b/gi) ?? [];
    expect(hex.length).toBeGreaterThan(0);
    expect(hex.filter(h => !tokens.toUpperCase().includes(h.toUpperCase()))).toEqual([]);
  });
});
