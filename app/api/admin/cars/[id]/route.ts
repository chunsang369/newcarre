export const dynamic = "force-dynamic";

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
    
    // Parse numeric fields if they exist and are strings
    const updateData: any = { ...data };
    if (updateData.year !== undefined) updateData.year = parseInt(updateData.year, 10);
    if (updateData.basePrice !== undefined) updateData.basePrice = parseInt(updateData.basePrice, 10);
    if (updateData.sortOrder !== undefined) updateData.sortOrder = parseInt(updateData.sortOrder, 10);

    // 트림별 개별 오프셋 부분 업데이트 지원
    if (data.trimIdx !== undefined) {
      const currentCar = await prisma.car.findUnique({ where: { id } });
      if (currentCar) {
        const options = typeof currentCar.options === "string" 
          ? JSON.parse(currentCar.options) 
          : (currentCar.options || {});
        
        let updated = false;
        if (options && options.grades) {
          options.grades.forEach((grade: any) => {
            if (grade.trims) {
              grade.trims.forEach((trim: any) => {
                if (trim.idx === data.trimIdx) {
                  trim.rentOffset = parseInt(data.rentOffset, 10) || 0;
                  trim.leaseOffset = parseInt(data.leaseOffset, 10) || 0;
                  updated = true;
                }
              });
            }
          });
        }
        if (updated) {
          updateData.options = options;
        }
      }
      delete updateData.trimIdx;
      delete updateData.rentOffset;
      delete updateData.leaseOffset;
    }

    const car = await prisma.car.update({
      where: { id },
      data: updateData,
    });
    // @ts-ignore
    revalidateTag("cars");
    return NextResponse.json({ success: true, data: car });
  } catch (error) {
    console.error("Failed to update car:", error);
    return NextResponse.json({ error: "Failed to update car" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.car.delete({
      where: { id },
    });
    // @ts-ignore
    revalidateTag("cars");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete car:", error);
    return NextResponse.json({ error: "Failed to delete car" }, { status: 500 });
  }
}
