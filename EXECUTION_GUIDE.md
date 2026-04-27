# 🚀 실행 매뉴얼 (EXECUTION GUIDE)

> **ADHD 친화 원칙**: 한 번에 한 블록만 본다. 블록 완료 전까지 다음 블록 보지 말 것.
>
> 각 블록 구성:
> - 🎯 **목표**: 1줄로
> - 👨 **내가 할 일**: 천상이 직접
> - 🤖 **안티에게**: Antigravity 채팅창에 복붙
> - ✅ **성공 판정**: 이게 뜨면 다음 블록으로
> - 🔁 **실패 시**: 막히면 이걸 그대로 복붙해서 안티에게 물어봐

---

## 📋 전체 진행 상태 트래커

완료한 블록에 X 표시. 다음 블록은 이전 블록 완료 후에만 시작.

```
[ ] 블록 0. 사전 준비물 확보
[ ] 블록 1. 빈 폴더 생성 + Antigravity 열기
[ ] 블록 2. 계획서 2개 파일 폴더에 복사
[ ] 블록 3. Next.js 프로젝트 초기화 (안티 실행)
[ ] 블록 4. Prisma 스키마 생성 (안티 실행)
[ ] 블록 5. Neon DB 연결
[ ] 블록 6. seed.ts 배치 + 브랜드 시드 실행
[ ] 블록 7. 크롤링 스크립트 2개 배치
[ ] 블록 8. 정찰 크롤링 (셀렉터 확인)
[ ] 블록 9. 본 크롤링 + DB 적재
[ ] 블록 10. 홈 화면 구현 시작
```

---

## 🧱 블록 0. 사전 준비물

### 🎯 목표
작업 시작 전 필요한 계정/파일이 다 있는지 확인.

### 👨 내가 할 일
아래 5가지 체크. 하나라도 없으면 블록 1로 넘어가지 말 것.

- [ ] **Antigravity IDE 설치됨** (안 되어 있으면 antigravity.google.com에서 다운로드)
- [ ] **Node.js 20+ 설치됨** (터미널에서 `node -v` 확인)
- [ ] **Neon 계정 있음** (neon.tech 로그인 가능)
- [ ] **내가 준 파일 4개 다운로드 완료**:
  - `HICARZ_CLONE_PLAN.md`
  - `EXECUTION_GUIDE.md` (지금 이 파일)
  - `seed.ts`
  - `crawl-hicarz.ts`
  - `seed-from-json.ts`
- [ ] **하이카즈 사이트 링크 기억**: `https://m.hicarzautoplan.com`

### ✅ 성공 판정
위 5개 전부 체크 완료.

### 🔁 실패 시
Node.js 설치 문제 → `winget install OpenJS.NodeJS.LTS` (Windows)
Neon 계정 문제 → 이메일만으로 가입 가능. 2분 걸림.

---

## 🧱 블록 1. 빈 폴더 생성 + Antigravity 열기

### 🎯 목표
작업할 빈 폴더를 만들고 Antigravity에서 연다.

### 👨 내가 할 일

**Windows (PowerShell)**:
```powershell
cd D:\ (또는 원하는 위치)
mkdir hicarz-clone
cd hicarz-clone
```

**Antigravity 실행** → `File > Open Folder` → `hicarz-clone` 선택.

### ✅ 성공 판정
Antigravity 좌측 탐색기에 `hicarz-clone` 폴더가 열려 있고, 파일 목록이 비어 있음.

### 🔁 실패 시
```
안티야, 지금 폴더를 Open Folder로 열었는데 파일이 안 보여. 
탐색기가 제대로 열려있는지 확인하고 상태 알려줘.
```

---

## 🧱 블록 2. 계획서 2개 파일 복사

### 🎯 목표
내가 준 `HICARZ_CLONE_PLAN.md`와 `EXECUTION_GUIDE.md`를 프로젝트 루트에 배치.

### 👨 내가 할 일
다운로드한 파일 2개를 방금 만든 `hicarz-clone` 폴더에 **드래그 앤 드롭**.

폴더 구조:
```
hicarz-clone/
├── HICARZ_CLONE_PLAN.md    ← 여기에
└── EXECUTION_GUIDE.md       ← 여기에
```

### ✅ 성공 판정
Antigravity 탐색기에 두 파일이 보이고, 클릭하면 내용이 읽혀야 함.

### 🔁 실패 시
파일 위치가 하위 폴더에 들어가 있으면 잘라내기 → 루트에 붙여넣기.

---

## 🧱 블록 3. Next.js 프로젝트 초기화

