const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

const FIXES = {
  "긴글주의)무심사 장기렌트 이용하게 해주신 진심 감사드립니다": "무심사 장기렌트도 가능! 진심으로 감사드립니다",
  "벤츠출고했어요": "벤츠 장기렌트 출고 완료했어요!",
  "제로카즈 cn7 출고후기": "CN7 장기렌트 출고 후기",
  "제로카즈 정말 고객을위해 최선을다하는모습좋았습니다": "고객을 위해 최선을 다하는 모습, 정말 좋았습니다",
};

async function main() {
  const reviews = await p.review.findMany({ orderBy: { sortOrder: 'asc' } });
  let fixed = 0;
  for (const r of reviews) {
    if (FIXES[r.title]) {
      await p.review.update({ where: { id: r.id }, data: { title: FIXES[r.title] } });
      console.log(`[${r.sortOrder}] "${r.title}" → "${FIXES[r.title]}"`);
      fixed++;
    }
  }
  console.log(`\n✅ ${fixed}개 최종 수정 완료`);

  const all = await p.review.findMany({ orderBy: { sortOrder: 'asc' }, select: { sortOrder: true, title: true } });
  console.log('\n--- 최종 제목 ---');
  all.forEach(x => console.log(`${x.sortOrder} | ${x.title}`));
  await p.$disconnect();
}
main().catch(e => { console.error(e); p.$disconnect(); });
