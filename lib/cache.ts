import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────
// 차량 데이터 캐시 (tag: 'cars')
// ──────────────────────────────────────────

export const getCachedCars = unstable_cache(
  async () => {
    return prisma.car.findMany({
      where: { isActive: true },
      select: {
        id: true,
        slug: true,
        modelName: true,
        trimName: true,
        year: true,
        category: true,
        fuelType: true,
        basePrice: true,
        thumbnailUrl: true,
        isPopular: true,
        isInstant: true,
        priceMatrix: true,
        brand: {
          select: {
            name: true,
            slug: true,
            isDomestic: true,
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });
  },
  ["all-cars"],
  { tags: ["cars"], revalidate: 1800 }
);

export const getCachedCarBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.car.findUnique({
      where: { slug },
      include: { brand: true },
    });
  },
  ["car-by-slug"],
  { tags: ["cars"], revalidate: 1800 }
);

export const getCachedBrands = unstable_cache(
  async () => {
    return prisma.brand.findMany({
      orderBy: { sortOrder: "asc" },
    });
  },
  ["all-brands"],
  { tags: ["cars"], revalidate: 3600 }
);

export const getCachedBrandWithCars = unstable_cache(
  async (slug: string) => {
    return prisma.brand.findUnique({
      where: { slug },
      include: {
        cars: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  },
  ["brand-with-cars"],
  { tags: ["cars"], revalidate: 3600 }
);

export const getCachedCarSlugs = unstable_cache(
  async () => {
    return prisma.car.findMany({
      where: { isActive: true },
      select: { slug: true },
    });
  },
  ["car-slugs"],
  { tags: ["cars"], revalidate: 3600 }
);

export const getCachedBrandSlugs = unstable_cache(
  async () => {
    return prisma.brand.findMany({
      select: { slug: true },
    });
  },
  ["brand-slugs"],
  { tags: ["cars"], revalidate: 3600 }
);

export const getCachedInstantCars = unstable_cache(
  async () => {
    return prisma.car.findMany({
      where: { isActive: true, isInstant: true },
      select: {
        id: true,
        slug: true,
        modelName: true,
        trimName: true,
        year: true,
        category: true,
        fuelType: true,
        basePrice: true,
        thumbnailUrl: true,
        isPopular: true,
        isInstant: true,
        priceMatrix: true,
        brand: {
          select: {
            name: true,
            slug: true,
            isDomestic: true,
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });
  },
  ["instant-cars"],
  { tags: ["cars"], revalidate: 1800 }
);

// ──────────────────────────────────────────
// 이용후기 캐시 (tag: 'reviews')
// ──────────────────────────────────────────

export const getCachedReviews = unstable_cache(
  async (limit = 50) => {
    return prisma.review.findMany({
      where: { isPublished: true },
      orderBy: { contractDate: "desc" },
      take: limit,
    });
  },
  ["all-reviews"],
  { tags: ["reviews"], revalidate: 1800 }
);

export const getCachedReviewById = unstable_cache(
  async (id: string) => {
    return prisma.review.findUnique({ where: { id } });
  },
  ["review-by-id"],
  { tags: ["reviews"], revalidate: 3600 }
);

export const getCachedReviewCarousel = unstable_cache(
  async () => {
    return prisma.review.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: "asc" },
      take: 12,
    });
  },
  ["review-carousel"],
  { tags: ["reviews"], revalidate: 1800 }
);

// ──────────────────────────────────────────
// FAQ 캐시 (tag: 'faq')
// ──────────────────────────────────────────

export const getCachedFaqs = unstable_cache(
  async () => {
    return prisma.faq.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: "asc" },
    });
  },
  ["all-faqs"],
  { tags: ["faq"], revalidate: 3600 }
);
