import { mutate } from '@/shared/api';

/** 이번 달 전체 한도 (A-02-04): 유료는 판매가 합계, 무료는 쿠폰 수량 */
export const setLimit = (total: number, ftotal: number) => mutate(d => { d.limit.total = total; d.limit.ftotal = ftotal; });
