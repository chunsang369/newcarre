# 신차 장기렌트/리스 견적 플랫폼 구현 계획서

> **버전**: v1.1 (2026-04-24 업데이트)
> **대상 레퍼런스**: `m.hicarzautoplan.com` (모바일)
> **기술 스택**: Next.js 14+ (App Router) + TypeScript + Tailwind + Prisma + Neon + Netlify
> **작업 환경**: Antigravity IDE
> **제외 대상**: 매거진, 이벤트/프로모션 (본 프로젝트 범위 외)
>
> **v1.1 변경사항**:
> - 섹션 0.3: 반응형 단일 코드베이스 규칙 명시 (m. 서브도메인 분리 금지)
> - 섹션 5.5 신규: 섹션별 모바일→데스크톱 레이아웃 확장 규칙
> - 섹션 9.3: Sticky 견적 요약 바 모바일/데스크톱 분기 상세화

---

## 0. 프로젝트 개요

### 0.1 비즈니스 목표
신차 장기렌트/리스 상품을 비교·탐색하게 한 뒤, **상담 신청(리드)을 수집**하는 것이 최종 KPI. 가격/조건 실제 결제는 발생하지 않으며, 모든 CTA는 **상담 신청 폼** 또는 **전화/카톡 채널**로 수렴된다.

### 0.2 퍼널 구조 (반드시 모든 페이지 설계의 기준으로 둘 것)
```
[유입] → [차량 탐색] → [가격 비교] → [견적 시뮬레이션] → [상담 신청(리드 수집)]
                                                          ↓
                                                   [카톡/전화 상담]
```

### 0.3 핵심 제약

- **모바일 퍼스트 반응형 단일 코드베이스**
- **m. 서브도메인 분리 금지**. 원본 사이트가 `m.` 구조인 것은 2020년 레거시 설계이며, 신규 개발에서는 채택하지 않는다.
- Tailwind breakpoint 규칙:
  - 기본(~640px) = 모바일 (메인 타겟)
  - `md:` (768px+) = 태블릿
  - `lg:` (1024px+) = 데스크톱 레이아웃 분기
  - `xl:` (1280px+) = 최대 너비 1200px 고정
- **폼 제출 = 최종 전환** → 폼 UX는 마찰 최소화
- 결제 기능 없음. 장바구니 없음. 로그인 선택 (회원가입 없어도 상담 신청 가능)
- **SEO**: Google은 반응형 단일 URL을 공식 권장 (2015년~). canonical 태그 관리 불필요.

---

## 1. 기술 스택

| 영역 | 선택 기술 | 선택 이유 |
|---|---|---|
| 프레임워크 | Next.js 14+ (App Router) | SSR/SSG 혼합, SEO 유리 |
| 언어 | TypeScript (strict) | 차량 데이터 스키마 안정성 |
| 스타일 | Tailwind CSS + CSS Variables | 빠른 프로토타입 + 디자인 토큰화 |
| 컴포넌트 | shadcn/ui (필요분만) | Radix 기반, 접근성 확보 |
| 상태 | Zustand (전역 필터), React Query (서버 상태) | 차량 필터/견적 계산 분리 |
| DB | PostgreSQL (Neon) | 서버리스 + Prisma 호환 |
| ORM | Prisma | 팀 스택 표준 |
| 폼 | React Hook Form + Zod | 검증 스키마 일원화 |
| 이미지 | next/image + Netlify Image CDN | 차량 썸네일 대량 처리 |
| 애니메이션 | Framer Motion (최소 사용) | 슬라이더/모달 한정 |
| 배포 | Netlify | 기존 워크플로우 연계 |
| 분석 | Google Analytics 4 + Meta Pixel | 원본 사이트도 Meta Pixel 사용 중 |

---

## 2. 정보 설계 (IA) 및 사이트맵

### 2.1 페이지 트리

```
/ (홈)
├── /cars
│   ├── /cars/brands (브랜드별 차량 목록)
│   ├── /cars/brands/[brand] (특정 브랜드 차량)
│   ├── /cars/[carId] (차량 상세 + 견적 시뮬레이터)
│   ├── /cars/instant (즉시출고차량)
│   ├── /cars/price (가격대별 탐색)
│   └── /cars/popular (인기 차량)
├── /quote
│   ├── /quote/simple (빠른 간편견적 폼)
│   └── /quote/custom (상세 견적 시뮬레이터)
├── /reviews (계약 후기)
│   └── /reviews/[id]
├── /faq (자주 묻는 질문)
├── /company (회사소개)
├── /planners (이달의 BEST 플래너)
│   └── /planners/[id]
├── /terms (이용약관)
├── /privacy (개인정보처리방침)
└── /api/*
```

