import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const faq = await prisma.faq.create({
      data: {
        category: data.category,
        question: data.question,
        answer: data.answer,
        isPublished: data.isPublished ?? true,
        sortOrder: parseInt(data.sortOrder || "0", 10),
      },
    });
    revalidateTag("faq", { expire: 0 });
    return NextResponse.json({ success: true, data: faq });
  } catch (error) {
    console.error("Failed to create FAQ:", error);
    return NextResponse.json({ error: "Failed to create FAQ" }, { status: 500 });
  }
}
