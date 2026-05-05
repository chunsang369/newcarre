"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// ─── Types ───
interface CarBrand {
  name: string;
  nameEn: string | null;
  slug: string;
  logoUrl: string;
}

interface CarData {
  id: string;
  slug: string;
  modelName: string;
  trimName: string;
  year: number;
  category: string;
  fuelType: string;
  basePrice: number;
  thumbnailUrl: string;
  galleryUrls: string[];
  catalogUrl: string | null;
  specSheetUrl: string | null;
  options: Record<string, unknown>;
  priceMatrix: Record<string, { rent: number; lease: number }>;
  brand: CarBrand;
}

// ─── Helpers ───
function formatPrice(v: number) {
  return v.toLocaleString("ko-KR");
}

function formatPriceWon(v: number) {
  if (v >= 100000000) {
    const uk = Math.floor(v / 100000000);
    const man = Math.floor((v % 100000000) / 10000);
    return man > 0 ? `${uk}억 ${formatPrice(man)}만원` : `${uk}억원`;
  }
  return `${formatPrice(Math.floor(v / 10000))}만원`;
}

const FUEL_LABEL: Record<string, string> = {
  GASOLINE: "가솔린",
  DIESEL: "디젤",
  HYBRID: "하이브리드",
  EV: "전기",
  LPG: "LPG",
};

const CATEGORY_LABEL: Record<string, string> = {
  SEDAN: "세단",
  SUV: "SUV",
  HATCHBACK: "해치백",
  VAN: "밴/MPV",
  COUPE: "쿠페",
  TRUCK: "트럭",
};

// ─── Constants ───
const PERIODS = [36, 48, 60] as const;
const DEPOSITS = [
  { key: "PREPAY_30", label: "선납금 30%" },
  { key: "DEPOSIT_30", label: "보증금 30%" },
  { key: "NO_DEPOSIT", label: "무보증" },
] as const;
const MILEAGES = [
  { key: 10000, label: "연 1만km" },
  { key: 20000, label: "연 2만km" },
  { key: 30000, label: "연 3만km" },
] as const;

