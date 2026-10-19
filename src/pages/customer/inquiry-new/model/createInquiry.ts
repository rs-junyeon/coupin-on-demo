import { ME, mutate, type InquiryType } from '@/shared/api';
import { iso } from '@/shared/lib';

/** 문의 접수. 새 문의 id를 돌려준다 */
export function createInquiry({ type, title, body }: { type: InquiryType; title: string; body: string }): string {
  const id = `q${Date.now()}`;
  mutate(d => { d.inquiries.unshift({ id, type, owner: ME, title, body, at: iso(), status: '접수', answer: null }); });
  return id;
}
