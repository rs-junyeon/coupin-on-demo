# 쿠핀 ON 설계 (지금 기획 기준)

- 갱신: 2026-10-19 · 기획: [PRD](https://docs.google.com/document/d/1GtdLziD9oJuto-a25ZCMMmhbz7Xru84yAoz6xQ5ZYy4/edit) · [IA 시트](https://docs.google.com/spreadsheets/d/14w8AZtN1QRWIVaoa3FjKefu8RxSkAZa9Zh0Vp3CXa4k/edit) · [첫 출시 범위](https://docs.google.com/document/d/1uycjl93NupoXuT5iOje9jxzkYxXhfHHqDn2oWMityws/edit) (2026-10-16) · 화면 원본: `on-planning/on-mockup-split.html` (상품 탭 분리안)
- 이전 버전(2026-10-12, Halo 보강 구조)은 git 기록에 있다.

## 1. 서비스 구조

점주가 쿠핀 PLUS의 **ON 내보내기 페이지**에서 상품과 판매가를 내보낸다 → ON 운영자가 **카테고리**를 고르고(필요하면 가격을 할인 방향으로만 조정) 게시한다 → 고객은 지도·매장 목록에서 쿠폰을 받거나 사서 매장에서 쓴다.

- 상품 정보·가게 위치·소비자가·점주 판매가는 PLUS 값이고 ON에서 바꾸지 않는다.
- 고객 노출 조건: ON 게시 + PLUS 판매 중 + PLUS 승인 + 가게 위치 있음 + 점주 PLUS 구독 중 (`entities/product` `visible`)
- 판매수수료: 판매가의 n%(미정, 데모 10%). 무료 쿠폰·취소 주문은 0원. 정산 상대는 점주.
- 한도: 이번 달 전체(유료 판매가 합계, 무료 쿠폰 수량)와 상품별 월 한도. 넘으면 받기·구매를 막는다.

## 2. 고객 앱 (`/`, 모바일 웹)

| 주소 | 화면 |
| --- | --- |
| `/` | 둘러보기: 검색창, 카테고리 칩(게시 상품이 있는 카테고리만), 카카오맵 가게 핀, 가게 시트, 내 위치, 이 지역에서 다시 찾기 |
| `/search` | 검색 (가게·상품 이름, 카테고리) |
| `/stores`, `/stores/:sid` | 매장 탭 (거리순, 칩·검색), 매장 상세 (소개·영업시간·길찾기·전화·상품) |
| `/products/:pid` | 상품 상세, 무료 받기·구매 (로그인 먼저, 로그인 뒤 이어서 진행) |
| `/checkout/:pid` → `/pay/:pid` → `/complete/:cid` · `/fail/:pid` | 결제(수단·동의) → PG 결제창 → 발급 완료·실패 |
| `/wallet`, `/coupons/:cid` | 내 쿠폰 (전체·사용 가능·사용 완료·만료), 쿠폰 (바코드·PIN, 유료 환불 요청·무료 쿠폰 취소) |
| `/my`, `/my/orders`, `/my/orders/:oid` | 마이, 주문·환불 내역 (주문(결제) \| 취소/환불), 주문 상세 |
| `/my/profile`, `/my/withdraw`, `/account/delete` | 회원 정보·로그인 방법 연결, 회원 탈퇴, 계정 삭제 안내 |
| `/my/inquiries`, `/my/inquiries/new`, `/my/inquiries/:qid` | 문의 목록·작성·상세 (새 답변 표시) |
| `/my/settings`, `/docs/:key` | 설정·약관, 약관 문서 |
| `/login`, `/signup`, `/find-account`, `/oauth/:prov`, `/oauth/:prov/phone` | 로그인, 회원가입, 계정 찾기, 소셜 동의, 휴대폰 확인으로 같은 계정 연결 |

계정 통합: 문자로 인증한 휴대폰 번호가 같으면 로그인 방법(아이디·비밀번호, 카카오, Google)이 달라도 한 계정이다.

## 3. 관리자 (`/admin`, antd 5)

| 메뉴 | 주소 | IA |
| --- | --- | --- |
| 로그인 | `/admin/login` | A-00-01 |
| 판매 현황 | `/admin` | A-01, 운영 알림 A-00-03·04, 발급 한도 A-02-04 |
| PLUS 상품 | `/admin/plus-products`, `/:pid` (`?tab=history`) | A-02-01, 상품 상세 A-02-01-03 (상품정보 \| 상품변경 이력) |
| 상품 관리 | `/admin/products`, `/:pid/terms` | A-02-06 (일괄 처리 A-02-06-01), 판매 조건 A-02-02 (변경 기록 A-02-02-01) |
| 카테고리 | `/admin/categories` | A-02-05 (기본 아이콘에서 고르거나 PNG·SVG 직접 올리기) |
| 주문 | `/admin/orders`, `/:oid` | A-03-01, A-03-01-01 |
| 환불 | `/admin/refunds` | A-03-02 |
| 발급 내역 | `/admin/coupons`, `/:cid` | A-03-03, 쿠폰 상세 A-03-03-01, 취소 A-03-03-02 |
| 월별 정산 | `/admin/settlements`, `/:month` | A-04-01, A-04-01-01 |
| 문의 | `/admin/inquiries` (`?id=`) | A-05-01, A-05-01-01 |
| PLUS 동기화 | `/admin/sync` | A-06-01 |

상품 탭은 2026-10-19에 분리안(PLUS 상품은 보기, 상품 관리에서 판매 조건·게시·숨김·일괄 처리)으로 확정했다. IA 시트도 이 번호로 고쳤고, 예전 일괄 처리 번호 A-02-01-02는 삭제한 번호다. A-02-01-01은 상품 상세의 상품정보 탭과 판매 조건 왼쪽에 함께 보이는 PLUS 상품 정보다.

화면 구조는 쿠핀+ 관리자 웹: 어두운 사이드바, 브레드크럼 헤더, "검색조건"(이름표 붙은 칸·상태 칩 묶음·[검색][초기화]) / "목록"(전체 N건·오른쪽 버튼·표·가운데 페이지 넘김), 상세는 카드와 라벨·값 줄, 아래 버튼 영역([목록] 맨 앞).

## 4. 코드 구조 (Feature-Sliced Design)

[FSD v2.1](https://feature-sliced.design)을 따른다. 레이어는 위에서 아래로 `app → pages → features → entities → shared`이고, **아래 레이어만 가져올 수 있다**. 조각(slice)은 `index.ts`(공개 API)로만 가져온다. `pnpm lint:fsd`(Steiger)로 확인한다.

```
src/
  app/        진입점 index.tsx · router/(라우트, 로그인 가드) · layouts/(고객 앱·관리자, antd 테마) · styles/(전역 CSS) · tests/(여러 화면을 거치는 흐름 테스트)
  pages/      화면 하나가 조각 하나. 화면에서만 쓰는 부품·동작은 그 조각의 ui/·model/에
    customer/   둘러보기(home: 가게 지도·핀·가게 카드), 검색, 매장, 상품 상세, 결제·PG·완료·실패, 내 쿠폰, 마이, 주문·문의
    account/    로그인, 가입, 계정 찾기, 소셜 동의·휴대폰 확인, 회원 정보, 탈퇴, 계정 삭제 안내, 설정, 약관
    admin/      판매 현황, PLUS 상품·상품 상세, 상품 관리, 판매 조건, 카테고리, 주문, 환불, 발급 내역, 정산, 문의, 동기화
  features/   여러 화면이 같이 쓰는 사용자 동작
    auth · admin-auth · issue-coupon(받기·구매) · refund-coupon(환불·무료 취소) · cancel-coupon(운영자 취소)
    retry-refund · sync-plus · verify-phone(문자 인증) · locate-me([내 위치]) · product-filter · order-list-filter
  entities/   업무 개념의 규칙(model)과 그 개념을 그리는 UI(ui)
    product · store · category · coupon · order · inquiry · settlement · account
    (가게는 상품 노출 규칙을, 상품은 카테고리 아이콘을, 쿠폰은 무료 여부를 @x 공개 API로 가져온다)
  shared/     업무를 모르는 바탕
    api/      가짜 서버: 스키마, 예시 데이터·사진, 저장소(useDB·mutate·resetDB, 탭 간 동기화), id로 찾기·만료일
    lib/      날짜·금액·거리·서식 도우미, 거리 기준점(내 위치)
    ui/       icon · mobile(고객 앱 공용 부품·화면 스타일) · admin(관리자 공용 부품·화면 스타일) · kakao-map · legal-doc · brand
    config/   판매수수료율, 카테고리 색
```

규칙
- 데이터는 `shared/api`의 `useDB`로 읽고, 고칠 때는 동작 함수(features 또는 화면 model)가 `mutate`를 부른다. 계산은 entities model.
- 한 화면에서만 쓰는 것은 그 화면 조각에 둔다. 두 화면 이상이 쓰게 되면 features·entities·shared로 내린다.
- 같은 레이어끼리는 가져오지 않는다. entities끼리만 `@x`로 예외를 둔다.
- 인라인 스타일 금지(카테고리 색 CSS 변수와 막대 폭만 예외). 노출 문구는 해요체, 줄표(—) 부연 금지.
