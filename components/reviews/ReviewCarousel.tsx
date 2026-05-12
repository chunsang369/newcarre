import { prisma } from "@/lib/prisma";
import ReviewCarouselClient from "./ReviewCarouselClient";

export default async function ReviewCarousel() {
  const reviews = await prisma.review.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: "asc" },
    take: 12,
  });

  const serialized = reviews.map(r => ({
    id: r.id,
    title: r.title,
    content: r.content,
    thumbnailUrl: r.thumbnailUrl,
    customerName: r.customerName,
    plannerName: r.plannerName,
    contractDate: r.contractDate.toISOString(),
  }));

  return <ReviewCarouselClient reviews={serialized} />;
}
