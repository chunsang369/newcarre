export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const car = await prisma.car.create({
      data: {
        slug: data.slug,
        modelName: data.modelName,
        trimName: data.trimName,
        year: parseInt(data.year, 10),
        category: data.category,
        fuelType: data.fuelType,
        basePrice: parseInt(data.basePrice, 10),
        thumbnailUrl: data.thumbnailUrl,
        galleryUrls: data.galleryUrls || [],
        catalogUrl: data.catalogUrl || null,
        specSheetUrl: data.specSheetUrl || null,
        options: data.options || {},
        priceMatrix: data.priceMatrix || {},
        brandId: data.brandId,
        isActive: data.isActive ?? true,
        isPopular: data.isPopular ?? false,
        isInstant: data.isInstant ?? false,
        sortOrder: parseInt(data.sortOrder || "0", 10),
      },
    });
    // @ts-ignore
    revalidateTag("cars");
    return NextResponse.json({ success: true, data: car });
  } catch (error) {
    console.error("Failed to create car:", error);
    return NextResponse.json({ error: "Failed to create car" }, { status: 500 });
  }
}
