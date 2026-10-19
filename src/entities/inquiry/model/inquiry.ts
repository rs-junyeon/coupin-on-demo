// 문의: 아직 보지 않은 답변
import { type DB, ME } from '@/shared/api';

export const unseenAnswer = (db: DB) => db.inquiries.some(q => q.owner === ME && !!q.answer && !q.seen);
