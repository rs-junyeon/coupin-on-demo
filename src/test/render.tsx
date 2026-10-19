// 화면 테스트 도우미: 데이터를 처음 상태로 되돌리고, 실제 라우트로 그 주소를 연다
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routes } from '../router';
import { useDB } from '../store/db';
import { useUi } from '../store/ui';

export function renderAt(path: string, opts: { logged?: boolean; admin?: boolean } = {}) {
  useDB.getState().reset();
  useUi.setState({ toast: null, busy: null });
  if (opts.logged) useDB.setState(s => ({ account: { ...s.account, logged: true } }));
  if (opts.admin) useDB.setState(s => ({ admin: { ...s.admin, logged: true } }));
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return { router, ...render(<RouterProvider router={router} />) };
}
