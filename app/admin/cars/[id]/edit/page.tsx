import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CarForm from "../../CarForm";

export default async function EditCarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [car, brands] = await Promise.all([
    prisma.car.findUnique({ where: { id } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!car) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">차량 수정</h1>
        <p className="text-slate-500 text-sm mt-1">{car.modelName} {car.trimName} 정보를 수정합니다.</p>
      </div>
      <CarForm initialData={car} brands={brands} />
    </div>
  );
}
