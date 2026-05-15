"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { getCarsByBrand, getCarsByTab, searchCars } from "@/app/actions";
import CarCard, { type CarData } from "./CarCard";

interface BrandItem {
  slug: string;
  name: string;
  nameEn?: string;
  isDomestic: boolean;
}

const BRANDS: BrandItem[] = [
  // 국산
  { slug: "hyundai", name: "현대", nameEn: "Hyundai", isDomestic: true },
  { slug: "kia", name: "기아", nameEn: "Kia", isDomestic: true },
  { slug: "genesis", name: "제네시스", nameEn: "Genesis", isDomestic: true },
  { slug: "renault-korea", name: "르노코리아", nameEn: "Renault", isDomestic: true },
  { slug: "chevrolet", name: "쉐보레", nameEn: "Chevrolet", isDomestic: true },
  { slug: "kgm", name: "KGM", nameEn: "KGM", isDomestic: true },
  // 수입
  { slug: "bmw", name: "BMW", nameEn: "BMW", isDomestic: false },
  { slug: "mercedes-benz", name: "벤츠", nameEn: "Mercedes", isDomestic: false },
  { slug: "audi", name: "아우디", nameEn: "Audi", isDomestic: false },
  { slug: "mini", name: "미니", nameEn: "MINI", isDomestic: false },
  { slug: "volvo", name: "볼보", nameEn: "Volvo", isDomestic: false },
  { slug: "volkswagen", name: "폭스바겐", nameEn: "VW", isDomestic: false },
  { slug: "toyota", name: "토요타", nameEn: "Toyota", isDomestic: false },
  { slug: "lexus", name: "렉서스", nameEn: "Lexus", isDomestic: false },
  { slug: "honda", name: "혼다", nameEn: "Honda", isDomestic: false },
  { slug: "land-rover", name: "랜드로버", nameEn: "LandRover", isDomestic: false },
  { slug: "jaguar", name: "재규어", nameEn: "Jaguar", isDomestic: false },
  { slug: "ford", name: "포드", nameEn: "Ford", isDomestic: false },
  { slug: "lincoln", name: "링컨", nameEn: "Lincoln", isDomestic: false },
  { slug: "jeep", name: "지프", nameEn: "Jeep", isDomestic: false },
  { slug: "cadillac", name: "캐딜락", nameEn: "Cadillac", isDomestic: false },
  { slug: "peugeot", name: "푸조", nameEn: "Peugeot", isDomestic: false },
  { slug: "tesla", name: "테슬라", nameEn: "Tesla", isDomestic: false },
  { slug: "ds", name: "DS", nameEn: "DS", isDomestic: false },
  { slug: "polestar", name: "폴스타", nameEn: "Polestar", isDomestic: false },
  { slug: "lucid", name: "루시드", nameEn: "Lucid", isDomestic: false },
  { slug: "lotus", name: "로터스", nameEn: "Lotus", isDomestic: false },
  { slug: "byd", name: "BYD", nameEn: "BYD", isDomestic: false },
];

