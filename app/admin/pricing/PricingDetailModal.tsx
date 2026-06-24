"use client";

import { useState, useEffect } from "react";

interface Car {
  id: string;
  modelName: string;
  trimName: string;
  priceMatrix: any;
}

interface PricingDetailModalProps {
  car: Car;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const PERIODS = [36, 48, 60] as const;
const MILEAGES = [10000, 20000, 30000] as const;
const PREPAYMENTS = [
  { key: "NO_DEPOSIT", label: "무보증" },
  { key: "DEPOSIT_30", label: "보증금 30%" },
  { key: "PREPAY_30", label: "선수금 30%" },
] as const;

export default function PricingDetailModal({
  car,
  isOpen,
  onClose,
  onSave,
}: PricingDetailModalProps) {
  const [localMatrix, setLocalMatrix] = useState<Record<string, { rent: number; lease: number }>>({});
  const [activePeriod, setActivePeriod] = useState<typeof PERIODS[number]>(36);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && car.priceMatrix) {
      // 얕은 복사를 통해 로컬 매트릭스 상태 초기화
      const matrix = typeof car.priceMatrix === "string" 
        ? JSON.parse(car.priceMatrix) 
        : { ...car.priceMatrix };
      
      // 혹시라도 매트릭스가 비어있거나 누락된 키가 있으면 채워넣음
      const normalized: typeof localMatrix = {};
      PERIODS.forEach(p => {
        PREPAYMENTS.forEach(pre => {
          MILEAGES.forEach(m => {
            const key = `${p}_${pre.key}_${m}`;
            normalized[key] = {
              rent: matrix[key]?.rent ?? 0,
              lease: matrix[key]?.lease ?? 0,
            };
          });
        });
      });
      setLocalMatrix(normalized);
    }
  }, [isOpen, car]);

  if (!isOpen) return null;

  const handlePriceChange = (key: string, type: "rent" | "lease", value: string) => {
    const numericValue = parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
    setLocalMatrix((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [type]: numericValue,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/cars/${car.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceMatrix: localMatrix,
        }),
      });

      if (res.ok) {
        alert("요금 설정이 성공적으로 저장되었습니다.");
        onSave();
        onClose();
      } else {
        let errorMsg = "알 수 없는 오류";
        try {
          const err = await res.json();
          errorMsg = err.error || errorMsg;
        } catch {
          errorMsg = `서버 오류 (상태 코드: ${res.status})`;
        }
        alert(`저장 실패: ${errorMsg}`);
      }
    } catch (e) {
      console.error(e);
      alert("네트워크 통신 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{car.modelName} 세부 요금 설정</h2>
            <p className="text-xs text-slate-500 mt-1">{car.trimName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Period Tabs */}
        <div className="flex border-b border-slate-100 px-6 bg-white shrink-0 gap-6">
          {PERIODS.map((period) => (
            <button
              key={period}
              onClick={() => setActivePeriod(period)}
              className={`py-4 text-sm font-bold border-b-2 transition-all relative ${
                activePeriod === period
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {period}개월 조건
            </button>
          ))}
        </div>

        {/* Content (Scrollable Grid) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
          {PREPAYMENTS.map((prepayment) => (
            <div key={prepayment.key} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                {prepayment.label}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MILEAGES.map((mileage) => {
                  const key = `${activePeriod}_${prepayment.key}_${mileage}`;
                  const values = localMatrix[key] || { rent: 0, lease: 0 };

                  return (
                    <div key={mileage} className="bg-slate-50/60 rounded-xl p-4 border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="text-xs font-bold text-slate-500 mb-3 flex justify-between items-center">
                        <span>연 {mileage.toLocaleString()}km</span>
                        <span className="text-[10px] bg-slate-200/80 px-2 py-0.5 rounded text-slate-600">
                          {activePeriod}개월 | {prepayment.label}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        {/* Rent Input */}
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-emerald-600 w-10 shrink-0">렌트</label>
                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={values.rent.toLocaleString()}
                              onChange={(e) => handlePriceChange(key, "rent", e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-right pr-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">원</span>
                          </div>
                        </div>

                        {/* Lease Input */}
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-violet-600 w-10 shrink-0">리스</label>
                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={values.lease.toLocaleString()}
                              onChange={(e) => handlePriceChange(key, "lease", e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-right pr-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">원</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 shrink-0">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 transition-colors text-sm"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSaving && (
              <svg className="animate-spin -ml-1 mr-1.5 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {isSaving ? "저장 중..." : "저장하기"}
          </button>
        </div>

      </div>
    </div>
  );
}
