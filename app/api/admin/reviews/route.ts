import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

// GET: 모든 후기 조회
export async function GET() {
  const reviews = await prisma.review.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(reviews);
}

// DELETE: 후기 삭제
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

// PATCH: 후기 수정
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // contractDate가 문자열이면 Date로 변환
  if (data.contractDate && typeof data.contractDate === "string") {
    data.contractDate = new Date(data.contractDate);
  }

  const updated = await prisma.review.update({
    where: { id },
    data,
  });
  return NextResponse.json(updated);
}
