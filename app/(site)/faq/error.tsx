"use client";

export default function FaqError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-subtle)] flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="text-5xl mb-4">❓</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">FAQ를 불러올 수 없습니다</h2>
        <p className="text-sm text-gray-500 mb-6">일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-xl bg-[#469BD9] text-white font-bold text-sm hover:bg-[#3a8dc7] transition-colors"
          >
            다시 시도
          </button>
          <a
            href="/"
            className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
          >
            홈으로 이동
          </a>
        </div>
      </div>
    </div>
  );
}
