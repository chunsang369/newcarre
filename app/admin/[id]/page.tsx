import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { revalidatePath } from "next/cache";

export default async function AdminQuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const quote = await prisma.quoteRequest.findUnique({
    where: { id },
  });

  if (!quote) {
    redirect("/admin");
  }

  // Server Action to update status
  async function updateStatus(formData: FormData) {
    "use server";
    const newStatus = formData.get("status") as string;
    if (newStatus) {
      await prisma.quoteRequest.update({
        where: { id },
        data: { status: newStatus },
      });
      revalidatePath(`/admin/${id}`);
      revalidatePath(`/admin`);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[800px] mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">상담 신청 상세</h1>
          <Link href="/admin" className="text-gray-500 hover:text-gray-900 transition-colors bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium">
            목록으로 돌아가기
          </Link>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">신청자명</h3>
              <p className="text-lg font-medium text-gray-900">{quote.name}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">연락처</h3>
              <p className="text-lg font-medium text-gray-900">{quote.phone}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">희망차량</h3>
              <p className="text-lg font-medium text-[#0a2540]">{quote.carOfInterest || "미지정"}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">상담 상태</h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                quote.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                quote.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                "bg-blue-100 text-blue-800"
              }`}>
                {quote.status === "PENDING" ? "대기중" : quote.status === "COMPLETED" ? "상담완료" : quote.status}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">선호 연락방법</h3>
              <p className="text-gray-900">{quote.contactMethod || "미지정"}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">통화 가능 시간</h3>
              <p className="text-gray-900">{quote.availableTime || "언제든 가능"}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">개인정보 동의</h3>
              <p className="text-gray-900">{quote.consentPrivacy ? "동의함" : "미동의"}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">신청일시</h3>
              <p className="text-gray-900">{format(new Date(quote.createdAt), "yyyy년 MM월 dd일 HH:mm", { locale: ko })}</p>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">문의/요청사항</h3>
              <div className="bg-gray-50 p-4 rounded-lg text-gray-800 whitespace-pre-wrap min-h-[100px] border border-gray-100">
                {quote.message || "남기신 메모가 없습니다."}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">상태 변경</h2>
          <form action={updateStatus} className="flex gap-3">
            <select 
              name="status" 
              defaultValue={quote.status}
              className="flex-1 max-w-[200px] border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0a2540] focus:border-transparent"
            >
              <option value="NEW">신규접수 (NEW)</option>
              <option value="PENDING">상담대기 (PENDING)</option>
              <option value="COMPLETED">상담완료 (COMPLETED)</option>
            </select>
            <button 
              type="submit"
              className="bg-[#0a2540] hover:bg-[#143a66] text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              저장
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
