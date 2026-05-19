import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { revalidatePath } from "next/cache";
import DetailDeleteButton from "./DetailDeleteButton";
import { Edit2, ChevronLeft, Save, Trash2 } from "lucide-react";
import { formatContactMethod, formatAvailableTime } from "@/lib/utils";

export default async function AdminQuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const quote = await prisma.quoteRequest.findUnique({
    where: { id },
  });

  if (!quote) {
    redirect("/admin");
  }

  const config = quote.carConfig as any;
  let carInfo: any = null;
  if (config && config.carName) {
    carInfo = await prisma.car.findFirst({
      where: { modelName: config.carName },
      include: { brand: true }
    });
  }

  async function updateQuote(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const status = formData.get("status") as string;
    const message = formData.get("message") as string;
    const carOfInterest = formData.get("carOfInterest") as string;

    await prisma.quoteRequest.update({
      where: { id },
      data: { name, phone, status, message, carOfInterest },
    });
    
    revalidatePath(`/admin/${id}`);
    revalidatePath(`/admin`);
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10">
      <div className="max-w-[900px] mx-auto">
        <form action={updateQuote}>
          {/* 상단 헤더 섹션 */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Link href="/admin" className="hover:text-slate-600 flex items-center transition-colors">
                  <ChevronLeft size={16} />
                  <span className="text-sm font-medium">상담 목록</span>
                </Link>
                <span className="text-xs">/</span>
                <span className="text-xs font-mono">{quote.id}</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">상담 신청 상세 정보</h1>
            </div>
            <div className="flex gap-3">
              <button 
                type="submit"
                className="flex items-center gap-2 bg-[#0a2540] hover:bg-[#143a66] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-900/10 transition-all active:scale-95"
              >
                <Save size={18} />
                변경사항 전체 저장
              </button>
            </div>
          </div>

          <div className="space-y-8">
            
            {/* 1. 고객 기본 정보 (표 형태) */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h2 className="text-[15px] font-bold text-slate-800">고객 기본 정보</h2>
                <span className={`px-3 py-1 rounded-full text-[11px] font-black tracking-widest uppercase ${
                  quote.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                  quote.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                  "bg-slate-100 text-slate-600"
                }`}>
                  {quote.status}
                </span>
              </div>
              
              <div className="divide-y divide-slate-100">
                {/* 이름 행 */}
                <div className="flex flex-col md:flex-row min-h-[64px]">
                  <div className="md:w-48 bg-slate-50/30 px-8 py-5 flex items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">신청자명</span>
                  </div>
                  <div className="flex-1 px-8 py-3 flex items-center group relative">
                    <input 
                      name="name"
                      defaultValue={quote.name}
                      className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded px-2 py-1 -ml-2"
                    />
                    <Edit2 size={14} className="absolute right-6 text-slate-300 group-hover:text-blue-500 transition-colors pointer-events-none" />
                  </div>
                </div>

                {/* 연락처 행 */}
                <div className="flex flex-col md:flex-row min-h-[64px]">
                  <div className="md:w-48 bg-slate-50/30 px-8 py-5 flex items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">연락처</span>
                  </div>
                  <div className="flex-1 px-8 py-3 flex items-center group relative">
                    <input 
                      name="phone"
                      defaultValue={quote.phone}
                      className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded px-2 py-1 -ml-2"
                    />
                    <Edit2 size={14} className="absolute right-6 text-slate-300 group-hover:text-blue-500 transition-colors pointer-events-none" />
                  </div>
                </div>

                {/* 연락 방법 행 */}
                <div className="flex flex-col md:flex-row min-h-[64px]">
                  <div className="md:w-48 bg-slate-50/30 px-8 py-5 flex items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">연락 방법</span>
                  </div>
                  <div className="flex-1 px-8 py-5 flex items-center">
                    <span className="text-sm font-bold text-slate-900">
                      {formatContactMethod(quote.contactMethod)}
                    </span>
                  </div>
                </div>

                {/* 상담 가능 시간 행 */}
                <div className="flex flex-col md:flex-row min-h-[64px]">
                  <div className="md:w-48 bg-slate-50/30 px-8 py-5 flex items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">상담 가능 시간</span>
                  </div>
                  <div className="flex-1 px-8 py-5 flex items-center">
                    <span className="text-sm font-bold text-slate-900">
                      {formatAvailableTime(quote.availableTime)}
                    </span>
                  </div>
                </div>

                {/* 상담 상태 행 */}
                <div className="flex flex-col md:flex-row min-h-[64px]">
                  <div className="md:w-48 bg-slate-50/30 px-8 py-5 flex items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">상담 진행 상태</span>
                  </div>
                  <div className="flex-1 px-8 py-3 flex items-center group relative">
                    <select 
                      name="status" 
                      defaultValue={quote.status}
                      className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded px-2 py-1 -ml-2 appearance-none cursor-pointer"
                    >
                      <option value="NEW">신규접수 (NEW)</option>
                      <option value="PENDING">상담대기 (PENDING)</option>
                      <option value="COMPLETED">상담완료 (COMPLETED)</option>
                    </select>
                    <Edit2 size={14} className="absolute right-6 text-slate-300 group-hover:text-blue-500 transition-colors pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. 희망차량 사양 정보 (표 형태) */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h2 className="text-[15px] font-bold text-slate-800">희망차량 및 사양</h2>
              </div>
              
              {config ? (
                <div className="divide-y divide-slate-100">
                  {/* 차량명 행 */}
                  <div className="flex flex-col md:flex-row min-h-[80px]">
                    <div className="md:w-48 bg-slate-50/30 px-8 py-5 flex items-center">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">선택 차량</span>
                    </div>
                    <div className="flex-1 px-8 py-5 flex items-center gap-4">
                      {config.thumbnailUrl && <img src={config.thumbnailUrl} className="w-16 h-10 object-contain bg-slate-50 rounded-lg p-1" />}
                      <div>
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter leading-none mb-1">{config.brandName}</p>
                        <h3 className="text-base font-black text-slate-900">{config.carName}</h3>
                      </div>
                    </div>
                  </div>

                  {/* 세부 사양 테이블 섹션 */}
                  {[
                    { label: "트림", value: config.trim },
                    { label: "외장 색상", value: config.exteriorColor?.name, hex: config.exteriorColor?.detail?.[0] },
                    { label: "내장 색상", value: config.interiorColor?.name, hex: config.interiorColor?.detail?.[0] },
                    { label: "선택 옵션", value: config.options && config.options.length > 0 ? config.options.join(", ") : "없음" },
                    { label: "계약 형태", value: config.contract?.type === 'RENT' ? '장기렌트' : '리스' },
                    { label: "기간/주행거리", value: `${config.contract?.months}개월 / 연 ${config.contract?.mileage?.toLocaleString()}km` },
                    { label: "선수금/보증금", value: `${config.contract?.deposit}%` },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col md:flex-row min-h-[60px]">
                      <div className="md:w-48 bg-slate-50/30 px-8 py-4 flex items-center">
                        <span className="text-xs font-bold text-slate-500 tracking-wider">{item.label}</span>
                      </div>
                      <div className="flex-1 px-8 py-4 flex items-center gap-3">
                        {item.hex && <span className="w-3.5 h-3.5 rounded-full border border-slate-200 shadow-inner" style={{ backgroundColor: item.hex }} />}
                        <span className="text-sm font-bold text-slate-900">{item.value || "-"}</span>
                      </div>
                    </div>
                  ))}

                  {/* 텍스트 요약 편집 (원본 데이터 보존을 위해 유지) */}
                  <div className="flex flex-col">
                    <div className="bg-slate-50/30 px-8 py-4 flex items-center border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">희망차량 텍스트 요약 (편집 가능)</span>
                    </div>
                    <div className="px-8 py-4 group relative">
                      <textarea 
                        name="carOfInterest"
                        defaultValue={quote.carOfInterest || ""}
                        rows={5}
                        className="w-full bg-slate-50/50 text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-xl p-4 border border-slate-100"
                      />
                      <Edit2 size={14} className="absolute top-8 right-12 text-slate-300 group-hover:text-blue-500 transition-colors pointer-events-none" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8">
                  <textarea 
                    name="carOfInterest"
                    defaultValue={quote.carOfInterest || ""}
                    rows={6}
                    className="w-full bg-slate-50/50 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-2xl p-6 border border-slate-200/50"
                  />
                </div>
              )}
            </div>

            {/* 3. 관리자 메모 (표 형태) */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-[15px] font-bold text-slate-800">관리자 메모 및 요청사항</h2>
              </div>
              <div className="p-6 group relative">
                <textarea 
                  name="message"
                  defaultValue={quote.message || ""}
                  placeholder="상담 과정에서의 특이사항이나 고객 요청을 기록하세요..."
                  className="w-full bg-slate-50/50 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-2xl p-6 border border-slate-200/50 min-h-[160px]"
                />
                <Edit2 size={14} className="absolute top-12 right-12 text-slate-300 group-hover:text-blue-500 transition-colors pointer-events-none" />
              </div>
            </div>

            {/* 하단 위험 영역 섹션 */}
            <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-200 px-2">
              <div className="text-center md:text-left">
                <p className="text-xs text-slate-400 font-medium">상담 신청일: {format(new Date(quote.createdAt), "yyyy년 MM월 dd일 HH:mm", { locale: ko })}</p>
                <p className="text-[10px] text-slate-300 mt-0.5">유입 소스: {quote.source || "Unknown"}</p>
              </div>
              <div className="w-full md:w-auto">
                <DetailDeleteButton id={quote.id} />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