### 🎯 목표
Next.js 14 + TypeScript + Tailwind + Prisma 환경 셋업. 완료하면 `npm run dev`로 localhost:3000 접속 가능.

### 👨 내가 할 일
아래 프롬프트를 **그대로** 안티 채팅창에 복붙 → 엔터.

### 🤖 안티에게
```
이 폴더의 HICARZ_CLONE_PLAN.md를 읽어.
섹션 1(기술 스택), 섹션 5(디자인 시스템), 섹션 8(디렉토리 구조)에 따라
Next.js 14 App Router 프로젝트를 초기화해줘.

실행 순서:
1. npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --use-npm
   (이미 폴더 안이니까 . 으로 현재 경로에 설치)
2. npm i prisma @prisma/client zustand @tanstack/react-query react-hook-form zod
3. npm i -D tsx playwright
4. npx playwright install chromium
5. npx prisma init
6. npx shadcn-ui@latest init (나중에 필요한 컴포넌트만 설치)
7. HICARZ_CLONE_PLAN.md 섹션 5.1의 CSS Variables를 app/globals.css에 추가
8. HICARZ_CLONE_PLAN.md 섹션 5 내용을 요약해서 DESIGN.md 파일로 루트에 생성
9. npm run dev 실행해서 localhost:3000 접속 가능한지 확인

중요:
- Git push는 절대 금지. 커밋만 해도 되지만 push는 내 허락 필요.
- 완료되면 "블록 3 완료" 라고 알려줘.
```

### ✅ 성공 판정
1. 브라우저에서 `http://localhost:3000` 접속 → Next.js 기본 페이지 뜸
2. 루트에 `DESIGN.md` 파일 있음
3. `app/globals.css`에 CSS Variables (`--color-primary` 등) 들어있음
4. 안티가 "블록 3 완료" 라고 말함

### 🔁 실패 시
```
안티야, 블록 3이 어디서 막혔어? 에러 로그 전체 보여줘.
그리고 어느 단계까지 완료됐는지 체크해줘.
```

---

## 🧱 블록 4. Prisma 스키마 생성

### 🎯 목표
DB 테이블 스키마를 코드로 정의. 아직 실제 DB 연결은 안 함.

### 🤖 안티에게
```
HICARZ_CLONE_PLAN.md 섹션 6의 Prisma 스키마 전체를
prisma/schema.prisma 파일로 옮겨줘.

그리고 .env.local 파일을 루트에 만들고 DATABASE_URL 자리만 비워둬:

DATABASE_URL="postgresql://여기에넣을거임"

완료되면 prisma/schema.prisma 파일 내용 보여주고 "블록 4 완료" 라고 알려줘.
```

### ✅ 성공 판정
1. `prisma/schema.prisma` 열면 Brand, Car, QuoteRequest, Review, Planner, Faq, AdminUser 모델 모두 존재
2. `.env.local` 파일 존재 (DATABASE_URL 자리만 있음)

### 🔁 실패 시
```
안티야, prisma/schema.prisma가 제대로 만들어졌는지 파일 내용 보여줘.
HICARZ_CLONE_PLAN.md 섹션 6과 비교해서 누락된 모델 있으면 추가해.
```

---

## 🧱 블록 5. Neon DB 연결

### 🎯 목표
Neon에서 DB 생성하고 연결 URL을 .env에 넣은 뒤 스키마를 실제 DB로 밀어넣기.

### 👨 내가 할 일

**1단계**: neon.tech 로그인 → `New Project` → 이름 `hicarz-clone` → Region은 `Asia Pacific (Seoul)` → 생성.

**2단계**: 프로젝트 대시보드 → `Connection string` 복사 (형식: `postgresql://user:pass@host/db?sslmode=require`)

**3단계**: Antigravity에서 `.env.local` 열고 `DATABASE_URL="..."` 안에 붙여넣기. 저장.

### 🤖 안티에게 (3단계 완료 후)
```
.env.local에 DATABASE_URL 넣었어. 이제 아래 실행해:

npx prisma migrate dev --name init

마이그레이션 성공 후 npx prisma studio 실행해서 브라우저에서
테이블들 다 만들어졌는지 확인해줘. 스크린샷 대신 테이블 목록 텍스트로 알려주면 돼.

완료되면 "블록 5 완료" 라고.
```

### ✅ 성공 판정
1. 터미널에 `Your database is now in sync with your schema` 출력
2. Neon 대시보드 Tables 탭에 Brand, Car, QuoteRequest, Review, Planner, Faq, AdminUser 테이블 보임
3. Prisma Studio (`localhost:5555`)에서 테이블 리스트 확인됨

