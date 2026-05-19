export default function FaqSkeleton() {
  return (
    <section className="py-8 bg-white" aria-label="FAQ 로딩 중">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        <div className="h-7 bg-gray-200 rounded w-64 mb-5 animate-pulse" />

        <div className="divide-y divide-gray-200 border-t border-gray-200">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="py-4 flex items-center justify-between animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-4/5" />
              <div className="w-5 h-5 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
