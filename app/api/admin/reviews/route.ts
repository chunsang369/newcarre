import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const review = await prisma.review.create({
      data: {
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl || null,
        carModel: data.carModel,
        customerName: data.customerName,
        plannerName: data.plannerName || null,
        contractDate: new Date(data.contractDate),
        isPublished: data.isPublished ?? true,
        sortOrder: parseInt(data.sortOrder || "0", 10),
      },
    });
    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    console.error("Failed to create review:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
