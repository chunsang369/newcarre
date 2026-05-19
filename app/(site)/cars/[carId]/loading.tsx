export default function CarDetailLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 좌측: 이미지 블록 */}
          <div className="space-y-4 animate-pulse">
            <div className="aspect-[4/3] bg-gray-100 rounded-2xl" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-16 h-16 bg-gray-100 rounded-lg" />
              ))}
            </div>
          </div>

          {/* 우측: 옵션/가격 패널 */}
          <div className="space-y-6 animate-pulse">
            {/* 브랜드 + 차량명 */}
            <div>
              <div className="h-4 bg-gray-100 rounded w-20 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-64 mb-1" />
              <div className="h-4 bg-gray-100 rounded w-48" />
            </div>

            {/* 구매 방식 탭 */}
            <div className="flex gap-2">
              <div className="h-10 bg-gray-200 rounded-lg flex-1" />
              <div className="h-10 bg-gray-100 rounded-lg flex-1" />
            </div>

            {/* 옵션 선택 영역 */}
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 rounded w-24" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg" />
              ))}
            </div>

            {/* 가격 영역 */}
            <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-10 bg-gray-200 rounded w-48" />
              <div className="h-12 bg-gray-300 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
