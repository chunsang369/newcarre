export const revalidate = 1800;

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCachedInstantCars } from "@/lib/cache";
import { resolveListPrices } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "즉시출고 차량 — 제로카즈",
  description: "계약 후 7일 이내 인도 가능한 즉시출고 차량을 확인하세요.",
};

function formatPrice(v: number) {
  return v.toLocaleString("ko-KR");
}

const FUEL_LABEL: Record<string, string> = {
  GASOLINE: "가솔린", DIESEL: "디젤", HYBRID: "하이브리드", EV: "전기",
};

export default async function InstantCarsPage() {
  const cars = await getCachedInstantCars();

  return (
    <div className="min-h-screen bg-[var(--color-bg-subtle)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--color-accent)] to-[#3a8dc7] text-white">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-12 lg:py-16 text-center">
          <h1 className="text-2xl lg:text-4xl font-bold mb-2">⚡ 즉시출고 차량</h1>
          <p className="text-white/80 text-sm lg:text-base">계약 후 7일 이내 인도 보장!</p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-8 lg:py-12">
        {cars.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🚗</p>
            <p className="text-[var(--color-text-muted)] mb-4">현재 즉시출고 가능한 차량이 없습니다.</p>
            <Link href="/cars" className="text-[var(--color-accent)] font-medium hover:underline">
              전체 차량 보기 →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {cars.map((car: any) => {
              const { rent } = resolveListPrices(car);

              return (
                <Link
                  key={car.id}
                  href={`/cars/${car.slug}`}
                  className="group bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
                    <Image
                      src={car.thumbnailUrl}
                      alt={`${car.brand.name} ${car.modelName}`}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                    <span className="absolute top-3 left-3 bg-[var(--color-accent)] text-white text-xs font-bold px-3 py-1 rounded-full">
                      ⚡ 즉시출고
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-[var(--color-text-muted)]">{car.brand.name} · {car.year}년형</p>
                    <h3 className="text-base font-bold text-[var(--color-text)] mt-1">{car.modelName}</h3>
                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-1">{car.trimName}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded">{FUEL_LABEL[car.fuelType] || car.fuelType}</span>
                    </div>
                    <div className="border-t border-[var(--color-border)] pt-3 mt-3">
                      <p className="text-xs text-[var(--color-text-muted)]">월 렌트료</p>
                      <p className="text-xl font-extrabold text-[var(--color-accent)]">
                        {rent > 0 ? `${formatPrice(rent)}원` : "견적문의"}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
