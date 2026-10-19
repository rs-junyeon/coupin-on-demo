// 입력·표기 도우미: 숫자만 남기기, 휴대폰·아이디 가리기, 천 단위 쉼표, 로그인 뒤 돌아갈 주소

export const digits = (s: string) => s.replace(/\D/g, '');

export const maskPhone = (p: string) => { const d = digits(p); return `${d.slice(0, 3)}-****-${d.slice(-4)}`; };
export const maskId = (id: string) => `${id.slice(0, 4)}****`;
export const fmtPhone = (p: string) => { const d = digits(p); return d.length === 11 ? `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}` : d.length === 10 ? `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}` : p; };

/** InputNumber 천 단위 쉼표 */
export const numFmt = (v: number | string | undefined) => `${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
export const numParse = (v: string | undefined) => Number((v ?? '').replace(/\D/g, ''));

/** 로그인 뒤 돌아갈 주소: 앱 안 경로만 받는다 */
export const safeNext = (raw: string | null, fallback = '/') => (raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : fallback);