export default function BrandGrid() {
  const [tab, setTab] = useState<"domestic" | "import">("domestic");
  const [selectedBrand, setSelectedBrand] = useState<string | null>("all");
  const [brandCars, setBrandCars] = useState<CarData[]>([]);
  const [isLoadingCars, setIsLoadingCars] = useState(false);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  const INITIAL_LIMIT = 5;

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchInitial = async () => {
      setIsLoadingCars(true);
      try {
        const cars = await getCarsByTab(true, INITIAL_LIMIT);
        if (isMounted) {
          setBrandCars(cars);
          if (cars.length === INITIAL_LIMIT) setIsBackgroundLoading(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setIsLoadingCars(false);
      }
    };
    fetchInitial();
    return () => { isMounted = false; };
  }, []);

  // Background loading effect
  useEffect(() => {
    let isMounted = true;
    const fetchRemaining = async () => {
      if (!isBackgroundLoading) return;
      
      try {
        let remainingCars: CarData[] = [];
        if (selectedBrand === "all") {
          remainingCars = await getCarsByTab(tab === "domestic", undefined, INITIAL_LIMIT);
        } else if (selectedBrand) {
          remainingCars = await getCarsByBrand(selectedBrand, undefined, INITIAL_LIMIT);
        }
        
        if (isMounted && remainingCars.length > 0) {
          setBrandCars((prev) => {
            const all = [...prev, ...remainingCars];
            const seen = new Set();
            return all.filter((car) => {
              if (seen.has(car.id)) return false;
              seen.add(car.id);
              return true;
            });
          });
        }
      } catch (err) {
        console.error("Background fetch failed:", err);
      } finally {
        if (isMounted) setIsBackgroundLoading(false);
      }
    };

    fetchRemaining();
    return () => { isMounted = false; };
  }, [isBackgroundLoading, selectedBrand, tab]);
  
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const [carsEmblaRef] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const filteredBrands = [
    { slug: "all", name: "전체", nameEn: "ALL", isDomestic: tab === "domestic" },
    ...BRANDS.filter((b) => (tab === "domestic" ? b.isDomestic : !b.isDomestic)),
  ];

  const handleBrandClick = async (slug: string) => {
    if (selectedBrand === slug) {
      return;
    }
    // Clear search mode when clicking a brand
    if (isSearchMode) {
      setIsSearchMode(false);
      setSearchQuery("");
    }
    setSelectedBrand(slug);
    setIsLoadingCars(true);
    setIsBackgroundLoading(false);
    try {
      if (slug === "all") {
        const cars = await getCarsByTab(tab === "domestic", INITIAL_LIMIT);
        setBrandCars(cars);
        if (cars.length === INITIAL_LIMIT) setIsBackgroundLoading(true);
      } else {
        const cars = await getCarsByBrand(slug, INITIAL_LIMIT);
        setBrandCars(cars);
        if (cars.length === INITIAL_LIMIT) setIsBackgroundLoading(true);
      }
    } catch (error) {
      console.error("Failed to fetch cars:", error);
    } finally {
      setIsLoadingCars(false);
    }
  };

  // 탭 변경 시 전체 브랜드 자동 선택
  const handleTabChange = async (newTab: "domestic" | "import") => {
    if (tab === newTab) return;
    // Clear search mode when changing tab
    if (isSearchMode) {
      setIsSearchMode(false);
      setSearchQuery("");
    }
    setTab(newTab);
    setSelectedBrand("all");
    setIsLoadingCars(true);
    setIsBackgroundLoading(false);
    try {
      const cars = await getCarsByTab(newTab === "domestic", INITIAL_LIMIT);
      setBrandCars(cars);
      if (cars.length === INITIAL_LIMIT) setIsBackgroundLoading(true);
    } catch (error) {
      console.error("Failed to fetch cars:", error);
    } finally {
      setIsLoadingCars(false);
    }
  };

  // Search handler with debounce
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim().length === 0) {
      // Reset to brand mode
      setIsSearchMode(false);
      handleBrandClick(selectedBrand || "all");
      return;
    }

    setIsSearchMode(true);
    setSelectedBrand(null);

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchCars(value.trim());
        setBrandCars(results);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearchMode(false);
    setSelectedBrand("all");
    searchInputRef.current?.blur();
    // Re-fetch default cars
    const refetch = async () => {
      setIsLoadingCars(true);
      try {
        const cars = await getCarsByTab(tab === "domestic", INITIAL_LIMIT);
        setBrandCars(cars);
        if (cars.length === INITIAL_LIMIT) setIsBackgroundLoading(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingCars(false);
      }
    };
    refetch();
  };

  const getBrandIconDetails = (slug: string) => {
    switch (slug) {
      case 'hyundai': return { bg: 'bg-[#F0F2F6]', textCol: 'text-[#0B3058]' };
      case 'kia': return { bg: 'bg-[#EBEBEB]', textCol: 'text-[#000000]' };
      case 'genesis': return { bg: 'bg-[#EBEBEB]', textCol: 'text-[#000000]' };
      case 'renault-korea': return { bg: 'bg-[#FFFBEA]', textCol: 'text-[#FFC107]' };
      case 'chevrolet': return { bg: 'bg-[#FDF7F0]', textCol: 'text-[#D09A44]' };
      case 'kgm': return { bg: 'bg-[#EBEBEB]', textCol: 'text-[#333333]' };
      case 'bmw': return { bg: 'bg-[#E6F0FA]', textCol: 'text-[#0066B1]' };
      case 'mercedes-benz': return { bg: 'bg-[#EBEBEB]', textCol: 'text-[#333333]' };
      case 'audi': return { bg: 'bg-[#FCE6E6]', textCol: 'text-[#CC0000]' };
      case 'volvo': return { bg: 'bg-[#E6EEF5]', textCol: 'text-[#003057]' };
      case 'all': return { bg: 'bg-[#FFFFFF]', textCol: 'text-[#555555]' };
      default: return { bg: 'bg-[#F4F5F7]', textCol: 'text-[#333333]' };
    }
  };

  const getLogoSize = (slug: string) => {
    if (slug === 'renault-korea') return 'w-7 h-7';
    if (['audi', 'honda'].includes(slug)) return 'w-12 h-12';
    if (['lexus', 'ford', 'cadillac', 'mercedes-benz'].includes(slug)) return 'w-11 h-11';
    return 'w-9 h-9';
  };

  const getLogoExtension = (slug: string) => {
    if (['polestar', 'jaguar', 'lincoln'].includes(slug)) return 'webp';
    if (['audi', 'cadillac', 'ford', 'honda', 'mercedes-benz', 'porsche'].includes(slug)) return 'png';
    return 'svg';
  };

  return (
    <section className="py-8 bg-white" aria-label="관심 차종 선택">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        {/* 제목 & 탭 */}
        <div className="flex items-end justify-between mb-4 lg:mb-6">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
              이차 간편 견적은?
            </h2>
          </div>
          <div className="flex items-center text-sm lg:text-base font-medium text-gray-400 gap-3 mb-0.5">
            <button
              onClick={() => handleTabChange("domestic")}
              className={cn(tab === "domestic" ? "text-[#469BD9] font-bold" : "hover:text-gray-600")}
            >
              국산
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => handleTabChange("import")}
              className={cn(tab === "import" ? "text-[#469BD9] font-bold" : "hover:text-gray-600")}
            >
              수입
            </button>
          </div>
        </div>

        {/* 검색 바 */}
        <div className="mb-5">
          <div className={cn(
            "relative flex items-center rounded-xl border transition-all duration-200",
            isSearchMode
              ? "border-[#469BD9] bg-white shadow-[0_0_0_3px_rgba(70,155,217,0.1)]"
              : "border-gray-200 bg-[#f8f9fa] hover:border-gray-300"
          )}>
            <Search className={cn(
              "absolute left-3.5 w-4 h-4 transition-colors pointer-events-none",
              isSearchMode ? "text-[#469BD9]" : "text-gray-400"
            )} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim().length > 0) setIsSearchMode(true);
              }}
              placeholder="차량명, 브랜드로 검색 (예: 스포티지, BMW)"
              className={cn(
                "w-full py-3 pl-10 pr-10 text-[14px] lg:text-[15px] bg-transparent outline-none rounded-xl placeholder:text-gray-400",
                isSearchMode ? "text-gray-900" : "text-gray-700"
              )}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                aria-label="검색 초기화"
              >
                <X className="w-3.5 h-3.5 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* 브랜드 선택 (검색 모드가 아닐 때만 표시) */}
        {!isSearchMode && (
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-2 px-1">
              {filteredBrands.map((brand) => {
                const isSelected = selectedBrand === brand.slug;
                const details = getBrandIconDetails(brand.slug);

                return (
                  <div
                    key={brand.slug}
                    className="flex-[0_0_auto] min-w-0"
                  >
                    <button
                      onClick={() => handleBrandClick(brand.slug)}
                      className={`flex flex-col items-center justify-center gap-1.5 shrink-0 w-[64px] h-[84px] rounded-2xl transition-all ${
                        isSelected ? 'bg-[#F4F6F8]' : 'bg-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-[16px] flex items-center justify-center font-extrabold text-[14px] ${details.bg} ${details.textCol} ${
                          isSelected ? 'border-[2px] border-[#469BD9]' : 'border border-transparent'
                        }`}
                      >
                        {brand.slug === 'all' ? (
                          'All'
                        ) : (
                          <img
                            src={`/images/brands/${brand.slug}.${getLogoExtension(brand.slug)}`}
                            alt={brand.name}
                            className={`${getLogoSize(brand.slug)} object-contain`}
                          />
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 검색 모드 결과 표시 */}
        {isSearchMode && (
          <div className="mb-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {isSearching ? (
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-3.5 h-3.5 border-2 border-[#469BD9] border-t-transparent rounded-full animate-spin" />
                    검색 중...
                  </span>
                ) : (
                  <>
                    <span className="font-semibold text-[#469BD9]">&ldquo;{searchQuery}&rdquo;</span>
                    {" "}검색 결과 <span className="font-bold text-gray-900">{brandCars.length}</span>건
                  </>
                )}
              </p>
              <button
                onClick={clearSearch}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                검색 초기화
              </button>
            </div>
          </div>
        )}

        {/* 차량 목록 */}
        <div className="mt-6 animate-in fade-in duration-300">
          {isLoadingCars || isSearching ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-[#469BD9] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : brandCars.length > 0 ? (
            <div className="space-y-6">
              {isSearchMode ? (
                /* 검색 결과: 그리드 레이아웃 */
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {brandCars.map((car) => (
                    <CarCard key={car.id} car={car} />
                  ))}
                </div>
              ) : (
                /* 브랜드 선택: 가로 스크롤 캐러셀 */
                <>
                  <div className="relative">
                    <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={carsEmblaRef}>
                      <div className="flex gap-3 px-1 pb-4">
                        {brandCars.map((car) => (
                          <div key={car.id} className="flex-[0_0_calc(60%-6px)] md:flex-[0_0_260px] min-w-0 flex">
                            <CarCard car={car} />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Peek-a-boo Gradient Overlay (Hidden on Mobile) */}
                    <div className="hidden md:block pointer-events-none absolute top-0 right-0 bottom-4 w-24 bg-gradient-to-l from-white to-transparent z-10" />
                  </div>
                  
                  {isBackgroundLoading && (
                    <div className="flex justify-center mt-4">
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-sm text-gray-500 shadow-sm animate-pulse">
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        차량 목록을 불러오는 중...
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
              {isSearchMode ? (
                <div className="space-y-2">
                  <p className="text-3xl">🔍</p>
                  <p className="font-medium">검색 결과가 없습니다</p>
                  <p className="text-sm text-gray-400">다른 키워드로 다시 검색해 보세요</p>
                </div>
              ) : (
                "해당 브랜드에 등록된 차량이 없습니다."
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
