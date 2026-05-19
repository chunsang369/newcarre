export default function ReviewCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden animate-pulse">
      {/* 이미지 영역 */}
      <div className="aspect-[16/10] bg-gray-100" />

      {/* 텍스트 영역 */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-5 bg-blue-50 rounded-full w-20" />
        </div>
        <div className="h-5 bg-gray-200 rounded w-4/5 mb-2" />
        <div className="space-y-1.5 mb-3">
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-3/4" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-3 bg-gray-100 rounded w-16" />
          <div className="h-3 bg-gray-100 rounded w-20" />
        </div>
      </div>
    </div>
  );
}
