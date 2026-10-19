// 문의 (A-05-01): 답변·상태 변경·PLUS 전달
import { mutate, type InquiryStatus } from '@/shared/api';

export const replyInquiry = (qid: string, text: string) => mutate(d => { const q = d.inquiries.find(x => x.id === qid)!; q.answer = text; q.status = '답변 완료'; q.seen = false; });
export const setInquiryStatus = (qid: string, st: InquiryStatus) => mutate(d => { d.inquiries.find(x => x.id === qid)!.status = st; });
/** 매장 정보 오류는 점주가 PLUS에서 고치도록 전달한다 */
export const forwardInquiry = (qid: string) => mutate(d => { const q = d.inquiries.find(x => x.id === qid)!; q.forwarded = true; q.status = '처리 중'; });
