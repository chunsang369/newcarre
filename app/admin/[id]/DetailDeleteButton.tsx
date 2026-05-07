"use client";

import { useRouter } from "next/navigation";

export default function DetailDeleteButton({ id }: { id: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm("정말로 이 상담 내역을 삭제하시겠습니까?\n삭제 후에는 복구가 불가능합니다.")) {
      try {
        const response = await fetch(`/api/quotes/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          router.push("/admin");
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
      type="button"
      onClick={handleDelete}
      className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white py-3 rounded-xl font-bold text-sm transition-all"
    >
      상담 내역 삭제하기
    </button>
  );
}
