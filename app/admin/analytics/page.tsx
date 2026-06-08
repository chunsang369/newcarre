export const dynamic = "force-dynamic";

import { getAnalyticsStats } from "@/lib/analytics/stats";
import AdminAnalyticsClient from "./AdminAnalyticsClient";

export default async function AdminAnalyticsPage() {
  // 최초 진입 시, KST 오늘 기준 최근 7일 범위의 데이터를 서버 사이드에서 직접 조회
  const initialData = await getAnalyticsStats({ range: "7" });

  return <AdminAnalyticsClient initialData={initialData} />;
}
