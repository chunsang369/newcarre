import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review || !review.isPublished) notFound();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[800px] mx-auto px-4 lg:px-8 py-8 lg:py-12">
        {/* Back */}
        <Link href="/reviews" className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] mb-6 transition-colors">
          ← 목록으로
        </Link>

        {/* Image */}
        {review.imageUrl && (
          <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 mb-8">
            <img src={review.imageUrl} alt={review.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">{review.carModel}</span>
          <span className="text-xs text-[var(--color-text-muted)]">{review.customerName}</span>
          <span className="text-xs text-[var(--color-text-muted)]">{new Date(review.contractDate).toLocaleDateString("ko-KR")}</span>
          {review.plannerName && (
            <span className="text-xs text-[var(--color-text-muted)]">담당: {review.plannerName}</span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text)] mb-6">{review.title}</h1>

        {/* Content */}
        <div className="prose max-w-none text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">
          {review.content}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-[var(--color-bg-subtle)] rounded-2xl p-6 lg:p-8 text-center">
          <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">나도 장기렌트·리스 견적 받아보기</h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">무료 상담으로 최저가 견적을 받아보세요</p>
          <Link
            href="/cars/quick-quote"
            className="inline-flex px-8 py-3 rounded-xl bg-[var(--color-accent)] text-white font-bold hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            간편 견적 신청
          </Link>
        </div>
      </div>
    </div>
  );
}