### 2.2 GNB (글로벌 내비게이션)

**모바일 (~1023px)**
- 상단 고정 헤더: 로고(좌) | 햄버거(우) | 대표전화 아이콘 | 카톡 아이콘
- 햄버거 메뉴 드로어 (우측에서 슬라이드)

**데스크톱 (1024px+)**
- 상단 고정 헤더: 로고(좌) | 수평 GNB (중앙) | 대표전화 번호 텍스트 노출(우) | 카톡 버튼(우)
- 햄버거 숨김

**메뉴 항목**:
1. 빠른 간편견적
2. 인기 차량
3. 계약후기
4. FAQ
5. 회사소개

### 2.3 하단 고정 CTA

**모바일 전용** (`lg:hidden`):
- 카톡 상담 + 전화 상담 2버튼 하단 고정

**데스크톱**: 헤더에 이미 연락처 노출되므로 Floating CTA 숨김

---

## 3. 페이지별 상세 명세

### 3.1 홈(`/`) — 10개 섹션으로 구성

순서대로 구현:

#### [Section 1] Hero Visual Slider
- **구조**: Full-width 슬라이더 (3~5장 자동 순환, 4초 간격)
- **모바일**: 이미지 비율 4:3, 높이 375px 전후
- **데스크톱**: 이미지 비율 16:7, 높이 500px 전후
- **구현**: Embla Carousel React
- **CTA**: "간편 빠른상담 신청하기" → 하단 상담 폼으로 스크롤 또는 모달 오픈

#### [Section 2] 관심 차종 선택 (브랜드 그리드)
- **구조**: 탭 2개 (국산 / 수입) + 브랜드 로고 그리드
- **모바일**: 4열
- **태블릿(`md:`)**: 6열
- **데스크톱(`lg:`)**: 8열
- **국산**: 전체, 현대, 기아, 제네시스, 르노코리아, 쉐보레, KGM (7개)
- **수입**: BMW, 벤츠, 아우디, 미니, 볼보, 폭스바겐, 토요타, 렉서스, 혼다, 랜드로버, 재규어, 포드, 링컨, 지프, GMC, 캐딜락, 푸조, 테슬라, DS, 폴스타, 루시드, 로터스, 마세라티, 포르쉐, 벤틀리, 페라리, 람보르기니, 애스턴마틴, 맥라렌, 롤스로이스, 이네오스, BYD (32개)
- **동작**: 브랜드 클릭 → `/cars/brands/[brand]` 이동
- **DB 연계**: `Brand` 테이블에서 `isDomestic` 필드로 필터

#### [Section 3] 인기 차량
- **모바일**: 가로 스크롤 캐러셀 (한 화면 1.2~1.5개 노출)
- **태블릿(`md:`)**: 2열 그리드, 캐러셀 해제
- **데스크톱(`lg:`)**: 3열 그리드
- **와이드(`xl:`)**: 4열 그리드
- **카드 정보**:
  - 차량 이미지 (투명 배경 PNG)
  - 연식 배지 (예: "2026년형")
  - 모델명 (예: "현대 더 뉴 아반떼")
  - 세부 트림
  - 월 렌트료 / 월 리스료
  - 상세 버튼 + 상담 신청 버튼
- **하단 조건 표시**: "36개월 | 초기비용 선납금 30% | 만 26세 이상 기준"
- **DB 연계**: `Car` 테이블 `isPopular=true`

#### [Section 4] CTA 배너 3종
- **모바일**: 세로 스택 (1열)
- **데스크톱**: 가로 3열
1. 하이카즈 전문 매니저와 상세 상담 → 간편견적 폼 모달
2. 지금 계약시 캐시백 최대 100만원 → 상담 신청 폼
3. 7일 이내 인도 보장 → `/cars/instant`

#### [Section 5] 간편 상담신청 폼 (인라인)
- **모바일**: Full-width 세로 스택
- **데스크톱**: 2열 레이아웃 (좌: 폼 60% / 우: 상담 채널 안내 + 신뢰 배지 40%)
- 이름 (필수)
- 전화번호 (필수, 자동 하이픈)
- 안내방법 (라디오: 전화/문자/카톡)
- 상담 가능 시간 (select)
- 관심 차량 (select, 선택)
- 개인정보 수집 동의 체크박스 (필수)
- **제출 버튼**: "견적 상담신청"

