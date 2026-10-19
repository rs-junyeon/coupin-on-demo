# 쿠핀 ON (Vite + React)

쿠핀 ON 고객 모바일 웹과 ON 관리자를 예시 데이터로 동작하게 만든 프로젝트. 기획(PRD·IA 시트·첫 출시 범위, 2026-10-16)과 `on-planning/on-mockup-split.html`을 실제 서비스 화면처럼 옮겼다.

- 고객 앱: http://localhost:5173/ (모바일 웹, 가운데 최대 480px)
- 관리자: http://localhost:5173/admin (antd 5, 쿠핀+ 관리자 웹 구조)
- 설계: [docs/spec.md](docs/spec.md) · 옮기기 결정: [docs/plan.md](docs/plan.md)

## 실행

```sh
cp .env.example .env   # VITE_KAKAO_JS_KEY 채우기 (없어도 지도 말고는 다 동작)
pnpm install
pnpm dev               # http://localhost:5173
```

카카오 키: [카카오 디벨로퍼스](https://developers.kakao.com) → 내 애플리케이션 → 앱 키의 **JavaScript 키**.
플랫폼 → Web 사이트 도메인에 `http://localhost:5173` 등록. 키가 없거나 도메인이 맞지 않으면 지도 자리에 안내가 나오고, 그 아래 가까운 가게 목록으로 계속 쓸 수 있다.

`pnpm test` 화면·규칙 테스트 · `pnpm typecheck` · `pnpm lint:fsd` FSD 구조 검사 · `pnpm build`

코드는 Feature-Sliced Design으로 나눴다 (`app → pages → features → entities → shared`). 자세한 구성은 [docs/spec.md 4장](docs/spec.md#4-코드-구조-feature-sliced-design).

## 계정 (예시 데이터)

| 화면 | 계정 |
| --- | --- |
| 고객 | 아이디 `on_user` (비밀번호는 아무 값). 휴대폰 `010-1234-5678`로 가입된 계정이라, 카카오·Google로 처음 들어와 이 번호로 인증하면 같은 계정에 연결된다. 문자 인증번호는 6자리면 통과 |
| 관리자 | 아이디 `ops.park` (비밀번호는 아무 값) |

## 같이 쓰기

- 데이터는 브라우저 저장소 `coupin-on-demo-v2`에 있다. 관리자 탭과 고객 앱 탭을 같이 열면, 관리자에서 게시·숨김·판매 조건을 바꾸는 즉시 고객 앱 탭에 반영된다.
- 처음 상태로 돌리려면 개발자 도구에서 저장소 키 `coupin-on-demo-v2`를 지운다.
- 날짜는 오늘 기준이다. 예시 주문·쿠폰은 목업 기준일(2026-10-15)과 오늘의 차이만큼 옮겨 만든다.
- 결제창(PG)과 카카오·Google 동의 화면은 외부 화면을 대신하는 테스트 화면이다.

## 디자인 기준

- 구조·컴포넌트: `~/Documents/coupin-plus` (관리자: plus-admin-web, libs/cims-ui·cims-assets / 고객 모바일: plus-qr-web 치수)
- 색: 쿠핀 컬러 시스템 `~/Documents/company/all.html` (ON Lime → Mint, Deep Navy)
