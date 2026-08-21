import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReviewForm from "../../ReviewForm";

export default async function EditReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const review = await prisma.review.findUnique({ where: { id } });

  if (!review) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">후기 수정</h1>
        <p className="text-slate-500 text-sm mt-1">출고 후기 내용을 수정합니다.</p>
      </div>
      <ReviewForm initialData={review} />
    </div>
  );
}
