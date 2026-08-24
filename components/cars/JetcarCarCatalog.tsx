"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, RotateCcw, ChevronRight, Zap, ShieldCheck, Sparkles } from "lucide-react";
import { formatPriceManwon } from "@/lib/utils";

export interface JetcarCar {
  id: string;
  slug: string;
  brandSlug: string;
  brandName: string;
  modelName: string;
  trimName?: string | null;
  year?: number | null;
  fuelType?: string | null;
  category?: string | null;
  monthlyRent: number;
  thumbnailUrl: string;
}

interface JetcarCarCatalogProps {
  initialCars: JetcarCar[];
}

const BRANDS = [
  { id: "all", name: "전체", logo: null, isAll: true },
  { id: "hyundai", name: "현대 자동차", logo: "/images/brand-hd.png" },
  { id: "kia", name: "기아 자동차", logo: "/images/brand-kia.png" },
  { id: "genesis", name: "제네시스", logo: "/images/brand-gen.png" },
  { id: "renault-korea", name: "르노 코리아", logo: "/images/brand-ln.png" },
  { id: "kgm", name: "KG모빌리티(쌍용)", logo: "/images/brand-kg.png" },
  { id: "chevrolet", name: "쉐보레 자동차", logo: "/images/brand-sh.png" },
  { id: "import", name: "수입자동차", logo: "/images/brand-benz.png" },
];

const PRICE_RANGES = [
  { id: "all", label: "전체" },
  { id: "p1", label: "35~60만원", min: 350000, max: 600000 },
  { id: "p2", label: "60~80만원", min: 600000, max: 800000 },
  { id: "p3", label: "80~100만원", min: 800000, max: 1000000 },
  { id: "p4", label: "100만원 이상", min: 1000000, max: Infinity },
];

const FUEL_TYPES = [
  { id: "all", label: "전체" },
  { id: "gasoline", label: "휘발유", keywords: ["가솔린", "휘발유", "Gasoline"] },
  { id: "hybrid", label: "하이브리드", keywords: ["하이브리드", "HEV", "Hybrid"] },
  { id: "electric", label: "전기", keywords: ["전기", "EV", "Electric"] },
  { id: "lpg", label: "LPG", keywords: ["LPG", "LPi"] },
  { id: "diesel", label: "경유", keywords: ["디젤", "경유", "Diesel"] },
];

