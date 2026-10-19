// 화면 테스트 도우미: 데이터를 처음 상태로 되돌리고, 실제 라우트로 그 주소를 연다
import { render, waitFor } from '@testing-library/react';
import { expect } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routes } from '@/router';
import { useDB } from '@/shared/api';
import { useUi } from '@/shared/ui/mobile';

export function renderAt(path: string, opts: { logged?: boolean; admin?: boolean } = {}) {
  useDB.getState().reset();
  useUi.setState({ toast: null, busy: null });
  if (opts.logged) useDB.setState(s => ({ account: { ...s.account, logged: true } }));
  if (opts.admin) useDB.setState(s => ({ admin: { ...s.admin, logged: true } }));
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return { router, ...render(<RouterProvider router={router} />) };
}

/** 관리자 화면처럼 나눠 불러오는 라우트: 첫 화면을 다 불러올 때까지 기다린다 */
export async function renderReady(path: string, opts: { logged?: boolean; admin?: boolean } = {}) {
  const r = renderAt(path, opts);
  await settle(r.router);
  return r;
}

/** 나눠 불러오는 화면으로 이동한 뒤: 이동이 끝나고 화면(제목이나 로그인 폼)이 그려질 때까지 기다린다 */
export async function settle(router: { state: { initialized: boolean; navigation: { state: string } } }) {
  await waitFor(() => {
    expect(router.state.initialized).toBe(true);
    expect(router.state.navigation.state).toBe('idle');
    expect(document.querySelector('.a-head, .ant-form, .c-page')).not.toBeNull();
  }, { timeout: 3000 });
}
