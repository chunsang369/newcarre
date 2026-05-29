export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import AdminLeadsList from "./AdminLeadsList";

export default async function AdminDashboardPage() {
  const now = new Date();
  const kstTodayStr = now.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
  const todayStart = new Date(`${kstTodayStr}T00:00:00.000+09:00`);
  const todayEnd = new Date(`${kstTodayStr}T23:59:59.999+09:00`);

  const [
    leads, 
    totalCars, 
    totalReviews, 
    totalFaq,
    todayLeadsCount,
    todayVisitsCount,
    todayVisitorsRaw
  ] = await Promise.all([
    prisma.quoteRequest.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.car.count({ where: { isActive: true } }),
    prisma.review.count({ where: { isPublished: true } }),
    prisma.faq.count({ where: { isPublished: true } }),
    prisma.quoteRequest.count({
      where: { createdAt: { gte: todayStart, lte: todayEnd } }
    }),
    prisma.visitLog.count({
      where: { createdAt: { gte: todayStart, lte: todayEnd } }
    }),
    prisma.visitLog.groupBy({
      by: ["visitorId"],
      where: { createdAt: { gte: todayStart, lte: todayEnd } }
    })
  ]);

  const todayVisitorsCount = todayVisitorsRaw.length;
  const pending = leads.filter((l) => l.status === "PENDING").length;
  const completed = leads.filter((l) => l.status === "COMPLETED").length;

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">대시보드</h1>
          <p className="text-slate-500 text-sm mt-1">
            실시간 사이트 현황과 접수된 상담 내역을 모니터링합니다.
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-4 py-2 rounded-xl shrink-0 self-start">
          ⏰ {format(new Date(), "yyyy.MM.dd (EEE) HH:mm", { locale: ko })} 기준 (KST)
        </div>
      </div>

      {/* 오늘 현황 (KST 기준) */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          오늘 현황 (KST)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "오늘 접수 견적", value: `${todayLeadsCount}건`, color: "text-rose-600", bg: "bg-rose-50/50", border: "border-rose-100" },
            { label: "오늘 총 페이지 뷰 (PV)", value: `${todayVisitsCount}회`, color: "text-blue-600", bg: "bg-blue-50/50", border: "border-blue-100" },
            { label: "오늘 고유 방문자 (UV)", value: `${todayVisitorsCount}명`, color: "text-indigo-600", bg: "bg-indigo-50/50", border: "border-indigo-100" },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} border ${stat.border} rounded-2xl p-5 shadow-sm`}>
              <p className="text-xs font-bold text-slate-500 mb-1">{stat.label}</p>
              <p className={`text-3xl font-extrabold tracking-tight ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 누적 데이터 현황 */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800">누적 데이터 현황</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "대기중 상담", value: pending, color: "text-yellow-600", bg: "bg-yellow-50" },
            { label: "완료 상담", value: completed, color: "text-green-600", bg: "bg-green-50" },
            { label: "등록 차량", value: totalCars, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "게시 후기", value: totalReviews, color: "text-purple-600", bg: "bg-purple-50" },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-2xl p-5 shadow-sm`}>
              <p className="text-xs font-bold text-slate-500 mb-1">{stat.label}</p>
              <p className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Leads Table Component */}
      <AdminLeadsList initialLeads={leads} />
    </div>
  );
}
