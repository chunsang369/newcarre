import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.quoteRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/quotes/[id]] Error:", error);
    return NextResponse.json(
      { error: "삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
