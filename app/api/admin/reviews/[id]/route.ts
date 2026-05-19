import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    const updateData: any = { ...data };
    if (updateData.sortOrder !== undefined) updateData.sortOrder = parseInt(updateData.sortOrder, 10);
    if (updateData.contractDate) updateData.contractDate = new Date(updateData.contractDate);

    const review = await prisma.review.update({
      where: { id },
      data: updateData,
    });
    // @ts-ignore
    revalidateTag("reviews");
    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    console.error("Failed to update review:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.review.delete({
      where: { id },
    });
    // @ts-ignore
    revalidateTag("reviews");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete review:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
