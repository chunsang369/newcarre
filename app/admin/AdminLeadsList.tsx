"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Trash2, CheckSquare, Square } from "lucide-react";
import DeleteQuoteButton from "./DeleteQuoteButton";

interface Lead {
  id: string;
  name: string;
  phone: string;
  carOfInterest: string | null;
  contactMethod: string | null;
  status: string;
  createdAt: Date;
}

export default function AdminLeadsList({ initialLeads }: { initialLeads: any[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const toggleSelectAll = () => {
    if (selectedIds.length === initialLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(initialLeads.map((l) => l.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    if (confirm(`정말로 선택한 ${selectedIds.length}건의 내역을 삭제하시겠습니까?\n삭제 후에는 복구가 불가능합니다.`)) {
      setIsDeleting(true);
      try {
        const response = await fetch("/api/quotes/bulk-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedIds }),
        });

        if (response.ok) {
          setSelectedIds([]);
          router.refresh();
        } else {
          alert("삭제 중 오류가 발생했습니다.");
        }
      } catch (error) {
        console.error("Bulk delete error:", error);
        alert("삭제 중 오류가 발생했습니다.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-base font-bold text-slate-900">최근 상담 신청</h2>
          <span className="text-xs text-slate-400">{initialLeads.length}건</span>
          
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {selectedIds.length}개 선택됨
              </span>
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
              >
                <Trash2 size={14} />
                선택 삭제
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs border-b border-slate-100">
              <th className="px-5 py-3 font-semibold w-12">
                <button onClick={toggleSelectAll} className="text-slate-400 hover:text-blue-600 transition-colors">
                  {selectedIds.length === initialLeads.length && initialLeads.length > 0 ? (
                    <CheckSquare size={18} className="text-blue-600" />
                  ) : (
                    <Square size={18} />
                  )}
                </button>
              </th>
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
            {initialLeads.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-slate-400 text-sm">
                  상담 신청 내역이 없습니다.
                </td>
              </tr>
            ) : (
              initialLeads.map((lead) => (
                <tr 
                  key={lead.id} 
                  className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors text-sm ${
                    selectedIds.includes(lead.id) ? "bg-blue-50/30" : ""
                  }`}
                  onClick={() => toggleSelectOne(lead.id)}
                >
                  <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => toggleSelectOne(lead.id)} 
                      className="text-slate-300 hover:text-blue-600 transition-colors"
                    >
                      {selectedIds.includes(lead.id) ? (
                        <CheckSquare size={18} className="text-blue-600" />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                    {format(new Date(lead.createdAt), "MM.dd HH:mm", { locale: ko })}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{lead.name}</td>
                  <td className="px-5 py-3.5 text-slate-600">{lead.phone}</td>
                  <td className="px-5 py-3.5 text-slate-600 max-w-[150px] truncate">
                    {lead.carConfig?.carName || lead.carOfInterest || "미지정"}
                  </td>
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
                  <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/${lead.id}`}
                        className="text-[#0a2540] text-xs font-semibold hover:underline"
                      >
                        보기 →
                      </Link>
                      <DeleteQuoteButton id={lead.id} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
