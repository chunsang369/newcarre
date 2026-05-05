"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { getCarsByBrand, getCarsByTab } from "@/app/actions";
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

const BRAND_COLORS: Record<string, string> = {
  hyundai: "#002C5F", kia: "#05141F", genesis: "#1C1C1C",
  "renault-korea": "#FFCC00", chevrolet: "#D4AF37", kgm: "#333333",
  bmw: "#0066B1", "mercedes-benz": "#333333", audi: "#BB0A30",
  volvo: "#003057", tesla: "#CC0000", byd: "#1A1A1A",
};

export default function BrandGrid() {
  const [tab, setTab] = useState<"domestic" | "import">("domestic");
  const [selectedBrand, setSelectedBrand] = useState<string | null>("all");
  const [brandCars, setBrandCars] = useState<CarData[]>([]);
  const [isLoadingCars, setIsLoadingCars] = useState(false);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  const INITIAL_LIMIT = 5;

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
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
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

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const handleBrandClick = async (slug: string) => {
    if (selectedBrand === slug) {
      return;
    }
    setSelectedBrand(slug);
    setIsLoadingCars(true);
    setIsBackgroundLoading(false); // Reset background loading
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

  return (
    <section className="py-8 bg-white" aria-label="관심 차종 선택">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        {/* 제목 & 탭 */}
        <div className="flex items-end justify-between mb-6 border-b border-gray-900 pb-3">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
            관심차종 선택하기
          </h2>
          <div className="flex items-center text-sm lg:text-base font-medium text-gray-400 gap-3 mb-0.5">
            <button
              onClick={() => handleTabChange("domestic")}
              className={cn(tab === "domestic" ? "text-gray-900 font-bold" : "hover:text-gray-600")}
            >
              국산
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => handleTabChange("import")}
              className={cn(tab === "import" ? "text-gray-900 font-bold" : "hover:text-gray-600")}
            >
              수입
            </button>
          </div>
        </div>

        {/* 드래그 가능한 가로 스크롤 컨테이너 (Embla Carousel) */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-2 px-1">
            {filteredBrands.map((brand) => {
              const isSelected = selectedBrand === brand.slug;
              
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
                        isSelected ? 'border-[2px] border-[#0B3058]' : 'border border-transparent'
                      }`}
                    >
                      {brand.slug === 'all' ? (
                        'All'
                      ) : (
                        <img src={`/images/brands/${brand.slug}.${['hyundai', 'kia', 'genesis', 'renault-korea', 'chevrolet', 'kgm'].includes(brand.slug) ? 'svg' : 'png'}`} alt={brand.name} className={`${brand.slug === 'renault-korea' ? 'w-7 h-7' : 'w-9 h-9'} object-contain`} />
                      )}
                    </div>
                    <span
                      className={`text-[12px] tracking-tight ${
                        isSelected ? 'text-[#0B3058] font-bold' : 'text-gray-500 font-medium'
                      }`}
                    >
                      {brand.name}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 선택된 브랜드 차량 목록 (1열) */}
        {selectedBrand && (
          <div className="mt-8 pt-6 border-t border-gray-100 animate-in slide-in-from-top-4 fade-in duration-300">

            {isLoadingCars ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-4 border-[#e74c3c] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : brandCars.length > 0 ? (
              <div className="space-y-6">
                <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={carsEmblaRef}>
                  <div className="flex gap-3 px-1 pb-4">
                    {brandCars.map((car) => (
                      <div key={car.id} className="flex-[0_0_calc(50%-6px)] md:flex-[0_0_260px] min-w-0 flex">
                        <CarCard car={car} />
                      </div>
                    ))}
                  </div>
                </div>
                
                {isBackgroundLoading && (
                  <div className="flex justify-center mt-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-sm text-gray-500 shadow-sm animate-pulse">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      차량 목록을 불러오는 중...
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                해당 브랜드에 등록된 차량이 없습니다.
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
