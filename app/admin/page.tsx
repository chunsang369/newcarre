export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import AdminLeadsList from "./AdminLeadsList";

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

      {/* Leads Table Component */}
      <AdminLeadsList initialLeads={leads} />
    </div>
  );
}
