// 고객 계정: 관리자 화면에 보이는 고객 이름
import { type Account, ME, type SocialProvider } from '@/shared/api';

export const who = (owner: string) => (owner === ME ? '김*온' : owner);

export const SNS: Record<SocialProvider, string> = { kakao: '카카오', google: 'Google' };
export const isProv = (x: string | null | undefined): x is SocialProvider => x === 'kakao' || x === 'google';

export const loginWays = (l: Account['links']) => [l.pw && '아이디·비밀번호', l.kakao && '카카오', l.google && 'Google'].filter(Boolean).join(', ');
