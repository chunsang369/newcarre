"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";

// ─────────────────────────────────────────
// Types & Formatters
// ─────────────────────────────────────────
function formatPriceWon(num: number): string {
  if (!num) return "0원";
  return num.toLocaleString() + "원";
}

type Period = "36" | "48" | "60";
type Deposit = "PREPAY_30" | "DEPOSIT_30" | "NO_DEPOSIT";
type Mileage = "10000" | "20000";
type Prepay = "0" | "30";
type Guarantee = "0" | "30";
type BuyMethod = "RENT" | "LEASE";

export default function CarDetailClient({ car }: { car: any }) {
  const grades = car.options?.grades || [];
  
  // States
  const [selectedGradeIdx, setSelectedGradeIdx] = useState<string>(grades[0]?.idx || "");
  const [selectedTrimIdx, setSelectedTrimIdx] = useState<string>("");
  const [selectedExtColor, setSelectedExtColor] = useState<string>("");
  const [selectedIntColor, setSelectedIntColor] = useState<string>("");
  const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>({});
  
  const [buyMethod, setBuyMethod] = useState<BuyMethod>("RENT");
  const [period, setPeriod] = useState<Period>("36");
  const [deposit, setDeposit] = useState<Deposit>("PREPAY_30");
  const [mileage, setMileage] = useState<Mileage>("20000");
  const [prepay, setPrepay] = useState<Prepay>("30");
  const [guarantee, setGuarantee] = useState<Guarantee>("0");

  const [form, setForm] = useState({ name: "", phone: "", consent1: false, consent2: false, consent3: false });
  const [submitting, setSubmitting] = useState(false);

  // Derived Selection
  const selectedGrade = grades.find((g: any) => g.idx === selectedGradeIdx) || grades[0];
  const selectedTrim = selectedGrade?.trims?.find((t: any) => t.idx === selectedTrimIdx) || selectedGrade?.trims?.[0];

  useEffect(() => {
    if (selectedGrade && !selectedGrade.trims.find((t: any) => t.idx === selectedTrimIdx)) {
      setSelectedTrimIdx(selectedGrade.trims[0]?.idx || "");
      setSelectedOptions({});
      setSelectedExtColor("");
      setSelectedIntColor("");
    }
  }, [selectedGradeIdx, selectedGrade, selectedTrimIdx]);

  // 자동 기본 색상 선택
  useEffect(() => {
    if (selectedTrim) {
      if (!selectedExtColor && selectedTrim.colorsExt?.[0]) {
        setSelectedExtColor(selectedTrim.colorsExt[0].idx);
      }
      if (!selectedIntColor && selectedTrim.colorsInt?.[0]) {
        setSelectedIntColor(selectedTrim.colorsInt[0].idx);
      }
    }
  }, [selectedTrim, selectedExtColor, selectedIntColor]);

  // Calculations
  const basePrice = Number(selectedTrim?.price) || car.basePrice || 0;
  
  const totalOptionPrice = useMemo(() => {
    if (!selectedTrim) return 0;
    let total = 0;
    selectedTrim.options?.forEach((opt: any) => {
      if (selectedOptions[opt.idx]) total += Number(opt.price) || 0;
    });
    return total;
  }, [selectedTrim, selectedOptions]);

  const selectedExtColorData = selectedTrim?.colorsExt?.find((c: any) => c.idx === selectedExtColor);
  const selectedIntColorData = selectedTrim?.colorsInt?.find((c: any) => c.idx === selectedIntColor);
  const totalColorPrice = (Number(selectedExtColorData?.price) || 0) + (Number(selectedIntColorData?.price) || 0);

  const finalCarPrice = basePrice + totalOptionPrice + totalColorPrice;
  const discountPrice = Math.floor(finalCarPrice * 0.975); // -2.5% 차살때 혜택

  // Monthly Price Calculation (from priceMatrix)
  const monthlyPrice = useMemo(() => {
    const key = `${period}_${deposit}_${mileage}`;
    const baseEntry = car.priceMatrix?.[key] || { rent: 0, lease: 0 };
    let baseMonthly = buyMethod === "RENT" ? baseEntry.rent : baseEntry.lease;
    let isFallback = false;
    
    // 데이터가 0이거나 비정상적으로 낮은 경우(예: 크롤링 오류 10001) Fallback 적용
    const isCasper = car.slug?.includes('casper');
    const isCasperElectric = car.slug?.includes('casper-electric');
    if (!baseMonthly || baseMonthly <= 20000 || isCasper) {
      isFallback = true;
      // 기본 Fallback: 차량 가액의 일정 비율 (36개월 0/0 기준)
      const baseRatio = buyMethod === "RENT" ? 0.0165 : 0.0135;
      const subsidyFactor = isCasperElectric ? 0.298 : 1.0; // 캐스퍼 일렉트릭 보조금(차살때 기준 70,200원) 정밀하게 맞춤
      
      const fallbackBase = Math.floor(basePrice * baseRatio * subsidyFactor);
      
      baseMonthly = fallbackBase;
      if (deposit === "PREPAY_30") baseMonthly = Math.floor(fallbackBase * 0.66);
      if (deposit === "DEPOSIT_30") baseMonthly = Math.floor(fallbackBase * 0.88);
    }
    
    // Add option monthly logic (선수금/보증금에 따른 옵션가 요율 조정)
    // 36개월 기준: 무보증 약 1.8%, 보증금30% 약 1.5%, 선수금30% 약 0.9% (잔존가치 고려)
    let ratio = 0.018; 
    if (deposit === "DEPOSIT_30") ratio = 0.015;
    if (deposit === "PREPAY_30") ratio = 0.009; // 선수금 시 옵션가도 크게 감액됨
    
    const added = Math.floor((totalOptionPrice + totalColorPrice) * ratio);
    
    let multiplier = 1.0;
    if (period === "48") multiplier = 0.90; 
    if (period === "60") multiplier = 0.82;
    
    let finalMonthly = 0;
    if (isFallback) {
      finalMonthly = Math.floor((baseMonthly + added) * multiplier);
    } else {
      // DB의 baseMonthly에는 이미 기간/선수금/주행거리 배수가 적용되어 있으므로 옵션 가격(added)에만 기간 배수 적용
      finalMonthly = Math.floor(baseMonthly + (added * multiplier));
    }

    return finalMonthly;
  }, [period, deposit, mileage, buyMethod, car.priceMatrix, totalOptionPrice, totalColorPrice, basePrice, car.fuelType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.consent1 || !form.consent2) {
      alert("필수 항목과 필수 동의를 확인해주세요.");
      return;
    }
    
    setSubmitting(true);
    
    try {
      // 차량 구성 정보 요약
      const optionList = Object.keys(selectedOptions)
        .filter(key => selectedOptions[key])
        .map(key => {
          const opt = selectedTrim?.options?.find((o: any) => o.idx === key);
          return opt ? opt.title : "";
        })
        .filter(Boolean);
      
      const optionText = optionList.length > 0 
        ? `${optionList[0]}${optionList.length > 1 ? ` 외 ${optionList.length - 1}건` : ""}` 
        : "없음";

      const configSummary = `[${car.brand.name} ${car.modelName}] 
트림: ${selectedTrim?.name || "-"}
외장: ${selectedExtColorData?.title || "-"}
내장: ${selectedIntColorData?.title || "-"}
옵션: ${optionText}
조건: ${buyMethod === "RENT" ? "렌트" : "리스"} (${period}개월 / 연 ${Number(mileage).toLocaleString()}km / ${prepay !== "0" ? `선수금 ${prepay}%` : guarantee !== "0" ? `보증금 ${guarantee}%` : "무보증"})`;

      // 구조화된 JSON 데이터 생성
      const carConfig = {
        carName: car.modelName,
        brandName: car.brand.name,
        thumbnailUrl: car.thumbnailUrl,
        trim: selectedTrim?.name || "-",
        exteriorColor: selectedExtColorData ? {
          name: selectedExtColorData.title,
          code: selectedExtColorData.idx,
          detail: selectedExtColorData.detail || []
        } : null,
        interiorColor: selectedIntColorData ? {
          name: selectedIntColorData.title,
          code: selectedIntColorData.idx,
          detail: selectedIntColorData.detail || []
        } : null,
        options: optionList,
        contract: {
          type: buyMethod,
          months: parseInt(period),
          mileage: parseInt(mileage),
          deposit: prepay !== "0" ? parseInt(prepay) : guarantee !== "0" ? parseInt(guarantee) : 0,
          depositType: prepay !== "0" ? "PREPAY" : guarantee !== "0" ? "GUARANTEE" : "NONE",
          monthlyPrice: monthlyPrice,
          raw: `${buyMethod === "RENT" ? "렌트" : "리스"} (${period}개월 / 연 ${Number(mileage).toLocaleString()}km / ${prepay !== "0" ? `선수금 ${prepay}%` : guarantee !== "0" ? `보증금 ${guarantee}%` : "무보증"})`
        }
      };

      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          consent: true,
          carOfInterest: configSummary,
          carConfig: carConfig,
          source: "DETAIL_PAGE_CONFIGURATOR"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "전송 실패");
      }

      alert("견적 상담이 성공적으로 신청되었습니다. 담당자가 곧 연락드리겠습니다.");
      setForm({ name: "", phone: "", consent1: false, consent2: false, consent3: false });
    } catch (error) {
      console.error("Quote submit error:", error);
      alert("상담 신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const primaryColor = "#469BD9"; // 하이카즈 브랜드 컬러

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-24 lg:pb-12 text-[#333]">
      {/* ─── Hero Section (차살때 동일) ─── */}
      <div className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 pt-6 pb-2">
          <h1 className="text-2xl font-bold mb-4">상세견적</h1>
        </div>
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 pb-8">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
            <div className="w-full md:w-[55%] flex items-center justify-center bg-[#f8f9fa] rounded-md py-6">
              {car.thumbnailUrl ? (
                <img src={car.thumbnailUrl} alt={car.modelName} className="max-h-[280px] w-auto object-contain mix-blend-multiply" />
              ) : (
                <div className="w-64 h-40 bg-gray-200 rounded flex items-center justify-center text-gray-400">No Image</div>
              )}
            </div>
            <div className="w-full md:w-[45%] flex flex-col items-center md:items-start">
              {/* ── 모바일: 로고+모델명 가로 한 줄 ── */}
              <div className="flex md:hidden flex-row items-center gap-2 w-full justify-center">
                {car.brand && (
                  <img 
                    src={`/images/brands/${car.brand.slug}.${['polestar', 'jaguar', 'lincoln'].includes(car.brand.slug) ? 'webp' : ['audi', 'cadillac', 'ford', 'honda', 'mercedes-benz', 'porsche'].includes(car.brand.slug) ? 'png' : 'svg'}`} 
                    alt={car.brand.name} 
                    className="h-6 object-contain shrink-0" 
                  />
                )}
                <h2 className="text-[17px] min-[375px]:text-[19px] sm:text-2xl font-bold tracking-tight">{car.modelName}</h2>
              </div>
              {/* ── 데스크톱: 로고 위 + 모델명 아래 (기존) ── */}
              <div className="hidden md:block">
                {car.brand && (
                  (() => {
                    const getDetailLogoSize = (slug: string) => {
                      if (slug === 'renault-korea') return 'h-8';
                      if (['audi', 'honda'].includes(slug)) return 'h-[52px]';
                      if (['lexus', 'ford', 'cadillac', 'mercedes-benz'].includes(slug)) return 'h-12';
                      return 'h-10';
                    };
                    return (
                      <img 
                        src={`/images/brands/${car.brand.slug}.${['polestar', 'jaguar', 'lincoln'].includes(car.brand.slug) ? 'webp' : ['audi', 'cadillac', 'ford', 'honda', 'mercedes-benz', 'porsche'].includes(car.brand.slug) ? 'png' : 'svg'}`} 
                        alt={car.brand.name} 
                        className={`${getDetailLogoSize(car.brand.slug)} mb-3 object-contain`} 
                      />
                    );
                  })()
                )}
                {!car.brand && <p className="text-sm font-bold text-gray-400 mb-1">차량 정보 없음</p>}
                <h2 className="text-2xl lg:text-3xl font-bold mb-4">{car.modelName}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-0 lg:px-8 pt-4 lg:pt-8 flex flex-col lg:flex-row gap-6">
        
        {/* ─────────────────────────────────────────
            LEFT COLUMN (Steps 01, 02, 03)
            ───────────────────────────────────────── */}
        <div className="w-full lg:w-[60%] space-y-4">
          
          {/* STEP 01 차량선택 */}
          <div className="bg-white">
            <div className="px-5 py-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="text-[#469BD9]">01</span> 차량선택
              </h2>
            </div>
            
            <div className="p-5 space-y-8">
              {/* 세부모델 */}
              <div>
                <h3 className="text-sm font-bold mb-3">세부모델</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {grades.map((g: any, index: number) => (
                    <button
                      key={`${g.idx}-${index}`}
                      onClick={() => setSelectedGradeIdx(g.idx)}
                      className={`text-left px-4 py-3 border rounded-sm text-[13px] font-medium transition-colors ${
                        selectedGradeIdx === g.idx 
                        ? "border-[#469BD9] bg-[#f0f7ff] text-[#469BD9]" 
                        : "border-[#e5e5e5] text-[#555] hover:bg-gray-50"
                      }`}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 트림 */}
              {selectedGrade && selectedGrade.trims?.length > 0 && (
                <div>
                  <div className="border border-[#e5e5e5] rounded-sm divide-y divide-[#e5e5e5]">
                    {selectedGrade.trims.map((t: any, index: number) => {
                      const isSelected = selectedTrimIdx === t.idx;
                      return (
                        <label 
                          key={`${t.idx}-${index}`}
                          onClick={() => setSelectedTrimIdx(t.idx)}
                          className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                            isSelected ? "bg-[#f0f7ff]" : "hover:bg-gray-50 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected ? "border-[#469BD9]" : "border-[#ccc]"
                            }`}>
                              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#469BD9]" />}
                            </div>
                            <span className={`text-[14px] ${isSelected ? "font-bold text-[#469BD9]" : "font-medium text-[#333]"}`}>
                              {t.name}
                            </span>
                          </div>
                          <span className={`text-[14px] font-bold ${isSelected ? "text-[#469BD9]" : "text-[#333]"}`}>
                            {formatPriceWon(Number(t.price))}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 외장 색상 */}
              {selectedTrim && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold mb-3 flex items-center justify-between">
                    <span>외장 색상</span>
                    <span className="text-[#469BD9] font-bold text-[12px]">
                      {selectedExtColorData ? `(${formatPriceWon(Number(selectedExtColorData.price) || 0)})` : "(0원)"}
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedTrim.colorsExt?.map((color: any, index: number) => {
                      const isSelected = selectedExtColor === color.idx;
                      
                      let bgStyle = "";
                      const detail = color.detail || [];
                      if (Array.isArray(detail) && detail.length >= 2 && detail[0] !== detail[1]) {
                        bgStyle = `linear-gradient(135deg, ${detail[0]} 50%, ${detail[1]} 50%)`;
                      } else {
                        const thumb = color.thumb || "#ffffff";
                        bgStyle = (thumb.startsWith("#") || thumb.startsWith("rgb")) 
                          ? thumb 
                          : `url('${thumb}') center/cover no-repeat`;
                      }

                      return (
                        <button
                          key={`ext-${color.idx}-${index}`}
                          onClick={() => setSelectedExtColor(color.idx)}
                          className={`w-[44px] h-[44px] rounded-full relative transition-all shadow-sm overflow-hidden ${
                            isSelected 
                              ? "border-[2px] border-[#469BD9] scale-110 z-10" 
                              : "border border-[#e0e0e0] hover:border-gray-400"
                          }`}
                          style={{ 
                            background: bgStyle,
                            boxShadow: isSelected ? "inset 0 0 0 2px #ffffff" : undefined
                          }}
                          title={color.title}
                        />
                      );
                    })}
                    {(!selectedTrim.colorsExt || selectedTrim.colorsExt.length === 0) && (
                      <div className="text-[13px] text-gray-400 py-2">외장 색상 정보가 없습니다.</div>
                    )}
                  </div>
                  {selectedExtColorData && (
                    <p className="text-[14px] text-[#333] font-semibold mt-3">{selectedExtColorData.title}</p>
                  )}
                </div>
              )}

              {/* 내장 색상 */}
              {selectedTrim && (
                <div>
                  <h3 className="text-sm font-bold mb-3 flex items-center justify-between">
                    <span>내장 색상</span>
                    <span className="text-[#469BD9] font-bold text-[12px]">
                      {selectedIntColorData ? `(${formatPriceWon(Number(selectedIntColorData.price) || 0)})` : "(0원)"}
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedTrim.colorsInt?.map((color: any, index: number) => {
                      const isSelected = selectedIntColor === color.idx;
                      
                      // 배경 스타일 결정 로직 (투톤 그라데이션 대응)
                      let bgStyle = "";
                      const detail = color.detail || [];
                      if (Array.isArray(detail) && detail.length >= 2 && detail[0] !== detail[1]) {
                        bgStyle = `linear-gradient(135deg, ${detail[0]} 50%, ${detail[1]} 50%)`;
                      } else {
                        const thumb = color.thumb || "#ffffff";
                        bgStyle = (thumb.startsWith("#") || thumb.startsWith("rgb")) 
                          ? thumb 
                          : `url('${thumb}') center/cover no-repeat`;
                      }

                      return (
                        <button
                          key={`int-${color.idx}-${index}`}
                          onClick={() => setSelectedIntColor(color.idx)}
                          className={`w-[44px] h-[44px] rounded-full relative transition-all shadow-sm overflow-hidden ${
                            isSelected 
                              ? "border-[2px] border-[#469BD9] scale-110 z-10" 
                              : "border border-[#e0e0e0] hover:border-gray-400"
                          }`}
                          style={{ 
                            background: bgStyle,
                            boxShadow: isSelected ? "inset 0 0 0 2px #ffffff" : undefined
                          }}
                          title={color.title}
                        />
                      );
                    })}
                    {(!selectedTrim.colorsInt || selectedTrim.colorsInt.length === 0) && (
                      <div className="text-[13px] text-gray-400 py-2">내장 색상 정보가 없습니다.</div>
                    )}
                  </div>
                  {selectedIntColorData && (
                    <p className="text-[14px] text-[#333] font-semibold mt-3">{selectedIntColorData.title}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* STEP 02 옵션 */}
          <div className="bg-white">
            <div className="px-5 py-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="text-[#469BD9]">02</span> 옵션 <span className="text-[13px] font-normal text-gray-500 ml-1">(중복 선택 가능)</span>
              </h2>
            </div>
            <div className="p-0">
              {selectedTrim?.options && selectedTrim.options.length > 0 ? (
                <div className="divide-y divide-[#e5e5e5]">
                  {selectedTrim.options.map((opt: any, index: number) => {
                    const isSelected = !!selectedOptions[opt.idx];
                    return (
                      <label 
                        key={`opt-${opt.idx}-${index}`}
                        className={`flex items-center justify-between p-5 cursor-pointer transition-colors ${
                          isSelected ? "bg-[#f0f7ff]" : "hover:bg-gray-50 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                            isSelected ? "bg-[#469BD9] border-[#469BD9]" : "bg-white border-[#ccc]"
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
                              onChange={() => setSelectedOptions(prev => ({ ...prev, [opt.idx]: !prev[opt.idx] }))}
                            />
                          </div>
                          <span className={`text-[14px] ${isSelected ? "font-bold text-[#0068B7]" : "font-medium text-[#333]"}`}>
                            {opt.title}
                          </span>
                        </div>
                        <span className={`text-[14px] font-bold ${isSelected ? "text-[#0068B7]" : "text-[#333]"}`}>
                          {formatPriceWon(Number(opt.price))}
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 text-[14px]">선택 가능한 옵션이 없습니다.</div>
              )}
            </div>
          </div>

          <div className="bg-white">
            <div className="px-5 py-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="text-[#469BD9]">03</span> 계약조건
              </h2>
            </div>
            <div className="px-5 pt-3 pb-1">
              <p className="text-[13px] text-[#469BD9]">많이 진행되는 계약 조건이 설정되어 있어요!</p>
            </div>
            <div className="p-5 space-y-6">
              {/* 구입방법 */}
              <div>
                <h3 className="text-[14px] font-bold mb-3">구입방법</h3>
                <div className="grid grid-cols-2 border border-[#e5e5e5] rounded-sm overflow-hidden">
                  {(["RENT","LEASE"] as BuyMethod[]).map(m => (
                    <button key={m} onClick={() => setBuyMethod(m)}
                      className={`py-3 text-[14px] font-bold transition-colors ${buyMethod === m ? "bg-[#469BD9] text-white" : "bg-[#f9f9f9] text-gray-500 hover:bg-gray-100"}`}
                    >{m === "RENT" ? "렌트" : "리스"}</button>
                  ))}
                </div>
              </div>
              {/* 이용기간 */}
              <div>
                <h3 className="text-[14px] font-bold mb-3">이용기간</h3>
                <div className="grid grid-cols-3 border border-[#e5e5e5] rounded-sm overflow-hidden">
                  {(["36","48","60"] as Period[]).map(p => (
                    <button key={p} onClick={() => setPeriod(p)}
                      className={`py-3 text-[14px] font-bold transition-colors ${period === p ? "bg-[#469BD9] text-white" : "bg-[#f9f9f9] text-gray-500 hover:bg-gray-100"}`}
                    >{p}개월</button>
                  ))}
                </div>
              </div>
              {/* 주행거리 */}
              <div>
                <h3 className="text-[14px] font-bold mb-3">주행거리(연간 km)</h3>
                <div className="grid grid-cols-2 border border-[#e5e5e5] rounded-sm overflow-hidden">
                  {(["10000","20000"] as Mileage[]).map(m => (
                    <button key={m} onClick={() => setMileage(m)}
                      className={`py-3 text-[13px] font-bold transition-colors ${mileage === m ? "bg-[#469BD9] text-white" : "bg-[#f9f9f9] text-gray-500 hover:bg-gray-100"}`}
                    >{Number(m)/10000}만</button>
                  ))}
                </div>
              </div>
              {/* 선수금 */}
              <div>
                <h3 className="text-[14px] font-bold mb-3">선수금 ⓘ</h3>
                <div className="grid grid-cols-2 border border-[#e5e5e5] rounded-sm overflow-hidden">
                  {(["0","30"] as Prepay[]).map(p => (
                    <button key={p} onClick={() => {
                        setPrepay(p);
                        if (p !== "0") {
                          setGuarantee("0");
                          setDeposit("PREPAY_30");
                        } else {
                          setDeposit(guarantee !== "0" ? "DEPOSIT_30" : "NO_DEPOSIT");
                        }
                      }}
                      className={`py-3 text-[13px] font-bold transition-colors ${prepay === p ? "bg-[#469BD9] text-white" : "bg-[#f9f9f9] text-gray-500 hover:bg-gray-100"}`}
                    >{p}%</button>
                  ))}
                </div>
              </div>
              {/* 보증금 */}
              <div>
                <h3 className="text-[14px] font-bold mb-3">보증금 ⓘ</h3>
                <div className="grid grid-cols-2 border border-[#e5e5e5] rounded-sm overflow-hidden">
                  {(["0","30"] as Guarantee[]).map(g => (
                    <button key={g} onClick={() => {
                        setGuarantee(g);
                        if (g !== "0") {
                          setPrepay("0");
                          setDeposit("DEPOSIT_30");
                        } else {
                          setDeposit(prepay !== "0" ? "PREPAY_30" : "NO_DEPOSIT");
                        }
                      }}
                      className={`py-3 text-[13px] font-bold transition-colors ${guarantee === g ? "bg-[#469BD9] text-white" : "bg-[#f9f9f9] text-gray-500 hover:bg-gray-100"}`}
                    >{g}%</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────
            RIGHT COLUMN (Sticky Summary & Form)
            ───────────────────────────────────────── */}
        <div className="w-full lg:w-[40%] relative">
          <div className="lg:sticky lg:top-20 space-y-4">
            
            {/* 스텝 인디케이터 */}
            <div className="bg-white lg:rounded-md overflow-hidden border-b border-[#e5e5e5]">
              <div className="flex">
                <div className="flex-1 py-3 text-center text-[12px] font-bold text-gray-400">01 차량 선택</div>
                <div className="flex-1 py-3 text-center text-[12px] font-bold text-gray-400">02 옵션</div>
                <div className="flex-1 py-3 text-center text-[12px] font-bold text-[#469BD9]">03 계약조건</div>
              </div>
            </div>

            {/* 요약 박스 */}
            <div className="bg-white">
              <div className="p-5">
                {/* 모델 정보 */}
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[13px] text-[#888]">모델</span>
                  </div>
                  <p className="text-[14px] font-bold text-[#333] leading-snug">
                    {car.brand?.name} {car.modelName} {selectedGrade?.name} {selectedTrim?.name}
                  </p>
                </div>

                {/* 색상 */}
                <div className="p-0 space-y-3 mb-4 pt-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[13px] text-[#888]">색상</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-[#555]">외장</span>
                    <span className="text-[13px] text-[#469BD9] font-bold">(+{(Number(selectedExtColorData?.price) || 0).toLocaleString()})</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-[#555]">내장</span>
                    <span className="text-[13px] text-[#469BD9] font-bold">(+{(Number(selectedIntColorData?.price) || 0).toLocaleString()})</span>
                  </div>
                </div>

                {/* 선택된 옵션 */}
                <div className="mb-4">
                  {Object.values(selectedOptions).filter(Boolean).length > 0 ? (
                    <div className="space-y-1">
                      {selectedTrim?.options?.filter((opt: any) => selectedOptions[opt.idx]).map((opt: any, i: number) => (
                        <div key={i} className="flex justify-between text-[13px]">
                          <span className="text-[#555]">{opt.title}</span>
                          <span className="font-medium">{formatPriceWon(Number(opt.price))}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[13px] text-gray-400">선택된 옵션이 없습니다.</p>
                  )}
                </div>

                <div className="my-4" />

                {/* 구입방법 */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[13px] text-[#888]">구입방법</span>
                  <span className="text-[14px] font-bold text-[#333]">{buyMethod === "RENT" ? "렌트" : "리스"}</span>
                </div>

                {/* 하이카즈 혜택 */}
                <div className="mb-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-[15px] font-bold text-[#333]">월 {buyMethod === "RENT" ? "렌트료" : "리스료"}</span>
                    <div className="text-right">
                      <span className="text-[26px] font-extrabold text-[#469BD9]">
                        {monthlyPrice.toLocaleString()} <span className="text-[18px]">원</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[14px] mb-2">
                    <span className="text-gray-500">차량 기본가</span>
                    <span className="font-medium">{finalCarPrice.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between items-center text-[14px] mb-4">
                    <span className="text-gray-500">혜택 적용가</span>
                    <span className="font-medium text-[#e74c3c]">{discountPrice.toLocaleString()}원 (-2.5%)</span>
                  </div>
                  {car.fuelType === "EV" && (
                    <div className="text-right mb-2">
                      <p className="text-[10px] text-gray-400 font-medium">* 국가 및 지자체 전기차 보조금이 반영된 월 대여료입니다.</p>
                    </div>
                  )}
                </div>

                {/* 안내 메시지 */}
                <div className="text-center mb-4 py-3 bg-[#f9f9f9] rounded-sm">
                  <p className="text-[13px] text-[#e74c3c] font-bold leading-relaxed">
                    고객님! 견적 상담을 통해<br/>정확한 차량 견적을 받아보세요!
                  </p>
                </div>



                {/* 쉽고 빠른 견적 문의 */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <h4 className="text-[14px] font-bold pb-2 mb-3">쉽고 빠른 견적 문의</h4>
                  <h5 className="text-[13px] font-bold text-[#555] mb-2">간편 견적 문의</h5>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="이름"
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      className="w-1/3 px-3 py-2.5 border border-[#ccc] rounded-sm text-[13px] focus:outline-none focus:border-[#469BD9]"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="휴대폰 번호 (- 없이 입력)"
                      value={form.phone}
                      onChange={e => setForm({...form, phone: e.target.value})}
                      className="w-2/3 px-3 py-2.5 border border-[#ccc] rounded-sm text-[13px] focus:outline-none focus:border-[#469BD9]"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 mt-4 border border-[#e5e5e5] p-3 rounded-sm bg-[#f9f9f9]">
                    <label className="flex items-center gap-2 text-[12px] font-bold cursor-pointer pb-2 border-b border-[#e5e5e5] mb-2">
                      <input 
                        type="checkbox" 
                        checked={form.consent1 && form.consent2 && form.consent3}
                        onChange={e => setForm({ ...form, consent1: e.target.checked, consent2: e.target.checked, consent3: e.target.checked })}
                        className="w-4 h-4 accent-[#469BD9]" 
                      />
                      전체 동의
                    </label>
                    <label className="flex items-center gap-2 text-[11px] text-gray-600 cursor-pointer">
                      <input type="checkbox" checked={form.consent1} onChange={e => setForm({...form, consent1: e.target.checked})} className="w-3.5 h-3.5 accent-[#469BD9]" />
                      (필수) 개인정보 수집 및 활용동의 [보기]
                    </label>
                    <label className="flex items-center gap-2 text-[11px] text-gray-600 cursor-pointer">
                      <input type="checkbox" checked={form.consent2} onChange={e => setForm({...form, consent2: e.target.checked})} className="w-3.5 h-3.5 accent-[#469BD9]" />
                      (필수) 개인정보 제3자 제공 동의 [보기]
                    </label>
                    <label className="flex items-center gap-2 text-[11px] text-gray-600 cursor-pointer">
                      <input type="checkbox" checked={form.consent3} onChange={e => setForm({...form, consent3: e.target.checked})} className="w-3.5 h-3.5 accent-[#469BD9]" />
                      (선택) 마케팅 활용동의 [보기]
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-[#469BD9] hover:bg-[#3a8dc7] text-white font-bold text-[16px] rounded-sm transition-colors mt-2"
                  >
                    {submitting ? "전송 중..." : "견적 문의하기"}
                  </button>
                </form>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────
          MOBILE BOTTOM STICKY BAR
          ───────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e5e5] p-3 flex items-center justify-between z-50 lg:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div>
          <p className="text-[10px] text-gray-500 mb-0.5">월 {buyMethod === "RENT" ? "렌트" : "리스"}료</p>
          {(car.slug === 'kia-carnival-heritage' || car.modelName?.includes('카니발 헤리티지')) ? (
            <p className="text-[18px] font-black">상담신청필요</p>
          ) : (
            <p className="text-[18px] font-black">{monthlyPrice.toLocaleString()}<span className="text-[12px] font-medium text-gray-500 ml-0.5">원</span></p>
          )}
        </div>
        <button
          onClick={() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          }}
          className="bg-[#469BD9] text-white px-6 py-2.5 rounded-sm font-bold text-[13px]"
        >
          간편 견적 문의
        </button>
      </div>

    </div>
  );
}