#### [Section 6] 상담 채널 (카톡 / 전화)
- 대형 버튼 2개
- **모바일**: 세로 스택 또는 가로 50:50
- **데스크톱**: Section 5의 우측 영역에 편입 (독립 섹션 아님)
- 카톡: `http://pf.kakao.com/_XXXXX/chat`
- 전화: `tel:1577-XXXX`

#### [Section 7] 가격대별 탐색
- **탭**: 렌트 / 리스
- **가격대 chip**
  - 모바일: 가로 스크롤
  - 데스크톱: 줄바꿈 배치
- 가격대: ~20만원대, 30만원대, 40만원대, 50만원대, 60만원대, 70만원대, 80만원대~
- **결과 그리드**
  - 모바일: 1열
  - 태블릿: 2열
  - 데스크톱: 3열

#### [Section 8] 이달의 BEST 플래너
- 카드형 프로필 (사진, 이름, 직급, 영문명)
- **모바일**: 세로 스택 또는 가로 스크롤
- **태블릿**: 2열
- **데스크톱**: 4열
- 각 카드에 "상담신청 바로하기" CTA → 해당 플래너 태그와 함께 폼 전송
- **DB 연계**: `Planner` 테이블 `isFeatured=true`

#### [Section 9] 실제 계약후기 (3~5건 프리뷰)
- 카드형 (후기 이미지, 차량명, 고객 마스킹, 날짜, 본문 일부)
- **모바일**: 세로 스택 또는 가로 스크롤
- **데스크톱**: 3열 그리드
- "전체 후기 보기" → `/reviews`

#### [Section 10] Footer
- **모바일**: 스택형 (모든 정보 세로 나열)
- **데스크톱**: 4컬럼 (회사정보 / 메뉴 / 연락처 / 약관)
- 회사정보 (상호, 대표자, 주소, 사업자번호, 통신판매업신고, 대표전화)
- 약관/개인정보/이메일무단수집거부 링크
- 카피라이트

---

### 3.2 차량 상세 페이지 (`/cars/[carId]`)

핵심: **견적 시뮬레이터**를 주인공으로 배치.

#### 모바일 레이아웃
```
[차량 이미지 갤러리]
  ↓
[차량 정보]
  ↓
[견적 시뮬레이터 — 인라인]
  ↓
[상세 스펙 / 옵션 리스트]
  ↓
[카달로그 / 가격사양 다운로드]
  ↓
[Sticky 하단 요약 바] ← 스크롤 따라 고정
  [월 납입료 / 상담 신청 버튼]
```

#### 데스크톱 레이아웃 (2컬럼)
```
[좌측 70% — 메인 컨텐츠]         [우측 30% — Sticky 사이드바]
  [이미지 갤러리]                    [견적 시뮬레이터]
  ↓                                    - 기간/선납/거리/연령
  [차량 정보]                          - 실시간 월납입료
  ↓                                    - 렌트/리스 비교 탭
  [상세 스펙]                          - 상담 신청 버튼
  ↓                                  └── 스크롤 따라 sticky
  [옵션 리스트]
  ↓
  [카달로그 / 가격사양 다운로드]
```

#### 견적 시뮬레이터 구성
- **계약 기간** (36/48/60개월) — 슬라이더 또는 세그먼트 버튼
- **선납 조건** (선납 30% / 보증금 30% / 무보증)
- **연 주행거리** (1만/1.5만/2만/3만 km) — 슬라이더
- **운전자 연령** (만 21세/26세 이상)
- **상품 구분** (렌트/리스) 탭
- **[출력]**
  - 기본가격
  - 옵션가격
  - 월 납입료 (VAT 포함, 개별소비세 3.5% 적용)
- **옵션 선택 모달** — 차량별 옵션 리스트 (다중 선택, 가격 합산)

**계산 로직**: `Car.priceMatrix` JSON 컬럼에 기간×선납×주행거리 조합별 월납입료를 사전 계산해 저장. 프론트는 조회만.

---

### 3.3 간편 견적 페이지 (`/quote/simple`)
스텝형 4단계 (Progress Bar):
1. 차량 선택 (브랜드 → 모델 → 트림)
2. 계약 조건 (기간/선납/주행거리)
3. 개인정보 (이름/연락처)
4. 제출 확인

각 스텝은 URL 쿼리에 상태 저장 (새로고침 복원).

- **모바일**: 한 스텝 = 한 화면
- **데스크톱**: 좌측 스텝 인디케이터 + 우측 폼 영역 2컬럼

---

### 3.4 계약 후기 (`/reviews`)
- 리스트: 카드 그리드
  - 모바일: 1열
  - 태블릿: 2열
  - 데스크톱: 3열
