"use client";

import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";

export default function ConsultChannel() {
  return (
    <section className="py-8 bg-white" aria-label="상담 채널">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">
          하이카즈 고객센터
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          편리한 상담 채널을 이용하세요
        </p>

        <div className="grid grid-cols-2 gap-3">
          {/* 전화 상담 */}
          <Link
            href="tel:1577-2617"
            className="flex flex-col items-center justify-center gap-2 py-6 rounded-xl border border-gray-200 hover:border-[#469BD9] hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-[#469BD9]/10 flex items-center justify-center group-hover:bg-[#469BD9]/20 transition-colors">
              <Phone className="w-5 h-5 text-[#469BD9]" />
            </div>
            <span className="text-lg font-bold text-[#469BD9]">1577-2617</span>
            <span className="text-xs text-gray-400">대표전화</span>
          </Link>

          {/* 카카오톡 */}
          <Link
            href="http://pf.kakao.com/_LUDxcn/chat"
            target="_blank"
            className="flex flex-col items-center justify-center gap-2 py-6 rounded-xl border border-gray-200 hover:border-[#fee500] hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-[#fee500]/20 flex items-center justify-center group-hover:bg-[#fee500]/40 transition-colors">
              <MessageCircle className="w-5 h-5 text-[#3c1e1e]" />
            </div>
            <span className="text-lg font-bold text-[#3c1e1e]">카카오톡</span>
            <span className="text-xs text-gray-400">간편 상담</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
