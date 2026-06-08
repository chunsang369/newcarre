import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsStats } from "@/lib/analytics/stats";

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

    // 2. 공통 모듈 호출
    const stats = await getAnalyticsStats({
      date: dateParam,
      range: rangeParam,
    });

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("Error fetching analytics stats:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
