export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "이달의 BEST 플래너 — 하이카즈",
  description: "하이카즈의 전문 장기렌트·리스 플래너를 만나보세요.",
};

export default async function PlannersPage() {
  const planners = await prisma.planner.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="min-h-screen bg-[var(--color-bg-subtle)]">
      {/* Header */}
      <div className="bg-[var(--color-primary)] text-white">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-12 lg:py-16 text-center">
          <h1 className="text-2xl lg:text-4xl font-bold mb-2">전문 플래너</h1>
          <p className="text-white/70 text-sm lg:text-base">고객님만을 위한 1:1 맞춤 상담</p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-8 lg:py-12">
        {planners.length === 0 ? (
          <div className="text-center py-20 text-[var(--color-text-muted)]">
            <p className="text-4xl mb-4">👤</p>
            <p>등록된 플래너가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {planners.map((planner) => (
              <div
                key={planner.id}
                className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden hover:shadow-lg transition-shadow text-center"
              >
                <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                  {planner.photoUrl ? (
                    <img src={planner.photoUrl} alt={planner.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-6xl">👤</div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-[var(--color-text)] text-lg">{planner.name}</h3>
                  {planner.nameEn && (
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{planner.nameEn}</p>
                  )}
                  <p className="text-sm text-[var(--color-accent)] font-medium mt-1">{planner.position}</p>
                  {planner.bio && (
                    <p className="text-xs text-[var(--color-text-muted)] mt-3 line-clamp-3">{planner.bio}</p>
                  )}
                  <div className="flex gap-2 mt-4">
                    {planner.phone && (
                      <a
                        href={`tel:${planner.phone}`}
                        className="flex-1 py-2 rounded-lg text-xs font-medium bg-[var(--color-bg-subtle)] text-[var(--color-text)] hover:bg-slate-100 transition-colors"
                      >
                        📞 전화
                      </a>
                    )}
                    {planner.kakaoUrl && (
                      <a
                        href={planner.kakaoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 rounded-lg text-xs font-medium bg-yellow-50 text-yellow-800 hover:bg-yellow-100 transition-colors"
                      >
                        💬 카톡
                      </a>
                    )}
                  </div>
                  <Link
                    href="/cars/quick-quote"
                    className="block mt-3 py-2.5 rounded-lg text-xs font-bold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
                  >
                    상담 신청 바로하기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
