export const dynamic = "force-dynamic";

import { getAnalyticsStats, StatsData } from "@/lib/analytics/stats";
import AdminAnalyticsClient from "./AdminAnalyticsClient";

const DEFAULT_FALLBACK_STATS: StatsData = {
  summary: {
    totalVisits: 0,
    uniqueVisitors: 0,
    totalClicks: 0,
    totalQuotes: 0,
    conversionRate: "0.0",
  },
  topReferrers: [],
  topReferrerUrls: [],
  topPages: [],
  topUtmSources: [],
  topClicks: [],
  dailyTrend: [],
};

export default async function AdminAnalyticsPage() {
  let initialData: StatsData = DEFAULT_FALLBACK_STATS;
  try {
    // 최초 진입 시, KST 오늘 기준 최근 7일 범위의 데이터를 서버 사이드에서 직접 조회
    initialData = await getAnalyticsStats({ range: "7" });
  } catch (err) {
    console.error("[AdminAnalyticsPage] SSR analytics fetch failed, using fallback:", err);
  }

  return <AdminAnalyticsClient initialData={initialData} />;
}
