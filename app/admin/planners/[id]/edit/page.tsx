import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PlannerForm from "../../PlannerForm";

export default async function EditPlannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const planner = await prisma.planner.findUnique({ where: { id } });

  if (!planner) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">플래너 수정</h1>
        <p className="text-slate-500 text-sm mt-1">하이카즈 매니저(플래너) 정보를 수정합니다.</p>
      </div>
      <PlannerForm initialData={planner} />
    </div>
  );
}
