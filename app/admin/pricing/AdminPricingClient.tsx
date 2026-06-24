"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import PricingDetailModal from "./PricingDetailModal";
import { resolveTrimRepresentativePrice } from "@/lib/pricing";

interface Brand {
  id: string;
  name: string;
}

interface Car {
  id: string;
  slug: string;
  brand: Brand;
  modelName: string;
  trimName: string;
  year: number;
  basePrice: number;
  thumbnailUrl: string;
  priceMatrix: any;
  fuelType: string;
  options: any;
  originalPriceMatrix: any; // 최초 원본 가격 매트릭스
}

interface TrimPricingItem {
  id: string; // car.id
  slug: string;
  fuelType: string;
  brand: Brand;
  modelName: string;
  trimIdx: string;
  trimName: string;
  fullTrimName: string;
  basePrice: number; // trim.price
  originalBasePrice: number; // car.basePrice
  rentOffset: number;
  leaseOffset: number;
  priceMatrix: any;
  originalPriceMatrix: any;
  options: any; // car.options 전체 (모달 저장용)
}

export default function AdminPricingClient({
  initialCars,
  brands,
}: {
  initialCars: Car[];
  brands: Brand[];
}) {
  const router = useRouter();

  // State for Batch Adjustment
  const [targetType, setTargetType] = useState<"rent" | "lease" | "all">("all");
  const [adjustAmount, setAdjustAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States for Batch Action Filters
  const [batchBrand, setBatchBrand] = useState<string>("");
  const [batchModel, setBatchModel] = useState<string>("");
  const [batchTier, setBatchTier] = useState<string>(""); // 원가 금액대 필터

  // State for Product Filter & Active Tier (Right side list)
  const [productFilter, setProductFilter] = useState<"rent" | "lease">("rent");
  const [selectedTier, setSelectedTier] = useState<number | "all">("all");
  
  // State for Selected Brand & Search Query (Right side list)
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // State for Individual Edit Modal
  const [selectedCar, setSelectedCar] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // initialCars -> TrimPricingItem[] 가상화 전개
  const trimItems = useMemo(() => {
    const items: TrimPricingItem[] = [];
    initialCars.forEach((car) => {
      const options = typeof car.options === "string" 
        ? JSON.parse(car.options) 
        : car.options;
      const grades = options?.grades || [];
      
      grades.forEach((grade: any) => {
        const gradeName = grade.name || "";
        grade.trims?.forEach((trim: any) => {
          items.push({
            id: car.id,
            slug: car.slug,
            fuelType: car.fuelType || "",
            brand: car.brand,
            modelName: car.modelName,
            trimIdx: trim.idx,
            trimName: trim.name,
            fullTrimName: gradeName ? `${gradeName} ${trim.name}` : trim.name,
            basePrice: Number(trim.price) || car.basePrice || 0,
            originalBasePrice: car.basePrice || 0,
            rentOffset: Number(trim.rentOffset) || 0,
            leaseOffset: Number(trim.leaseOffset) || 0,
            priceMatrix: car.priceMatrix,
            originalPriceMatrix: car.originalPriceMatrix,
            options: car.options
          });
        });
      });
    });
    return items;
  }, [initialCars]);

  // Helper: 대표 월 납입료 구하기 (36개월 / 선수금30% / 2만km) - 현재 설정 요금용 (오프셋 적용됨)
  const getRepresentativePrice = (item: TrimPricingItem, type: "rent" | "lease") => {
    return resolveTrimRepresentativePrice(
      {
        slug: item.slug,
        fuelType: item.fuelType,
        basePrice: item.originalBasePrice,
        priceMatrix: item.priceMatrix
      },
      {
        price: item.basePrice,
        rentOffset: item.rentOffset,
        leaseOffset: item.leaseOffset
      },
      type
    );
  };

  // Helper: 최초 원가(Original) 대표 요금 구하기 (36개월 / 선수금30% / 2만km) - 대역 분류용 (오프셋 미적용)
  const getOriginalRepresentativePrice = (item: TrimPricingItem, type: "rent" | "lease") => {
    return resolveTrimRepresentativePrice(
      {
        slug: item.slug,
        fuelType: item.fuelType,
        basePrice: item.originalBasePrice,
        priceMatrix: item.originalPriceMatrix
      },
      {
        price: item.basePrice,
        rentOffset: 0,
        leaseOffset: 0
      },
      type
    );
  };

  // 10만원 단위 동적 요금 대역(Tiers) 산출 (트림별 최초 원가 기준)
  const dynamicTiers = useMemo(() => {
    const tiersSet = new Set<number>();
    trimItems.forEach((item) => {
      const origPrice = getOriginalRepresentativePrice(item, productFilter);
      if (origPrice > 0) {
        const tier = Math.floor(origPrice / 100000);
        tiersSet.add(tier);
      }
    });
    return Array.from(tiersSet).sort((a, b) => a - b);
  }, [trimItems, productFilter]);

  // 일괄수정 패널에 사용될 동적 모델명 리스트 (선택된 브랜드 기준)
  const batchModels = useMemo(() => {
    if (!batchBrand) return [];
    const modelsSet = new Set<string>();
    initialCars.forEach((car) => {
      if (car.brand.id === batchBrand) {
        modelsSet.add(car.modelName);
      }
    });
    return Array.from(modelsSet).sort();
  }, [initialCars, batchBrand]);

  // Filtered Items based on Tiers, Brand and Search
  const processedItems = useMemo(() => {
    return trimItems.filter((item) => {
      // 1. 브랜드 필터
      if (selectedBrand && item.brand.id !== selectedBrand) return false;

      // 2. 검색어 필터
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const modelMatch = item.modelName.toLowerCase().includes(query);
        const trimMatch = item.fullTrimName.toLowerCase().includes(query);
        if (!modelMatch && !trimMatch) return false;
      }

      // 3. 요금 대역 필터
      if (selectedTier !== "all") {
        const origPrice = getOriginalRepresentativePrice(item, productFilter);
        const itemTier = Math.floor(origPrice / 100000);
        if (itemTier !== selectedTier) return false;
      }

      return true;
    });
  }, [trimItems, productFilter, selectedTier, selectedBrand, searchQuery]);

  // Batch Adjust Action
  const handleBatchAdjust = async () => {
    const parsedAmount = parseInt(adjustAmount.replace(/[^0-9-]/g, ""), 10);
    if (isNaN(parsedAmount)) {
      alert("올바른 가감 금액 숫자를 입력하세요. (예: 50000 또는 -20000)");
      return;
    }

    // 조건부 요약 로그
    let conditionSummary = [];
    if (batchBrand) {
      const brandObj = brands.find(b => b.id === batchBrand);
      conditionSummary.push(`브랜드: ${brandObj?.name || ""}`);
    }
    if (batchModel) {
      conditionSummary.push(`모델: ${batchModel}`);
    }
    if (batchTier) {
      const tierVal = parseInt(batchTier, 10);
      conditionSummary.push(`금액대: ${tierVal === 0 ? "10만원 미만" : `${tierVal * 10}만원대`}`);
    }

    const conditionsText = conditionSummary.length > 0 
      ? `\n[필터 조건: ${conditionSummary.join(", ")}]` 
      : "\n[필터 조건: 전체 차량]";

    const typeLabel = targetType === "rent" ? "렌트" : targetType === "lease" ? "리스" : "렌트 및 리스";
    const confirmMsg = `설정하신 조건에 해당하는 차량의 ${typeLabel} 요금을 일괄적으로 ${parsedAmount.toLocaleString()}원 ${parsedAmount > 0 ? "인상" : "인하"}하시겠습니까?${conditionsText}`;
    
    if (!confirm(confirmMsg)) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/pricing/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "adjust",
          type: targetType,
          amount: parsedAmount,
          filters: {
            brandId: batchBrand || undefined,
            modelName: batchModel || undefined,
            originalTier: batchTier !== "" ? parseInt(batchTier, 10) : undefined,
          }
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message || "요금이 성공적으로 일괄 수정되었습니다.");
        setAdjustAmount("");
        // 일괄수정 조건 필터 리셋
        setBatchBrand("");
        setBatchModel("");
        setBatchTier("");
        router.refresh();
      } else {
        let errorMsg = "알 수 없는 오류가 발생했습니다.";
        try {
          const data = await res.json();
          errorMsg = data.error || errorMsg;
        } catch (err) {
          errorMsg = `서버 오류가 발생했습니다. (상태 코드: ${res.status})`;
        }
        alert(`실패: ${errorMsg}`);
      }
    } catch (e) {
      console.error(e);
      alert("작업 처리 중 네트워크 통신 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Batch Reset Action
  const handleBatchReset = async () => {
    const confirmMsg = "정말로 모든 차량의 트림별 세부조정 가격을 원래 초기 요금으로 복원(초기화)하시겠습니까?\n이 작업은 되돌릴 수 없습니다.";
    if (!confirm(confirmMsg)) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/pricing/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset",
        }),
      });

      if (res.ok) {
        alert("모든 요금 정보가 성공적으로 초기 요금제로 복원되었습니다.");
        router.refresh();
      } else {
        let errorMsg = "알 수 없는 오류가 발생했습니다.";
        try {
          const data = await res.json();
          errorMsg = data.error || errorMsg;
        } catch (err) {
          errorMsg = `서버 오류가 발생했습니다. (상태 코드: ${res.status})`;
        }
        alert(`실패: ${errorMsg}`);
      }
    } catch (e) {
      console.error(e);
      alert("복원 작업 중 네트워크 통신 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (item: TrimPricingItem) => {
    // PricingDetailModal에 차량 형태로 맞춰서 전달
    setSelectedCar({
      id: item.id,
      modelName: item.modelName,
      trimName: item.fullTrimName,
      basePrice: item.originalBasePrice,
      options: item.options
    });
    isModalOpen ? setIsModalOpen(false) : setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">차량 관리 시스템</div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">실시간 가격조정 및 매트릭스 설정</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Batch Control Panel */}
        <div className="xl:col-span-1 bg-white border border-slate-100 rounded-3xl shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              요금 일괄수정
            </h2>
            <p className="text-xs text-slate-500 mt-1">특정 필터 조건(모델별 / 원가 금액대별)을 설정하여 일괄 요금을 가감합니다.</p>
          </div>

          <div className="space-y-4">
            {/* Target Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">적용 대상</label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as any)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">렌트 + 리스 전체</option>
                <option value="rent">장기렌트만 적용</option>
                <option value="lease">자동차리스만 적용</option>
              </select>
            </div>

            {/* Filter: Brand (for Batch) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">대상 브랜드 필터</label>
              <select
                value={batchBrand}
                onChange={(e) => {
                  setBatchBrand(e.target.value);
                  setBatchModel(""); // 브랜드 변경 시 모델 리셋
                }}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">전체 브랜드 대상</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Filter: Model (for Batch) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">대상 차량 모델 선택</label>
              <select
                value={batchModel}
                onChange={(e) => setBatchModel(e.target.value)}
                disabled={!batchBrand}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">전체 모델 대상</option>
                {batchModels.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">브랜드를 먼저 선택해야 모델 지정이 가능합니다.</p>
            </div>

            {/* Filter: Original Pricing Tier (for Batch) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">대상 요금제 원가 금액대 필터</label>
              <select
                value={batchTier}
                onChange={(e) => setBatchTier(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">전체 금액대 대상</option>
                <option value="0">10만원 미만</option>
                {Array.from({ length: 33 }, (_, i) => i + 1).map((val) => (
                  <option key={val} value={val}>{val * 10}만원대</option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                **예시적 요금 조정**: 선택 시 차량 내 요금제 조회 중 **최초 원가가 해당 대역에 속하는 개별 항목만 가감**됩니다. (예: 10만원대 지정 시, 원가 18만 요금은 할인되나 원가 32만 요금은 그대로 보존)
              </p>
            </div>

            {/* Amount input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">조정 금액 (원 단위)</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="예: -50000 또는 30000"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 pr-8"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">원</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">할인 시 마이너스(-), 인상 시 플러스(+) 기호를 포함해 입력하세요.</p>
            </div>

            <button
              onClick={handleBatchAdjust}
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors text-sm shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? "일괄조정 적용 중..." : "일괄수정 적용"}
            </button>
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-red-600">초기화 위험구역</h3>
              <p className="text-xs text-slate-500 mt-0.5">요금 수정 상태를 지우고 크롭링/시드 최초 정보로 복원합니다.</p>
            </div>
            <button
              onClick={handleBatchReset}
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-bold text-xs"
            >
              요금제 전체 초기화 (기본 복원)
            </button>
          </div>
        </div>

        {/* Right Side: Interactive Table List & Category Filters */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 space-y-6">
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-400 mb-1">브랜드 필터</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full border border-slate-100 bg-slate-50/50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">전체 브랜드</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-400 mb-1">모델 / 트림 검색</label>
                <input
                  type="text"
                  placeholder="모델명 또는 트림명을 입력하세요..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-slate-100 bg-slate-50/50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Filter 1: Product Type (Rent vs Lease) */}
            <div className="flex border-b border-slate-100">
              <button
                onClick={() => {
                  setProductFilter("rent");
                  setSelectedTier("all"); // 분류 기준 변경 시 탭 리셋
                }}
                className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all ${
                  productFilter === "rent" 
                    ? "border-emerald-500 text-emerald-600" 
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                렌트 원가 기준 분류
              </button>
              <button
                onClick={() => {
                  setProductFilter("lease");
                  setSelectedTier("all"); // 분류 기준 변경 시 탭 리셋
                }}
                className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all ${
                  productFilter === "lease" 
                    ? "border-violet-500 text-violet-600" 
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                리스 원가 기준 분류
              </button>
            </div>

            {/* Filter 2: Dynamic 10만원 단위 Tier Buttons */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-2">월 요금 원가 대역 선택 (10만원 단위)</label>
              <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-1 pb-1">
                <button
                  onClick={() => setSelectedTier("all")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedTier === "all"
                      ? productFilter === "rent"
                        ? "bg-emerald-600 text-white"
                        : "bg-violet-600 text-white"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  전체 보기
                </button>
                {dynamicTiers.map((tier) => {
                  const label = tier === 0 ? "10만원 미만" : `${tier * 10}만원대`;
                  return (
                    <button
                      key={tier}
                      onClick={() => setSelectedTier(tier)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        selectedTier === tier
                          ? productFilter === "rent"
                            ? "bg-emerald-600 text-white"
                            : "bg-violet-600 text-white"
                          : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                * **원가 기준 분류 규칙**: 일괄 가감 금액이 적용되더라도 분류는 최초 등록된 **원래 요금(Original Price)**을 기준으로 상시 고정됩니다.
              </p>
            </div>

          </div>

          {/* Cars List Table */}
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">브랜드</th>
                    <th className="px-6 py-4">모델 / 트림</th>
                    <th className="px-6 py-4 text-right">기본 차량가</th>
                    <th className="px-6 py-4 text-right">최초 원가</th>
                    <th className="px-6 py-4 text-right">현재 적용가</th>
                    <th className="px-6 py-4 text-center">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {processedItems.length > 0 ? (
                    processedItems.map((item) => {
                      const origPrice = getOriginalRepresentativePrice(item, productFilter);
                      const currPrice = getRepresentativePrice(item, productFilter);
                      return (
                        <tr key={`${item.id}_${item.trimIdx}`} className="hover:bg-slate-50/50 transition-colors text-sm">
                          <td className="px-6 py-4 text-slate-600 font-medium">{item.brand.name}</td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-800">{item.modelName}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 max-w-[250px]" title={item.fullTrimName}>
                              {item.fullTrimName}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right text-slate-500 font-medium">
                            {(item.basePrice / 10000).toLocaleString("ko-KR")}만원
                          </td>
                          {/* 최초 원가 */}
                          <td className="px-6 py-4 text-right text-slate-400 font-bold text-xs">
                            {origPrice > 0 ? `${origPrice.toLocaleString()}원` : "견적요청"}
                          </td>
                          {/* 현재 적용가 */}
                          <td className="px-6 py-4 text-right font-extrabold">
                            <span className={productFilter === "rent" ? "text-emerald-600" : "text-violet-600"}>
                              {currPrice > 0 ? `${currPrice.toLocaleString()}원` : "견적요청"}
                            </span>
                            <div className="text-[9px] text-slate-400 font-medium mt-0.5">36m | 선납30% | 2만km</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleEditClick(item)}
                              className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:border-slate-300 text-slate-600 bg-white hover:bg-slate-50 transition-all shadow-sm"
                            >
                              세부 요금 수정
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-xs">
                        검색 조건 및 대역에 해당하는 차량이 존재하지 않습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Table Footer Summary */}
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
              <span>총 필터 트림수</span>
              <span>{processedItems.length}개</span>
            </div>

          </div>

        </div>

      </div>

      {/* Individual Pricing Edit Modal */}
      {selectedCar && (
        <PricingDetailModal
          car={selectedCar}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCar(null);
          }}
          onSave={() => {
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
