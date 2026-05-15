import Link from "next/link";

export interface CarData {
  id: string;
  slug: string;
  brandName: string;
  modelName: string;
  trimName: string;
  year: number;
  category: string;
  fuelType: string;
  monthlyRent: number;
  monthlyLease: number;
  thumbnailUrl: string;
  basePrice: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  SEDAN: "세단",
  SUV: "SUV",
  HATCHBACK: "해치백",
  VAN: "승합",
  TRUCK: "트럭",
  COUPE: "쿠페",
  CONVERTIBLE: "컨버터블",
};

function formatPrice(num: number): string {
  if (!num) return "0";
  return num.toLocaleString();
}

function formatBasePrice(num: number): string {
  if (!num) return "가격 정보 없음";
  const million = Math.floor(num / 10000);
  return `${million.toLocaleString()}만원~`;
}

export default function CarCard({ car }: { car: CarData }) {
  return (
    <div className="w-full border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-gray-300 hover:shadow-sm transition-all group flex flex-col h-full">
      {/* 이미지 영역 */}
      <Link 
        href={`/cars/${car.slug}`}
        className="aspect-[4/3] bg-[#f8f9fa] flex items-center justify-center p-3 shrink-0 relative overflow-hidden block"
      >
        {car.thumbnailUrl ? (
          <img 
            src={car.thumbnailUrl} 
            alt={car.modelName} 
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
            draggable={false}
          />
        ) : (
          <div className="w-[70%] h-auto text-gray-300 flex items-center justify-center">
            <svg viewBox="0 0 200 100" fill="currentColor" className="w-full h-full">
              <ellipse cx="100" cy="80" rx="90" ry="10" opacity="0.2" />
              <path d="M30 65 Q40 30 80 30 L120 30 Q160 30 170 65 L175 70 Q175 78 168 78 L32 78 Q25 78 25 70 Z" opacity="0.3" />
              <circle cx="55" cy="78" r="12" opacity="0.25" />
              <circle cx="145" cy="78" r="12" opacity="0.25" />
            </svg>
          </div>
        )}
        {/* 배지 영역 (필요 시 추가 가능) */}
      </Link>

      {/* 정보 영역 */}
      <div className="p-3 lg:p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3 gap-1">
          <Link href={`/cars/${car.slug}`} className="flex-1 min-w-0">
            <h4 className="font-bold text-[13px] lg:text-[17px] text-gray-900 break-keep group-hover:text-[#469BD9] transition-colors leading-snug">
              {car.modelName}
            </h4>
          </Link>
          <span className="text-[11px] lg:text-[13px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap">
            {formatBasePrice(car.monthlyRent > 0 ? (car as any).basePrice : 0) === "가격 정보 없음" ? "" : formatBasePrice((car as any).basePrice)}
          </span>
        </div>

        <div className="mt-auto space-y-1.5">
          <div className="flex justify-between items-center text-[14px] lg:text-[15px]">
            <span className="text-gray-500 font-medium">렌트</span>
            {car.monthlyRent > 0 ? (
              <div className="flex items-center gap-1">
                <span className="text-gray-400 text-[12px]">월</span>
                <span className="font-bold text-gray-900">{formatPrice(car.monthlyRent)}원</span>
              </div>
            ) : (
              <span className="font-bold text-blue-600">상담 신청 필요</span>
            )}
          </div>
          <div className="flex justify-between items-center text-[14px] lg:text-[15px]">
            <span className="text-gray-500 font-medium">리스</span>
            {car.monthlyLease > 0 ? (
              <div className="flex items-center gap-1">
                <span className="text-gray-400 text-[12px]">월</span>
                <span className="font-bold text-gray-900">{formatPrice(car.monthlyLease)}원</span>
              </div>
            ) : (
              <span className="font-bold text-blue-600">상담 신청 필요</span>
            )}
          </div>
          
          {/* 하단 버튼 영역 */}
          <div className="mt-4 flex gap-1.5 w-full">
            <Link 
              href={`/cars/${car.slug}`}
              className="flex-1 flex items-center justify-center bg-[#469BD9] text-white py-2.5 rounded-md text-[13px] font-bold hover:bg-[#3a8dc7] transition-colors"
            >
              상세보기
            </Link>
            <button 
              onClick={(e) => {
                e.preventDefault();
                const form = document.getElementById("quote-form");
                if (form) {
                  form.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="flex-1 bg-white border border-[#469BD9] text-[#469BD9] py-2.5 rounded-md text-[13px] font-bold hover:bg-gray-50 transition-colors"
            >
              빠른상담
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
