import { mutate, useDB, type Result, type SocialProvider } from '@/shared/api';

/** 로그인 방법 해제. 마지막 하나는 해제할 수 없다 */
export function unlinkSocial(prov: SocialProvider): Result {
  if (Object.values(useDB.getState().account.links).filter(Boolean).length < 2) return { ok: false, error: '로그인 방법이 하나만 남으면 해제할 수 없어요' };
  mutate(d => { d.account.links[prov] = false; });
  return { ok: true };
}
