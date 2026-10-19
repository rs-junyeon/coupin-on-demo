// 운영자 로그인 (고객 계정과 분리)
import { mutate } from '@/shared/api';

/** 데모: 아이디·비밀번호에 무엇을 넣어도 로그인한다 */
export const adminLogin = () => mutate(d => { d.admin.logged = true; });
export const adminLogout = () => mutate(d => { d.admin.logged = false; });
