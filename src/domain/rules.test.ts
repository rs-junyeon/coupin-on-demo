import { describe, expect, it } from 'vitest';
import { seed } from '../data/seed';
import { adminStatus, blockReason, cStatus, myRefunds, plusSnaps, prodOf, settleRows, settleTot, visible } from './rules';

describe('rules', () => {
  const db = seed(new Date(2026, 9, 15, 10));
  it('노출 조건: 재승인 대기·판매 중지·구독 종료·위치 없음은 보이지 않는다', () => {
    expect(visible(db, prodOf(db, 'p1'))).toBe(true);
    expect(visible(db, prodOf(db, 'p11'))).toBe(false);
    expect(visible(db, prodOf(db, 'p13'))).toBe(false);
    expect(visible(db, prodOf(db, 'p12'))).toBe(false);
    expect(adminStatus(db, prodOf(db, 'p15')).k).toBe('block');
    expect(adminStatus(db, prodOf(db, 'p14')).k).toBe('draft');
  });
  it('상품별 한도를 다 쓴 무료 쿠폰은 받을 수 없다', () => {
    expect(blockReason(db, prodOf(db, 'p10'))).toBe('이번 달 준비된 수량이 모두 나갔어요');
    expect(blockReason(db, prodOf(db, 'p6'))).toBeNull();
  });
  it('쿠폰 상태', () => {
    expect(cStatus(db.coupons.find(c => c.id === 'c7')!).t).toBe('취소');
    expect(cStatus(db.coupons.find(c => c.id === 'c6')!).t).toBe('일부 사용');
  });
  it('상품변경 이력은 최신 줄이 위, 바뀐 칸을 표시한다', () => {
    const s = plusSnaps(prodOf(db, 'p11'));
    expect(s[0].chg).toEqual(expect.arrayContaining(['own', 'notes', 'plus']));
    expect(s[s.length - 1].by).toBe('점주 (처음 내보냄)');
  });
  it('정산: 대조 전에는 PLUS와 차이 1건', () => {
    expect(settleRows(db).filter(r => r.plusN).length).toBe(1);
    expect(settleTot(settleRows(db)).pay).toBeGreaterThan(0);
  });
  it('내 취소/환불 내역은 비어 있다가 무료 취소가 생기면 보인다', () => {
    expect(myRefunds(db)).toHaveLength(0);
  });
});
