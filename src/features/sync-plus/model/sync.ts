// PLUS 상품 수동 동기화 (PLUS 상품·PLUS 동기화 화면)
import { mutate } from '@/shared/api';
import { iso } from '@/shared/lib';

export const sync = () => mutate(d => { d.syncLog.unshift({ at: iso(), how: '수동', ok: true, n: d.products.length - 1 }); });
