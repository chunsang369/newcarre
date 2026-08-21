export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AdminFaqActions from "./AdminFaqActions";

export default async function AdminFaqPage() {
  const faqs = await prisma.faq.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">FAQ 관리</h1>
          <p className="text-slate-500 text-sm mt-1">총 {faqs.length}건</p>
        </div>
        <Link
          href="/admin/faq/new"
          className="px-5 py-2.5 rounded-xl bg-[#0a2540] text-white text-sm font-bold hover:bg-[#143a66] transition-colors"
        >
          + FAQ 등록
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs border-b border-slate-100">
                <th className="px-5 py-3 font-semibold">카테고리</th>
                <th className="px-5 py-3 font-semibold">질문 (Q)</th>
                <th className="px-5 py-3 font-semibold">상태</th>
                <th className="px-5 py-3 font-semibold">관리</th>
              </tr>
            </thead>
            <tbody>
              {faqs.map((faq) => (
                <tr key={faq.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors text-sm">
                  <td className="px-5 py-3.5 text-slate-600 font-medium">{faq.category}</td>
                  <td className="px-5 py-3.5 text-slate-800">{faq.question}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${faq.isPublished ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {faq.isPublished ? "공개" : "비공개"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <AdminFaqActions faqId={faq.id} />
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
