"use client";

import Link from "next/link";
import Image from "next/image";

interface CarItem {
  id: string;
  slug: string;
  modelName: string;
  trimName: string;
  year: number;
  category: string;
  fuelType: string;
  thumbnailUrl: string;
  isPopular: boolean;
  isInstant: boolean;
  priceMatrix: Record<string, { rent: number; lease: number }>;
  brand: { name: string; slug: string };
}

function formatPrice(v: number) {
  return v.toLocaleString("ko-KR");
}

const FUEL_LABEL: Record<string, string> = {
  GASOLINE: "가솔린", DIESEL: "디젤", HYBRID: "하이브리드", EV: "전기",
};

const PRICE_CHIPS = [20, 30, 40, 50, 60, 70, 80];

export default function PriceRangeClient({ range, cars }: { range: number; cars: CarItem[] }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-subtle)]">
      {/* Header */}
      <div className="bg-white border-b border-[var(--color-border)]">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-10 lg:py-14 text-center">
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text)] mb-4">
            <span className="text-[var(--color-accent)]">{range}만원대</span> 추천 차량
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm lg:text-base mb-8">
            합리적인 월 납입료로 만나는 베스트 셀링 모델
          </p>

          {/* Quick Range Selector */}
          <div className="flex flex-wrap justify-center gap-2">
            {PRICE_CHIPS.map((p) => (
              <Link
                key={p}
                href={`/cars/price/${p}`}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  range === p
                    ? "bg-[var(--color-accent)] text-white shadow-md shadow-orange-200"
                    : "bg-slate-100 text-[var(--color-text-muted)] hover:bg-slate-200"
                }`}
              >
                {p}만원대
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-8 lg:py-12">
        {cars.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[var(--color-border)] shadow-sm">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-[var(--color-text-muted)] mb-6">해당 가격대의 차량을 준비 중입니다.</p>
            <Link
              href="/cars"
              className="inline-flex px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white font-bold text-sm hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              전체 차량 보기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {cars.map((car) => {
              const rent = car.priceMatrix["36_PREPAY_30_20000"]?.rent || 0;
              return (
                <Link
                  key={car.id}
                  href={`/cars/${car.slug}`}
                  className="group bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
                    <Image
                      src={car.thumbnailUrl}
                      alt={car.modelName}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      {car.isPopular && (
                        <span className="bg-[var(--color-accent)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">인기</span>
                      )}
                      {car.isInstant && (
                        <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">즉시출고</span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-wider">{car.brand.name}</p>
                    <h3 className="text-sm font-bold text-[var(--color-text)] mb-1 line-clamp-1">{car.modelName}</h3>
                    <p className="text-[10px] text-[var(--color-text-muted)] line-clamp-1 mb-4">{car.trimName}</p>
                    
                    <div className="border-t border-slate-50 pt-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[10px] text-[var(--color-text-muted)]">월 렌트료</span>
                        <span className="text-lg font-extrabold text-[var(--color-accent)]">
                          {formatPrice(rent)}<span className="text-xs ml-0.5">원</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 pb-16">
        <div className="bg-[var(--color-primary)] text-white/90 rounded-3xl p-8 lg:p-12 text-center">
          <h2 className="text-xl lg:text-2xl font-bold mb-4 text-white">찾으시는 모델이 없나요?</h2>
          <p className="text-sm lg:text-base text-white/70 mb-8 max-w-xl mx-auto leading-relaxed">
            원하시는 가격대와 차종을 말씀해주시면<br className="lg:hidden" /> 하이카즈 매니저가 전국 최저가 견적을 실시간으로 찾아드립니다.
          </p>
          <Link
            href="/cars/quick-quote"
            className="inline-flex px-10 py-4 rounded-xl bg-[var(--color-accent)] text-white font-bold text-base hover:bg-[var(--color-accent-hover)] transition-all shadow-xl shadow-orange-950/20"
          >
            3분 만에 간편 견적 받기
          </Link>
        </div>
      </div>
    </div>
  );
}
