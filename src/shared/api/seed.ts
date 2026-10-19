// 예시 데이터 (목업 on-mockup-split.html의 seed와 같은 내용). 목업 기준일 2026-10-15와 오늘의 차이만큼 날짜를 옮긴다
import { addDays, p2, SEONGSU, startOfDay } from '@/shared/lib';
import { CAT_COLORS } from '@/shared/config';
import { expOf, ME } from './lookups';
import type { Category, Coupon, CouponStatus, DB, Inquiry, Order, PlusLogEntry, Product, Refund, Store } from './schema';

export const STORAGE_KEY = 'coupin-on-demo-v2';
/** 같은 사람인지는 문자로 인증한 휴대폰 번호로 판단한다. 이 번호로 가입한 계정이 이미 있다 (on_user) */
export const ACCT_PHONE = '010-1234-5678';
const BASE = new Date(2026, 9, 15);

export function seedCats(): Record<string, Category> {
  return {
    '뷰티': { color: CAT_COLORS[0], icon: 'beauty' },
    '헤어': { color: CAT_COLORS[1], icon: 'hair' },
    '운동': { color: CAT_COLORS[2], icon: 'fit' },
    '카페': { color: CAT_COLORS[3], icon: 'cafe' },
    '클래스': { color: CAT_COLORS[4], icon: 'class' },
    '사진': { color: CAT_COLORS[5], icon: 'photo' },
  };
}

export function pinOf(n: number) {
  let s = '', x = n;
  for (let i = 0; i < 16; i++) { x = (x * 1103515245 + 12345) % 2147483648; s += Math.floor((x / 2147483648) * 10); }
  return s;
}

