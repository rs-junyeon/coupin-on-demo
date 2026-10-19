// 문의: 아직 보지 않은 답변
import { type DB, type InquiryStatus, ME } from '@/shared/api';

export const unseenAnswer = (db: DB) => db.inquiries.some(q => q.owner === ME && !!q.answer && !q.seen);

export const inqChip = (st: InquiryStatus) => (st === '답변 완료' ? 'st-ok' : st === '처리 중' ? 'st-part' : 'st-warn');