- 상세: 제목, 본문, 차량 이미지, 담당 매니저, 날짜, 고객 마스킹 닉네임
- **관리자만 작성 가능** (관리자 CMS 필요 — 섹션 10 참조)

---

### 3.5 기타 정적 페이지
- `/faq`: 아코디언 UI, 카테고리 필터
- `/company`: 회사소개 (CEO 인사말, 오시는길, 조직도 등)
- `/planners`: BEST 플래너 전체 리스트 + 상세
- `/terms`, `/privacy`: 약관 텍스트 페이지 (SEO 색인 허용)

---

## 4. 공통 컴포넌트 명세

```
components/
├── layout/
│   ├── Header.tsx          # 모바일 햄버거 + 데스크톱 수평 GNB 동시 내장
│   ├── Footer.tsx
│   ├── MobileNav.tsx       # 햄버거 드로어 (lg:hidden)
│   └── FloatingCTA.tsx     # 하단 고정 카톡/전화 (lg:hidden)
├── cars/
│   ├── CarCard.tsx         # 인기차량/리스트 공용
│   ├── CarCarousel.tsx     # 모바일 전용 Embla
│   ├── CarGrid.tsx         # 태블릿/데스크톱 전용 그리드
│   ├── BrandGrid.tsx       # 반응형 4→6→8열
│   ├── BrandTabs.tsx       # 국산/수입 탭
│   ├── PriceFilter.tsx     # 가격대 chip
│   └── QuoteSimulator.tsx  # 견적 계산기 (모바일 인라인 / 데스크톱 sticky)
├── form/
│   ├── QuickQuoteForm.tsx  # 간편 상담신청
│   ├── FullQuoteForm.tsx   # 상세 견적 폼
│   ├── PhoneInput.tsx      # 자동 하이픈
│   └── ConsentCheckbox.tsx # 개인정보 동의
├── ui/
│   ├── Button.tsx
│   ├── Modal.tsx           # 약관/견적 등 공용
│   ├── Accordion.tsx       # FAQ
│   ├── Tabs.tsx
│   └── Chip.tsx
└── planner/
    └── PlannerCard.tsx
```

---

## 5. 디자인 시스템 (DESIGN.md — 디미 연동)

### 5.1 컬러 토큰 (CSS Variables)

> **주의**: 원본 사이트의 정확한 색상값은 시안 확정 후 업데이트. 아래는 신차 렌트/리스 업계 톤앤매너에 맞는 권장값.

```css
:root {
  /* Brand */
  --color-primary: #0a2540;        /* 딥 네이비 — 신뢰감 */
  --color-primary-hover: #143a66;
  --color-accent: #ff6b35;         /* 오렌지 — CTA */
  --color-accent-hover: #e85a28;

  /* Neutral */
  --color-bg: #ffffff;
  --color-bg-subtle: #f7f8fa;
  --color-border: #e5e7eb;
  --color-text: #1f2937;
  --color-text-muted: #6b7280;

  /* Semantic */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;

  /* Spacing */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;

  /* Shadow */
  --shadow-card: 0 2px 12px rgba(0, 0, 0, 0.06);
  --shadow-modal: 0 20px 60px rgba(0, 0, 0, 0.18);
}
```

### 5.2 타이포그래피
- **폰트**: Pretendard (한국어 최적화, 가변 폰트로 용량 절감)
- **스케일** (모바일 기준, 데스크톱에서 대제목 일부 증가):
  - `text-xs` 11px — 캡션
  - `text-sm` 13px — 보조 정보
  - `text-base` 15px — 본문
  - `text-lg` 17px — 카드 제목
  - `text-xl` 20px — 섹션 소제목
  - `text-2xl` 24px — 섹션 제목 (데스크톱 `lg:text-3xl`)
  - `text-3xl` 30px — 히어로 (데스크톱 `lg:text-5xl`)

### 5.3 레이아웃
- **모바일 기준 너비**: 375~430px
- **최대 컨텐츠 너비**: 1200px (데스크톱)
- **섹션 간 세로 간격**:
  - 모바일: 48px (`py-12`)
  - 데스크톱: 96px (`lg:py-24`)
- **카드 간 간격**: 12~16px (모바일), 16~24px (데스크톱)
- **좌우 패딩**: 모바일 16px, 데스크톱 32px, 와이드 48px

