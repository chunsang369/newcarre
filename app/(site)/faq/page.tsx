export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import FaqAccordionClient from "./FaqAccordionClient";

export const metadata: Metadata = {
  title: "자주 묻는 질문 (FAQ) — 하이카즈",
  description: "장기렌트, 리스에 대해 자주 묻는 질문과 답변을 확인하세요.",
};

export default async function FaqPage() {
  const faqs = await prisma.faq.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: "asc" },
  });

  const serialized = faqs.map((f) => ({
    id: f.id,
    category: f.category,
    question: f.question,
    answer: f.answer,
  }));

  return (
    <div className="min-h-screen bg-[var(--color-bg-subtle)]">
      {/* Header */}
      <div className="bg-[var(--color-primary)] text-white">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-12 lg:py-16 text-center">
          <h1 className="text-2xl lg:text-4xl font-bold mb-2">자주 묻는 질문</h1>
          <p className="text-white/70 text-sm lg:text-base">장기렌트·리스에 대한 궁금증을 해결해드립니다</p>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <FaqAccordionClient faqs={serialized} />
      </div>
    </div>
  );
}
