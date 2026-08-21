"use client";

import { useState, useEffect } from "react";

interface Trim {
  idx: string;
  name: string;
  price: number;
  rentOffset?: number;
  leaseOffset?: number;
}

interface Grade {
  idx: string;
  name: string;
  trims: Trim[];
}

interface Car {
  id: string;
  modelName: string;
  trimName: string;
  basePrice: number;
  options: any; // grades 등이 포함된 JSON 객체
}

interface PricingDetailModalProps {
  car: Car;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function PricingDetailModal({
  car,
  isOpen,
  onClose,
  onSave,
}: PricingDetailModalProps) {
  const [localGrades, setLocalGrades] = useState<Grade[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && car.options) {
      const options = typeof car.options === "string" 
        ? JSON.parse(car.options) 
        : car.options;
      
      const grades = options?.grades || [];
      // grades 딥카피하여 상태로 관리
      const clonedGrades = JSON.parse(JSON.stringify(grades)) as Grade[];
      
      // 혹시라도 각 trim에 rentOffset, leaseOffset이 없으면 0으로 초기화
      clonedGrades.forEach(g => {
        if (g.trims) {
          g.trims.forEach(t => {
            if (t.rentOffset === undefined) t.rentOffset = 0;
            if (t.leaseOffset === undefined) t.leaseOffset = 0;
          });
        }
      });
      setLocalGrades(clonedGrades);
    }
  }, [isOpen, car]);

  if (!isOpen) return null;

  const handleOffsetChange = (
    gradeIdx: string,
    trimIdx: string,
    type: "rentOffset" | "leaseOffset",
    value: string
  ) => {
    // 음수 부호(-)와 숫자만 허용
    const isNegative = value.startsWith("-");
    const cleaned = value.replace(/[^0-9]/g, "");
    let numericValue = parseInt(cleaned, 10) || 0;
    if (isNegative) numericValue = -numericValue;

    setLocalGrades((prev) =>
      prev.map((g) => {
        if (g.idx !== gradeIdx) return g;
        return {
          ...g,
          trims: g.trims.map((t) => {
            if (t.idx !== trimIdx) return t;
            return {
              ...t,
              [type]: numericValue,
            };
          }),
        };
      })
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // car.options 파싱
      const currentOptions = typeof car.options === "string"
        ? JSON.parse(car.options)
        : car.options;
      
      // 로컬 변경사항 덮어쓰기
      const newOptions = {
        ...currentOptions,
        grades: localGrades,
      };

      const res = await fetch(`/api/admin/cars/${car.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          options: newOptions,
        }),
      });

      if (res.ok) {
        alert("트림별 가격 세부 조정 오프셋이 성공적으로 저장되었습니다.");
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
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{car.modelName} 트림별 세부 가격 오프셋 설정</h2>
            <p className="text-xs text-slate-500 mt-1">기준 가격: {car.basePrice?.toLocaleString()}원 (원가에 가감할 월 요금을 입력하세요. 예: -20000, 15000)</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          {localGrades.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">트림 정보가 존재하지 않습니다.</div>
          ) : (
            localGrades.map((grade) => (
              <div key={grade.idx} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  {grade.name}
                </h3>
                
                <div className="space-y-4 divide-y divide-slate-100">
                  {grade.trims?.map((trim) => (
                    <div key={trim.idx} className="pt-4 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{trim.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">차량 가격: {Number(trim.price)?.toLocaleString()}원</div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4">
                        {/* Rent Offset */}
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-emerald-600 w-16 shrink-0">렌트 조정액</label>
                          <div className="relative w-36">
                            <input
                              type="text"
                              value={trim.rentOffset !== undefined ? trim.rentOffset.toString() : "0"}
                              onChange={(e) => handleOffsetChange(grade.idx, trim.idx, "rentOffset", e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-right pr-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">원</span>
                          </div>
                        </div>

                        {/* Lease Offset */}
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-violet-600 w-16 shrink-0">리스 조정액</label>
                          <div className="relative w-36">
                            <input
                              type="text"
                              value={trim.leaseOffset !== undefined ? trim.leaseOffset.toString() : "0"}
                              onChange={(e) => handleOffsetChange(grade.idx, trim.idx, "leaseOffset", e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-right pr-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">원</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
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
