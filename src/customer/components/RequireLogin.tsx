import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDB } from '@/shared/api';

/** 로그인이 필요한 화면: 로그인 전이면 로그인 화면으로 보내고, 로그인하면 원래 화면으로 돌아온다 */
export function RequireLogin({ children }: { children: ReactNode }) {
  const logged = useDB(s => s.account.logged);
  const loc = useLocation();
  if (!logged) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  return <>{children}</>;
}
