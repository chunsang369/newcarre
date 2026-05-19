export const revalidate = 1800;

import type { Metadata } from "next";
import Link from "next/link";
import { getCachedReviews } from "@/lib/cache";

export const metadata: Metadata = {
  title: "계약 후기 — 하이카즈",
  description: "하이카즈에서 장기렌트·리스를 이용하신 고객님들의 생생한 후기를 확인하세요.",
};

export default async function ReviewsPage() {
  const reviews = await getCachedReviews(50);

  return (
    <div className="min-h-screen bg-[var(--color-bg-subtle)]">
      {/* Header */}
      <div className="bg-[var(--color-primary)] text-white">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-12 lg:py-16 text-center">
          <h1 className="text-2xl lg:text-4xl font-bold mb-2">계약 후기</h1>
          <p className="text-white/70 text-sm lg:text-base">실제 고객님들의 생생한 이용 후기입니다</p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-8 lg:py-12">
        {reviews.length === 0 ? (
          <div className="text-center py-20 text-[var(--color-text-muted)]">
            <p className="text-4xl mb-4">📝</p>
            <p>등록된 후기가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.map((review: any) => (
              <Link
                key={review.id}
                href={`/reviews/${review.id}`}
                className="group bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden hover:shadow-lg transition-shadow"
              >
                {review.imageUrl && (
                  <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                    <img
                      src={review.imageUrl}
                      alt={review.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">{review.carModel}</span>

                  </div>
                  <h3 className="font-bold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors mb-2 line-clamp-2">
                    {review.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] line-clamp-3 mb-3">{review.content}</p>
                  <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                    <span>{review.customerName}</span>
                    <span>{new Date(review.contractDate).toLocaleDateString("ko-KR")}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