### 🔁 실패 시
```
안티야, migrate dev 에러 전체 로그 보여줘. 
특히 "connection refused" 나 "authentication failed" 메시지 있는지 확인.
```

에러별 대응:
- `P1001 connection refused` → Neon Connection string 오타, 재복사
- `SSL required` → URL 끝에 `?sslmode=require` 붙었는지 확인
- `Database does not exist` → Neon에서 DB 이름 확인

---

## 🧱 블록 6. seed.ts 배치 + 브랜드 시드 실행

### 🎯 목표
내가 준 `seed.ts`를 정확한 위치에 놓고 실행 → DB에 브랜드 38개 + 차량 15개 적재.

### 👨 내가 할 일
1. 다운로드한 `seed.ts` 파일을 **`hicarz-clone/prisma/seed.ts`** 로 옮기기 (`prisma` 폴더 안, 기존 schema.prisma 옆).

2. Antigravity 탐색기 확인:
```
prisma/
├── schema.prisma
├── seed.ts           ← 여기!
└── migrations/
```

### 🤖 안티에게
```
prisma/seed.ts 파일이 있지? 확인하고 아래 실행해:

1. package.json 최상위에 추가:
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}

2. npx prisma db seed 실행.

3. 실행 후 로그 전부 보여줘. "38 brands seeded" 가 뜨는지 확인.
4. npx prisma studio 열어서 Brand 테이블에 38개 row 들어있는지 알려줘.

완료되면 "블록 6 완료" 라고.
```

### ✅ 성공 판정
1. 로그에 `✅ 38 brands seeded`, `✅ 15 cars seeded`, `🎉 Seed completed` 출력
2. Prisma Studio Brand 테이블 row 수 = 38

### 🔁 실패 시
```
안티야, seed 실행 실패했어. 전체 에러 로그 보여줘.
특히 P2002 (unique constraint) 또는 타입 에러 있는지 확인.
```

에러별 대응:
- `P2002 unique constraint failed` → 이미 시드된 것. 무시 가능 (upsert 구조라 안전).
- `Module not found: tsx` → `npm i -D tsx` 재실행.
- `Cannot find module '@prisma/client'` → `npx prisma generate` 실행.

---

## 🧱 블록 7. 크롤링 스크립트 배치

### 🎯 목표
내가 준 크롤링 스크립트 2개를 scripts 폴더에 배치.

### 👨 내가 할 일
1. Antigravity 탐색기 루트에 `scripts` 폴더 생성 (우클릭 → New Folder)
2. 다운로드한 파일 2개를 scripts 폴더로 옮기기:
```
scripts/
├── crawl-hicarz.ts         ← 여기!
└── seed-from-json.ts        ← 여기!
```

3. 루트에 `data` 폴더도 생성 (크롤링 결과 저장용, 비어있어도 됨).

### 🤖 안티에게
```
scripts/crawl-hicarz.ts 와 scripts/seed-from-json.ts 있는지 확인해.
data/ 폴더도 있는지 확인해.

없으면 만들고, 있으면 "블록 7 완료" 라고 알려줘.
```

### ✅ 성공 판정
```
hicarz-clone/
├── scripts/
│   ├── crawl-hicarz.ts
│   └── seed-from-json.ts
└── data/   (빈 폴더)
```

### 🔁 실패 시
파일을 드래그 앤 드롭으로 직접 옮기면 됨. 위치만 맞으면 문제없음.

---

## 🧱 블록 8. 정찰 크롤링 (셀렉터 확인)

### 🎯 목표
**이 블록이 제일 중요하고 제일 막히기 쉽다.** 크롤러가 돌아가기 전에 하이카즈 사이트의 실제 HTML 구조를 확인해야 한다.

### 🤖 안티에게
```
아래 명령 실행해:

DRY_RUN=true MAX_CARS=2 npx tsx scripts/crawl-hicarz.ts

이건 정찰 모드야. 브라우저 창이 실제로 뜨면서 하이카즈 사이트를 방문할 거야.

결과로 확인해야 할 것 3가지:
1. 콘솔에 "API 호출 감지: POST ..." 로그가 뜨는지
2. 차량 URL을 몇 개 찾았는지
3. 크롤링 실패 로그가 있는지

위 3가지를 정리해서 알려줘. 완료되면 "블록 8-1 완료".
```

### ✅ 성공 판정 (8-1)
3가지 중 하나 이상의 시나리오 확인:

**시나리오 A (최고)**: API 호출 감지됨 → Playwright 클릭 불필요, fetch로 직접 API 호출 가능. 블록 9에서 스크립트 대폭 단순화 가능.