### 5.4 컴포넌트 패턴
- **카드**: 흰 배경, 1px 보더 (`--color-border`), 12px radius, 카드 그림자
- **Primary CTA**: `--color-accent` 배경, 흰 텍스트, 모바일 52px 높이 풀너비 / 데스크톱 48px 높이 인라인 허용
- **Secondary CTA**: `--color-primary` 아웃라인
- **입력 필드**: 48px 높이, 8px radius, 포커스 시 accent 테두리

### 5.5 섹션별 반응형 레이아웃 확장 규칙 (신규)

모든 섹션은 모바일 원본(m.hicarzautoplan.com) 기준으로 설계한 뒤, 아래 규칙으로 태블릿·데스크톱을 확장한다.

| 섹션 | 모바일 (기본) | 태블릿 (`md:`) | 데스크톱 (`lg:`+) |
|---|---|---|---|
| Header | 로고 + 햄버거 | 좌동 | 로고 + 수평 GNB + 전화번호 텍스트 |
| Hero Slider | Full-width 4:3 | Full-width 16:9 | Full-width 16:7, 높이 확대 |
| 브랜드 그리드 | 4열 | 6열 | 8열 |
| 인기 차량 | 가로 스크롤 캐러셀 | 2열 그리드 | 3~4열 그리드 |
| CTA 배너 3종 | 세로 스택 1열 | 3열 가로 | 3열 가로 |
| 상담 폼 | Full-width 세로 | 좌동 | 2열 (폼 60% / 우측 채널+신뢰배지 40%) |
| 가격대 탐색 | Chip 가로 스크롤 / 결과 1열 | Chip 줄바꿈 / 결과 2열 | Chip 줄바꿈 / 결과 3열 |
| BEST 플래너 | 세로 스택 | 2열 | 4열 |
| 후기 카드 | 세로 스택 | 2열 | 3열 |
| Footer | 스택형 세로 | 2컬럼 | 4컬럼 (회사 / 메뉴 / 연락처 / 약관) |
| FloatingCTA 하단 | 고정 노출 | 고정 노출 | `lg:hidden`으로 숨김 |
| 차량 상세 견적기 | 인라인 + 하단 sticky 요약바 | 좌동 | 우측 sticky 사이드바 (스크롤 따라감) |

### 5.6 반응형 구현 원칙
1. **모든 스타일은 모바일 기본 → `md:`/`lg:` 오버라이드 순서로 작성** (never desktop-first)
2. **컴포넌트는 하나의 파일로 유지**, 내부에서 Tailwind breakpoint로 분기
3. 모바일/데스크톱 레이아웃이 근본적으로 다른 경우에만 `useMediaQuery` 훅으로 조건부 렌더링 (예외적 사용)
4. **절대 분기 금지**: `if (isMobile) return <MobileHome/>; else return <DesktopHome/>;` 금지

---

## 6. 데이터 모델 (Prisma 스키마 초안)

```prisma
model Brand {
  id            String   @id @default(cuid())
  slug          String   @unique
  name          String
  nameEn        String?
  logoUrl       String
  isDomestic    Boolean
  sortOrder     Int      @default(0)
  cars          Car[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Car {
  id            String   @id @default(cuid())
  slug          String   @unique
  brandId       String
  brand         Brand    @relation(fields: [brandId], references: [id])
  modelName     String
  trimName      String
  year          Int
  category      String
  fuelType      String
  basePrice     Int
  thumbnailUrl  String
  galleryUrls   String[]
  catalogUrl    String?
  specSheetUrl  String?
  options       Json
  priceMatrix   Json
  isPopular     Boolean  @default(false)
  isInstant     Boolean  @default(false)
  isActive      Boolean  @default(true)
  sortOrder     Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([brandId, isActive])
  @@index([isPopular])
  @@index([isInstant])
}

model QuoteRequest {
  id              String   @id @default(cuid())
  name            String
  phone           String
  contactMethod   String
  availableTime   String?
  carOfInterest   String?
  message         String?
  plannerId       String?
  source          String?
  status          String   @default("NEW")
  consentPrivacy  Boolean
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([status, createdAt])
}

model Review {
  id            String   @id @default(cuid())
  title         String
  content       String   @db.Text
  imageUrl      String?
  carModel      String
  customerName  String
  plannerName   String?
  contractDate  DateTime
  isPublished   Boolean  @default(true)
  sortOrder     Int      @default(0)
  createdAt     DateTime @default(now())
}

model Planner {
  id            String   @id @default(cuid())
  name          String
  nameEn        String?
  position      String
  photoUrl      String
  phone         String?
  kakaoUrl      String?
  bio           String?  @db.Text
  isFeatured    Boolean  @default(false)
  sortOrder     Int      @default(0)
  createdAt     DateTime @default(now())
}

model Faq {
  id          String   @id @default(cuid())
  category    String
  question    String
  answer      String   @db.Text
  sortOrder   Int      @default(0)
  isPublished Boolean  @default(true)
  createdAt   DateTime @default(now())
}

model AdminUser {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  role         String   @default("ADMIN")
  createdAt    DateTime @default(now())
}
```

