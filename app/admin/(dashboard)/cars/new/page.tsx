import { prisma } from "@/lib/prisma";
import CarForm from "../CarForm";

export default async function NewCarPage() {
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">차량 등록</h1>
        <p className="text-slate-500 text-sm mt-1">새로운 렌트/리스 차량을 추가합니다.</p>
      </div>
      <CarForm brands={brands} />
    </div>
  );
}
