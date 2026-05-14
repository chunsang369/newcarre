"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

// ─── Types ───
interface CarBrand {
  name: string;
  slug: string;
  isDomestic: boolean;
}

interface CarItem {
  id: string;
  slug: string;
  modelName: string;
  trimName: string;
  year: number;
  category: string;
  fuelType: string;
  basePrice: number;
  thumbnailUrl: string;
  isPopular: boolean;
  isInstant: boolean;
  priceMatrix: Record<string, { rent: number; lease: number }>;
  brand: CarBrand;
}

// ─── Helpers ───
function formatPrice(v: number) {
  return v.toLocaleString("ko-KR");
}

const FUEL_LABEL: Record<string, string> = {
  GASOLINE: "가솔린",
  DIESEL: "디젤",
  HYBRID: "하이브리드",
  EV: "전기",
};

const CATEGORY_LABEL: Record<string, string> = {
  SEDAN: "세단",
  SUV: "SUV",
  HATCHBACK: "해치백",
  VAN: "밴/MPV",
  COUPE: "쿠페",
};

const SORT_OPTIONS = [
  { key: "popular", label: "인기순" },
  { key: "priceLow", label: "낮은가격순" },
  { key: "priceHigh", label: "높은가격순" },
  { key: "newest", label: "최신순" },
];

