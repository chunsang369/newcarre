"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function AdminReviewsActions({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("후기를 삭제하시겠습니까?")) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("삭제에 실패했습니다.");
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Link href={`/reviews/${reviewId}`} target="_blank" className="text-xs text-blue-600 hover:underline">보기</Link>
      <Link href={`/admin/reviews/${reviewId}/edit`} className="text-xs text-slate-600 hover:underline">수정</Link>
      <button onClick={handleDelete} disabled={deleting} className="text-xs text-red-500 hover:underline disabled:opacity-50">삭제</button>
    </div>
  );
}
