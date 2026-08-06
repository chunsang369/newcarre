const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== [제로카즈 외부 유입 경로 & 방문 분석 종합 보고서 생성] ===\n');

  const totalVisitLogs = await prisma.visitLog.count();
  const totalClickEvents = await prisma.clickEvent.count();

  if (totalVisitLogs === 0) {
    console.log('방문 데이터(VisitLog)가 아직 누적되지 않았거나 0건입니다.');
    await prisma.$disconnect();
    return;
  }

  // 1. 전체 기간 및 방문자 통계
  const firstLog = await prisma.visitLog.findFirst({ orderBy: { createdAt: 'asc' } });
  const lastLog = await prisma.visitLog.findFirst({ orderBy: { createdAt: 'desc' } });

  const uniqueVisitors = await prisma.visitLog.groupBy({
    by: ['visitorId']
  });

  const uniqueSessions = await prisma.visitLog.groupBy({
    by: ['sessionId']
  });

  // 2. 유입 도메인별 집계 (referringDomain)
  const domainStats = await prisma.visitLog.groupBy({
    by: ['referringDomain'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  });

  // 3. UTM Source 별 집계
  const utmSourceStats = await prisma.visitLog.groupBy({
    by: ['utmSource'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  });

  // 4. UTM Medium 별 집계
  const utmMediumStats = await prisma.visitLog.groupBy({
    by: ['utmMedium'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  });

  // 5. 인기 접속 경로 (path)
  const pathStats = await prisma.visitLog.groupBy({
    by: ['path'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 15
  });

  // 6. 일자별 방문자 & 세션 통계 (날짜 그룹핑)
  const rawLogs = await prisma.visitLog.findMany({
    select: {
      createdAt: true,
      sessionId: true,
      visitorId: true,
      referringDomain: true,
      utmSource: true
    },
    orderBy: { createdAt: 'asc' }
  });

  const dailyMap = {};
  rawLogs.forEach(log => {
    const dateStr = log.createdAt.toISOString().split('T')[0];
    if (!dailyMap[dateStr]) {
      dailyMap[dateStr] = {
        date: dateStr,
        pageViews: 0,
        sessions: new Set(),
        visitors: new Set(),
        sources: {}
      };
    }
    dailyMap[dateStr].pageViews++;
    dailyMap[dateStr].sessions.add(log.sessionId);
    dailyMap[dateStr].visitors.add(log.visitorId);

    const sourceKey = log.referringDomain || log.utmSource || '직접 유입 (Direct / Unknown)';
    dailyMap[dateStr].sources[sourceKey] = (dailyMap[dateStr].sources[sourceKey] || 0) + 1;
  });

  const reportData = {
    summary: {
      period: `${firstLog.createdAt.toISOString().split('T')[0]} ~ ${lastLog.createdAt.toISOString().split('T')[0]}`,
      totalPageViews: totalVisitLogs,
      totalSessions: uniqueSessions.length,
      totalVisitors: uniqueVisitors.length,
      totalClickEvents: totalClickEvents
    },
    domainStats: domainStats.map(d => ({
      domain: d.referringDomain || '직접 유입 (Direct / Bookmark)',
      count: d._count.id,
      ratio: ((d._count.id / totalVisitLogs) * 100).toFixed(1) + '%'
    })),
    utmSourceStats: utmSourceStats.map(u => ({
      source: u.utmSource || '미지정 (None)',
      count: u._count.id
    })),
    utmMediumStats: utmMediumStats.map(m => ({
      medium: m.utmMedium || '미지정 (None)',
      count: m._count.id
    })),
    pathStats: pathStats.map(p => ({
      path: p.path,
      count: p._count.id
    })),
    dailyMap: dailyMap
  };

  console.log(JSON.stringify(reportData, null, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
