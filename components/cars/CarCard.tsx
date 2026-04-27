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
}

function formatPrice(num: number): string {
  return num.toLocaleString();
}

export default function CarCard({ car }: { car: CarData }) {
  return (
    <div className="w-full border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-gray-300 hover:shadow-sm transition-all group flex flex-col h-full">
      {/* 이미지 영역 */}
      <div className="aspect-[4/3] bg-[#f8f9fa] flex items-center justify-center p-3 shrink-0 relative overflow-hidden">
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
      </div>

      {/* 정보 영역 */}
      <div className="p-3 lg:p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase">{car.brandName}</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <span className="text-[10px] font-bold text-gray-400 uppercase">{car.category}</span>
        </div>
        
        <h4 className="font-bold text-[14px] lg:text-[15px] text-gray-900 mb-3 line-clamp-1 group-hover:text-[#e74c3c] transition-colors">
          {car.modelName}
        </h4>

        <div className="mt-auto space-y-1.5">
          <div className="flex justify-between items-center text-[12px] lg:text-[13px]">
            <span className="text-gray-500 font-medium">렌트</span>
            <div className="flex items-center gap-1">
              <span className="text-gray-400 text-[10px]">월</span>
              <span className="font-bold text-gray-900">{formatPrice(car.monthlyRent)}원</span>
            </div>
          </div>
          <div className="flex justify-between items-center text-[12px] lg:text-[13px]">
            <span className="text-gray-500 font-medium">리스</span>
            <div className="flex items-center gap-1">
              <span className="text-gray-400 text-[10px]">월</span>
              <span className="font-bold text-gray-900">{formatPrice(car.monthlyLease)}원</span>
            </div>
          </div>
          
          {/* 하단 버튼 영역 */}
          <div className="mt-4 flex gap-1.5 w-full">
            <Link 
              href={`/cars/${car.slug}`}
              className="flex-1 flex items-center justify-center bg-[#1A283A] text-white py-2.5 rounded-md text-[11px] font-bold hover:bg-[#111A26] transition-colors"
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
              className="flex-1 bg-white border border-[#1A283A] text-[#1A283A] py-2.5 rounded-md text-[11px] font-bold hover:bg-gray-50 transition-colors"
            >
              빠른상담
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
