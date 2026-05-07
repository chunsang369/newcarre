import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { revalidatePath } from "next/cache";
import DetailDeleteButton from "./DetailDeleteButton";

export default async function AdminQuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const quote = await prisma.quoteRequest.findUnique({
    where: { id },
  });

  if (!quote) {
    redirect("/admin");
  }

  // carConfig가 있는 경우 관련 차량 정보를 가져와서 색상 hex값을 찾음
  let carInfo: any = null;
  const config = quote.carConfig as any;
  
  if (config && config.carName) {
    carInfo = await prisma.car.findFirst({
      where: { modelName: config.carName },
      include: { brand: true }
    });
  }

  // Server Action to update everything
  async function updateQuote(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const status = formData.get("status") as string;
    const message = formData.get("message") as string;
    const carOfInterest = formData.get("carOfInterest") as string;

    await prisma.quoteRequest.update({
      where: { id },
      data: { 
        name, 
        phone, 
        status, 
        message, 
        carOfInterest 
      },
    });
    
    revalidatePath(`/admin/${id}`);
    revalidatePath(`/admin`);
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-6 lg:p-10">
      <div className="max-w-[1000px] mx-auto">
        <form action={updateQuote}>
          {/* 헤더 */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">상담 신청 상세/수정</h1>
              <p className="text-sm text-gray-500">ID: {quote.id}</p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900 transition-all bg-white border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm">
                ← 목록으로
              </Link>
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95"
              >
                변경사항 저장
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 좌측: 정보 수정 섹션 */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 기본 정보 수정 카드 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                  <h2 className="text-sm font-bold text-gray-700">고객 정보 수정</h2>
                </div>
                <div className="p-6 grid grid-cols-2 gap-6">
                  <div className="col-span-1">
                    <label className="text-[12px] text-gray-400 block mb-1">신청자명</label>
                    <input 
                      name="name"
                      defaultValue={quote.name}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-[12px] text-gray-400 block mb-1">연락처</label>
                    <input 
                      name="phone"
                      defaultValue={quote.phone}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[12px] text-gray-400 block mb-1">희망차량 (텍스트 요약)</label>
                    <textarea 
                      name="carOfInterest"
                      defaultValue={quote.carOfInterest || ""}
                      rows={4}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 구조화 데이터 카드 (읽기 전용 추천) */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden opacity-90">
                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-gray-700">희망차량 구조화 정보 (참고용)</h2>
                </div>
                <div className="p-6">
                  {config ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 pb-4 border-b border-gray-50">
                        {config.thumbnailUrl && <img src={config.thumbnailUrl} className="w-16 h-10 object-contain" />}
                        <div>
                          <p className="text-[10px] text-blue-600 font-bold">{config.brandName}</p>
                          <h3 className="text-md font-bold text-gray-900">{config.carName}</h3>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-[13px]">
                        <div className="flex justify-between">
                          <span className="text-gray-400">트림</span>
                          <span className="font-bold">{config.trim}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">외장</span>
                          <span className="font-bold">{config.exteriorColor?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">계약</span>
                          <span className="font-bold">{config.contract?.type === 'RENT' ? '렌트' : '리스'} / {config.contract?.months}개월</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">구조화된 정보가 없습니다.</p>
                  )}
                </div>
              </div>

              {/* 문의/요청사항 수정 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                  <h2 className="text-sm font-bold text-gray-700">관리자 메모 / 요청사항</h2>
                </div>
                <div className="p-6">
                  <textarea 
                    name="message"
                    defaultValue={quote.message || ""}
                    placeholder="상담 메모를 입력하세요..."
                    className="w-full border border-gray-200 rounded-xl p-4 text-[14px] min-h-[150px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 우측: 상태 및 위험 관리 */}
            <div className="space-y-6">
              {/* 상태 변경 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-sm font-bold text-gray-700 mb-4">상담 진행 상태</h2>
                <select 
                  name="status" 
                  defaultValue={quote.status}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-[14px] font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="NEW">🆕 신규접수 (NEW)</option>
                  <option value="PENDING">⏳ 상담대기 (PENDING)</option>
                  <option value="COMPLETED">✅ 상담완료 (COMPLETED)</option>
                </select>
              </div>

              {/* 메타 정보 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">신청 일시</label>
                  <p className="text-[13px] font-semibold text-gray-700">{format(new Date(quote.createdAt), "yyyy. MM. dd HH:mm", { locale: ko })}</p>
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">유입 경로</label>
                  <p className="text-[13px] font-semibold text-gray-700">{quote.source || "직접 유입"}</p>
                </div>
              </div>

              {/* 데이터 삭제 (위험 구역) */}
              <div className="bg-red-50 rounded-2xl border border-red-100 p-6">
                <h2 className="text-sm font-bold text-red-700 mb-2">위험 구역</h2>
                <p className="text-[12px] text-red-500 mb-4">데이터를 삭제하면 복구할 수 없습니다.</p>
                <DetailDeleteButton id={quote.id} />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
