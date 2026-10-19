import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { useDB } from '../../store/db';
import { renderAt } from '../../test/render';

describe('결제·내 쿠폰', () => {
  it('결제: 동의해야 결제 버튼이 켜지고, 결제창에서 결제하면 구매 완료', async () => {
    const u = userEvent.setup();
    const { router } = renderAt('/checkout/p4', { logged: true });
    const pay = screen.getByRole('button', { name: '19,900원 결제하기' });
    expect(pay).toBeDisabled();
    await u.click(screen.getByRole('radio', { name: '신용·체크카드' }));
    await u.click(screen.getByRole('checkbox'));
    expect(pay).toBeEnabled();
    await u.click(pay);
    expect(router.state.location.pathname).toBe('/pay/p4');
    expect(router.state.location.search).toBe('?m=card');

    // 결제창 취소: 결제 화면으로 돌아오고 동의는 그대로
    await u.click(screen.getByRole('button', { name: '취소' }));
    expect(router.state.location.pathname).toBe('/checkout/p4');
    expect(screen.getByText('결제를 취소했어요')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(screen.getByRole('radio', { name: '신용·체크카드' })).toBeChecked();

    await u.click(screen.getByRole('button', { name: '19,900원 결제하기' }));
    await u.click(screen.getByRole('button', { name: '결제하기' }));
    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/complete\//), { timeout: 3000 });
    expect(screen.getByText('구매가 끝났어요')).toBeInTheDocument();
    const o = useDB.getState().orders[0];
    expect(o.pid).toBe('p4');
    expect(o.method).toBe('신용·체크카드');

    // 완료 → 쿠폰 화면. 뒤로 가면 내 쿠폰(사용 가능)
    await u.click(screen.getByRole('button', { name: '내 쿠폰에서 보기' }));
    expect(router.state.location.pathname).toBe(`/coupons/${o.cid}`);
    expect(screen.getByRole('button', { name: /환불 요청/ })).toBeInTheDocument();
    await act(() => router.navigate(-1));
    expect(router.state.location.pathname + router.state.location.search).toBe('/wallet?tab=active');
  });

  it('무료 쿠폰 취소: 시트에서 확인하면 취소 도장이 찍힌다', async () => {
    const u = userEvent.setup();
    const { router } = renderAt('/wallet', { logged: true });
    let cid = '';
    await act(async () => {
      const r = useDB.getState().issue('p6');
      if (r.ok) cid = r.cid;
      await router.navigate(`/coupons/${cid}`);
    });
    expect(screen.getByText('사용 가능')).toBeInTheDocument();
    await u.click(screen.getByRole('button', { name: '쿠폰 취소' }));
    expect(screen.getByRole('dialog', { name: '쿠폰 취소' })).toBeInTheDocument();
    await u.click(screen.getByRole('button', { name: '쿠폰 취소하기' }));
    await screen.findByText('쿠폰을 취소했어요', undefined, { timeout: 3000 });
    expect(useDB.getState().coupons.find(c => c.id === cid)!.status).toBe('CANCELLED');
    expect(screen.getAllByText('취소').length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: '쿠폰 취소' })).not.toBeInTheDocument();
  });

  it('내 쿠폰 탭: 사용 가능이 비면 안내, 카드를 누르면 쿠폰 화면', async () => {
    const u = userEvent.setup();
    const { router } = renderAt('/wallet', { logged: true });
    expect(screen.getByRole('tab', { name: '전체 2' })).toHaveAttribute('aria-selected', 'true');
    await u.click(screen.getByRole('tab', { name: '사용 가능 0' }));
    expect(router.state.location.search).toBe('?tab=active');
    expect(screen.getByText('쓸 수 있는 쿠폰이 없어요')).toBeInTheDocument();
    await u.click(screen.getByRole('tab', { name: '사용 완료·만료 2' }));
    await u.click(screen.getByRole('button', { name: /남성 커트 첫 방문/ }));
    expect(router.state.location.pathname).toBe('/coupons/c12');
    expect(screen.getAllByText('만료').length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: 'PIN 복사' })).not.toBeInTheDocument();
  });
});
