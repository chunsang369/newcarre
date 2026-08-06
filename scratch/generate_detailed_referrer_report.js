const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== [외부 유입 경로 상세 URL / 도메인 랭킹 집계] ===\n');

  const totalLogs = await prisma.visitLog.count();
  if (totalLogs === 0) {
    console.log('방문 데이터가 0건입니다.');
    await prisma.$disconnect();
    return;
  }

  // 1. 상세 링크 (Referrer 원문 URL) 랭킹
  const detailedReferrers = await prisma.visitLog.groupBy({
    by: ['referrer'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  });

  // 2. 도메인 (referringDomain) 랭킹
  const domainReferrers = await prisma.visitLog.groupBy({
    by: ['referringDomain'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  });

  const detailedList = detailedReferrers.map((r, i) => {
    const rawUrl = r.referrer || '직접 유입 (Direct / URL 직접 입력)';
    const count = r._count.id;
    const ratio = ((count / totalLogs) * 100).toFixed(1) + '%';
    return {
      rank: i + 1,
      url: rawUrl,
      count: count,
      ratio: ratio
    };
  });

  const domainList = domainReferrers.map((d, i) => {
    const domain = d.referringDomain || '직접 유입 (Direct / Bookmark)';
    const count = d._count.id;
    const ratio = ((count / totalLogs) * 100).toFixed(1) + '%';
    return {
      rank: i + 1,
      domain: domain,
      count: count,
      ratio: ratio
    };
  });

  console.log('=== 상세 링크 랭킹 (Top 20) ===');
  console.log(JSON.stringify(detailedList.slice(0, 20), null, 2));

  console.log('\n=== 도메인 랭킹 ===');
  console.log(JSON.stringify(domainList, null, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