// ─── Component ───
export default function CarsListClient({
  cars,
  brands,
}: {
  cars: CarItem[];
  brands: { slug: string; name: string; isDomestic: boolean }[];
}) {
  const [brandFilter, setBrandFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [fuelFilter, setFuelFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("popular");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => Array.from(new Set(cars.map((c) => c.category))), [cars]);
  const fuels = useMemo(() => Array.from(new Set(cars.map((c) => c.fuelType))), [cars]);

  const filtered = useMemo(() => {
    let result = [...cars];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.modelName.toLowerCase().includes(q) ||
          c.brand.name.toLowerCase().includes(q)
      );
    }

    if (brandFilter) result = result.filter((c) => c.brand.slug === brandFilter);
    if (categoryFilter) result = result.filter((c) => c.category === categoryFilter);
    if (fuelFilter) result = result.filter((c) => c.fuelType === fuelFilter);

    switch (sortBy) {
      case "priceLow":
        result.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case "priceHigh":
        result.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case "newest":
        result.sort((a, b) => b.year - a.year);
        break;
      default:
        result.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
    }
    return result;
  }, [cars, brandFilter, categoryFilter, fuelFilter, sortBy, searchQuery]);

  const getBaseRent = (car: CarItem) => {
    const entry = car.priceMatrix["36_PREPAY_30_20000"];
    if (entry?.rent && entry.rent > 0) return entry.rent;
    
    // Fallback: Estimate based on 1.3% of basePrice for 36 months prepay 30%
    // 0.013 * 0.7 (prepay factor) = ~0.009
    return Math.round(car.basePrice * 0.0091);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-subtle)]">
      {/* Header */}
      <div className="bg-[var(--color-primary)] text-white">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-10 lg:py-14">
          <h1 className="text-2xl lg:text-4xl font-bold mb-2">전체 차량</h1>
          <p className="text-white/70 text-sm lg:text-base">
            국산·수입차 {cars.length}개 모델의 장기렌트·리스 견적을 비교하세요
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-6 lg:py-10">
        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-[var(--color-border)] p-4 lg:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="모델명 또는 브랜드명을 입력하세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:bg-white transition-all"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              )}
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[var(--color-text)]">
                  {filtered.length}대의 차량
                </span>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden text-xs text-[var(--color-accent)] font-medium"
                >
                  {showFilters ? "필터 접기 ▲" : "필터 열기 ▼"}
                </button>
              </div>
              <div className="flex gap-1">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setSortBy(opt.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      sortBy === opt.key
                        ? "bg-[var(--color-primary)] text-white"
                        : "text-[var(--color-text-muted)] hover:bg-slate-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={`space-y-3 ${showFilters ? "" : "hidden lg:block"}`}>
            {/* Brand */}
            <div>
              <div className="flex overflow-x-auto pb-2 scrollbar-hide gap-1">
                {(() => {
                  const getBrandIconDetails = (slug: string) => {
                    switch (slug) {
                      case 'hyundai': return { text: 'HY', bg: 'bg-[#F0F2F6]', textCol: 'text-[#0B3058]' };
                      case 'kia': return { text: 'KI', bg: 'bg-[#EBEBEB]', textCol: 'text-[#000000]' };
                      case 'genesis': return { text: 'GE', bg: 'bg-[#EBEBEB]', textCol: 'text-[#000000]' };
                      case 'renault-korea': return { text: 'RE', bg: 'bg-[#FFFBEA]', textCol: 'text-[#FFC107]' };
                      case 'chevrolet': return { text: 'CH', bg: 'bg-[#FDF7F0]', textCol: 'text-[#D09A44]' };
                      case 'kgm': return { text: 'KG', bg: 'bg-[#EBEBEB]', textCol: 'text-[#333333]' };
                      case 'bmw': return { text: 'BM', bg: 'bg-[#E6F0FA]', textCol: 'text-[#0066B1]' };
                      case 'mercedes-benz': return { text: 'MB', bg: 'bg-[#EBEBEB]', textCol: 'text-[#333333]' };
                      case 'audi': return { text: 'AU', bg: 'bg-[#FCE6E6]', textCol: 'text-[#CC0000]' };
                      case 'volvo': return { text: 'VO', bg: 'bg-[#E6EEF5]', textCol: 'text-[#003057]' };
                      case 'all': return { text: 'All', bg: 'bg-[#FFFFFF]', textCol: 'text-[#555555]' };
                      default: return { text: slug.substring(0, 2).toUpperCase(), bg: 'bg-[#F4F5F7]', textCol: 'text-[#333333]' };
                    }
                  };

                  const brandList = [{ slug: '', name: '전체' }, ...brands];

                  return brandList.map((b) => {
                    const isSelected = brandFilter === b.slug;
                    const details = getBrandIconDetails(b.slug || 'all');

                    return (
                      <button
                        key={b.slug || 'all'}
                        onClick={() => setBrandFilter(b.slug)}
                        className={`flex flex-col items-center justify-center gap-1.5 shrink-0 w-[64px] h-[84px] rounded-2xl transition-all ${
                          isSelected ? 'bg-[#F4F6F8]' : 'bg-transparent hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-[16px] flex items-center justify-center font-extrabold text-[14px] ${details.bg} ${details.textCol} ${
                            isSelected ? 'border-[2px] border-[#0B3058]' : 'border border-transparent'
                          }`}
                        >
                          {(b.slug === '' || b.slug === 'all') ? (
                            'All'
                          ) : (
                            (() => {
                              const getLogoSize = (slug: string) => {
                                if (slug === 'renault-korea') return 'w-7 h-7';
                                if (['audi', 'honda'].includes(slug)) return 'w-12 h-12';
                                if (['lexus', 'ford', 'cadillac', 'mercedes-benz'].includes(slug)) return 'w-11 h-11';
                                return 'w-9 h-9';
                              };
                              return (
                                <img src={`/images/brands/${b.slug}.${['polestar', 'jaguar', 'lincoln'].includes(b.slug) ? 'webp' : ['audi', 'cadillac', 'ford', 'honda', 'mercedes-benz', 'porsche'].includes(b.slug) ? 'png' : 'svg'}`} alt={b.name} className={`${getLogoSize(b.slug)} object-contain`} />
                              );
                            })()
                          )}
                        </div>
                        <span
                          className={`text-[12px] tracking-tight ${
                            isSelected ? 'text-[#0B3058] font-bold' : 'text-gray-500 font-medium'
                          }`}
                        >
                          {b.name}
                        </span>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Category & Fuel */}
            <div className="flex gap-4 flex-col lg:flex-row">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-2">차종</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setCategoryFilter("")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      !categoryFilter ? "bg-[var(--color-accent)] text-white" : "bg-slate-50 text-[var(--color-text-muted)] hover:bg-slate-100"
                    }`}
                  >
                    전체
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        categoryFilter === cat ? "bg-[var(--color-accent)] text-white" : "bg-slate-50 text-[var(--color-text-muted)] hover:bg-slate-100"
                      }`}
                    >
                      {CATEGORY_LABEL[cat] || cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-2">연료</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setFuelFilter("")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      !fuelFilter ? "bg-[var(--color-accent)] text-white" : "bg-slate-50 text-[var(--color-text-muted)] hover:bg-slate-100"
                    }`}
                  >
                    전체
                  </button>
                  {fuels.map((fuel) => (
                    <button
                      key={fuel}
                      onClick={() => setFuelFilter(fuel)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        fuelFilter === fuel ? "bg-[var(--color-accent)] text-white" : "bg-slate-50 text-[var(--color-text-muted)] hover:bg-slate-100"
                      }`}
                    >
                      {FUEL_LABEL[fuel] || fuel}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-[var(--color-text-muted)]">
            <p className="text-4xl mb-4">🚗</p>
            <p>조건에 맞는 차량이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((car) => {
              const rent = getBaseRent(car);
              return (
                <Link
                  key={car.id}
                  href={`/cars/${car.slug}`}
                  className="group bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden hover:shadow-lg transition-all hover:border-[var(--color-accent)]/30"
                >
                  {/* Image */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
                    <Image
                      src={car.thumbnailUrl}
                      alt={`${car.brand.name} ${car.modelName}`}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                    <span className="absolute top-3 left-3 bg-[var(--color-primary)] text-white text-[10px] font-bold px-2 py-1 rounded-full">
                      {car.year}년형
                    </span>
                    {car.isPopular && (
                      <span className="absolute top-3 right-3 bg-[var(--color-accent)] text-white text-[10px] font-bold px-2 py-1 rounded-full">
                        인기
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-xs text-[var(--color-text-muted)] mb-0.5">{car.brand.name}</p>
                    <h3 className="text-sm font-bold text-[var(--color-text)] mb-0.5 line-clamp-1">
                      {car.modelName}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-1 mb-3">{car.trimName}</p>

                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded">{FUEL_LABEL[car.fuelType] || car.fuelType}</span>
                    </div>

                    <div className="border-t border-[var(--color-border)] pt-3 mt-1">
                      <p className="text-[10px] text-[var(--color-text-muted)]">월 렌트료</p>
                      <p className="text-lg font-extrabold text-[var(--color-accent)]">
                        {rent > 0 ? `${formatPrice(rent)}원` : "견적문의"}
                      </p>
                      <p className="text-[9px] text-[var(--color-text-muted)] mt-0.5">36개월 | 선납30% | 만26세↑</p>
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
