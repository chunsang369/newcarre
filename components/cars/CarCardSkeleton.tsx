export default function CarCardSkeleton() {
  return (
    <div className="w-full border border-gray-200 rounded-xl overflow-hidden bg-white flex flex-col h-full animate-pulse">
      {/* 이미지 영역 */}
      <div className="aspect-[4/3] bg-gray-100" />

      {/* 정보 영역 */}
      <div className="p-3 lg:p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3 gap-1">
          <div className="h-4 bg-gray-200 rounded w-3/5" />
          <div className="h-4 bg-gray-100 rounded w-16" />
        </div>

        <div className="mt-auto space-y-1.5">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-10" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-10" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>

          {/* 버튼 영역 */}
          <div className="mt-4 flex gap-1.5 w-full">
            <div className="flex-1 h-10 bg-gray-200 rounded-md" />
            <div className="flex-1 h-10 bg-gray-100 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
