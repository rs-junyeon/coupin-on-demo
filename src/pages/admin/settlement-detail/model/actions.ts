import { mutate } from '@/shared/api';

/** PLUS 발급 기록과 대조를 마쳤다 */
export const settleCheck = () => mutate(d => { d.settle.checked = true; });
/** 정산 확정 */
export const settleConfirm = () => mutate(d => { d.settle.done = true; });
