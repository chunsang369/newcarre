# Hicarz Clone Project

현대적이고 고급스러운 디자인의 프리미엄 장기렌트/리스 차량 견적 플랫폼입니다.
차량 목록 자동 로딩(Progressive Loading) 및 데이터베이스 최적화가 적용되어 있습니다.

## 주요 기능
- **차량 탐색:** 국산/수입 브랜드별 차량 필터링 및 Progressive Loading 무한 스크롤 구현
- **프리미엄 UI/UX:** 모던하고 부드러운 인터랙션, 글래스모피즘 및 최신 트렌드 디자인 적용
- **데이터 자동화:** 차량 가격 및 상세 정보 데이터베이스 연동 (Prisma + Neon PostgreSQL)
- **최적화:** 초기 로딩 속도 극대화를 위해 초기 5대만 렌더링하고 나머지는 백그라운드 페칭

## 기술 스택
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS, Shadcn UI
- **Database:** Neon PostgreSQL, Prisma ORM
- **Deployment:** Netlify

## 로컬 실행 방법
```bash
npm install
npm run dev
```
