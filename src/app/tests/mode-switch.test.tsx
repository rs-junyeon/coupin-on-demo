import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderAt, renderReady, settle } from './render';

describe('고객 앱 ↔ 관리자 오가기', () => {
  it('고객 앱의 [관리자 화면]으로 관리자에 간다 (로그인 전이면 운영자 로그인)', async () => {
    const { router } = renderAt('/stores');
    await userEvent.click(screen.getByRole('link', { name: '관리자 화면' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/admin/login'));
    await settle(router);
  });
  it('관리자 헤더의 [고객 앱]으로 고객 앱 둘러보기에 간다', async () => {
    const { router } = await renderReady('/admin/orders', { admin: true });
    await userEvent.click(screen.getByRole('button', { name: /고객 앱/ }));
    expect(router.state.location.pathname).toBe('/');
  });
  it('운영자 로그인 화면에서도 고객 앱으로 돌아갈 수 있다', async () => {
    const { router } = await renderReady('/admin/login');
    await userEvent.click(screen.getByRole('link', { name: '고객 앱으로 가기' }));
    expect(router.state.location.pathname).toBe('/');
  });
});
