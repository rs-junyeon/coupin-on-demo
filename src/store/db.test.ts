import { beforeEach, describe, expect, it } from 'vitest';
import { useDB } from './db';

const S = () => useDB.getState();
describe('db 동작', () => {
  beforeEach(() => S().reset());
  it('무료 쿠폰 받기 → 1인 1회 → 취소하면 한도가 돌아간다', () => {
    S().login('on_user', 'x');
    const before = S().limit.fused;
    const r = S().issue('p6');
    expect(r.ok).toBe(true);
    expect(S().limit.fused).toBe(before + 1);
    expect(S().issue('p6').ok).toBe(false);
    if (r.ok) expect(S().cancelFree(r.cid).ok).toBe(true);
    expect(S().limit.fused).toBe(before);
  });
  it('유료 구매 → 환불 요청하면 관리자 환불 기록이 남는다', () => {
    const r = S().issue('p4', 'card');
    expect(r.ok && r.oid).toBeTruthy();
    if (!r.ok) return;
    expect(S().requestRefund(r.cid).ok).toBe(true);
    expect(S().refunds.some(x => x.oid === r.oid && x.result === '완료')).toBe(true);
  });
  it('판매 조건: 점주 판매가보다 높일 수 없고, 카테고리를 고르면 게시된다', () => {
    expect(S().saveTerms('p14', { cat: '사진', price: 60000, limit: null }, true).ok).toBe(false);
    const r = S().saveTerms('p14', { cat: '사진', price: 45000, limit: null }, true);
    expect(r.ok && r.published).toBe(true);
    expect(S().products.find(p => p.id === 'p14')!.on).toBe('PUBLISHED');
  });
  it('일괄 처리: 노출 불가는 게시를 건너뛴다', () => {
    const r = S().bulkApply(['p14', 'p16', 'p15'], '클래스', true);
    expect(r).toEqual({ count: 3, published: 2, skipped: 1 });
  });
  it('소셜 로그인: 같은 휴대폰 번호면 기존 계정에 연결', () => {
    expect(S().socialLogin('kakao')).toBe('needPhone');
    expect(S().socialPhone('01012345678')).toBe('link');
    S().socialLink('kakao');
    expect(S().account.logged && S().account.links.kakao).toBe(true);
    expect(S().socialLogin('kakao')).toBe('logged');
  });
});