---

## 7. API 라우트 구조

```
app/api/
├── cars/
│   ├── route.ts                   GET (필터 쿼리: brand, category, priceRange, type=rent|lease)
│   ├── [id]/route.ts              GET 단일 차량
│   ├── [id]/quote/route.ts        POST 견적 계산
│   ├── popular/route.ts           GET 인기 차량
│   └── instant/route.ts           GET 즉시출고
├── brands/route.ts                GET 브랜드 리스트
├── quotes/route.ts                POST 상담 신청
├── reviews/route.ts               GET 후기 리스트
├── faqs/route.ts                  GET FAQ
├── planners/route.ts              GET 플래너 리스트
└── admin/
    ├── login/route.ts
    ├── quotes/route.ts
    ├── cars/route.ts
    └── reviews/route.ts
```

### 7.1 상담 신청 제출 시 후속 액션 (`POST /api/quotes`)
1. DB에 `QuoteRequest` 저장
2. 관리자 텔레그램 봇 알림
3. 관리자 이메일 알림 (Resend 또는 Netlify Forms)
4. Meta Pixel `Lead` 이벤트 발화 (클라이언트)
5. GA4 `generate_lead` 이벤트 발화

---

## 8. 디렉토리 구조

```
project-root/
├── app/
│   ├── (site)/
│   │   ├── layout.tsx              # 사이트 레이아웃 (Header, Footer, FloatingCTA)
│   │   ├── page.tsx                # 홈
│   │   ├── cars/
│   │   ├── quote/
│   │   ├── reviews/
│   │   ├── faq/
│   │   ├── company/
│   │   ├── planners/
│   │   ├── terms/page.tsx
│   │   └── privacy/page.tsx
│   ├── (admin)/
│   │   └── admin/
│   ├── api/
│   └── globals.css
├── components/
├── lib/
│   ├── prisma.ts
│   ├── quote-calc.ts
│   ├── validators/
│   └── analytics/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── scripts/
│   ├── crawl-hicarz.ts             # 하이카즈 1회성 크롤러
│   └── seed-from-json.ts           # 크롤링 JSON → DB 적재
├── data/
│   └── hicarz-cars.json            # 크롤링 결과 (gitignore 권장)
├── public/
│   └── images/brands/              # 브랜드 로고
├── DESIGN.md
├── README.md
└── .env.local
```

---

## 9. 원본 대비 개선 포인트 (반드시 반영)

### 9.1 견적 시뮬레이터 UX 고도화
- **Slider UI**: 계약기간/주행거리를 드롭다운 대신 슬라이더로 변경
- **실시간 계산**: 조건 변경 시 월납입료를 Debounced 300ms로 즉시 업데이트
- **비교 기능**: 동일 차량의 렌트 vs 리스 월납입료를 **나란히 비교** 카드로 노출
- **반응형**: 모바일 인라인 / 데스크톱 우측 사이드바 sticky (섹션 3.2 참조)

### 9.2 차량 필터링 강화
원본은 브랜드/가격대 2차원뿐. 아래 필터 추가:
- **연료 타입** (가솔린/디젤/하이브리드/전기)
- **차종** (세단/SUV/해치백/밴/전기차)
- **정렬** (인기순/낮은가격순/최신순)
- **URL 쿼리 기반 상태 관리** — 공유·뒤로가기 대응

### 9.3 전환율(CVR) 최적화 — Sticky 견적 요약 바 (업데이트)

차량 상세 페이지의 핵심 CVR 장치. 반응형 동작 상세:

**모바일 (~1023px)**
- 화면 **하단 고정 바** (`fixed bottom-0`)
- 구성: 좌측에 월 납입료 텍스트 (크게) + 우측에 "상담 신청" 버튼
- 높이 64px, 스크롤 관계없이 항상 노출
- FloatingCTA(카톡/전화)보다 위에 레이어링 (견적 바 > FloatingCTA)

**데스크톱 (1024px+)**
- 차량 상세 페이지 **우측 사이드바** 전체 견적 시뮬레이터로 승격
- `position: sticky; top: 96px` (헤더 아래)
- 스크롤해도 항상 우측에 견적기 노출
- 모바일 하단 바는 `lg:hidden`으로 숨김

