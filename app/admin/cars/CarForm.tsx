"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CarForm({ initialData, brands }: { initialData?: any; brands: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    slug: initialData?.slug || "",
    modelName: initialData?.modelName || "",
    trimName: initialData?.trimName || "",
    year: initialData?.year || new Date().getFullYear(),
    category: initialData?.category || "SEDAN",
    fuelType: initialData?.fuelType || "GASOLINE",
    basePrice: initialData?.basePrice || 0,
    thumbnailUrl: initialData?.thumbnailUrl || "",
    brandId: initialData?.brandId || (brands[0]?.id || ""),
    isActive: initialData?.isActive ?? true,
    isPopular: initialData?.isPopular ?? false,
    isInstant: initialData?.isInstant ?? false,
    sortOrder: initialData?.sortOrder || 0,
    priceMatrix: initialData?.priceMatrix ? JSON.stringify(initialData.priceMatrix, null, 2) : "{}",
    options: initialData?.options ? JSON.stringify(initialData.options, null, 2) : "{}",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      // Parse JSON fields
      const payload = {
        ...formData,
        priceMatrix: JSON.parse(formData.priceMatrix),
        options: JSON.parse(formData.options),
      };

      const url = initialData ? `/api/admin/cars/${initialData.id}` : "/api/admin/cars";
      const method = initialData ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/cars");
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(`저장 실패: ${errorData.error || "알 수 없는 오류"}`);
      }
    } catch (err) {
      console.error(err);
      alert("JSON 형식이 잘못되었거나 통신 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl bg-white p-6 rounded-2xl border border-slate-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">브랜드</label>
          <select name="brandId" value={formData.brandId} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm">
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">슬러그 (URL에 사용, 고유해야 함)</label>
          <input required name="slug" value={formData.slug} onChange={handleChange} placeholder="ex) grandeur-gn7" className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">모델명</label>
          <input required name="modelName" value={formData.modelName} onChange={handleChange} placeholder="ex) 디 올 뉴 그랜저" className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">트림명</label>
          <input required name="trimName" value={formData.trimName} onChange={handleChange} placeholder="ex) 2.5 가솔린 프리미엄" className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">차종</label>
          <select name="category" value={formData.category} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm">
            {["SEDAN", "SUV", "VAN", "COMPACT"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">연료</label>
          <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm">
            {["GASOLINE", "DIESEL", "HYBRID", "EV", "LPG"].map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">연식</label>
          <input required type="number" name="year" value={formData.year} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">기본 차량가 (단위: 만원)</label>
          <input required type="number" name="basePrice" value={formData.basePrice} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">썸네일 URL</label>
          <input required name="thumbnailUrl" value={formData.thumbnailUrl} onChange={handleChange} placeholder="https://..." className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>

        {/* JSON Fields */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">가격표 매트릭스 (JSON)</label>
          <textarea required name="priceMatrix" value={formData.priceMatrix} onChange={handleChange} rows={6} className="w-full border rounded-lg px-3 py-2 text-sm font-mono" />
          <p className="text-xs text-slate-500 mt-1">형식: {`{"36_PREPAY_30_20000": {"rent": 500000, "lease": 450000}}`}</p>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">차량 제원 및 옵션 (JSON)</label>
          <textarea required name="options" value={formData.options} onChange={handleChange} rows={4} className="w-full border rounded-lg px-3 py-2 text-sm font-mono" />
        </div>

        {/* Flags */}
        <div className="md:col-span-2 flex flex-wrap gap-6 pt-4 border-t">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4" />
            활성화 (노출)
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" name="isPopular" checked={formData.isPopular} onChange={handleChange} className="w-4 h-4" />
            인기 차량 (라벨 표기)
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" name="isInstant" checked={formData.isInstant} onChange={handleChange} className="w-4 h-4" />
            즉시출고 가능
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