**시나리오 B (보통)**: 차량 URL은 찾았지만 크롤링 실패 발생 → 내가 쓴 셀렉터가 실제 DOM과 다름. 셀렉터 보정 필요.

**시나리오 C (최악)**: 차량 URL조차 0개 → 브랜드 페이지 URL 패턴 자체가 틀림. URL 패턴 재발견 필요.

### 🔁 실패 시 (블록 8-2: 셀렉터 보정)

**천상이 직접 할 일**:
1. 크롬 브라우저 열기
2. 모바일 뷰로 전환 (F12 → 디바이스 토글 아이콘)
3. `https://m.hicarzautoplan.com` 접속
4. 브랜드 로고 하나 클릭 → 차량 리스트 페이지 URL 확인 (예: `/cars/...`)
5. 차량 하나 클릭 → 상세 페이지에서 **우클릭 → 검사** 로 아래 셀렉터 확인:

| 확인할 요소 | 실제 셀렉터 찾아야 함 |
|---|---|
| 모델명 | 보통 `h1`, `.model-name` 등 |
| 기본가격 | "기본가격" 텍스트 옆 숫자 |
| 월납입료 | "월 납입료" 표시 영역 |
| 36개월 버튼 | "36개월" 텍스트 버튼 |
| 선납30% 버튼 | "선납30%" 텍스트 버튼 |
| 옵션 모달 버튼 | "모델 및 옵션" 버튼 |

**확인 완료 후 안티에게**:
```
안티야, 정찰 결과 아래와 같아:

- 브랜드별 차량 리스트 URL 패턴: [실제 URL]
- 모델명 셀렉터: [실제 셀렉터]
- 기본가격 셀렉터: [실제 셀렉터]
- 월납입료 셀렉터: [실제 셀렉터]
- 36개월 버튼: [실제 셀렉터]
- 선납30% 버튼: [실제 셀렉터]
- 옵션 모달 버튼: [실제 셀렉터]

이 정보로 scripts/crawl-hicarz.ts 의 셀렉터 부분을 수정해줘.
수정 후 다시 DRY_RUN=true MAX_CARS=2 npx tsx scripts/crawl-hicarz.ts 실행해서
정상 크롤링 되는지 확인.

완료되면 "블록 8-2 완료".
```

### ⚠️ 이 블록이 막히면?
정찰 자체를 **안티한테 시키는 방법**도 있음:

```
안티야, Playwright로 아래 작업 자동화해줘:

1. https://m.hicarzautoplan.com 접속 (모바일 뷰포트 390x844)
2. 페이지 전체 HTML을 dom-dump-main.html 로 저장
3. 브랜드 링크 중 하나 클릭해서 차량 리스트 페이지 이동
4. 해당 페이지 HTML을 dom-dump-brand.html 로 저장
5. 차량 링크 하나 클릭해서 상세 페이지 이동
6. 해당 페이지 HTML을 dom-dump-car.html 로 저장

저장 후 세 파일 내 주요 요소 (차량 카드, 가격, 버튼들)의 
CSS 셀렉터를 추출해서 보고서 작성해줘.
```

---

## 🧱 블록 9. 본 크롤링 + DB 적재

### 🎯 목표
전체 차량 데이터를 크롤링하고 DB에 넣기.

### 🤖 안티에게 (9-1: 본 크롤링)
```
셀렉터 보정 완료됐지?

이제 본 크롤링 실행:
npx tsx scripts/crawl-hicarz.ts

30~40분 걸릴 거야. 중간중간 data/hicarz-cars.json 크기가 계속
커지는지 확인해줘. 10분마다 한 번씩 상태 보고:
- 현재 수집된 차량 수
- 실패한 차량 수
- JSON 파일 크기

완료되면 "블록 9-1 완료" 하고 총 수집 건수 알려줘.
```

### ✅ 성공 판정 (9-1)
1. `data/hicarz-cars.json` 파일 생성됨 (크기 수 MB)
2. 콘솔에 `🎉 완료: 총 N대` 출력 (N ≥ 50 권장)

### 🤖 안티에게 (9-2: DB 적재)
```
크롤링 완료됐으면 이제 DB에 넣자:

npx tsx scripts/seed-from-json.ts

실행 후 로그 보여줘. "신규: N대, 갱신: M대, 스킵: K대" 형식.
완료되면 Prisma Studio 열어서 Car 테이블 row 수 확인.

"블록 9-2 완료" 라고 알려줘.
```

### ✅ 성공 판정 (9-2)
Prisma Studio > Car 테이블 > row 수 = 크롤링한 차량 수