**공통**
- Exit Intent 팝업: 이탈 직전 간편 연락처 수집 (데스크톱 한정)
- 폼 이탈 최소화:
  - 전화번호 자동 포맷팅
  - 관심 차량은 차량 페이지에서 진입 시 자동 pre-fill
  - 개인정보 동의 체크박스 기본값 해제 (법적 요구)

### 9.4 SEO / 검색 노출
- **동적 메타데이터**: 각 차량 페이지 `title`/`description`/`og:image` 자동 생성
- **구조화 데이터 (JSON-LD)**:
  - `Product` 스키마 (차량 페이지)
  - `LocalBusiness` 스키마 (회사 페이지)
  - `FAQPage` 스키마 (FAQ)
- **사이트맵 자동 생성**: `next-sitemap`
- **robots.txt**: 관리자 영역 차단
- **반응형 단일 URL**: Google 공식 권장. canonical 관리 불필요.

### 9.5 성능
- **이미지 최적화**: 모든 차량 썸네일 WebP 변환, `next/image` priority 제어
- **코드 스플리팅**: 관리자 CMS는 별도 번들
- **ISR**: 차량 목록/상세는 `revalidate: 3600` (1시간)
- **Lighthouse 목표**: 모바일 성능 90+, LCP 2.5s 이하

### 9.6 신뢰 신호 강화 (전환율 직결)
- **실시간 상담 현황**: "지금 3명이 상담 중" (실제 DB 기반 최근 24h 상담 수)
- **계약 후기 평균 평점** 노출
- **플래너 프로필 강화**: 담당 계약 건수, 평균 응답시간, 전문 분야
- **보증 배지**: 금융감독원 등록, 개인정보보호 인증

### 9.7 접근성 & 기술적 위생
- **접근성 (a11y)**: 모든 버튼 `aria-label`, 색 대비 WCAG AA
- **Rate Limiting**: `/api/quotes` POST에 IP당 분당 3회 제한
- **reCAPTCHA v3**: 상담 폼 봇 차단 (투명 적용)
- **로그 수집**: Sentry (에러), Vercel Analytics 또는 Umami

### 9.8 반응형 QA 강제 (신규 권장)
모든 컴포넌트 작성 후 Playwright로 **모바일/태블릿/데스크톱 3개 viewport에서 스크린샷 자동 생성**. 컴포넌트별 반응형 확인을 눈으로 강제하는 장치.

```ts
// scripts/visual-qa.ts (Antigravity에 구현 지시)
const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
];
```

---

## 10. 관리자 CMS (별도 모듈)

경로: `/admin` (SSO 또는 이메일/비밀번호 로그인)

**관리자 CMS는 데스크톱 전용 가정**. 모바일 대응은 최소한만 (테이블 가로 스크롤 허용).

### 10.1 대시보드
- 오늘 상담 신청 수
- 최근 7일 추이 그래프
- 상태별 카운트 (NEW / CONTACTED / CONVERTED / CLOSED)

### 10.2 상담 관리 (`/admin/quotes`)
- 리스트 (필터: 상태, 기간, 플래너)
- 상세 + 상태 변경
- 메모 기록
- CSV 내보내기

### 10.3 차량 관리 (`/admin/cars`)
- CRUD
- 엑셀 업로드 (대량 등록)
- 가격 매트릭스 JSON 에디터

### 10.4 후기 관리 (`/admin/reviews`)
- CRUD
- 공개/비공개 토글

### 10.5 FAQ / 플래너 / 브랜드 관리
- 기본 CRUD

---

## 11. 구현 우선순위 (스프린트 분할)

### Sprint 1 (핵심 퍼널 — 1~2주)
- [ ] 프로젝트 셋업 (Next.js + Prisma + Tailwind + Neon 연결)
- [ ] DESIGN.md 작성 및 디자인 토큰 CSS Variables 등록
- [ ] DB 스키마 정의 및 마이그레이션
- [ ] 시드 데이터 (브랜드 38개, 샘플 차량 15~30개)
- [ ] Header / Footer / FloatingCTA (반응형)
- [ ] 홈 페이지 전 10개 섹션 (반응형)
- [ ] `/api/quotes` POST + 텔레그램 봇 알림

### Sprint 2 (차량 탐색 — 1~2주)
- [ ] 차량 목록 (`/cars`, `/cars/brands/[brand]`, 필터)
- [ ] 차량 상세 + 견적 시뮬레이터 (모바일 인라인 / 데스크톱 sticky)
- [ ] 가격대별 탐색
- [ ] 즉시출고 페이지

