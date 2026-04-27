import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CarDetailClient from "./CarDetailClient";

// ---------- Dynamic Metadata (SEO) ----------
export async function generateMetadata({
  params,
}: {
  params: Promise<{ carId: string }>;
}): Promise<Metadata> {
  const { carId } = await params;
  const car = await prisma.car.findUnique({
    where: { slug: carId },
    include: { brand: true },
  });
  if (!car) return { title: "차량 상세 — 하이카즈" };

  const title = `${car.brand.name} ${car.modelName} ${car.trimName} | 하이카즈 장기렌트·리스`;
  const description = `${car.year}년형 ${car.brand.name} ${car.modelName} ${car.trimName} 장기렌트·리스 견적을 비교하세요. 월 납입료 확인 및 무료 상담.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [car.thumbnailUrl],
      type: "website",
      locale: "ko_KR",
    },
  };
}

// ---------- Page ----------
export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ carId: string }>;
}) {
  const { carId } = await params;

  const car = await prisma.car.findUnique({
    where: { slug: carId },
    include: { brand: true },
  });

  if (!car) notFound();

  // Serialize for client component
  const serializedCar = {
    id: car.id,
    slug: car.slug,
    modelName: car.modelName,
    trimName: car.trimName,
    year: car.year,
    category: car.category,
    fuelType: car.fuelType,
    basePrice: car.basePrice,
    thumbnailUrl: car.thumbnailUrl,
    galleryUrls: car.galleryUrls,
    catalogUrl: car.catalogUrl,
    specSheetUrl: car.specSheetUrl,
    options: car.options as Record<string, unknown>,
    priceMatrix: car.priceMatrix as Record<string, { rent: number; lease: number }>,
    brand: {
      name: car.brand.name,
      nameEn: car.brand.nameEn,
      slug: car.brand.slug,
      logoUrl: car.brand.logoUrl,
    },
  };

  return <CarDetailClient car={serializedCar} />;
}
