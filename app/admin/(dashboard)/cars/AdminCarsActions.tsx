"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function AdminCarsActions({ carId, slug }: { carId: string; slug: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("차량을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/cars/${carId}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("삭제에 실패했습니다.");
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/cars/${slug}`}
        target="_blank"
        className="text-xs text-blue-600 hover:underline"
      >
        보기
      </Link>
      <Link
        href={`/admin/cars/${carId}/edit`}
        className="text-xs text-slate-600 hover:underline"
      >
        수정
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="text-xs text-red-500 hover:underline disabled:opacity-50"
      >
        삭제
      </button>
    </div>
  );
}
