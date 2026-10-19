import { beforeEach, describe, expect, it } from 'vitest';
import { resetDB, useDB } from '@/shared/api';
import { addCat, editCat } from './actions';

const S = () => useDB.getState();
const IMG = 'data:image/png;base64,AAAA';

describe('카테고리', () => {
  beforeEach(() => resetDB());
  it('올린 아이콘과 함께 추가하면 이미지를 저장하고, 색은 아직 쓰지 않은 색을 받는다', () => {
    const used = Object.values(S().cats).map(c => c.color);
    expect(addCat('반려동물', 'pet', IMG).ok).toBe(true);
    const c = S().cats['반려동물'];
    expect(c.img).toBe(IMG);
    expect(used).not.toContain(c.color);
  });
  it('수정: 기본 아이콘으로 바꾸면 올린 이미지를 지우고, 색은 그대로', () => {
    addCat('반려동물', 'pet', IMG);
    const color = S().cats['반려동물'].color;
    expect(editCat('반려동물', '반려동물', 'gift', null).ok).toBe(true);
    expect(S().cats['반려동물']).toEqual({ color, icon: 'gift' });
  });
});
