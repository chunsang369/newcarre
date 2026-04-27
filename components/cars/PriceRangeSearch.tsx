"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const PRICE_RANGES = [
  { label: "~20만원대", min: 0, max: 209999 },
  { label: "30만원대", min: 210000, max: 399999 },
  { label: "40만원대", min: 400000, max: 499999 },
  { label: "50만원대", min: 500000, max: 599999 },
  { label: "60만원대", min: 600000, max: 699999 },
  { label: "70만원대", min: 700000, max: 799999 },
  { label: "80만원대~", min: 800000, max: Infinity },
];

// 샘플 차량 데이터 (DB 연동 전 정적 데이터)
const SAMPLE_CARS = [
  { slug: "tucson-2026", title: "더 뉴 투싼 2026년형", rentPrice: 162930, leasePrice: 175000 },
  { slug: "grandeur-2026", title: "디 올 뉴 그랜저 2026년형", rentPrice: 163850, leasePrice: 180000 },
  { slug: "sorento-2026", title: "쏘렌토 2026년형", rentPrice: 166410, leasePrice: 178000 },
  { slug: "avante-2026", title: "더 뉴 아반떼 2026년형", rentPrice: 200870, leasePrice: 213917 },
  { slug: "k8-2026", title: "기아 K8 2026년형", rentPrice: 325196, leasePrice: 358000 },
  { slug: "g80-2025", title: "제네시스 G80 2025년형", rentPrice: 368060, leasePrice: 410000 },
  { slug: "k5-2026", title: "기아 K5 2026년형", rentPrice: 234750, leasePrice: 260000 },
  { slug: "seltos-2025", title: "셀토스 2025년형", rentPrice: 181560, leasePrice: 198000 },
  { slug: "santafe-2025", title: "디 올 뉴 싼타페 2025년형", rentPrice: 250830, leasePrice: 280000 },
  { slug: "ev3-2025", title: "기아 EV3 2025년형", rentPrice: 207000, leasePrice: 220000 },
  { slug: "gv70-2025", title: "제네시스 GV70 2025년형", rentPrice: 315860, leasePrice: 350000 },
  { slug: "sonata-2025", title: "쏘나타 디 엣지 2025년형", rentPrice: 235300, leasePrice: 255000 },
  { slug: "carnival-2026", title: "카니발 2026년형", rentPrice: 280000, leasePrice: 310000 },
  { slug: "palisade-2025", title: "팰리세이드 2025년형", rentPrice: 350000, leasePrice: 380000 },
  { slug: "sportage-2025", title: "스포티지 2025년형", rentPrice: 195000, leasePrice: 210000 },
  { slug: "niro-2025", title: "니로 2025년형", rentPrice: 212570, leasePrice: 230000 },
  { slug: "ev6-2026", title: "기아 EV6 2026년형", rentPrice: 233860, leasePrice: 258000 },
  { slug: "bmw-320i", title: "BMW 320i 2025년형", rentPrice: 520000, leasePrice: 560000 },
  { slug: "benz-c200", title: "벤츠 C200 2025년형", rentPrice: 580000, leasePrice: 620000 },
  { slug: "gv80-2025", title: "제네시스 GV80 2025년형", rentPrice: 420000, leasePrice: 460000 },
];

export default function PriceRangeSearch() {
  const [type, setType] = useState<"rent" | "lease">("rent");
  const [selectedRange, setSelectedRange] = useState(0);

  const range = PRICE_RANGES[selectedRange];
  const filtered = SAMPLE_CARS.filter((car) => {
    const price = type === "rent" ? car.rentPrice : car.leasePrice;
    return price >= range.min && price <= range.max;
  }).slice(0, 3);

  return (
    <section className="py-8 bg-white" aria-label="가격대별 검색">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-5">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
            가격대로 찾아보세요
          </h2>
          <div className="flex items-center gap-0 text-sm">
            <button
              onClick={() => setType("rent")}
              className={cn(
                "px-2 py-0.5 font-semibold transition-colors",
                type === "rent" ? "text-[#0a2540]" : "text-gray-400"
              )}
            >
              렌트
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => setType("lease")}
              className={cn(
                "px-2 py-0.5 font-semibold transition-colors",
                type === "lease" ? "text-[#0a2540]" : "text-gray-400"
              )}
            >
              리스
            </button>
          </div>
        </div>

        {/* 가격대 칩 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {PRICE_RANGES.map((r, i) => (
            <button
              key={r.label}
              onClick={() => setSelectedRange(i)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                selectedRange === i
                  ? "bg-[#0a2540] text-white border-[#0a2540]"
                  : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* 결과 (3열 가로 스크롤) */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {filtered.length > 0 ? (
            filtered.map((car) => (
              <Link
                key={car.slug}
                href={`/cars/${car.slug}`}
                className="flex-shrink-0 w-[140px] lg:w-[180px] text-center group"
              >
                {/* 이미지 */}
                <div className="aspect-[4/3] bg-gradient-to-b from-[#f0f0f0] to-[#e4e4e4] rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                  <svg className="w-[60%] h-auto text-gray-300 group-hover:scale-105 transition-transform" viewBox="0 0 200 100" fill="currentColor">
                    <ellipse cx="100" cy="80" rx="90" ry="10" opacity="0.2" />
                    <path d="M30 65 Q40 30 80 30 L120 30 Q160 30 170 65 L175 70 Q175 78 168 78 L32 78 Q25 78 25 70 Z" opacity="0.3" />
                    <circle cx="55" cy="78" r="12" opacity="0.25" />
                    <circle cx="145" cy="78" r="12" opacity="0.25" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-gray-800 mb-0.5 line-clamp-2">
                  {car.title}
                </p>
                <p className="text-xs text-gray-500">
                  월 {formatPrice(type === "rent" ? car.rentPrice : car.leasePrice)}원~
                </p>
              </Link>
            ))
          ) : (
            <p className="text-sm text-gray-400 py-8 w-full text-center">
              해당 가격대의 차량이 없습니다.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function formatPrice(num: number): string {
  return num.toLocaleString();
}
