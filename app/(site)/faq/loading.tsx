export default function FaqLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-subtle)]">
      {/* Header */}
      <div className="bg-[var(--color-primary)] text-white">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-12 lg:py-16 text-center">
          <h1 className="text-2xl lg:text-4xl font-bold mb-2">자주 묻는 질문</h1>
          <p className="text-white/70 text-sm lg:text-base">장기렌트·리스에 대한 궁금증을 해결해드립니다</p>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <div className="space-y-0 divide-y divide-gray-200 border-t border-gray-200">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="py-4 flex items-center justify-between animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-4/5" />
              <div className="w-5 h-5 bg-gray-100 rounded flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
