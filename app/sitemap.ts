import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://hicarzautoplan.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 정적 페이지들
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/cars`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/cars/quick-quote`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/reviews`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/planners`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/company`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    // 가격대별 페이지
    ...[20, 30, 40, 50, 60, 70, 80].map((p) => ({
      url: `${BASE_URL}/cars/price/${p}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];

  // 차량 상세 페이지 (동적)
  const cars = await prisma.car.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });
  const carRoutes: MetadataRoute.Sitemap = cars.map((car) => ({
    url: `${BASE_URL}/cars/${car.slug}`,
    lastModified: car.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // 브랜드 페이지 (동적)
  const brands = await prisma.brand.findMany({ select: { slug: true } });
  const brandRoutes: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${BASE_URL}/cars/brands/${brand.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  // 후기 페이지 (동적)
  const reviews = await prisma.review.findMany({
    where: { isPublished: true },
    select: { id: true, createdAt: true },
  });
  const reviewRoutes: MetadataRoute.Sitemap = reviews.map((r) => ({
    url: `${BASE_URL}/reviews/${r.id}`,
    lastModified: r.createdAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...carRoutes, ...brandRoutes, ...reviewRoutes];
}
