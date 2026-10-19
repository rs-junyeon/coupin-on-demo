import { beforeEach, describe, expect, it } from 'vitest';
import { resetDB, useDB } from '@/shared/api';
import { socialLink, socialLogin, socialPhone } from './auth';

const S = () => useDB.getState();
describe('소셜 로그인', () => {
  beforeEach(() => resetDB());
  it('소셜 로그인: 같은 휴대폰 번호면 기존 계정에 연결', () => {
    expect(socialLogin('kakao')).toBe('needPhone');
    expect(socialPhone('01012345678')).toBe('link');
    socialLink('kakao');
    expect(S().account.logged && S().account.links.kakao).toBe(true);
    expect(socialLogin('kakao')).toBe('logged');
  });
});