export default function JetcarCarCatalog({ initialCars }: JetcarCarCatalogProps) {
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedFuel, setSelectedFuel] = useState("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [visibleCount, setVisibleCount] = useState(16);

  // 필터링 계산
  const filteredCars = useMemo(() => {
    return initialCars.filter((car) => {
      // 1. 브랜드 필터
      if (selectedBrand !== "all") {
        if (selectedBrand === "import") {
          const domesticSlugs = ["hyundai", "kia", "genesis", "renault-korea", "kgm", "chevrolet"];
          if (domesticSlugs.includes(car.brandSlug)) return false;
        } else {
          if (car.brandSlug !== selectedBrand) return false;
        }
      }

      // 2. 가격 필터
      if (selectedPrice !== "all") {
        const pRange = PRICE_RANGES.find((p) => p.id === selectedPrice);
        if (pRange && pRange.min && pRange.max) {
          if (car.monthlyRent < pRange.min || car.monthlyRent > pRange.max) {
            return false;
          }
        }
      }

      // 3. 유종 필터
      if (selectedFuel !== "all") {
        const fRange = FUEL_TYPES.find((f) => f.id === selectedFuel);
        if (fRange && fRange.keywords) {
          const carFuel = (car.fuelType || "") + " " + (car.trimName || "") + " " + (car.modelName || "");
          const matches = fRange.keywords.some((kw) =>
            carFuel.toLowerCase().includes(kw.toLowerCase())
          );
          if (!matches) return false;
        }
      }

      // 4. 검색어 필터
      if (searchKeyword.trim()) {
        const query = searchKeyword.trim().toLowerCase();
        const fullText = `${car.brandName} ${car.modelName} ${car.trimName || ""}`.toLowerCase();
        if (!fullText.includes(query)) return false;
      }

      return true;
    });
  }, [initialCars, selectedBrand, selectedPrice, selectedFuel, searchKeyword]);

  // 필터 변경 시 표시 개수 리셋
  useEffect(() => {
    setVisibleCount(16);
  }, [selectedBrand, selectedPrice, selectedFuel, searchKeyword]);

  const handleResetFilters = () => {
    setSelectedBrand("all");
    setSelectedPrice("all");
    setSelectedFuel("all");
    setSearchKeyword("");
  };

  const handleQuoteRequest = (car: JetcarCar) => {
    const carText = `[무심사희망] [${car.brandName}] ${car.modelName} (월 ${car.monthlyRent.toLocaleString()}원~)`;
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("select-car-for-quote", {
          detail: {
            carName: carText,
            carId: car.id,
            brand: car.brandName,
            model: car.modelName,
            rent: car.monthlyRent,
            isLowCredit: true,
          },
        })
      );
      const formEl = document.getElementById("quote-form");
      if (formEl) {
        formEl.scrollIntoView({ behavior: "smooth", block: "start" });
        const nameInput = formEl.querySelector<HTMLInputElement>("input[required]");
        if (nameInput) {
          setTimeout(() => nameInput.focus(), 500);
        }
      }
    }
  };

  const displayedCars = filteredCars.slice(0, visibleCount);

  return (
    <section className="w-full bg-[#f8fafc] pb-20 pt-2">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* ── 1. 브랜드 카테고리 셀렉터 (제트카 스타일 원형/카드형) ── */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4">
            {BRANDS.map((brand) => {
              const isActive = selectedBrand === brand.id;
              return (
                <button
                  key={brand.id}
                  onClick={() => setSelectedBrand(brand.id)}
                  className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#ebf4fd] border-2 border-[#1d7ef3] shadow-sm scale-102"
                      : "bg-[#f8fafc] border border-transparent hover:bg-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-white shadow-xs mb-2">
                    {brand.isAll ? (
                      <span className={`text-base sm:text-lg font-black ${isActive ? "text-[#1d7ef3]" : "text-gray-700"}`}>
                        ALL
                      </span>
                    ) : (
                      <img
                        src={brand.logo!}
                        alt={brand.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                      />
                    )}
                  </div>
                  <span
                    className={`text-xs sm:text-sm font-semibold tracking-tight text-center ${
                      isActive ? "text-[#1d7ef3] font-bold" : "text-gray-700"
                    }`}
                  >
                    {brand.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 2. 상세 필터 탭 (금액별 / 유종별 / 검색) ── */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 space-y-4">
          {/* 검색 바 */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="차량명 또는 브랜드 검색 (예: 아반떼, 그랜저, 카니발)"
                className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#f1f5f9] text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1d7ef3] transition-all"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>

            {/* 필터 초기화 버튼 */}
            {(selectedBrand !== "all" || selectedPrice !== "all" || selectedFuel !== "all" || searchKeyword) && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#1d7ef3] px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                필터 초기화
              </button>
            )}
          </div>

          {/* 차량 금액별 탭 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm font-bold text-gray-900 w-20 shrink-0">
              차량 금액별
            </span>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {PRICE_RANGES.map((price) => {
                const isActive = selectedPrice === price.id;
                return (
                  <button
                    key={price.id}
                    onClick={() => setSelectedPrice(price.id)}
                    className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#1d7ef3] text-white shadow-xs font-bold"
                        : "bg-[#f1f5f9] text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {price.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 차량 유종별 탭 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 pt-1">
            <span className="text-xs sm:text-sm font-bold text-gray-900 w-20 shrink-0">
              차량 유종별
            </span>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {FUEL_TYPES.map((fuel) => {
                const isActive = selectedFuel === fuel.id;
                return (
                  <button
                    key={fuel.id}
                    onClick={() => setSelectedFuel(fuel.id)}
                    className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#1d7ef3] text-white shadow-xs font-bold"
                        : "bg-[#f1f5f9] text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {fuel.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── 3. 차량 목록 그리드 (제트카 스타일 카드) ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              신차 장기렌트 차량 <span className="text-[#1d7ef3] font-black">{filteredCars.length}</span>대
            </h3>
            <p className="text-xs text-gray-500">
              * 보증금 0원 / 무심사 빠른 출고 가능
            </p>
          </div>

          {filteredCars.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm space-y-3">
              <p className="text-base font-semibold text-gray-600">
                선택하신 조건에 해당하는 차량이 없습니다.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1d7ef3] text-white text-sm font-bold shadow-md hover:bg-[#156cd4] transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                모든 차량 보기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
              {displayedCars.map((car) => (
                <div
                  key={car.id}
                  onClick={() => handleQuoteRequest(car)}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative cursor-pointer"
                >
                  {/* 상단 뱃지 */}
                  <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 rounded-md bg-[#1d7ef3] text-white text-[11px] font-bold shadow-xs">
                      신차
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#10b981] text-white text-[11px] font-bold shadow-xs">
                      즉시출고
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-gray-900 text-white text-[11px] font-bold shadow-xs">
                      무심사
                    </span>
                  </div>

                  {/* 차량 이미지 */}
                  <div
                    className="block aspect-[16/10] bg-[#f8fafc] overflow-hidden relative cursor-pointer"
                  >
                    <img
                      src={car.thumbnailUrl || "/hero/hero-bg.jpg"}
                      alt={car.modelName}
                      className="w-full h-full object-contain p-4 group-hover:scale-106 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  {/* 차량 스펙 및 가격 정보 */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* 브랜드명 */}
                      <span className="text-xs font-semibold text-gray-500 mb-1 block">
                        {car.brandName}
                      </span>
                      {/* 모델명 */}
                      <h4
                        className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-[#1d7ef3] line-clamp-1 transition-colors"
                      >
                        {car.modelName}
                      </h4>
                      {/* 트림명 / 유종 */}
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                        {car.fuelType || "가솔린"} · {car.year ? `${car.year}년형` : "신차"}
                      </p>
                    </div>

                    {/* 렌트료 가격 및 상담 버튼 */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-end justify-between">
                      <div>
                        <span className="text-[11px] text-gray-500 font-medium block">
                          월 렌트료 (VAT포함)
                        </span>
                        <div className="text-lg sm:text-xl font-extrabold text-[#1d7ef3] leading-none mt-1">
                          월 {car.monthlyRent.toLocaleString()}원 ~
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuoteRequest(car);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-gray-900 group-hover:bg-[#1d7ef3] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                      >
                        견적상담
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 더보기 버튼 */}
          {visibleCount < filteredCars.length && (
            <div className="mt-10 text-center">
              <button
                onClick={() => setVisibleCount((prev) => prev + 16)}
                className="px-8 py-3.5 rounded-full bg-white border border-gray-200 text-gray-800 font-bold text-sm shadow-sm hover:bg-[#1d7ef3] hover:text-white hover:border-[#1d7ef3] transition-all cursor-pointer"
              >
                차량 더보기 ({displayedCars.length} / {filteredCars.length})
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