### Sprint 3 (부가 콘텐츠 + SEO — 1주)
- [ ] 계약 후기, FAQ, 회사소개, 플래너
- [ ] 약관/개인정보 페이지 및 모달
- [ ] SEO (메타데이터, JSON-LD, 사이트맵)
- [ ] GA4, Meta Pixel 연동

### Sprint 4 (관리자 CMS — 1~2주)
- [ ] 어드민 인증 (NextAuth 또는 자체 세션)
- [ ] 상담 관리 대시보드
- [ ] 차량/후기/FAQ 관리
- [ ] 대량 등록 기능

### Sprint 5 (개선점 반영 + QA — 1주)
- [ ] Sticky 견적 요약 바 (모바일/데스크톱)
- [ ] Exit Intent, reCAPTCHA, Rate Limiting
- [ ] Sentry, Umami 연동
- [ ] Lighthouse 최적화
- [ ] Playwright 반응형 스크린샷 QA
- [ ] 크로스 브라우저 테스트 (iOS Safari, Android Chrome)

---

## 12. Antigravity 작업 지시 요약

### 12.1 최초 세팅 프롬프트 예시
```
이 계획서(HICARZ_CLONE_PLAN.md)를 기준으로 Next.js 14 App Router 프로젝트를
초기화해줘. Prisma + Neon + Tailwind + shadcn/ui 설정 포함.
디렉토리 구조는 섹션 8을 그대로 따르고, Section 5의 디자인 토큰을
globals.css에 CSS Variables로 등록해. prisma/schema.prisma는 섹션 6의
스키마 그대로 사용. 완료 후 npm run dev로 확인 가능한 상태까지.
```

### 12.2 페이지별 작업 지시 원칙
- **한 번에 한 페이지/섹션씩** 지시 (Antigravity 컨텍스트 효율)
- 각 지시에 **해당 섹션의 계획서 번호** 명시 (예: "3.1 Section 3 인기 차량 구현")
- **반응형 필수**: 모든 컴포넌트는 섹션 5.5의 반응형 레이아웃 확장 규칙 따를 것
- **데이터는 항상 시드 스크립트로** 먼저 준비 → 그 후 UI 구현
- **API 먼저, UI 나중**

### 12.3 Git 정책
- 자동 git push 금지
- 커밋은 섹션 단위로 (예: `feat(home): section 3 popular cars responsive`)
- Netlify 자동 배포는 main 머지 시점만

---

## 13. 리스크 및 주의사항

| 리스크 | 대응 |
|---|---|
| 금융 리스료 계산식 영업비밀 | `priceMatrix` JSON에 사전 계산값만 저장, 공식 노출 금지 |
| 차량 이미지/로고 저작권 | 제조사 공식 프레스킷 또는 실제 촬영 이미지 사용 |
| 개인정보 수집 법적 요건 | 개인정보처리방침 실제 사업자 정보로 업데이트, 동의 로그 DB 저장 |
| 대량 리드 유입 시 DB 부하 | Neon 스케일 플랜 + `/api/quotes` Rate Limit |
| 어드민 로그인 유출 | NextAuth + 2FA(TOTP) 또는 IP 화이트리스트 |
| 반응형 불일치 (모바일/데스크톱 스타일 충돌) | Playwright 스크린샷 QA 자동화 (섹션 9.8) |

---

## 14. 최종 체크리스트 (완료 판정 기준)

- [ ] 모바일 Lighthouse 성능/접근성/SEO 90+ 달성
- [ ] 데스크톱 Lighthouse 성능/접근성/SEO 90+ 달성
- [ ] 상담 신청 폼 → DB 저장 → 텔레그램 알림 전 구간 확인
- [ ] 차량 38개 브랜드 + 최소 50개 차량 시드 완료
- [ ] 어드민에서 차량/후기/FAQ CRUD 동작
- [ ] SEO 메타데이터 및 JSON-LD 모든 주요 페이지에 주입
- [ ] Netlify 배포 + 커스텀 도메인 연결
- [ ] GA4, Meta Pixel Lead 이벤트 발화 확인
- [ ] 모바일/태블릿/데스크톱 3개 viewport에서 주요 페이지 스크린샷 QA 통과

---

**문서 버전**: v1.1
**최종 업데이트**: 2026-04-24
**변경 이력**:
- v1.0 (2026-04-24): 초안 작성
- v1.1 (2026-04-24): 반응형 규칙 명시, 섹션 5.5 신규, 섹션 9.3 Sticky 견적 바 상세화
