"use client";

import { useState } from "react";
import Link from "next/link";
import AdminCarsActions from "./AdminCarsActions";

type Brand = {
  id: string;
  name: string;
};

type Car = {
  id: string;
  slug: string;
  brand: Brand;
  modelName: string;
  trimName: string;
  year: number;
  isActive: boolean;
  isPopular: boolean;
  isInstant: boolean;
  options: any; // JSON
};

export default function AdminCarsClient({
  initialCars,
  brands,
}: {
  initialCars: Car[];
  brands: Brand[];
}) {
  const [filterBrand, setFilterBrand] = useState("");
  const [searchModel, setSearchModel] = useState("");
  const [searchOption, setSearchOption] = useState("");

  const filteredCars = initialCars.filter((car) => {
    if (filterBrand && car.brand.id !== filterBrand) return false;
    
    if (searchModel) {
      const modelMatch = car.modelName.toLowerCase().includes(searchModel.toLowerCase());
      const trimMatch = car.trimName.toLowerCase().includes(searchModel.toLowerCase());
      if (!modelMatch && !trimMatch) return false;
    }

    if (searchOption) {
      const optionString = JSON.stringify(car.options || {}).toLowerCase();
      if (!optionString.includes(searchOption.toLowerCase())) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">차량 관리</h1>
          <p className="text-slate-500 text-sm mt-1">
            총 {initialCars.length}대 (필터됨: {filteredCars.length}대)
          </p>
        </div>
        <Link
          href="/admin/cars/new"
          className="px-5 py-2.5 rounded-xl bg-[#0a2540] text-white text-sm font-bold hover:bg-[#143a66] transition-colors"
        >
          + 차량 등록
        </Link>
      </div>

      {/* 필터 영역 */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500 mb-1">브랜드 필터</label>
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 브랜드</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500 mb-1">모델 / 트림 검색</label>
          <input
            type="text"
            value={searchModel}
            onChange={(e) => setSearchModel(e.target.value)}
            placeholder="모델명 또는 트림 입력..."
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500 mb-1">옵션 검색</label>
          <input
            type="text"
            value={searchOption}
            onChange={(e) => setSearchOption(e.target.value)}
            placeholder="옵션 키워드 입력... (예: 파노라마)"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs border-b border-slate-100">
                <th className="px-5 py-3 font-semibold">브랜드</th>
                <th className="px-5 py-3 font-semibold">모델명</th>
                <th className="px-5 py-3 font-semibold">트림</th>
                <th className="px-5 py-3 font-semibold">연식</th>
                <th className="px-5 py-3 font-semibold">상태</th>
                <th className="px-5 py-3 font-semibold">인기</th>
                <th className="px-5 py-3 font-semibold">즉시출고</th>
                <th className="px-5 py-3 font-semibold">관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredCars.length > 0 ? (
                filteredCars.map((car) => (
                  <tr
                    key={car.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors text-sm"
                  >
                    <td className="px-5 py-3.5 text-slate-600">{car.brand.name}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{car.modelName}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs max-w-[120px] truncate" title={car.trimName}>
                      {car.trimName}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{car.year}년형</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                          car.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {car.isActive ? "활성" : "비활성"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">{car.isPopular ? "⭐" : "-"}</td>
                    <td className="px-5 py-3.5 text-center">{car.isInstant ? "⚡" : "-"}</td>
                    <td className="px-5 py-3.5">
                      <AdminCarsActions carId={car.id} slug={car.slug} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-500 text-sm">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
