import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // 1. 관리자 세션 쿠키 검사 (관리자 행동 수집 배제)
    const adminSession = request.cookies.get("admin_session");
    if (adminSession && adminSession.value === "true") {
      return NextResponse.json({ success: true, ignored: true });
    }

    const body = await request.json();
    const { sessionId, pagePath, elementId, elementText } = body;

    if (!sessionId || !pagePath) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. 가장 최근에 해당하는 동일 세션의 VisitLog 매칭
    const lastVisit = await prisma.visitLog.findFirst({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
    });

    if (!lastVisit) {
      // 세션 시작 로그가 누락된 경우, 안전을 위해 통과 처리
      return NextResponse.json({ success: false, reason: "No active session visit log found" }, { status: 200 });
    }

    // 3. 클릭 로그 데이터베이스 저장
    const click = await prisma.clickEvent.create({
      data: {
        visitLogId: lastVisit.id,
        pagePath,
        elementId: elementId || null,
        elementText: elementText || null,
      },
    });

    return NextResponse.json({ success: true, clickId: click.id });
  } catch (error: any) {
    console.error("Error creating click event log:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
