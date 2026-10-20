// 브라우저 저장소에 남은 예전 버전 데이터를 옮기는 규칙
import { afterEach, describe, expect, it } from 'vitest';
import { CAT_COLORS } from '@/shared/config';
import { resetDB, useDB } from './db';
import { seed, STORAGE_KEY } from './seed';

describe('저장된 데이터 옮기기', () => {
  afterEach(() => { localStorage.clear(); resetDB(); });

  it('v2 카테고리 색은 톤 업한 팔레트의 같은 자리 색으로 바뀌고, 팔레트 밖 색은 그대로 둔다', async () => {
    const d = seed();
    const [a, b] = Object.keys(d.cats);
    d.cats[a].color = '#B05D7F'; // v2 팔레트 6번째 (rose)
    d.cats[b].color = '#123456';
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: d, version: 2 }));
    await useDB.persist.rehydrate();
    expect(useDB.getState().cats[a].color).toBe('#C86E92');
    expect(CAT_COLORS[5]).toBe('#C86E92');
    expect(useDB.getState().cats[b].color).toBe('#123456');
  });
});