// ─── Component ───
export default function CarDetailClient({ car }: { car: CarData }) {
  // Configuration state
  const detailedConfig = useMemo(() => {
    if (!car.options) return null;
    
    // Check if it's the direct Chasalddae format
    if ((car.options as any).car_info && (car.options as any).lineup_trim_list) {
      const colorsExt = (car.options as any).trim_outer_color_list?.map((color: any) => ({
        idx: String(color.id),
        title: color.name,
        price: Number(color.price || 0),
        detail: color.detail || [],
        thumb: Array.isArray(color.detail) ? color.detail[0] : "#ffffff"
      })) || [];

      const colorsInt = (car.options as any).trim_inner_color_list?.map((color: any) => ({
        idx: String(color.id),
        title: color.name,
        price: Number(color.price || 0),
        detail: color.detail || [],
        thumb: Array.isArray(color.detail) ? color.detail[0] : "#000000"
      })) || [];

      const grades = (car.options as any).lineup_trim_list.map((lineup: any) => ({
        idx: String(lineup.id),
        name: lineup.lineup_name,
        trims: lineup.trim_list?.map((trim: any) => ({
          idx: String(trim.id),
          name: trim.trim_name,
          price: Number(trim.price),
          colorsExt: (trim.trim_outer_color_list || (car.options as any).trim_outer_color_list)?.map((color: any) => ({
            idx: String(color.id),
            title: color.name,
            price: Number(color.price || 0),
            detail: color.detail || [],
            thumb: Array.isArray(color.detail) ? color.detail[0] : "#ffffff"
          })) || colorsExt,
          colorsInt: (trim.trim_inner_color_list || (car.options as any).trim_inner_color_list)?.map((color: any) => ({
            idx: String(color.id),
            title: color.name,
            price: Number(color.price || 0),
            detail: color.detail || [],
            thumb: Array.isArray(color.detail) ? color.detail[0] : "#000000"
          })) || colorsInt,
          options: (trim.trim_opt_list || (car.options as any).trim_opt_list)?.map((opt: any) => ({
            idx: String(opt.id),
            title: opt.name,
            price: Number(opt.price),
            memo: opt.memo
          })) || []
        })) || []
      })) || [];

      return {
        grades,
        colorsExt,
        colorsInt
      };
    }


    let config = (car.options as any)?.detailedConfig || car.options;
    if (!config || !Array.isArray(config.grades)) return null;

    // Build map of trims by gradeIdx for flat array data
    let trimsMap: Record<string, any[]> = {};
    if (Array.isArray(config.trims)) {
      config.trims.forEach((t: any) => {
        const gIdx = String(t.gradeIdx);
        if (!trimsMap[gIdx]) trimsMap[gIdx] = [];
        trimsMap[gIdx].push(t);
      });
    }

    // Clone grades and merge trims
    const clonedGrades = config.grades.map((g: any) => {
      const gIdx = String(g.idx);
      const gradeTrims = g.trims || trimsMap[gIdx] || [];
      return {
        ...g,
        trims: gradeTrims
      };
    });

    return {
      ...config,
      grades: clonedGrades
    };
  }, [car.options]);

  
  const [selectedGradeIdx, setSelectedGradeIdx] = useState<string>("");
  const [selectedTrimIdx, setSelectedTrimIdx] = useState<string>("");
  const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>({});
  const [selectedExtColor, setSelectedExtColor] = useState<string>("");
  const [selectedIntColor, setSelectedIntColor] = useState<string>("");

  // Find the cheapest trim across all grades as the default
  const allTrims = useMemo(() => {
    return detailedConfig?.grades?.flatMap((g: any) => 
      g.trims?.map((t: any) => ({ ...t, gradeIdx: g.idx }))
    ) || [];
  }, [detailedConfig]);

  const cheapestTrim = useMemo(() => {
    if (allTrims.length === 0) return null;
    return allTrims.reduce((min: any, t: any) => (!min || Number(t.price) < Number(min.price)) ? t : min, allTrims[0]);
  }, [allTrims]);

  // Set initial state once detailedConfig is available
  useEffect(() => {
    if (cheapestTrim && !selectedGradeIdx) {
      setSelectedGradeIdx(cheapestTrim.gradeIdx);
      setSelectedTrimIdx(cheapestTrim.idx);
    }
  }, [cheapestTrim, selectedGradeIdx]);

  const selectedGrade = detailedConfig?.grades.find((g: any) => g.idx === selectedGradeIdx);
  const currentTrim = selectedGrade?.trims.find((t: any) => t.idx === selectedTrimIdx) || selectedGrade?.trims[0];

  // Quote simulator state
  const [productType, setProductType] = useState<"rent" | "lease">("rent");
  const [period, setPeriod] = useState<number>(36);
  const [deposit, setDeposit] = useState<string>("PREPAY_30");
  const [mileage, setMileage] = useState<number>(20000);

  // Calculate configured total price
  const configuredTotalPrice = useMemo(() => {
    if (!currentTrim) return 0;
    let total = Number(currentTrim.price) || car.basePrice;
    
    // Options
    Object.keys(selectedOptions).forEach((optIdx) => {
      if (selectedOptions[optIdx]) {
        const opt = currentTrim.options?.find((o: any) => o.idx === optIdx);
        if (opt) total += Number(opt.price) || 0;
      }
    });

    // Colors
    const extColor = currentTrim.colorsExt?.find((c: any) => c.idx === selectedExtColor);
    const intColor = currentTrim.colorsInt?.find((c: any) => c.idx === selectedIntColor);
    if (extColor) total += Number(extColor.price) || 0;
    if (intColor) total += Number(intColor.price) || 0;

    return total;
  }, [currentTrim, selectedOptions, selectedExtColor, selectedIntColor, car.basePrice]);

  // Calculate monthly price (scaled by total price ratio)
  const monthlyPrice = useMemo(() => {
    const key = `${period}_${deposit}_${mileage}`;
    const baseEntry = car.priceMatrix[key];
    
    let baseMonthly = 0;
    if (baseEntry) {
      baseMonthly = productType === "rent" ? baseEntry.rent : baseEntry.lease;
    }

    // Fallback: If no matrix data, estimate based on 1.2% of car price for 60 months
    // We use a base rate that scales with period
    if (!baseMonthly || baseMonthly === 0) {
      const periodFactor = 60 / period; // 60m -> 1.0, 36m -> 1.66
      const depositFactor = deposit === "PREPAY_30" ? 0.7 : deposit === "DEPOSIT_30" ? 0.95 : 1.0;
      baseMonthly = (car.basePrice * 0.012) * periodFactor * depositFactor;
    }
    
    if (!baseMonthly) return null;

    // Scale monthly price by the ratio of configured price to base price
    const effectiveBasePrice = car.basePrice || 1;
    const ratio = configuredTotalPrice / effectiveBasePrice;
    return Math.round(baseMonthly * ratio);
  }, [productType, period, deposit, mileage, car.priceMatrix, configuredTotalPrice, car.basePrice]);

  // Comparison
  const comparisonPrice = useMemo(() => {
    const key = `${period}_${deposit}_${mileage}`;
    const entry = car.priceMatrix[key];
    if (!entry) return null;
    return productType === "rent" ? entry.lease : entry.rent;
  }, [productType, period, deposit, mileage, car.priceMatrix]);

  const handleConsult = () => {
    const section = document.getElementById("quick-quote");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)]">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">홈</Link>
            <span>/</span>
            <span>{car.brand.name}</span>
            <span>/</span>
            <span className="text-[var(--color-text)]">{car.modelName}</span>
          </nav>
        </div>
      </div>

      {/* Main 2-column Layout */}
      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-6 lg:py-10">
        <div className="lg:flex lg:gap-10">
          {/* ──────── Left Column: Main Content ──────── */}
          <div className="lg:w-[65%] space-y-8">
            {/* Image Gallery */}
            <section className="relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl overflow-hidden">
              <div className="aspect-[4/3] lg:aspect-[16/10] relative">
                {car.thumbnailUrl ? (
                  <Image
                    src={car.thumbnailUrl}
                    alt={`${car.brand.name} ${car.modelName}`}
                    fill
                    className="object-contain p-6 lg:p-12"
                    priority
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    이미지 준비중
                  </div>
                )}
                {/* Year badge */}
                <span className="absolute top-4 left-4 bg-[var(--color-primary)] text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  {car.year}년형
                </span>
                {/* Fuel badge */}
                <span className="absolute top-4 right-4 bg-white/80 backdrop-blur text-xs font-semibold px-3 py-1.5 rounded-full text-[var(--color-text)]">
                  {FUEL_LABEL[car.fuelType] || car.fuelType}
                </span>
              </div>
            </section>

            {/* Car Info */}
            <section>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white border border-[var(--color-border)] flex items-center justify-center p-1.5 overflow-hidden">
                  {car.brand.logoUrl ? (
                    <Image
                      src={car.brand.logoUrl}
                      alt={car.brand.name}
                      width={28}
                      height={28}
                      className="object-contain"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </div>
                <span className="text-sm font-medium text-[var(--color-text-muted)]">{car.brand.name}</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text)] mb-1">
                {car.modelName}
              </h1>
              <p className="text-base lg:text-lg text-[var(--color-text-muted)] mb-4">
                {car.trimName}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
                  {CATEGORY_LABEL[car.category] || car.category}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
                  {FUEL_LABEL[car.fuelType] || car.fuelType}
                </span>
              </div>
              <div className="bg-[var(--color-bg-subtle)] rounded-xl p-4 lg:p-5">
                <div className="flex justify-between items-end mb-1">
                  <div className="text-sm text-[var(--color-text-muted)]">
                    차량 기본가
                  </div>
                  <div className="text-sm font-bold text-[var(--color-text)]">
                    {formatPriceWon(car.basePrice)} ~
                  </div>
                </div>
                <div className="h-[1px] bg-gray-200 my-2" />
                <div className="flex justify-between items-center">
                  <div className="text-sm text-[var(--color-text-muted)]">
                    {currentTrim ? `${currentTrim.name} 합계` : "선택된 차량 가격"}
                  </div>
                  <div className="text-xl lg:text-2xl font-bold text-[var(--color-primary)]">
                    {formatPriceWon(configuredTotalPrice || (currentTrim ? Number(currentTrim.price) : car.basePrice))}
                  </div>
                </div>
              </div>
            </section>

            {/* ──────── Configurator UI ──────── */}
            {detailedConfig && (
              <ConfiguratorUI 
                detailedConfig={detailedConfig}
                selectedGradeIdx={selectedGradeIdx}
                setSelectedGradeIdx={setSelectedGradeIdx}
                selectedTrimIdx={selectedTrimIdx}
                setSelectedTrimIdx={setSelectedTrimIdx}
                selectedOptions={selectedOptions}
                setSelectedOptions={setSelectedOptions}
                selectedExtColor={selectedExtColor}
                setSelectedExtColor={setSelectedExtColor}
                selectedIntColor={selectedIntColor}
                setSelectedIntColor={setSelectedIntColor}
              />
            )}

            {/* Mobile-only inline quote simulator */}
            <section className="lg:hidden">
              <QuoteSimulator
                productType={productType}
                setProductType={setProductType}
                period={period}
                setPeriod={setPeriod}
                deposit={deposit}
                setDeposit={setDeposit}
                mileage={mileage}
                setMileage={setMileage}
                monthlyPrice={monthlyPrice}
                comparisonPrice={comparisonPrice}
                onConsult={handleConsult}
              />
            </section>

            {/* Spec Detail */}
            <section>
              <h2 className="text-lg font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                차량 사양
              </h2>
              <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      ["모델명", `${car.brand.name} ${car.modelName}`],
                      ["트림", car.trimName],
                      ["연식", `${car.year}년형`],
                      ["차종", CATEGORY_LABEL[car.category] || car.category],
                      ["연료", FUEL_LABEL[car.fuelType] || car.fuelType],
                      ["기본가격", formatPriceWon(car.basePrice)],
                    ].map(([label, value], i) => (
                      <tr key={label} className={i % 2 === 0 ? "bg-slate-50/50" : ""}>
                        <td className="px-4 py-3 font-medium text-[var(--color-text-muted)] w-28 lg:w-40">{label}</td>
                        <td className="px-4 py-3 text-[var(--color-text)]">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Download Section */}
            {(car.catalogUrl || car.specSheetUrl) && (
              <section>
                <h2 className="text-lg font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  카달로그 / 가격표
                </h2>
                <div className="flex flex-wrap gap-3">
                  {car.catalogUrl && (
                    <a
                      href={car.catalogUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors text-sm font-medium"
                    >
                      📄 카달로그 다운로드
                    </a>
                  )}
                  {car.specSheetUrl && (
                    <a
                      href={car.specSheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors text-sm font-medium"
                    >
                      📋 가격·사양표 다운로드
                    </a>
                  )}
                </div>
              </section>
            )}

            {/* Conditions Note */}
            <section className="bg-amber-50 border border-amber-200 rounded-xl p-4 lg:p-5 text-xs lg:text-sm text-amber-800 leading-relaxed">
              <p className="font-bold mb-2">💡 안내사항</p>
              <ul className="list-disc list-inside space-y-1">
                <li>월 납입료는 만 26세 이상, 일반 신용등급 기준 예시입니다.</li>
                <li>실제 견적은 고객 신용도, 금융사 프로모션에 따라 달라질 수 있습니다.</li>
                <li>정확한 견적은 무료 상담을 통해 확인해주세요.</li>
              </ul>
            </section>

            {/* Inline Quick Quote Form */}
            <section id="quick-quote">
              <QuickConsultInline carName={`${car.brand.name} ${car.modelName} ${car.trimName}`} />
            </section>
          </div>

          {/* ──────── Right Column: Sticky Simulator (Desktop only) ──────── */}
          <div className="hidden lg:block lg:w-[35%]">
            <div className="sticky top-24">
              <QuoteSimulator
                productType={productType}
                setProductType={setProductType}
                period={period}
                setPeriod={setPeriod}
                deposit={deposit}
                setDeposit={setDeposit}
                mileage={mileage}
                setMileage={setMileage}
                monthlyPrice={monthlyPrice}
                comparisonPrice={comparisonPrice}
                onConsult={handleConsult}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ──────── Mobile & Desktop Sticky Summary Bar ──────── */}
      <StickySummaryBar 
        car={car}
        currentTrim={currentTrim}
        totalPrice={configuredTotalPrice}
        monthlyPrice={monthlyPrice}
        onConsult={handleConsult}
      />

      {/* Bottom spacer for mobile sticky bars */}
      <div className="h-32 lg:h-0" />
    </div>
  );
}

