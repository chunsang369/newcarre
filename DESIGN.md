# HICARZ 디자인 시스템

> HICARZ_CLONE_PLAN.md 섹션 5 요약
> 최종 업데이트: 2026-04-24

---

## 1. 컬러 토큰

| 토큰 | 값 | 용도 |
|---|---|---|
| `--color-primary` | `#0a2540` | 딥 네이비 — 브랜드 메인, 신뢰감 |
| `--color-primary-hover` | `#143a66` | Primary hover 상태 |
| `--color-accent` | `#ff6b35` | 오렌지 — CTA 버튼, 강조 |
| `--color-accent-hover` | `#e85a28` | Accent hover 상태 |
| `--color-bg` | `#ffffff` | 기본 배경 |
| `--color-bg-subtle` | `#f7f8fa` | 보조 배경 (섹션 분리) |
| `--color-border` | `#e5e7eb` | 테두리, 구분선 |
| `--color-text` | `#1f2937` | 본문 텍스트 |
| `--color-text-muted` | `#6b7280` | 보조 텍스트, 캡션 |
| `--color-success` | `#10b981` | 성공 상태 |
| `--color-warning` | `#f59e0b` | 경고 상태 |
| `--color-danger` | `#ef4444` | 위험/에러 상태 |

### Radius & Shadow

| 토큰 | 값 |
|---|---|
| `--radius-sm` | `6px` |
| `--radius-md` | `12px` |
| `--radius-lg` | `20px` |
| `--shadow-card` | `0 2px 12px rgba(0,0,0,0.06)` |
| `--shadow-modal` | `0 20px 60px rgba(0,0,0,0.18)` |

---

## 2. 타이포그래피

- **폰트**: Pretendard (가변 폰트, 한국어 최적화)
- **CDN**: `cdn.jsdelivr.net/gh/orioncactus/pretendard`

### 타입 스케일 (모바일 기준)

| 클래스 | 크기 | 용도 |
|---|---|---|
| `text-xs` | 11px | 캡션 |
| `text-sm` | 13px | 보조 정보 |
| `text-base` | 15px | 본문 |
| `text-lg` | 17px | 카드 제목 |
| `text-xl` | 20px | 섹션 소제목 |
| `text-2xl` | 24px | 섹션 제목 (데스크톱 `lg:text-3xl`) |
| `text-3xl` | 30px | 히어로 (데스크톱 `lg:text-5xl`) |

---

## 3. 레이아웃 규칙

| 항목 | 모바일 | 데스크톱 |
|---|---|---|
| 기준 너비 | 375~430px | 최대 1200px |
| 섹션 간격 | 48px (`py-12`) | 96px (`lg:py-24`) |
| 카드 간격 | 12~16px | 16~24px |
| 좌우 패딩 | 16px (`px-4`) | 32px (`lg:px-8`), 와이드 48px (`xl:px-12`) |

### Breakpoint 규칙 (Tailwind)

| Breakpoint | 범위 | 대상 |
|---|---|---|
| 기본 | ~640px | 모바일 (메인 타겟) |
| `md:` | 768px+ | 태블릿 |
| `lg:` | 1024px+ | 데스크톱 레이아웃 분기 |
| `xl:` | 1280px+ | 최대 너비 1200px 고정 |

---

## 4. 컴포넌트 패턴

### 카드
- 흰 배경 + `1px solid var(--color-border)`
- `border-radius: var(--radius-md)` (12px)
- `box-shadow: var(--shadow-card)`

### Primary CTA 버튼
- 배경: `var(--color-accent)` / 텍스트: 흰색
- 모바일: 높이 52px, 풀너비
- 데스크톱: 높이 48px, 인라인 허용
- Hover: `var(--color-accent-hover)`

### Secondary CTA 버튼
- 아웃라인 스타일: `var(--color-primary)` 보더
- 텍스트: `var(--color-primary)`

### 입력 필드
- 높이: 48px
- `border-radius: 8px`
- 포커스: `var(--color-accent)` 테두리

---

## 5. 반응형 구현 원칙

1. **모바일 퍼스트**: 모든 스타일은 모바일 기본 → `md:`/`lg:` 오버라이드 순서
2. **단일 컴포넌트**: 하나의 파일 내에서 Tailwind breakpoint로 분기
3. **조건부 렌더링 최소화**: `useMediaQuery` 훅은 레이아웃이 근본적으로 다른 경우에만 사용
4. **분기 금지**: `if (isMobile)` 패턴으로 전체 페이지를 분리하지 않음

### 섹션별 반응형 레이아웃

| 섹션 | 모바일 | 태블릿 (`md:`) | 데스크톱 (`lg:`+) |
|---|---|---|---|
| Header | 로고 + 햄버거 | 좌동 | 로고 + 수평 GNB + 전화번호 |
| Hero | Full-width 4:3 | 16:9 | 16:7, 높이 확대 |
| 브랜드 그리드 | 4열 | 6열 | 8열 |
| 인기 차량 | 가로 스크롤 | 2열 그리드 | 3~4열 그리드 |
| CTA 배너 | 1열 스택 | 3열 | 3열 |
| 상담 폼 | Full-width 세로 | 좌동 | 2열 (60%/40%) |
| 가격대 탐색 | Chip 스크롤 / 1열 | 줄바꿈 / 2열 | 줄바꿈 / 3열 |
| 플래너 | 세로 스택 | 2열 | 4열 |
| 후기 카드 | 세로 스택 | 2열 | 3열 |
| Footer | 스택형 | 2컬럼 | 4컬럼 |
| FloatingCTA | 고정 노출 | 고정 노출 | `lg:hidden` |
| 견적기 | 인라인 + 하단 sticky | 좌동 | 우측 sticky 사이드바 |
