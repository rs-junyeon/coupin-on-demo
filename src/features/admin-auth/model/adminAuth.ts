// 운영자 로그인 (고객 계정과 분리)
import { mutate, type Result } from '@/shared/api';

export function adminLogin(id: string, pw: string): Result {
  if (!id.trim() || !pw) return { ok: false, error: '아이디와 비밀번호를 입력해 주세요' };
  mutate(d => { d.admin.logged = true; });
  return { ok: true };
}
export const adminLogout = () => mutate(d => { d.admin.logged = false; });
