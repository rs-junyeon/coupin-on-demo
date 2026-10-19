// 고객 로그인·가입·소셜 로그인. 같은 사람인지는 문자로 인증한 휴대폰 번호로 판단한다
import { mutate, useDB, type SocialProvider } from '@/shared/api';
import { digits } from '@/shared/lib';

const get = () => useDB.getState();

/** 데모: 아이디·비밀번호에 무엇을 넣어도 이 데모 계정으로 로그인한다 */
export const login = () => mutate(d => { d.account.logged = true; });
export const logout = () => mutate(d => { d.account.logged = false; });

/** 자체 가입. 이미 가입한 휴대폰 번호면 새로 만들지 않는다 */
export const signupCheckPhone = (phone: string): 'dup' | 'new' => (digits(phone) === digits(get().account.phone) ? 'dup' : 'new');
export const signup = ({ userId, phone, mkt }: { userId: string; phone: string; mkt: boolean }) =>
  mutate(d => { d.account = { logged: true, userId, name: '김*온', phone, links: { pw: true, kakao: false, google: false }, mkt }; });

/** 소셜 로그인: 이미 연결된 소셜 계정이면 바로 로그인, 아니면 휴대폰 확인으로 */
export function socialLogin(prov: SocialProvider): 'logged' | 'needPhone' {
  if (get().account.links[prov]) { mutate(d => { d.account.logged = true; }); return 'logged'; }
  return 'needPhone';
}
/** 휴대폰 인증 뒤: 같은 번호 계정이 있으면 연결, 없으면 소셜 계정으로 새로 가입 */
export const socialPhone = (phone: string): 'link' | 'new' => (digits(phone) === digits(get().account.phone) ? 'link' : 'new');
export const socialLink = (prov: SocialProvider) => mutate(d => { d.account.links[prov] = true; d.account.logged = true; });
export const socialJoin = (prov: SocialProvider, phone: string, mkt: boolean) =>
  mutate(d => { d.account = { logged: true, userId: '', name: '김*온', phone, links: { pw: false, kakao: prov === 'kakao', google: prov === 'google' }, mkt }; });
/** 로그인한 계정에 소셜 로그인 방법을 더한다 (회원 정보에서 연결) */
export const linkSocial = (prov: SocialProvider) => mutate(d => { d.account.links[prov] = true; });
