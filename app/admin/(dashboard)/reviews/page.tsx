export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import AdminReviewsClient from "./AdminReviewsClient";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { sortOrder: "asc" },
  });

  // Serialize dates for client component
  const serialized = reviews.map(r => ({
    ...r,
    contractDate: r.contractDate.toISOString(),
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">출고 후기 관리</h1>
          <p className="text-slate-500 text-sm mt-1">총 {reviews.length}건</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/reviews/new"
            className="px-5 py-2.5 rounded-xl bg-[#0a2540] text-white text-sm font-bold hover:bg-[#143a66] transition-colors"
          >
            + 후기 등록
          </Link>
        </div>
      </div>

      <AdminReviewsClient reviews={serialized} />
    </div>
  );
}
