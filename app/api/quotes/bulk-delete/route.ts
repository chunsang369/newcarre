import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "삭제할 항목을 선택해주세요." },
        { status: 400 }
      );
    }

    await prisma.quoteRequest.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return NextResponse.json({ success: true, count: ids.length });
  } catch (error) {
    console.error("[POST /api/quotes/bulk-delete] Error:", error);
    return NextResponse.json(
      { error: "일괄 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
