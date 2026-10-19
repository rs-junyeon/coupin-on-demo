import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderAt } from '@/test/render';

const q = (search: string) => new URLSearchParams(search);

describe('둘러보기 (지도를 쓸 수 없을 때)', () => {
  it('안내와 가까운 가게 목록을 보여 주고, 카테고리 칩으로 거른다', async () => {
    const { router } = renderAt('/');
    expect(screen.getByText(/VITE_KAKAO_JS_KEY|지도를 불러오고/)).toBeInTheDocument();
    expect(screen.getByText('카페 온도')).toBeInTheDocument();
    expect(screen.getByText('네일하우스 성수')).toBeInTheDocument();
    // 구독이 끝난 가게, 위치가 없는 가게는 보이지 않는다
    expect(screen.queryByText('꽃집 오월')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '카페' }));
    expect(q(router.state.location.search).get('cat')).toBe('카페');
    expect(screen.getByText('카페 온도')).toBeInTheDocument();
    expect(screen.queryByText('네일하우스 성수')).not.toBeInTheDocument();
  });

  it('조건에 맞는 가게가 없으면 안내하고 [조건 지우기]로 되돌린다', async () => {
    const { router } = renderAt('/?q=없는가게');
    expect(screen.getByText('조건에 맞는 혜택이 없어요')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '조건 지우기' }));
    expect(router.state.location.search).toBe('');
    expect(screen.getByText('카페 온도')).toBeInTheDocument();
  });

  it('가게 카드의 [더보기]로 나머지 상품을 펼친다', async () => {
    renderAt('/');
    const card = screen.getByText('네일하우스 성수').closest('.store') as HTMLElement;
    expect(within(card).getByText('젤네일 첫 방문 체험권')).toBeInTheDocument();
    expect(within(card).queryByText('핸드 케어 무료 체험')).not.toBeInTheDocument();
    await userEvent.click(within(card).getByRole('button', { name: /쿠폰 2개 더보기/ }));
    expect(within(card).getByText('핸드 케어 무료 체험')).toBeInTheDocument();
    expect(within(card).getByRole('link', { name: /가게 정보/ })).toHaveAttribute('href', '/stores/s1');
  });
});

describe('검색', () => {
  it('검색어로 상품을 찾고 [지도에서 보기]로 둘러보기에 적용한다', async () => {
    const { router } = renderAt('/search');
    expect(screen.getByText('카테고리로 찾기')).toBeInTheDocument();
    await userEvent.type(screen.getByRole('searchbox', { name: '검색어' }), '라떼');
    expect(screen.getByText('시그니처 온도 라떼 교환권')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /'라떼' 지도에서 보기/ }));
    expect(router.state.location.pathname).toBe('/');
    expect(q(router.state.location.search).get('q')).toBe('라떼');
    expect(screen.getByText('카페 온도')).toBeInTheDocument();
    expect(screen.queryByText('네일하우스 성수')).not.toBeInTheDocument();
  });

  it('카테고리를 고르면 그 카테고리로 둘러보기를 연다', async () => {
    const { router } = renderAt('/search');
    await userEvent.click(screen.getByRole('button', { name: '운동' }));
    expect(router.state.location.pathname).toBe('/');
    expect(q(router.state.location.search).get('cat')).toBe('운동');
  });
});

describe('매장 탭·매장 상세', () => {
  it('카테고리 칩과 검색어로 매장을 거른다', async () => {
    renderAt('/stores');
    expect(screen.getByText('카페 온도')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '운동' }));
    expect(screen.getByText('무브 필라테스')).toBeInTheDocument();
    expect(screen.queryByText('카페 온도')).not.toBeInTheDocument();
    await userEvent.type(screen.getByRole('searchbox', { name: '매장 검색어' }), '없는가게');
    expect(screen.getByText('조건에 맞는 매장이 없어요')).toBeInTheDocument();
  });

  it('매장 상세에 길찾기·전화 링크와 상품 목록이 있다', () => {
    renderAt('/stores/s3');
    expect(screen.getByRole('link', { name: /길찾기/ }).getAttribute('href')).toMatch(/^https:\/\/map\.kakao\.com\/link\/to\/%EC%B9%B4%ED%8E%98%20%EC%98%A8%EB%8F%84,37\.\d+,127\.\d+$/);
    expect(screen.getByRole('link', { name: /전화/ })).toHaveAttribute('href', 'tel:024620303');
    expect(screen.getByRole('link', { name: /아메리카노 한 잔/ })).toHaveAttribute('href', '/products/p6');
  });
});

describe('상품 상세', () => {
  it('로그인 전에 받으면 로그인 화면으로 보낸다', async () => {
    const { router } = renderAt('/products/p6');
    await userEvent.click(screen.getByRole('button', { name: /무료로 받기/ }));
    expect(router.state.location.pathname).toBe('/login');
    expect(q(router.state.location.search).get('next')).toBe('/products/p6?claim=1');
  });

  it('로그인하고 돌아오면 하려던 무료 받기를 이어서 한다', async () => {
    const { router } = renderAt('/products/p6?claim=1', { logged: true });
    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/complete\//), { timeout: 3000 });
  });

  it('유료 상품은 로그인 뒤 결제 화면으로 이어진다', async () => {
    const { router } = renderAt('/products/p4');
    await userEvent.click(screen.getByRole('button', { name: /구매하기/ }));
    expect(q(router.state.location.search).get('next')).toBe('/checkout/p4');
  });

  it('무료 쿠폰을 받으면 발급 완료 화면으로 간다', async () => {
    const { router } = renderAt('/products/p6', { logged: true });
    await userEvent.click(screen.getByRole('button', { name: /무료로 받기/ }));
    expect(await screen.findByText('쿠폰을 발급하고 있어요')).toBeInTheDocument();
    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/complete\/n\d+$/), { timeout: 3000 });
  });

  it('유료 상품은 결제 화면으로 간다', async () => {
    const { router } = renderAt('/products/p1', { logged: true });
    await userEvent.click(screen.getByRole('button', { name: /구매하기/ }));
    expect(router.state.location.pathname).toBe('/checkout/p1');
  });

  it('받을 수 없으면 이유를 보여 주고 버튼을 막는다', () => {
    renderAt('/products/p10');
    expect(screen.getByText('이번 달 준비된 수량이 모두 나갔어요')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '지금 받을 수 없어요' })).toBeDisabled();
  });
});
