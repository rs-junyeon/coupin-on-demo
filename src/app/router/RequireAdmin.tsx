import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useDB } from '@/shared/api';

/** 운영자 계정으로 로그인해야 들어올 수 있다 (고객 계정과 분리) */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const logged = useDB(s => s.admin.logged);
  return logged ? <>{children}</> : <Navigate to="/admin/login" replace />;
}
