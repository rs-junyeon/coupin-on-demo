import { mutate } from '@/shared/api';
import { iso } from '@/shared/lib';

/** 이번 달 정산 수동 실행 */
export const settleRun = () => mutate(d => { d.settle.runAt = iso(); });
