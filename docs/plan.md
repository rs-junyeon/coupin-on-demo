# 쿠핀 ON 데모: 지금 기획(2026-10-16)으로 옮기기

- 작성: 2026-10-19 · 브랜치 `feat/current-spec`에서 작업하고 테스트 후 main에 머지함 (2026-10-19)
- 원본 화면: `~/Documents/company/on-planning/on-mockup-split.html` (상품 탭 분리안, 쿠핀+ 디자인 맞춘 버전)
- 기획 문서: [PRD](https://docs.google.com/document/d/1GtdLziD9oJuto-a25ZCMMmhbz7Xru84yAoz6xQ5ZYy4/edit) · [IA 시트](https://docs.google.com/spreadsheets/d/14w8AZtN1QRWIVaoa3FjKefu8RxSkAZa9Zh0Vp3CXa4k/edit) · [첫 출시 범위](https://docs.google.com/document/d/1uycjl93NupoXuT5iOje9jxzkYxXhfHHqDn2oWMityws/edit). 시연 장치(가이드·시연 상황·화면 설명·흐름 띠·연동 로그)는 넣지 않는다. **실제 서비스 화면처럼** 만든다.

## 결정

| 항목 | 결정 |
| --- | --- |
| 고객 앱 | 모바일 웹 `/` (가운데 최대 폭 480px, 쿠핀+ plus-qr-web 치수: 입력 48px·radius 8, CTA 52px·radius 10, 카드 radius 12, 모달 radius 14) |
| 관리자 | 웹 `/admin` · **antd 5.29** (coupin-plus와 같은 버전) + 쿠핀+ 관리자 웹 구조 (어두운 사이드바, 브레드크럼 헤더, 검색조건/목록 박스, 상세 탭, 하단 버튼 영역) |
| 색 | 쿠핀 ON 디자인 시스템 [docs/design/DESIGN.md](design/DESIGN.md) 3장: ON이 직접 만든 Lime·Mint 스케일, 기본 버튼 Lime 800(#378247) + 흰 글자, [무료로 받기]는 ON 그라데이션, [구매하기]는 Navy(#24324A). 카테고리 색은 8색 팔레트를 만든 순서대로 |
| 지도 | 카카오맵 (`VITE_KAKAO_JS_KEY`). 키가 없으면 지도 자리에 안내, 나머지 기능은 동작 |
| 상태 | zustand persist (`coupin-on-demo-v2`), 다른 탭과 storage 이벤트로 동기화 (관리자에서 게시하면 고객 앱 탭에 반영) |
| 날짜 | 실제 오늘 기준. 시드 데이터는 목업 기준일(2026-10-15)과의 차이만큼 옮겨 만든다 |
| 관리자 상품 화면 | 분리안으로 확정 (2026-10-19). PLUS 상품(보기, 상품 상세: 상품정보 \| 상품변경 이력)과 상품 관리(판매 조건 페이지·게시·숨김·일괄 처리). PRD 6.8·IA 시트·첫 출시 범위에 반영함 |
| 코드 구조 | Feature-Sliced Design v2.1 (화면 먼저 나누고, 여러 화면이 쓰는 것만 features·entities로). Steiger로 검사 (`pnpm lint:fsd`) |
| 결제·소셜 로그인·문자 인증 | 외부 화면(PG 결제창, 카카오·Google 동의)은 테스트용 화면으로 대신한다. 인증번호는 6자리면 통과 |

## 구조

Feature-Sliced Design(2026-10-19 적용). 레이어·조각 구성과 규칙은 [spec.md 4장](spec.md#4-코드-구조-feature-sliced-design).

## 기획에 없어 데모에서 임시로 정한 것

| 항목 | 데모 | 정할 곳 |
| --- | --- | --- |
| 동기화 주기 | PLUS 동기화 화면에 "3시간마다"로 표시 | PRD 11장 (주기 확인 필요) |
| 상품별 한도 기본값 | 빈칸. 비우면 전체 한도만 적용 (목업은 50장·50만 원을 미리 채움) | PRD 6.9 |
| 카테고리 아이콘 이미지 | 올린 PNG·SVG는 단색 배경을 지운 128px 투명 PNG로 줄여 브라우저 저장소에 둔다 (그 브라우저에서만 보임) | 실서비스 저장 위치 (PRD 6.8 확인 필요) |
| 사업자 정보 | "(예시)" 자리표시 (`customer/components/BizInfo.tsx`) | 법무 확인 (P5) |
| 지도 | 카카오 키가 없어 실제 지도 화면(핀·가게 시트·이 지역에서 다시 찾기)은 아직 확인하지 못함 | `.env`에 키를 넣고 확인 |
