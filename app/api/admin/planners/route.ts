import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const planner = await prisma.planner.create({
      data: {
        name: data.name,
        nameEn: data.nameEn || null,
        position: data.position,
        photoUrl: data.photoUrl,
        phone: data.phone || null,
        kakaoUrl: data.kakaoUrl || null,
        bio: data.bio || null,
        isFeatured: data.isFeatured ?? false,
        sortOrder: parseInt(data.sortOrder || "0", 10),
      },
    });
    return NextResponse.json({ success: true, data: planner });
  } catch (error) {
    console.error("Failed to create planner:", error);
    return NextResponse.json({ error: "Failed to create planner" }, { status: 500 });
  }
}
