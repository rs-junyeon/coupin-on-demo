import { mutate } from '@/shared/api';

/** 답변을 봤다고 표시한다 (마이 탭·문의 목록의 새 답변 표시가 꺼진다) */
export const markInquirySeen = (qid: string) => mutate(d => { const q = d.inquiries.find(x => x.id === qid); if (q && q.answer) q.seen = true; });
