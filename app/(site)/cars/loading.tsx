import CarCardSkeleton from "@/components/cars/CarCardSkeleton";

export default function CarsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 필터 영역 스켈레톤 */}
      <div className="bg-white border-b border-gray-100 py-6 mb-6">
        <div className="mx-auto max-w-[1200px] px-4 lg:px-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-3" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-100 rounded-full w-20" />
            ))}
          </div>
        </div>
      </div>

      {/* 차량 그리드 스켈레톤 */}
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <CarCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
