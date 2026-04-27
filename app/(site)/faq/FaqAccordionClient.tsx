"use client";

import { useState, useMemo } from "react";

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export default function FaqAccordionClient({ faqs }: { faqs: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("전체");

  const categories = useMemo(() => {
    const cats = Array.from(new Set(faqs.map((f) => f.category)));
    return ["전체", ...cats];
  }, [faqs]);

  const filtered = useMemo(() => {
    if (activeCategory === "전체") return faqs;
    return faqs.filter((f) => f.category === activeCategory);
  }, [faqs, activeCategory]);

  return (
    <div>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat
                ? "bg-[var(--color-accent)] text-white"
                : "bg-white border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-slate-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accordion */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">등록된 FAQ가 없습니다.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((faq) => (
            <div
              key={faq.id}
              className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden"
            >
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-[var(--color-accent)] font-bold text-sm mt-0.5">Q</span>
                  <span className="text-sm lg:text-base font-medium text-[var(--color-text)] pr-4">
                    {faq.question}
                  </span>
                </div>
                <svg
                  className={`w-5 h-5 text-[var(--color-text-muted)] flex-shrink-0 transition-transform ${openId === faq.id ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openId === faq.id && (
                <div className="px-5 pb-5 border-t border-[var(--color-border)]">
                  <div className="flex items-start gap-3 pt-4">
                    <span className="text-blue-600 font-bold text-sm mt-0.5">A</span>
                    <p className="text-sm text-[var(--color-text-muted)] leading-relaxed whitespace-pre-wrap">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