// ─────────────────────────────────────────
// StickySummaryBar Component
// ─────────────────────────────────────────
function StickySummaryBar({ 
  car, 
  currentTrim, 
  totalPrice, 
  monthlyPrice, 
  onConsult 
}: { 
  car: any; 
  currentTrim: any; 
  totalPrice: number; 
  monthlyPrice: number | null; 
  onConsult: () => void;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 600px
      setIsVisible(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div 
      className={`fixed left-0 right-0 z-50 transition-all duration-500 transform ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full lg:-translate-y-full opacity-0"
      } ${
        // Desktop: Top sticky, Mobile: Bottom sticky
        "top-0 bottom-auto lg:bottom-auto lg:top-0 border-b lg:border-b max-lg:top-auto max-lg:bottom-0 max-lg:border-t"
      } bg-white/90 backdrop-blur-md border-[var(--color-border)] shadow-xl`}
    >
      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-10 hidden sm:block">
            {car.thumbnailUrl && (
              <Image src={car.thumbnailUrl} alt={car.modelName} fill className="object-contain" unoptimized />
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-[var(--color-text)] leading-tight">
              {car.brand.name} {car.modelName}
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)]">
              {currentTrim?.name || car.trimName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-[var(--color-text-muted)]">총 차량가</p>
            <p className="text-sm font-bold text-[var(--color-text)]">{formatPriceWon(totalPrice)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[var(--color-text-muted)]">예상 월 납입료</p>
            <p className="text-lg lg:text-xl font-extrabold text-[var(--color-accent)]">
              {monthlyPrice ? `${formatPrice(monthlyPrice)}원` : "상담 필요"}
            </p>
          </div>
          <button
            onClick={onConsult}
            className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-md active:scale-95"
          >
            상담 신청
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// QuoteSimulator Sub-component
// ─────────────────────────────────────────
function QuoteSimulator({
  productType,
  setProductType,
  period,
  setPeriod,
  deposit,
  setDeposit,
  mileage,
  setMileage,
  monthlyPrice,
  comparisonPrice,
  onConsult,
}: {
  productType: "rent" | "lease";
  setProductType: (v: "rent" | "lease") => void;
  period: number;
  setPeriod: (v: number) => void;
  deposit: string;
  setDeposit: (v: string) => void;
  mileage: number;
  setMileage: (v: number) => void;
  monthlyPrice: number | null;
  comparisonPrice: number | null;
  onConsult: () => void;
}) {
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--color-primary)] px-5 py-4">
        <h3 className="text-white font-bold text-base lg:text-lg">견적 시뮬레이터</h3>
        <p className="text-white/70 text-xs mt-0.5">조건을 변경하면 월 납입료가 실시간 계산됩니다</p>
      </div>

      <div className="p-5 space-y-5">
        {/* Product Type Tabs */}
        <div className="flex rounded-xl overflow-hidden border border-[var(--color-border)]">
          {(["rent", "lease"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setProductType(type)}
              className={`flex-1 py-3 text-sm font-bold transition-colors ${
                productType === type
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-white text-[var(--color-text-muted)] hover:bg-slate-50"
              }`}
            >
              {type === "rent" ? "장기렌트" : "리스"}
            </button>
          ))}
        </div>

        {/* Period */}
        <div>
          <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">계약 기간</label>
          <div className="grid grid-cols-3 gap-2">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
                  period === p
                    ? "border-[var(--color-accent)] bg-orange-50 text-[var(--color-accent)]"
                    : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-slate-300"
                }`}
              >
                {p}개월
              </button>
            ))}
          </div>
        </div>

        {/* Deposit */}
        <div>
          <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">선납 조건</label>
          <div className="space-y-2">
            {DEPOSITS.map((d) => (
              <button
                key={d.key}
                onClick={() => setDeposit(d.key)}
                className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium border text-left transition-all ${
                  deposit === d.key
                    ? "border-[var(--color-accent)] bg-orange-50 text-[var(--color-accent)]"
                    : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-slate-300"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mileage */}
        <div>
          <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">연간 주행거리</label>
          <div className="grid grid-cols-3 gap-2">
            {MILEAGES.map((m) => (
              <button
                key={m.key}
                onClick={() => setMileage(m.key)}
                className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
                  mileage === m.key
                    ? "border-[var(--color-accent)] bg-orange-50 text-[var(--color-accent)]"
                    : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-slate-300"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <hr className="border-[var(--color-border)]" />

        {/* Result */}
        <div className="text-center space-y-3">
          <p className="text-xs text-[var(--color-text-muted)]">
            예상 월 납입료 ({productType === "rent" ? "장기렌트" : "리스"})
          </p>
          <p className="text-3xl lg:text-4xl font-extrabold text-[var(--color-accent)]">
            {monthlyPrice && isFinite(monthlyPrice) && monthlyPrice > 0 ? `${formatPrice(monthlyPrice)}원` : "상담 신청 필요"}
          </p>
          {comparisonPrice && (
            <p className="text-xs text-[var(--color-text-muted)]">
              {productType === "rent" ? "리스" : "렌트"} 기준:{" "}
              <span className="font-semibold">{formatPrice(comparisonPrice)}원</span>
            </p>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={onConsult}
          className="w-full py-4 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-base transition-all active:scale-[0.98] shadow-md"
        >
          무료 상담 신청하기
        </button>
        <div className="flex justify-center gap-4 text-xs text-[var(--color-text-muted)]">
          <a href="tel:1577-0000" className="flex items-center gap-1 hover:text-[var(--color-primary)]">
            📞 1577-0000
          </a>
          <a href="http://pf.kakao.com/_XXXXX/chat" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[var(--color-primary)]">
            💬 카톡 상담
          </a>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Quick Consult Inline Form
// ─────────────────────────────────────────
function QuickConsultInline({ carName }: { carName: string }) {
  const [form, setForm] = useState({ name: "", phone: "", contactMethod: "phone", consent: false });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handlePhoneChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    let formatted = digits;
    if (digits.length > 3 && digits.length <= 7) formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
    else if (digits.length > 7) formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    setForm((f) => ({ ...f, phone: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.consent) {
      setError("필수 항목을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, carOfInterest: carName }),
      });
      if (!res.ok) throw new Error("Failed");
      setSuccess(true);
    } catch {
      setError("전송에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">✅</div>
        <h3 className="text-lg font-bold text-green-800 mb-2">상담 신청이 완료되었습니다!</h3>
        <p className="text-sm text-green-700">빠른 시간 내에 전문 매니저가 연락드리겠습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-primary)] rounded-2xl p-6 lg:p-8">
      <h2 className="text-white font-bold text-xl mb-1">💬 빠른 상담 신청</h2>
      <p className="text-white/70 text-sm mb-6">
        관심 차량: <span className="text-white font-medium">{carName}</span>
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="이름 *"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-[var(--color-accent)] transition-colors text-sm"
          required
        />
        <input
          type="tel"
          placeholder="전화번호 *"
          value={form.phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-[var(--color-accent)] transition-colors text-sm"
          required
        />
        <div className="flex gap-3">
          {[
            { key: "phone", label: "📞 전화" },
            { key: "sms", label: "💬 문자" },
            { key: "kakao", label: "🟡 카톡" },
          ].map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setForm((f) => ({ ...f, contactMethod: m.key }))}
              className={`flex-1 py-2.5 rounded-lg text-xs font-medium border transition-all ${
                form.contactMethod === m.key
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/20 text-white"
                  : "border-white/20 text-white/60 hover:border-white/40"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <label className="flex items-start gap-2 text-white/70 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
            className="mt-0.5 rounded accent-[var(--color-accent)]"
          />
          <span>개인정보 수집 및 이용에 동의합니다. (필수)</span>
        </label>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-base transition-all active:scale-[0.98] disabled:opacity-60"
        >
          {submitting ? "전송 중..." : "견적 상담 신청하기"}
        </button>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────
// Configurator UI Sub-component
// ─────────────────────────────────────────
function ConfiguratorUI({ 
  detailedConfig,
  selectedGradeIdx,
  setSelectedGradeIdx,
  selectedTrimIdx,
  setSelectedTrimIdx,
  selectedOptions,
  setSelectedOptions,
  selectedExtColor,
  setSelectedExtColor,
  selectedIntColor,
  setSelectedIntColor,
}: { 
  detailedConfig: any;
  selectedGradeIdx: string;
  setSelectedGradeIdx: (v: string) => void;
  selectedTrimIdx: string;
  setSelectedTrimIdx: (v: string) => void;
  selectedOptions: Record<string, boolean>;
  setSelectedOptions: (v: any) => void;
  selectedExtColor: string;
  setSelectedExtColor: (v: string) => void;
  selectedIntColor: string;
  setSelectedIntColor: (v: string) => void;
}) {
  const [colorTab, setColorTab] = useState<"ext" | "int">("ext");
  const { grades } = detailedConfig;
  
  const selectedGrade = grades.find((g: any) => g.idx === selectedGradeIdx);
  const selectedTrim = selectedGrade?.trims.find((t: any) => t.idx === selectedTrimIdx) || selectedGrade?.trims[0];

  // Auto-select first trim when grade changes
  useEffect(() => {
    if (selectedGrade && !selectedGrade.trims.find((t: any) => t.idx === selectedTrimIdx)) {
      setSelectedTrimIdx(selectedGrade.trims[0]?.idx || "");
      setSelectedOptions({});
      setSelectedExtColor("");
      setSelectedIntColor("");
    }
  }, [selectedGradeIdx, selectedGrade, selectedTrimIdx, setSelectedTrimIdx, setSelectedOptions, setSelectedExtColor, setSelectedIntColor]);

  const toggleOption = (optIdx: string) => {
    setSelectedOptions((prev: any) => ({ ...prev, [optIdx]: !prev[optIdx] }));
  };

  const totalOptionPrice = useMemo(() => {
    if (!selectedTrim) return 0;
    let total = 0;
    selectedTrim.options?.forEach((opt: any) => {
      if (selectedOptions[opt.idx]) {
        total += Number(opt.price) || 0;
      }
    });
    return total;
  }, [selectedTrim, selectedOptions]);

  const selectedExtColorData = selectedTrim?.colorsExt?.find((c: any) => c.idx === selectedExtColor);
  const selectedIntColorData = selectedTrim?.colorsInt?.find((c: any) => c.idx === selectedIntColor);
  const totalColorPrice = (Number(selectedExtColorData?.price) || 0) + (Number(selectedIntColorData?.price) || 0);

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-2xl overflow-hidden mt-8 shadow-sm">
      {/* Header with glassmorphism feel */}
      <div className="bg-gradient-to-r from-slate-50 to-white px-5 py-5 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--color-text)]">커스텀 빌드</h3>
            <p className="text-[11px] text-[var(--color-text-muted)]">당신만의 {detailedConfig.modelName || "차량"}을 완성해보세요</p>
          </div>
        </div>
      </div>

      <div className="p-5 lg:p-7 space-y-10">
        {/* 1. Grade Selection */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">1</span>
            <h4 className="text-sm font-bold text-[var(--color-text)]">라인업 선택</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {grades.map((g: any) => (
              <button
                key={g.idx}
                onClick={() => setSelectedGradeIdx(g.idx)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-300 ${
                  selectedGradeIdx === g.idx
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-lg shadow-blue-900/10 scale-[1.02]"
                    : "border-slate-200 text-slate-500 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </section>

        {/* 2. Trim Selection */}
        {selectedGrade && selectedGrade.trims.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">2</span>
              <h4 className="text-sm font-bold text-[var(--color-text)]">트림 선택</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedGrade.trims.map((t: any) => (
                <button
                  key={t.idx}
                  onClick={() => setSelectedTrimIdx(t.idx)}
                  className={`relative overflow-hidden text-left p-4 rounded-2xl border transition-all duration-300 ${
                    selectedTrimIdx === t.idx
                      ? "border-[var(--color-primary)] bg-blue-50/40 shadow-inner"
                      : "border-slate-100 bg-slate-50/30 hover:border-blue-200"
                  }`}
                >
                  {selectedTrimIdx === t.idx && (
                    <div className="absolute top-0 right-0 p-1">
                      <div className="bg-[var(--color-primary)] text-white rounded-bl-xl p-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                      </div>
                    </div>
                  )}
                  <div className="mb-1">
                    <span className={`text-sm font-bold ${selectedTrimIdx === t.idx ? "text-[var(--color-primary)]" : "text-[var(--color-text)]"}`}>
                      {t.name}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-500">
                    {t.price > 0 ? `${formatPrice(Number(t.price))}원` : "가격 정보 없음"}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 3. Color Selection with Tabs */}
        {selectedTrim && (
          <section className="animate-in fade-in duration-700 delay-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                <h4 className="text-sm font-bold text-[var(--color-text)]">색상 선택</h4>
              </div>
              <div className="flex bg-slate-100 p-0.5 rounded-lg">
                <button 
                  onClick={() => setColorTab("ext")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${colorTab === "ext" ? "bg-white shadow-sm text-[var(--color-primary)]" : "text-slate-400"}`}
                >
                  외장
                </button>
                <button 
                  onClick={() => setColorTab("int")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${colorTab === "int" ? "bg-white shadow-sm text-[var(--color-primary)]" : "text-slate-400"}`}
                >
                  내장
                </button>
              </div>
            </div>

            <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
              {colorTab === "ext" ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-bold text-slate-600">외장 색상</span>
                    <span className="text-xs font-bold text-[var(--color-primary)]">
                      {selectedExtColorData ? selectedExtColorData.title : "선택 안됨"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {selectedTrim.colorsExt?.map((color: any, index: number) => {
                      const isSelected = selectedExtColor === color.idx;
                      const bgStyle = Array.isArray(color.detail) && color.detail.length >= 2
                        ? `linear-gradient(135deg, ${color.detail[0]} 50%, ${color.detail[1]} 50%)`
                        : color.thumb && color.thumb.startsWith("#") ? color.thumb : color.thumb || "#ffffff";
                        
                      return (
                        <button
                          key={color.idx || index}
                          onClick={() => setSelectedExtColor(color.idx)}
                          className={`group relative flex flex-col items-center gap-2 transition-all`}
                        >
                          <div 
                            className={`w-12 h-12 rounded-full border-2 transition-all shadow-sm ${
                              isSelected ? "border-[var(--color-primary)] scale-110 shadow-md" : "border-white hover:border-slate-300"
                            }`}
                            style={{ background: bgStyle, backgroundSize: "cover" }}
                          />
                          <span className={`text-[9px] font-bold transition-all ${isSelected ? "text-[var(--color-primary)]" : "text-slate-400 group-hover:text-slate-600"}`}>
                            {color.title}
                          </span>
                        </button>
                      );
                    })}
                    {(!selectedTrim.colorsExt || selectedTrim.colorsExt.length === 0) && (
                      <div className="w-full py-4 text-center border-2 border-dashed border-slate-200 rounded-xl">
                        <p className="text-[10px] font-medium text-slate-400">색상 정보가 제공되지 않는 차량입니다.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-bold text-slate-600">내장 색상</span>
                    <span className="text-xs font-bold text-[var(--color-primary)]">
                      {selectedIntColorData ? selectedIntColorData.title : "선택 안됨"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {selectedTrim.colorsInt?.map((color: any, index: number) => {
                      const isSelected = selectedIntColor === color.idx;
                      const bgStyle = Array.isArray(color.detail) && color.detail.length >= 2
                        ? `linear-gradient(135deg, ${color.detail[0]} 50%, ${color.detail[1]} 50%)`
                        : color.thumb && color.thumb.startsWith("#") ? color.thumb : color.thumb || "#ffffff";
                        
                      return (
                        <button
                          key={color.idx || index}
                          onClick={() => setSelectedIntColor(color.idx)}
                          className="group relative flex flex-col items-center gap-2"
                        >
                          <div 
                            className={`w-12 h-12 rounded-full border-2 transition-all shadow-sm ${
                              isSelected ? "border-[var(--color-primary)] scale-110 shadow-md" : "border-white hover:border-slate-300"
                            }`}
                            style={{ background: bgStyle, backgroundSize: "cover" }}
                          />
                          <span className={`text-[9px] font-bold transition-all ${isSelected ? "text-[var(--color-primary)]" : "text-slate-400 group-hover:text-slate-600"}`}>
                            {color.title}
                          </span>
                        </button>
                      );
                    })}
                    {(!selectedTrim.colorsInt || selectedTrim.colorsInt.length === 0) && (
                      <div className="w-full py-4 text-center border-2 border-dashed border-slate-200 rounded-xl">
                        <p className="text-[10px] font-medium text-slate-400">내장 색상 정보가 제공되지 않는 차량입니다.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 4. Option Selection */}
        {selectedTrim && selectedTrim.options && selectedTrim.options.length > 0 && (
          <section className="animate-in fade-in duration-700 delay-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">4</span>
                <h4 className="text-sm font-bold text-[var(--color-text)]">선택 옵션</h4>
              </div>
              <div className="text-[10px] font-bold text-slate-400">
                선택됨: <span className="text-[var(--color-primary)]">{Object.values(selectedOptions).filter(Boolean).length}개</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {selectedTrim.options.map((opt: any) => {
                const isSelected = !!selectedOptions[opt.idx];
                return (
                  <label
                    key={opt.idx}
                    className={`group relative flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? "border-[var(--color-primary)] bg-blue-50/30 shadow-sm"
                        : "border-slate-100 hover:border-blue-200 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                      isSelected ? "bg-[var(--color-primary)] border-[var(--color-primary)]" : "border-slate-300 bg-white"
                    }`}>
                      {isSelected && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={isSelected}
                        onChange={() => toggleOption(opt.idx)}
                      />
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs font-bold leading-tight ${isSelected ? "text-[var(--color-primary)]" : "text-slate-700"}`}>
                        {opt.title}
                      </p>
                      {Number(opt.price) > 0 && (
                        <p className="text-[10px] font-bold text-slate-400 mt-1">
                          + {formatPrice(Number(opt.price))}원
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </section>
        )}

        {/* 5. Final Summary Box */}
        {selectedTrim && (
          <section className="pt-4 border-t border-slate-100 animate-in fade-in duration-1000 delay-500">
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 p-6 rounded-3xl shadow-xl shadow-blue-900/20">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-blue-200/60 text-[10px] font-bold uppercase tracking-wider">
                  <span>Configuration Summary</span>
                  <span className="bg-blue-400/20 text-blue-300 px-2 py-0.5 rounded-full">Selected</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-blue-200/50 text-[10px] mb-0.5">기본 차량가</p>
                    <p className="text-white text-sm font-bold">{formatPriceWon(Number(selectedTrim.price) || 0)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-200/50 text-[10px] mb-0.5">선택 옵션 합계</p>
                    <p className="text-white text-sm font-bold">+ {formatPriceWon(totalOptionPrice + totalColorPrice)}</p>
                  </div>
                </div>

                <div className="h-[1px] bg-white/10" />

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-blue-300 text-[10px] font-bold mb-0.5">최종 견적가 (VAT 포함)</p>
                    <h5 className="text-white text-2xl lg:text-3xl font-black">
                      {formatPriceWon((Number(selectedTrim.price) || 0) + totalOptionPrice + totalColorPrice)}
                    </h5>
                  </div>
                  <div className="pb-1">
                    <span className="text-[10px] font-bold text-blue-300/80 italic">Estimated Price</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
