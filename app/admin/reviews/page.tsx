export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AdminReviewsActions from "./AdminReviewsActions";
import { format } from "date-fns";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">출고 후기 관리</h1>
          <p className="text-slate-500 text-sm mt-1">총 {reviews.length}건</p>
        </div>
        <Link
          href="/admin/reviews/new"
          className="px-5 py-2.5 rounded-xl bg-[#0a2540] text-white text-sm font-bold hover:bg-[#143a66] transition-colors"
        >
          + 후기 등록
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs border-b border-slate-100">
                <th className="px-5 py-3 font-semibold">제목</th>
                <th className="px-5 py-3 font-semibold">고객명</th>
                <th className="px-5 py-3 font-semibold">차종</th>
                <th className="px-5 py-3 font-semibold">계약일</th>
                <th className="px-5 py-3 font-semibold">상태</th>
                <th className="px-5 py-3 font-semibold">관리</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors text-sm">
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{review.title}</td>
                  <td className="px-5 py-3.5 text-slate-600">{review.customerName}</td>
                  <td className="px-5 py-3.5 text-slate-600 max-w-[120px] truncate">{review.carModel}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">
                    {format(new Date(review.contractDate), "yyyy.MM.dd")}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${review.isPublished ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {review.isPublished ? "공개" : "비공개"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <AdminReviewsActions reviewId={review.id} />
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
