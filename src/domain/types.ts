/** 날짜는 모두 ISO 8601 문자열로 저장한다 (브라우저 저장소에 그대로 들어간다) */
export type ISO = string;

export type LatLng = { lat: number; lng: number };
export type Bounds = { sw: LatLng; ne: LatLng };

/** 가게: 점주가 쿠핀 PLUS에 입력한 정보. ON은 받아서 쓰기만 한다 */
export type Store = {
  id: string; name: string; addr: string;
  /** 위치가 없으면 노출할 수 없다 */
  pos: LatLng | null;
  /** false = 점주의 PLUS 구독이 끊김. 신규 판매를 멈추고 자동으로 내린다 */
  sub: boolean;
  hours: string; intro: string; desc: string; phone: string;
};

export type Validity = { days: number; incl: boolean } | { until: string };
export type CouponType = '교환권' | '잔액권';
export type SaleType = 'SALE' | 'FREE';
export type PlusSale = 'ON_SALE' | 'STOPPED';
export type PlusApproval = 'APPROVED' | 'PENDING';
export type OnStatus = 'PUBLISHED' | 'HIDDEN' | 'DRAFT';

/** 판매 조건 변경 기록 (A-02-02-01) */
export type TermsLog = { at: ISO; who: string; text: string };

/** PLUS 변경 기록 (A-02-01-03). 동기화 때 저장한 값 */
export type PlusLogEntry = { at: ISO; k: 'start' | 'edit' | 'state'; f?: string; from?: string; to: string; on?: string };

/** 상품: 점주가 PLUS ON 내보내기 페이지에서 내보낸 상품 + ON이 정하는 판매 조건 */
export type Product = {
  id: string; sid: string; code: string; name: string; type: CouponType; sale: SaleType;
  /** 소비자가. 없으면 노출할 수 없다 */
  list: number | null;
  /** 점주 판매가 (PLUS에서 정함) */
  own: number;
  /** ON 판매가 (고객이 내는 금액, own 이하로만 조정) */
  price: number;
  val: Validity;
  plus: PlusSale; appr: PlusApproval; on: OnStatus;
  /** ON 운영자가 고르는 카테고리. 게시하려면 필요 */
  cat: string | null;
  /** 대표 상품 여부, 게시 순서 */
  rep: boolean; pub: number;
  /** 상품별 월 한도: 유료는 판매가 합계(원), 무료는 쿠폰 수량(장) */
  limit: number | null; limitUsed: number;
  resv: string | null; restr: string | null; notes: string[];
  hist: TermsLog[];
  plusLog: PlusLogEntry[];
};

export type Category = { color: string; icon: IconName };

/** 쿠폰 상태: PLUS 쿠폰 상태 값 */
export type CouponStatus = 'ISSUED' | 'IN_USE' | 'EXCHANGED' | 'CANCELLED';
export type Coupon = {
  id: string; pid: string; owner: string; oid: string;
  issuedAt: ISO; exp: ISO; pin: string; status: CouponStatus; usedAt: ISO | null;
  balance: number | null; paid: number;
  /** 고객이 무료 쿠폰을 직접 취소 */
  selfCancel?: { at: ISO };
  /** 고객이 무료 쿠폰 취소를 요청했지만 이미 사용돼 거절됨 */
  selfCancelRejected?: { at: ISO };
  /** 운영자 직접 취소 */
  cancel?: { at: ISO; who: string; reason: string };
  /** 이 앱에서 새로 발급한 쿠폰 (판매 현황 오늘 집계에 더한다) */
  live?: boolean;
};

export type OrderStatus = '결제 확인 중' | '발급 중' | '완료' | '실패(결제 취소됨)' | '환불 처리 중' | '환불 완료';
export type Order = {
  id: string; cid: string | null; pid: string; owner: string; amount: number; at: ISO;
  status: OrderStatus; method: string; note?: string;
  /** 발급 응답을 받지 못한 주문 (관리자에게만 '결과 미확인'으로 보인다) */
  unconfirmed?: boolean;
  log: [ISO, string][];
  live?: boolean;
};

export type Refund = { oid: string; at: ISO; result: '완료' | '처리 중' | '거절'; memo: string; kind?: 'req' | 'ops' };

export type InquiryType = '결제·환불' | '쿠폰 사용' | '매장 정보 오류' | '기타';
export type InquiryStatus = '접수' | '처리 중' | '답변 완료';
export type Inquiry = {
  id: string; type: InquiryType; owner: string; title: string; body: string; at: ISO;
  status: InquiryStatus; answer: string | null; seen?: boolean; forwarded?: boolean;
};

export type SyncLog = { at: ISO; how: '자동' | '수동'; ok: boolean; n?: number; err?: string };

export type SocialProvider = 'kakao' | 'google';
/** 고객 계정. 같은 사람인지는 문자로 인증한 휴대폰 번호로 판단한다 */
export type Account = {
  logged: boolean; userId: string; name: string; phone: string;
  links: { pw: boolean; kakao: boolean; google: boolean };
  mkt: boolean;
};

export type DB = {
  stores: Store[];
  products: Product[];
  cats: Record<string, Category>;
  coupons: Coupon[];
  orders: Order[];
  refunds: Refund[];
  inquiries: Inquiry[];
  syncLog: SyncLog[];
  /** 이번 달 전체 한도: 유료는 판매가 합계, 무료는 쿠폰 수량 */
  limit: { total: number; used: number; ftotal: number; fused: number };
  /** 이번 달 1일부터 어제까지 누적 (판매 현황) */
  base: { issued: number; gmv: number };
  /** 이번 달 일별 발급 건수 (1일부터 오늘까지) */
  daily: number[];
  settle: { checked: boolean; done: boolean; runAt: ISO | null };
  account: Account;
  admin: { logged: boolean; name: string };
  seq: number; pubSeq: number;
};

export type IconName =
  | 'beauty' | 'hair' | 'fit' | 'cafe' | 'class' | 'photo' | 'search' | 'locate' | 'map' | 'list' | 'ticket' | 'user'
  | 'back' | 'chev' | 'down' | 'up' | 'check' | 'x' | 'lock' | 'chart' | 'box' | 'receipt' | 'coins' | 'refund' | 'chat'
  | 'place' | 'phone' | 'info' | 'doc' | 'out' | 'send' | 'alert' | 'card' | 'store' | 'tag' | 'food' | 'pet' | 'gift' | 'clock';