export function seed(now = new Date()): DB {
  const today = startOfDay(now);
  /** 목업 날짜(월, 일, 시, 분) → 오늘 기준으로 옮긴 날짜 */
  const T = (mo: number, d: number, h = 0, mi = 0) => {
    const diff = Math.round((new Date(2026, mo - 1, d).getTime() - BASE.getTime()) / 86400000);
    const x = addDays(today, diff); x.setHours(h, mi, 0, 0); return x;
  };
  const iso = (mo: number, d: number, h = 0, mi = 0) => T(mo, d, h, mi).toISOString();
  const ymdC = (x: Date) => `${x.getFullYear()}${p2(x.getMonth() + 1)}${p2(x.getDate())}`;
  /** 목업 지도 좌표(%) → 성수역 기준 위경도 (가로 1% ≈ 24m, 세로 1% ≈ 34m) */
  const pos = (x: number, y: number) => ({ lat: +(SEONGSU.lat - ((y - 50.4) * 34) / 111000).toFixed(6), lng: +(SEONGSU.lng + ((x - 50) * 24) / 88000).toFixed(6) });

  const stores: Store[] = [
    { id: 's1', name: '네일하우스 성수', pos: pos(33, 37), addr: '서울 성동구 성수이로 88, 2층', sub: true, phone: '02-462-0101', hours: '매일 11:00 ~ 21:00', intro: '1인 원장이 운영하는 예약제 네일숍이에요', desc: '원컬러부터 아트까지, 한 분 한 분 상담하고 시술해요. 시술 도구는 손님마다 소독해서 써요.' },
    { id: 's2', name: '무브 필라테스', pos: pos(64, 30), addr: '서울 성동구 성수일로 12, 3층', sub: true, phone: '02-462-0202', hours: '평일 07:00 ~ 22:00 · 주말 09:00 ~ 18:00', intro: '기구 필라테스 1:1·그룹 수업', desc: '리포머·캐딜락 기구를 갖춘 스튜디오예요. 처음 오시면 자세를 보고 수업 강도를 맞춰 드려요.' },
    { id: 's3', name: '카페 온도', pos: pos(46, 61), addr: '서울 성동구 연무장길 41', sub: true, phone: '02-462-0303', hours: '매일 09:00 ~ 22:00', intro: '직접 볶은 원두로 내리는 동네 카페', desc: '매주 원두를 직접 볶아요. 시그니처 온도 라떼와 디저트가 있어요. 2층에 조용한 좌석이 있어요.' },
    { id: 's4', name: '공방 손끝', pos: pos(73, 58), addr: '서울 성동구 연무장5길 9, 1층', sub: true, phone: '02-462-0404', hours: '화~일 12:00 ~ 20:00 · 월 휴무', intro: '처음이어도 괜찮은 도자기 원데이 클래스', desc: '손으로 빚기와 물레 체험을 할 수 있는 공방이에요. 완성품은 구워서 3주 뒤 받아요.' },
    { id: 's5', name: '바버 성수', pos: pos(20, 54), addr: '서울 성동구 아차산로 17', sub: true, phone: '02-462-0505', hours: '매일 10:00 ~ 20:00', intro: '남성 커트·두피 관리 전문', desc: '예약하면 기다리지 않아요. 커트에 샴푸와 스타일링이 포함돼요.' },
    { id: 's6', name: '요가 숨', pos: pos(34, 76), addr: '서울 성동구 서울숲2길 30, 4층', sub: true, phone: '02-462-0606', hours: '평일 07:00 ~ 21:30 · 토 09:00 ~ 14:00', intro: '서울숲이 보이는 빈야사 요가원', desc: '정원 10명 소규모 수업이에요. 매트와 수건을 빌려 드려요.' },
    { id: 's7', name: '꽃집 오월', pos: pos(82, 40), addr: '서울 성동구 성수이로7길 21', sub: false, phone: '02-462-0707', hours: '매일 10:00 ~ 20:00', intro: '계절 꽃다발과 꽃 클래스', desc: '그날 들어온 꽃으로 꽃다발을 만들어요.' },
    { id: 's8', name: '스튜디오 빛', pos: pos(62, 77), addr: '서울 성동구 서울숲4길 15, 2층', sub: true, phone: '02-462-0808', hours: '예약제 · 10:00 ~ 19:00', intro: '자연광 프로필 사진 스튜디오', desc: '큰 창으로 들어오는 자연광으로 찍어요. 보정본은 메일로 보내 드려요.' },
    { id: 's9', name: '리틀 베이커리', pos: null, addr: '주소 미입력', sub: true, phone: '02-462-0909', hours: '-', intro: '소금빵 맛집', desc: '' },
  ];

  // PLUS 변경 기록 (목업 PLOG). '월.일 시:분'을 오늘 기준으로 옮긴다
  const L = (at: string, k: PlusLogEntry['k'], rest: Omit<PlusLogEntry, 'at' | 'k'>): PlusLogEntry => {
    const [m, d, h, mi] = at.split(/[.\s:]/).map(Number);
    return { at: iso(m, d, h, mi), k, ...rest };
  };
  const PLOG: Record<string, PlusLogEntry[]> = {
    p1: [L('09.20 10:12', 'start', { to: '점주 판매가 15,000원 · 소비자가 35,000원' }), L('10.02 16:40', 'edit', { f: '유의사항', from: '원컬러 젤네일 기준이에요. 아트·연장은 현장에서 추가 결제해요.', to: '원컬러 젤네일 기준이에요. 아트·연장은 현장에서 추가 결제해요. 예약 시간보다 10분 넘게 늦으면 시술이 어려울 수 있어요.' })],
    p2: [L('09.22 11:05', 'start', { to: '무료 · 소비자가 10,000원' }), L('10.08 13:20', 'edit', { f: '사용 제한', from: '없음', to: '1인 1회만 받을 수 있어요.' })],
    p3: [L('09.25 15:31', 'start', { to: '점주 판매가 39,000원 · 소비자가 70,000원' }), L('10.05 10:02', 'edit', { f: '유효기간', from: '받은 날 포함 60일', to: '2026.12.31까지' })],
    p4: [L('09.18 09:47', 'start', { to: '점주 판매가 25,000원 · 소비자가 60,000원' }), L('09.30 18:15', 'edit', { f: '점주 판매가', from: '25,000원', to: '22,000원', on: 'PLUS 재승인 대기로 바뀌어 ON 신규 판매를 잠시 멈췄어요' }), L('10.01 10:30', 'state', { f: 'PLUS 재승인 완료', to: 'ON 판매를 다시 시작했어요' })],
    p5: [L('09.18 09:52', 'start', { to: '점주 판매가 9,900원 · 소비자가 25,000원' })],
    p6: [L('09.21 08:40', 'start', { to: '무료 · 소비자가 4,500원' }), L('10.11 09:15', 'edit', { f: '유의사항', from: 'HOT·ICE 모두 가능해요.', to: 'HOT·ICE 모두 가능해요. 사이즈 업은 현장에서 추가 결제해요.' })],
    p7: [L('09.21 08:44', 'start', { to: '점주 판매가 3,000원 · 소비자가 6,500원' }), L('10.03 14:10', 'edit', { f: '상품명', from: '온도 라떼 교환권', to: '시그니처 온도 라떼 교환권' })],
    p8: [L('09.26 17:22', 'start', { to: '점주 판매가 25,000원 · 소비자가 55,000원' }), L('10.07 12:48', 'edit', { f: '유의사항', from: '2시간 수업, 컵이나 접시 1개를 만들어요. 완성품은 3주 뒤 찾아가요.', to: '2시간 수업, 컵이나 접시 1개를 만들어요. 완성품은 3주 뒤 찾아가거나 택배로 받아요(택배비 별도).' })],
    p9: [L('09.27 10:05', 'start', { to: '점주 판매가 12,000원 · 소비자가 25,000원' })],
    p10: [L('09.19 19:30', 'start', { to: '무료 · 소비자가 22,000원' })],
    p11: [L('09.28 20:11', 'start', { to: '점주 판매가 55,000원 · 소비자가 88,000원' }), L('10.14 18:02', 'edit', { f: '점주 판매가', from: '55,000원', to: '49,000원', on: 'PLUS 재승인 대기라 고객 화면에서 자동으로 내렸어요' }), L('10.14 18:02', 'edit', { f: '유의사항', from: '4회를 30일 안에 나눠 쓸 수 있어요.', to: '4회를 60일 안에 나눠 쓸 수 있어요.' })],
    p12: [L('09.24 13:00', 'start', { to: '금액권 · 점주 판매가 25,000원 · 소비자가 30,000원' }), L('10.12 00:00', 'state', { f: 'PLUS 구독 종료', to: '가게의 PLUS 구독이 끝났어요', on: '신규 판매를 멈추고 자동으로 내렸어요. 발급된 쿠폰은 유효기간까지 쓸 수 있어요' })],
    p13: [L('09.24 13:04', 'start', { to: '점주 판매가 24,000원 · 소비자가 45,000원' }), L('10.09 11:30', 'state', { f: 'PLUS 판매 중지', to: '점주가 PLUS에서 판매를 멈췄어요', on: '고객 화면에서 자동으로 내렸어요' }), L('10.12 00:00', 'state', { f: 'PLUS 구독 종료', to: '가게의 PLUS 구독이 끝났어요' })],
    p14: [L('10.13 15:40', 'start', { to: '점주 판매가 49,000원 · 소비자가 80,000원' })],
    p15: [L('10.14 09:20', 'start', { to: '무료 · 소비자가 9,000원', on: '가게 위치가 없어 노출할 수 없어요 (점주가 PLUS에서 입력)' })],
    p16: [L('10.14 16:55', 'start', { to: '점주 판매가 69,000원 · 소비자가 98,000원' })],
    p17: [L('10.15 08:30', 'start', { to: '무료 · 소비자가 없음', on: '소비자가가 없는 무료 상품이라 노출할 수 없어요 (점주가 PLUS에서 입력)' })],
  };
  const CAT0: Record<string, string> = { p1: '뷰티', p2: '뷰티', p3: '뷰티', p4: '운동', p5: '운동', p6: '카페', p7: '카페', p8: '클래스', p9: '헤어', p10: '운동', p11: '운동', p12: '클래스', p13: '클래스' };
  type PIn = Partial<Product> & Pick<Product, 'id' | 'sid' | 'name' | 'sale' | 'list' | 'own' | 'price' | 'val'>;
  const P = (o: PIn): Product => ({
    code: `P${o.id.slice(1).padStart(4, '0')}ON`, type: '교환권', plus: 'ON_SALE', appr: 'APPROVED', on: 'PUBLISHED', rep: false, limit: null, limitUsed: 0, pub: 0,
    hist: [], resv: null, restr: null, notes: [], cat: CAT0[o.id] ?? null, plusLog: PLOG[o.id] ?? [], ...o,
  });
  const products: Product[] = [
    P({ id: 'p1', sid: 's1', name: '젤네일 첫 방문 체험권', sale: 'SALE', list: 35000, own: 15000, price: 15000, val: { days: 30, incl: true }, rep: true, pub: 5, limit: 360000, limitUsed: 135000, resv: '방문 전 매장 전화로 예약해 주세요.', restr: '첫 방문 고객만 쓸 수 있어요.', notes: ['원컬러 젤네일 기준이에요. 아트·연장은 현장에서 추가 결제해요.', '예약 시간보다 10분 넘게 늦으면 시술이 어려울 수 있어요.'] }),
    P({ id: 'p2', sid: 's1', name: '핸드 케어 무료 체험', sale: 'FREE', list: 10000, own: 0, price: 0, val: { days: 14, incl: true }, pub: 8, limit: 30, limitUsed: 7, restr: '1인 1회만 받을 수 있어요.', notes: ['큐티클 정리와 보습 케어 15분이에요.'] }),
    P({ id: 'p3', sid: 's1', name: '젤네일 + 젤패디 세트', sale: 'SALE', list: 70000, own: 39000, price: 39000, val: { until: '2026-12-31' }, pub: 2, resv: '방문 전 매장 전화로 예약해 주세요.', restr: '평일에만 쓸 수 있어요.', notes: ['손·발 원컬러 기준이에요.'] }),
    P({ id: 'p4', sid: 's2', name: '1:1 체험 레슨 50분', sale: 'SALE', list: 60000, own: 22000, price: 19900, val: { days: 60, incl: true }, rep: true, pub: 6, limit: 300000, limitUsed: 159200, hist: [{ at: iso(10, 10, 14, 20), who: '박운영', text: '판매가 22,000원 → 19,900원 · 한도 300,000원 · 점주에게 알림' }], resv: '네이버 예약이나 전화로 원하는 시간을 정해 주세요.', restr: '첫 방문 고객만 쓸 수 있어요.', notes: ['기구 필라테스 1:1 수업이에요.', '운동복을 챙겨 오세요. 개인 사물함이 있어요.'] }),
    P({ id: 'p5', sid: 's2', name: '그룹 레슨 1회권', sale: 'SALE', list: 25000, own: 9900, price: 9900, val: { days: 30, incl: true }, pub: 4, resv: '수업 시간표를 확인하고 예약해 주세요.', notes: ['정원 6명 그룹 수업이에요.'] }),
    P({ id: 'p6', sid: 's3', name: '아메리카노 한 잔', sale: 'FREE', list: 4500, own: 0, price: 0, val: { days: 14, incl: true }, rep: true, pub: 7, limit: 100, limitUsed: 43, restr: '1인 1회만 받을 수 있어요.', notes: ['HOT·ICE 모두 가능해요.', '사이즈 업은 현장에서 추가 결제해요.'] }),
    P({ id: 'p7', sid: 's3', name: '시그니처 온도 라떼 교환권', sale: 'SALE', list: 6500, own: 3000, price: 3000, val: { days: 30, incl: true }, pub: 3, notes: ['시그니처 라떼 한 잔으로 바꿀 수 있어요.'] }),
    P({ id: 'p8', sid: 's4', name: '원데이 도자기 클래스', sale: 'SALE', list: 55000, own: 25000, price: 25000, val: { days: 90, incl: true }, rep: true, pub: 6, resv: '클래스는 예약제예요. 매장 전화로 날짜를 정해 주세요.', notes: ['2시간 수업, 컵이나 접시 1개를 만들어요.', '완성품은 3주 뒤 찾아가거나 택배로 받아요(택배비 별도).'] }),
    P({ id: 'p9', sid: 's5', name: '남성 커트 첫 방문', sale: 'SALE', list: 25000, own: 12000, price: 12000, val: { days: 30, incl: true }, rep: true, pub: 5, resv: '방문 전 예약하면 기다리지 않아요.', restr: '첫 방문 고객만 쓸 수 있어요.', notes: ['커트와 샴푸가 포함돼요.'] }),
    P({ id: 'p10', sid: 's6', name: '첫 수업 무료 체험', sale: 'FREE', list: 22000, own: 0, price: 0, val: { days: 30, incl: true }, rep: true, pub: 6, limit: 10, limitUsed: 10, resv: '수업 시간표를 확인하고 예약해 주세요.', notes: ['빈야사 요가 60분 수업이에요.', '요가 매트를 빌려드려요.'] }),
    P({ id: 'p11', sid: 's6', name: '요가 4회권', appr: 'PENDING', sale: 'SALE', list: 88000, own: 49000, price: 49000, val: { days: 60, incl: true }, pub: 4, resv: '수업 시간표를 확인하고 예약해 주세요.', notes: ['4회를 60일 안에 나눠 쓸 수 있어요.'] }),
    P({ id: 'p12', sid: 's7', name: '꽃집 오월 3만원 금액권', type: '잔액권', sale: 'SALE', list: 30000, own: 25000, price: 25000, val: { until: '2027-03-31' }, rep: true, pub: 5, notes: ['3만원 안에서 여러 번 나눠 쓸 수 있어요.', '남은 금액은 쿠폰 화면에서 확인할 수 있어요.'] }),
    P({ id: 'p13', sid: 's7', name: '계절 꽃다발 클래스', sale: 'SALE', list: 45000, own: 24000, price: 24000, val: { days: 60, incl: true }, plus: 'STOPPED', pub: 3, notes: ['계절 꽃으로 꽃다발을 만들어 가져가요.'] }),
    P({ id: 'p14', sid: 's8', name: '프로필 사진 촬영 체험', sale: 'SALE', list: 80000, own: 49000, price: 49000, val: { days: 60, incl: true }, on: 'DRAFT', resv: '촬영은 예약제예요. 매장 전화로 날짜를 정해 주세요.', notes: ['20분 촬영, 보정본 2장을 메일로 받아요.', '의상 1벌 기준이에요.'] }),
    P({ id: 'p15', sid: 's9', name: '소금빵 3개 교환권', sale: 'FREE', list: 9000, own: 0, price: 0, val: { days: 14, incl: true }, on: 'DRAFT' }),
    P({ id: 'p16', sid: 's4', name: '물레 체험 2인', sale: 'SALE', list: 98000, own: 69000, price: 69000, val: { days: 90, incl: true }, on: 'DRAFT', resv: '클래스는 예약제예요.', notes: ['두 사람이 함께 수업을 들어요.'] }),
    P({ id: 'p17', sid: 's5', name: '두피 스케일링 무료 체험', sale: 'FREE', list: null, own: 0, price: 0, val: { days: 30, incl: true }, on: 'DRAFT', notes: ['두피 상태 진단과 스케일링 20분이에요.'] }),
  ];

  const others = ['김*진', '이*아', '박*호', '최*름', '정*우', '한*별', '윤*서', '오*민', '서*연', '강*현'];
  const coupons: Coupon[] = [], orders: Order[] = [];
  const mk = (i: number, pid: string, owner: string, at: Date, status: CouponStatus, usedAt?: Date) => {
    const p = products.find(x => x.id === pid)!;
    const oid = `ON-${ymdC(at)}-${String(40 + i).padStart(4, '0')}`;
    const c: Coupon = { id: `c${i}`, pid, owner, oid, issuedAt: at.toISOString(), exp: expOf(p, at).toISOString(), pin: pinOf(i * 7919 + 12345), status, usedAt: usedAt ? usedAt.toISOString() : null, balance: p.type === '잔액권' ? p.list : null, paid: p.price };
    coupons.push(c);
    if (p.price > 0) orders.push({ id: oid, cid: c.id, pid, owner, amount: p.price, at: at.toISOString(), status: status === 'CANCELLED' ? '환불 완료' : '완료', method: '신용·체크카드', log: [] });
    return c;
  };
  mk(1, 'p4', others[0], T(10, 15, 9, 12), 'ISSUED');
  mk(2, 'p6', others[1], T(10, 15, 8, 41), 'EXCHANGED', T(10, 15, 9, 5));
  mk(3, 'p1', others[2], T(10, 14, 21, 3), 'ISSUED');
  mk(4, 'p8', others[3], T(10, 14, 18, 27), 'ISSUED');
  mk(5, 'p2', others[4], T(10, 14, 13, 50), 'EXCHANGED', T(10, 14, 17, 20));
  mk(6, 'p12', others[5], T(10, 14, 11, 2), 'IN_USE').balance = 12000;
  mk(7, 'p9', others[6], T(10, 13, 19, 44), 'CANCELLED');
  mk(8, 'p5', others[7], T(10, 13, 10, 15), 'EXCHANGED', T(10, 14, 19, 30));
  mk(9, 'p6', others[8], T(10, 12, 15, 8), 'ISSUED');
  mk(10, 'p11', others[9], T(10, 12, 9, 31), 'ISSUED');
  // 내 쿠폰 (김*온, on_user)
  mk(11, 'p7', ME, T(10, 3, 12, 10), 'EXCHANGED', T(10, 5, 14, 22));
  mk(12, 'p9', ME, T(8, 20, 18, 0), 'ISSUED');
  // 결제 취소가 막혀 운영자가 다시 처리해야 하는 주문
  const stuckId = `ON-${ymdC(T(10, 13))}-0036`;
  orders.push({ id: stuckId, cid: null, pid: 'p3', owner: '문*정', amount: 39000, at: iso(10, 13, 16, 2), status: '환불 처리 중', note: '결제 취소 자동 재시도 3회 실패', method: '신용·체크카드',
    log: [[iso(10, 13, 16, 30), '고객 환불 요청 → PLUS 발급 취소 완료'], [iso(10, 13, 16, 45), '결제 취소 자동 재시도 3회 실패 → 환불 처리 중, 운영자 알림']] });
  // 발급 응답을 받지 못한 결과 미확인 주문: 결제 취소하지 않고 tid로 확인한다
  orders.push({ id: `ON-${ymdC(T(10, 15))}-0099`, cid: null, pid: 'p8', owner: '정*우', amount: 25000, at: iso(10, 15, 9, 48), status: '발급 중', unconfirmed: true, method: '간편결제', note: 'PLUS 발급 응답 시간 초과 · tid로 결과 확인 중', log: [] });
  orders.sort((a, b) => +new Date(b.at) - +new Date(a.at));
  const oOf = (cid: string) => orders.find(o => o.cid === cid)!;
  oOf('c7').log = [[iso(10, 13, 20, 10), '고객 환불 요청 → PLUS 발급 취소 → 결제 취소 완료']];
  oOf('c8').log = [[iso(10, 14, 19, 31), '고객 환불 요청 → PLUS 취소 거절(이미 사용) → 환불하지 않음']];
  const refunds: Refund[] = [
    { oid: oOf('c7').id, at: iso(10, 13, 20, 10), result: '완료', memo: '고객 요청 · 자동 처리', kind: 'req' },
    { oid: stuckId, at: iso(10, 13, 16, 30), result: '처리 중', memo: '결제 취소 자동 재시도 3회 실패 · 운영자 알림 보냄', kind: 'req' },
    { oid: oOf('c8').id, at: iso(10, 14, 19, 31), result: '거절', memo: 'PLUS 취소 거절: 19:30 매장에서 사용됨', kind: 'req' },
  ];
  const inquiries: Inquiry[] = [
    { id: 'q1', type: '결제·환불', owner: '문*정', title: '환불 신청했는데 언제 들어오나요?', body: '젤네일 세트를 환불 요청했는데 아직 카드 취소가 안 됐어요. 언제 처리되나요?', at: iso(10, 15, 8, 20), status: '접수', answer: null },
    { id: 'q2', type: '매장 정보 오류', owner: '서*연', title: '꽃집 오월 위치가 지도와 달라요', body: '지도에는 성수이로7길로 나오는데 실제로는 한 블록 아래 골목에 있어요.', at: iso(10, 14, 20, 11), status: '접수', answer: null },
    { id: 'q3', type: '쿠폰 사용', owner: '김*진', title: '바코드가 안 찍혀요', body: '매장에서 바코드가 안 읽힌다고 해서 PIN 번호로 사용했어요. 정상인가요?', at: iso(10, 13, 17, 45), status: '답변 완료', answer: '네, PIN 번호로 승인돼도 정상 사용이에요. 화면 밝기를 최대로 올리면 바코드가 더 잘 읽혀요.' },
    { id: 'q0', type: '쿠폰 사용', owner: ME, title: '금액권 남은 금액은 어디서 보나요?', body: '꽃집 오월 금액권을 일부 쓰고 나면 남은 금액을 어디서 확인하나요?', at: iso(10, 6, 19, 12), status: '답변 완료', seen: false, answer: '내 쿠폰에서 금액권을 누르면 쿠폰 화면에 남은 금액이 함께 보여요. 매장에서 쓸 때마다 바로 바뀌어요.' },
  ];
  // 이번 달 일별 발급 건수 (목업 값을 반복해 1일부터 오늘까지)
  const DAILY = [9, 12, 8, 14, 11, 6, 7, 13, 15, 12, 16, 10, 14, 18, 11];
  const daily = Array.from({ length: today.getDate() }, (_, i) => DAILY[i % DAILY.length]);
  const syncAt = (h: number) => { const x = new Date(today); x.setHours(h, 0, 0, 0); return x.toISOString(); };

  return {
    stores, products, cats: seedCats(), coupons, orders, refunds, inquiries,
    syncLog: [{ at: syncAt(9), how: '자동', ok: true, n: 16 }, { at: syncAt(6), how: '자동', ok: false, err: 'PLUS API 응답 시간 초과 (30초) · 마지막 성공 데이터 유지' }, { at: syncAt(3), how: '자동', ok: true, n: 16 }],
    limit: { total: 3000000, used: 2316400, ftotal: 300, fused: 64 },
    base: { issued: 176, gmv: 2316400 },
    daily,
    settle: { checked: false, done: false, runAt: null },
    account: { logged: false, userId: 'on_user', name: '김*온', phone: ACCT_PHONE, links: { pw: true, kakao: false, google: false }, mkt: false },
    admin: { logged: false, name: '박운영' },
    seq: 101, pubSeq: 10,
  };
}
