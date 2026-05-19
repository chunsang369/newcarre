import ReviewCardSkeleton from "@/components/reviews/ReviewCardSkeleton";

export default function ReviewsLoading() {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <ReviewCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
