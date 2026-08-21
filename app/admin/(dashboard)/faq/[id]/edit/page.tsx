import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import FaqForm from "../../FaqForm";

export default async function EditFaqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const faq = await prisma.faq.findUnique({ where: { id } });

  if (!faq) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">FAQ 수정</h1>
        <p className="text-slate-500 text-sm mt-1">자주 묻는 질문 내용을 수정합니다.</p>
      </div>
      <FaqForm initialData={faq} />
    </div>
  );
}
