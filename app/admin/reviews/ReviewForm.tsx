"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
    imageUrl: initialData?.imageUrl || "",
    carModel: initialData?.carModel || "",
    customerName: initialData?.customerName || "",
    plannerName: initialData?.plannerName || "",
    contractDate: initialData?.contractDate ? new Date(initialData.contractDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    isPublished: initialData?.isPublished ?? true,
    sortOrder: initialData?.sortOrder || 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = initialData ? `/api/admin/reviews/${initialData.id}` : "/api/admin/reviews";
      const method = initialData ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/admin/reviews");
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(`저장 실패: ${errorData.error || "알 수 없는 오류"}`);
      }
    } catch (err) {
      console.error(err);
      alert("통신 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl bg-white p-6 rounded-2xl border border-slate-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">후기 제목</label>
          <input required name="title" value={formData.title} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">계약 차량명</label>
          <input required name="carModel" value={formData.carModel} onChange={handleChange} placeholder="ex) 그랜저 하이브리드" className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">고객명</label>
          <input required name="customerName" value={formData.customerName} onChange={handleChange} placeholder="ex) 김*민 대표님" className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">담당 플래너</label>
          <input name="plannerName" value={formData.plannerName} onChange={handleChange} placeholder="ex) 하이카즈 매니저" className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">계약(출고)일</label>
          <input required type="date" name="contractDate" value={formData.contractDate} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">대표 이미지 URL</label>
          <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://..." className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">후기 본문</label>
          <textarea required name="content" value={formData.content} onChange={handleChange} rows={6} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>

        <div className="md:col-span-2 flex flex-wrap gap-6 pt-4 border-t">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" name="isPublished" checked={formData.isPublished} onChange={handleChange} className="w-4 h-4" />
            공개 여부
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            정렬 순서: <input type="number" name="sortOrder" value={formData.sortOrder} onChange={handleChange} className="w-16 border rounded px-2 py-1" />
          </label>
        </div>
      </div>

      <div className="pt-6 border-t flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100">취소</button>
        <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl bg-[#0a2540] text-white font-bold hover:bg-[#143a66] disabled:opacity-50">
          {loading ? "저장 중..." : "저장하기"}
        </button>
      </div>
    </form>
  );
}
