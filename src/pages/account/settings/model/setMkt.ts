import { mutate } from '@/shared/api';

/** 마케팅 수신 동의 */
export const setMkt = (on: boolean) => mutate(d => { d.account.mkt = on; });
