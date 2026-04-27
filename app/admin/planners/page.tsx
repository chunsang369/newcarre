export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AdminPlannersActions from "./AdminPlannersActions";
import Image from "next/image";

export default async function AdminPlannersPage() {
  const planners = await prisma.planner.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">플래너 관리</h1>
          <p className="text-slate-500 text-sm mt-1">총 {planners.length}명</p>
        </div>
        <Link
          href="/admin/planners/new"
          className="px-5 py-2.5 rounded-xl bg-[#0a2540] text-white text-sm font-bold hover:bg-[#143a66] transition-colors"
        >
          + 플래너 등록
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs border-b border-slate-100">
                <th className="px-5 py-3 font-semibold">사진</th>
                <th className="px-5 py-3 font-semibold">이름</th>
                <th className="px-5 py-3 font-semibold">직책</th>
                <th className="px-5 py-3 font-semibold">연락처</th>
                <th className="px-5 py-3 font-semibold">상태</th>
                <th className="px-5 py-3 font-semibold">관리</th>
              </tr>
            </thead>
            <tbody>
              {planners.map((planner) => (
                <tr key={planner.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors text-sm">
                  <td className="px-5 py-3.5">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                      {planner.photoUrl ? (
                        <Image src={planner.photoUrl} alt={planner.name} fill className="object-cover" unoptimized />
                      ) : (
                        <span className="text-xs text-slate-400 absolute inset-0 flex items-center justify-center">No</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{planner.name}</td>
                  <td className="px-5 py-3.5 text-slate-600">{planner.position}</td>
                  <td className="px-5 py-3.5 text-slate-600">{planner.phone || "-"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${planner.isFeatured ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-500"}`}>
                      {planner.isFeatured ? "대표 플래너" : "일반"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <AdminPlannersActions plannerId={planner.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
