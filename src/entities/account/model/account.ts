// 고객 계정: 관리자 화면에 보이는 고객 이름
import { ME } from '@/shared/api';

export const who = (owner: string) => (owner === ME ? '김*온' : owner);
