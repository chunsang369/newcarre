import { getCachedReviewCarousel } from "@/lib/cache";
import ReviewCarouselClient from "./ReviewCarouselClient";

export default async function ReviewCarousel() {
  const reviews = await getCachedReviewCarousel();

  const serialized = reviews.map((r: any) => ({
    id: r.id,
    title: r.title,
    content: r.content,
    thumbnailUrl: r.thumbnailUrl,
    customerName: r.customerName,
    plannerName: r.plannerName,
    contractDate: new Date(r.contractDate).toISOString(),
  }));

  return <ReviewCarouselClient reviews={serialized} />;
}


