"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteQuoteButton({ id }: { id: string }) {
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm("정말로 이 상담 내역을 삭제하시겠습니까?\n삭제 후에는 복구가 불가능합니다.")) {
      try {
        const response = await fetch(`/api/quotes/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          router.refresh();
        } else {
          alert("삭제 중 오류가 발생했습니다.");
        }
      } catch (error) {
        console.error("Delete error:", error);
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
      title="상담 내역 삭제"
    >
      <Trash2 size={16} />
    </button>
  );
}
