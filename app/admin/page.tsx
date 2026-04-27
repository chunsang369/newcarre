import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default async function AdminDashboardPage() {
  const [leads, totalCars, totalReviews, totalFaq] = await Promise.all([
    prisma.quoteRequest.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.car.count({ where: { isActive: true } }),
    prisma.review.count({ where: { isPublished: true } }),
    prisma.faq.count({ where: { isPublished: true } }),
  ]);

  const pending = leads.filter((l) => l.status === "PENDING").length;
  const completed = leads.filter((l) => l.status === "COMPLETED").length;

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">대시보드</h1>
        <p className="text-slate-500 text-sm mt-1">{format(new Date(), "yyyy년 MM월 dd일 (EEE)", { locale: ko })} 기준</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "대기중 상담", value: pending, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "완료 상담", value: completed, color: "text-green-600", bg: "bg-green-50" },
          { label: "등록 차량", value: totalCars, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "게시 후기", value: totalReviews, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl p-5`}>
            <p className="text-xs font-medium text-slate-500 mb-1">{stat.label}</p>
            <p className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">최근 상담 신청</h2>
          <span className="text-xs text-slate-400">{leads.length}건</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs border-b border-slate-100">
                <th className="px-5 py-3 font-semibold">신청일시</th>
                <th className="px-5 py-3 font-semibold">이름</th>
                <th className="px-5 py-3 font-semibold">연락처</th>
                <th className="px-5 py-3 font-semibold">희망차량</th>
                <th className="px-5 py-3 font-semibold">연락방법</th>
                <th className="px-5 py-3 font-semibold">상태</th>
                <th className="px-5 py-3 font-semibold">상세</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-sm">
                    상담 신청 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors text-sm">
                    <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                      {format(new Date(lead.createdAt), "MM.dd HH:mm", { locale: ko })}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{lead.name}</td>
                    <td className="px-5 py-3.5 text-slate-600">{lead.phone}</td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-[150px] truncate">{lead.carOfInterest || "미지정"}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">{lead.contactMethod || "-"}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                        lead.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : lead.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {lead.status === "PENDING" ? "대기중" : lead.status === "COMPLETED" ? "완료" : lead.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/${lead.id}`}
                        className="text-[#0a2540] text-xs font-semibold hover:underline"
                      >
                        보기 →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
