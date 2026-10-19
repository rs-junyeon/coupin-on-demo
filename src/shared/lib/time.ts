// 날짜·금액 표기. 고객 앱은 MM.DD HH:mm · YYYY.MM.DD, 관리자는 쿠핀+ 관리자 웹과 같은 YYYY-MM-DD HH:mm
export const DAY = 86400000;
export const p2 = (n: number) => String(n).padStart(2, '0');
export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const now = () => new Date();
/** 지금 시각 (저장용 ISO 문자열) */
export const iso = () => new Date().toISOString();
export const today = () => startOfDay(new Date());
export const toD = (iso: string) => new Date(iso);

export const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;
export const ymdDot = (d: Date | string) => { const x = new Date(d); return `${x.getFullYear()}.${p2(x.getMonth() + 1)}.${p2(x.getDate())}`; };
export const ymd = (d: Date | string) => { const x = new Date(d); return `${x.getFullYear()}-${p2(x.getMonth() + 1)}-${p2(x.getDate())}`; };
export const md = (d: Date | string) => { const x = new Date(d); return `${x.getMonth() + 1}월 ${x.getDate()}일`; };
export const hm = (d: Date | string) => { const x = new Date(d); return `${p2(x.getHours())}:${p2(x.getMinutes())}`; };
/** 고객 앱 목록 표기: 10.15 09:12 */
export const mdhm = (d: Date | string) => { const x = new Date(d); return `${p2(x.getMonth() + 1)}.${p2(x.getDate())} ${hm(x)}`; };
/** 관리자 표기: 2026-10-15 09:12 */
export const dtA = (d: Date | string) => `${ymd(d)} ${hm(d)}`;
export const monthLabel = (d: Date) => `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
export const monthKey = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}`;
/** 만료일까지 남은 날 (오늘 = 0) */
export const daysLeft = (exp: Date | string, base = today()) => Math.round((startOfDay(new Date(exp)).getTime() - base.getTime()) / DAY);
