"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Q. 차량 배송지 지정 또는 변경이 가능한가요?",
    answer: "차량 배송지는 계약 진행 시, 고객님께서 원하시는 장소를 지정할 수 있습니다. 계약이 완료된 이후 변경을 원하시는 경우, 차량 준비가 완료된 후에 출고 담당자가 연락을 드리므로 그 때 배송 장소 및 일시를 조정하실 수 있습니다.",
  },
  {
    question: "Q. 보증증권에 대해 알려주세요.",
    answer: "보증증권은 고객님 신용을 바탕으로 하는 신용 담보 조건입니다. 발급 수수료만으로 계약이 가능합니다. 보증증권은 초기비용 부담없이 계약을 진행하고자 하는 고객이 가장 많이 선택하는 조건입니다. SGI서울보증사를 통해 발급되며 개인정보 조회·동의 및 수수료가 지급되어야 발급이 완료됩니다.",
  },
  {
    question: "Q. 렌트와 리스의 차이점은 무엇인가요?",
    answer: "장기렌트는 렌트회사 명의로 차량을 빌려 이용하는 방식이고, 리스는 고객님 명의로 차량을 할부 구매하는 금융 상품입니다. 렌트는 보험·세금이 포함되어 관리가 편리하고, 리스는 차량 소유가 가능한 장점이 있습니다.",
  },
  {
    question: "Q. 신용등급이 낮아도 이용 가능한가요?",
    answer: "네, 가능합니다. 하이카즈에서는 다양한 금융사와 제휴를 맺고 있어 신용등급이 낮더라도 조건에 맞는 상품을 안내해 드립니다. 보증금이나 선납금 조건을 활용하면 더 유리한 조건으로 진행 가능합니다.",
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-8 bg-white" aria-label="자주 묻는 질문">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-5">
          장기렌트에 관한 궁금증을<br />모두 해결해드립니다!
        </h2>

        <div className="divide-y divide-gray-200 border-t border-gray-200">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between py-4 text-left group"
                >
                  <span className="text-sm font-semibold text-gray-800 pr-4">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300",
                    isOpen ? "max-h-96 pb-4" : "max-h-0"
                  )}
                >
                  <p className="text-sm text-gray-600 leading-relaxed pl-1">
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
