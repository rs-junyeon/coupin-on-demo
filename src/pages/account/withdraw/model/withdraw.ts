import { mutate } from '@/shared/api';

/** 회원 탈퇴 (데모: 로그아웃만) */
export const withdraw = () => mutate(d => { d.account.logged = false; });
