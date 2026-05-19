export default function ReviewCarouselSkeleton() {
  return (
    <section className="py-8 bg-white" aria-label="이용후기 로딩 중">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-5">
          <div className="h-7 bg-gray-200 rounded w-40 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-16 animate-pulse" />
        </div>

        {/* 캐러셀 스켈레톤 */}
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex-[0_0_75%] md:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0"
            >
              <div className="border border-gray-200 rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-[16/10] bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
