import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    const updateData: any = { ...data };
    if (updateData.sortOrder !== undefined) updateData.sortOrder = parseInt(updateData.sortOrder, 10);

    const planner = await prisma.planner.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json({ success: true, data: planner });
  } catch (error) {
    console.error("Failed to update planner:", error);
    return NextResponse.json({ error: "Failed to update planner" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.planner.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete planner:", error);
    return NextResponse.json({ error: "Failed to delete planner" }, { status: 500 });
  }
}
