import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay, endOfDay } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    // 1. 관리자 세션 쿠키 검증
    const adminSession = request.cookies.get("admin_session");
    if (!adminSession || adminSession.value !== "true") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date"); // YYYY-MM-DD 포맷
    const rangeParam = searchParams.get("range");

    let startDate: Date;
    let endDate: Date;
    let isSingleDay = false;
    let targetDateStr = "";

    // KST 오늘 구하기 (YYYY-MM-DD)
    const kstTodayStr = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });

    // 2. 단일 특정 일자 필터링 vs 범위 필터링 결정 (한국시간 KST 기준)
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      targetDateStr = dateParam;
      startDate = new Date(`${targetDateStr}T00:00:00.000+09:00`);
      endDate = new Date(`${targetDateStr}T23:59:59.999+09:00`);
      isSingleDay = true;
    } else {
      const range = parseInt(rangeParam || "7");
      const endDateStr = kstTodayStr;
      
      const startBase = new Date();
      startBase.setDate(startBase.getDate() - (range - 1));
      const startDateStr = startBase.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });

      startDate = new Date(`${startDateStr}T00:00:00.000+09:00`);
      endDate = new Date(`${endDateStr}T23:59:59.999+09:00`);
    }

    // 3. 핵심 성과 지표 병렬 집계
    const [totalVisits, uniqueVisitors, totalClicks, totalQuotes] = await Promise.all([
      prisma.visitLog.count({
        where: { createdAt: { gte: startDate, lte: endDate } }
      }),
      prisma.visitLog.groupBy({
        by: ["visitorId"],
        where: { createdAt: { gte: startDate, lte: endDate } },
      }).then(res => res.length),
      prisma.clickEvent.count({
        where: { createdAt: { gte: startDate, lte: endDate } }
      }),
      prisma.quoteRequest.count({
        where: { createdAt: { gte: startDate, lte: endDate } }
      })
    ]);

    // 4. 외부 유입 경로 탑 10 도메인 집계
    const topReferrersRaw = await prisma.visitLog.groupBy({
      by: ["referringDomain"],
      where: { createdAt: { gte: startDate, lte: endDate } },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: "desc"
        }
      },
      take: 10
    });

    // 4.1. 외부 유입 상세 URL 링크 탑 10 집계
    const topReferrerUrlsRaw = await prisma.visitLog.groupBy({
      by: ["referrer"],
      where: { 
        createdAt: { gte: startDate, lte: endDate },
        referrer: { not: null },
        NOT: { referrer: "" }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: "desc"
        }
      },
      take: 10
    });

    // 5. 페이지 뷰 인기 페이지 탑 10
    const topPagesRaw = await prisma.visitLog.groupBy({
      by: ["path"],
      where: { createdAt: { gte: startDate, lte: endDate } },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: "desc"
        }
      },
      take: 10
    });

    // 6. 마케팅 캠페인 소스 탑 10
    const topUtmSourcesRaw = await prisma.visitLog.groupBy({
      by: ["utmSource"],
      where: {
        createdAt: { gte: startDate, lte: endDate },
        utmSource: { not: null }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: "desc"
        }
      },
      take: 10
    });

    // 7. 가장 많이 클릭된 인터랙션 요소 탑 10
    const topClicksRaw = await prisma.clickEvent.groupBy({
      by: ["elementText", "pagePath"],
      where: {
        createdAt: { gte: startDate, lte: endDate },
        elementText: { not: null },
        NOT: { elementText: "" }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: "desc"
        }
      },
      take: 10
    });

    // 8. 최근 트렌드 시계열 분석 (한국시간 KST 기준)
    const dailyTrend = [];
    if (isSingleDay) {
      // 0시부터 22시까지 2시간 단위 파싱
      for (let h = 0; h < 24; h += 2) {
        const padH1 = String(h).padStart(2, "0");
        const padH2 = String(h + 1).padStart(2, "0");

        const start = new Date(`${targetDateStr}T${padH1}:00:00.000+09:00`);
        const end = new Date(`${targetDateStr}T${padH2}:59:59.999+09:00`);
        const timeStr = `${h}시`;

        const [vCount, cCount] = await Promise.all([
          prisma.visitLog.count({ where: { createdAt: { gte: start, lte: end } } }),
          prisma.clickEvent.count({ where: { createdAt: { gte: start, lte: end } } })
        ]);

        dailyTrend.push({
          date: timeStr,
          visits: vCount,
          clicks: cCount
        });
      }
    } else {
      const range = parseInt(rangeParam || "7");
      for (let i = range - 1; i >= 0; i--) {
        const targetDay = new Date();
        targetDay.setDate(targetDay.getDate() - i);
        const dayStr = targetDay.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
        
        const start = new Date(`${dayStr}T00:00:00.000+09:00`);
        const end = new Date(`${dayStr}T23:59:59.999+09:00`);
        
        const [, month, day] = dayStr.split("-").map(Number);
        const dateStr = `${month}/${day}`;

        const [vCount, cCount] = await Promise.all([
          prisma.visitLog.count({ where: { createdAt: { gte: start, lte: end } } }),
          prisma.clickEvent.count({ where: { createdAt: { gte: start, lte: end } } })
        ]);

        dailyTrend.push({
          date: dateStr,
          visits: vCount,
          clicks: cCount
        });
      }
    }

    return NextResponse.json({
      summary: {
        totalVisits,
        uniqueVisitors,
        totalClicks,
        totalQuotes,
        conversionRate: totalVisits > 0 ? ((totalQuotes / totalVisits) * 100).toFixed(1) : "0.0"
      },
      topReferrers: topReferrersRaw.map(r => ({
        domain: r.referringDomain || "direct",
        count: r._count.id
      })),
      topReferrerUrls: topReferrerUrlsRaw.map(r => ({
        url: r.referrer || "direct",
        count: r._count.id
      })),
      topPages: topPagesRaw.map(p => ({
        path: p.path,
        count: p._count.id
      })),
      topUtmSources: topUtmSourcesRaw.map(u => ({
        source: u.utmSource,
        count: u._count.id
      })),
      topClicks: topClicksRaw.map(c => ({
        text: c.elementText,
        path: c.pagePath,
        count: c._count.id
      })),
      dailyTrend
    });
  } catch (error: any) {
    console.error("Error fetching analytics stats:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