### 🔁 실패 시
- 크롤링 도중 IP 차단 의심 → `scripts/crawl-hicarz.ts` 상단 `REQUEST_DELAY_MS = 5000`으로 증가 후 재실행
- JSON 로드 실패 → `data/hicarz-cars.json` 파일 유효한 JSON인지 확인 (마지막 괄호 빠지면 깨짐)

---

## 🧱 블록 10. 홈 화면 구현 시작

### 🎯 목표
실제 UI 만들기 시작. 여기부터는 긴 작업이라 **하위 블록으로 쪼개서** 하나씩 진행.

### 🤖 안티에게 (10-1: Header)
```
HICARZ_CLONE_PLAN.md 섹션 3 [홈 섹션 S1~S10] 중에
먼저 공통 레이아웃(Header + Footer + FloatingCTA)부터 만들어.

요구사항:
1. components/layout/Header.tsx 생성. 반응형: 모바일 햄버거, 데스크톱 수평 메뉴.
2. components/layout/Footer.tsx 생성. 모바일 스택, 데스크톱 4컬럼.
3. components/layout/FloatingCTA.tsx 생성. lg:hidden으로 모바일 전용.
4. app/(site)/layout.tsx 에 위 3개 조립.
5. 모든 컴포넌트는 섹션 5.1 CSS Variables 사용.

완료 후 npm run dev 로 확인하고 "블록 10-1 완료" 라고 알려줘.
```

### ✅ 성공 판정 (10-1)
localhost:3000 접속 → 헤더, 푸터, 모바일 FloatingCTA 보임. 반응형으로 창 줄여보면 레이아웃 바뀜.

### 🔁 이후 블록들
10-2: 홈 섹션 S1~S3 (Hero, 브랜드 그리드, 인기 차량)
10-3: 홈 섹션 S4~S6 (CTA 배너, 상담 폼, 채널)
10-4: 홈 섹션 S7~S10 (가격대, 플래너, 후기, Footer는 이미 있음)

이 블록들은 **한 번에 하나씩** 진행. 한 번에 다 시키면 안티가 뒤죽박죽 만든다.

---

## 🆘 응급 대응 매뉴얼

### 🔥 터미널에 긴 에러 로그가 떴을 때
당황하지 말고 **이 프롬프트만 복붙**:
```
안티야, 방금 에러 전체 로그를 읽고:
1. 에러의 핵심 원인 1줄 요약
2. 해결 방법 구체적 명령어
3. 왜 발생했는지 이유

3가지로 정리해줘. 한 번에 다 고치려 하지 말고 1단계 해결책만 제시해.
```

### 🌀 "뭐 하고 있었는지 까먹음"
```
안티야, 현재까지 내가 완료한 블록과 진행 중인 블록 정리해줘.
EXECUTION_GUIDE.md 체크리스트 기준으로.
```

### ⏰ "오늘은 여기까지"
```
안티야, 지금 상태 저장해. 다음에 다시 올 때 봐야 할 것:
1. 지금까지 완료한 블록
2. 다음에 시작할 블록 번호
3. 미해결 이슈

세 가지 SESSION_LOG.md 파일로 루트에 저장해.
```

### 🆘 "안티가 말 안 들음"
안티 채팅창 리셋 (새 세션 시작) 후:
```
HICARZ_CLONE_PLAN.md 와 EXECUTION_GUIDE.md 먼저 읽어.
그리고 지금 진행 중인 블록이 EXECUTION_GUIDE.md 기준 몇 번인지 
SESSION_LOG.md 확인해서 알려줘.
```

---

## 🚨 절대 금지 사항

1. **Git push 자동 실행 금지** — 안티가 알아서 push 하면 CVE 노출 위험. 커밋은 OK, push는 천상 허락 필요.
2. **하이카즈 약관/개인정보 문구 복사 금지** — 법적 리스크. 천상 사업자 정보로 자체 작성.
3. **하이카즈 이미지 URL 직접 사용 금지** — 저작권 위험. 제조사 프레스킷 또는 자체 촬영.
4. **한 번에 여러 블록 시키기 금지** — ADHD 관점에서 결과 품질 폭락.

---

## 🎯 오늘 하루 목표 (선택)

시간 블록별 추천:

**2시간 블록**: 블록 1~6 완료 (DB까지)
**+2시간 블록**: 블록 7~9 완료 (크롤링까지)
**+1시간 블록**: 블록 10-1 완료 (Header/Footer)

합계 5시간이면 **"차량 데이터 들어있는 빈 사이트 골격"** 완성.

홈 실구현은 다음 날 별도 블록으로.

---

**문서 버전**: v1.0
**마지막 수정**: 2026-04-24
