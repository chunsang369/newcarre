"use client";

import { ChevronRight, ShieldCheck, Zap } from "lucide-react";

export default function HeroPromoBanner() {
  const handleScrollToQuote = () => {
    if (typeof window !== "undefined") {
      const formEl = document.getElementById("quote-form");
      if (formEl) {
        formEl.scrollIntoView({ behavior: "smooth", block: "start" });
        const nameInput = formEl.querySelector<HTMLInputElement>("input[required]");
        if (nameInput) {
          setTimeout(() => nameInput.focus(), 500);
        }
      }
    }
  };

  return (
    <section 
      className="w-full bg-[#f4f7fa] pt-2 pb-6 sm:pt-4 sm:pb-8"
      aria-label="저신용 신차장기렌트 히어로 섹션"
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="relative w-full overflow-hidden rounded-2xl lg:rounded-3xl shadow-xl bg-black min-h-[380px] sm:min-h-[420px] md:min-h-[460px] lg:min-h-[480px] flex items-center">
          
          {/* 1. 배경 히어로 이미지: 모바일에서 차가 보이도록 68% 지점 포커스 */}
          <div 
            className="absolute inset-0 bg-cover bg-[68%_center] sm:bg-[72%_center] md:bg-[right_center] bg-no-repeat pointer-events-none"
            style={{
              backgroundImage: `url('/images/low-credit-hero.png')`,
            }}
          />

          {/* 2. 원본 사진의 밝기를 살리며 텍스트 가독성만 보조하는 초경량 그라데이션 */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/15 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:hidden pointer-events-none" />

          {/* 3. 콘텐츠 영역 (좌측 상단 로고 + 문구) */}
          <div className="relative z-10 w-full px-6 sm:px-10 md:px-14 lg:px-16 py-8 sm:py-12 flex flex-col justify-between h-full max-w-[720px]">
            
            {/* 좌측 상단: 제로카즈 로고 & 배지 */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md inline-flex items-center justify-center">
                  <img
                    src="/logo.png"
                    alt="제로카즈 로고"
                    className="h-6 sm:h-7 md:h-8 w-auto object-contain"
                  />
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1d7ef3]/30 border border-[#1d7ef3]/50 text-[#60a5fa] text-xs font-bold tracking-tight backdrop-blur-xs">
                  <Zap className="w-3.5 h-3.5 text-[#38bdf8]" />
                  누구나 100% 당일 출고
                </span>
              </div>
            </div>

            {/* 좌측 메인 텍스트 */}
            <div className="space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-[12px] sm:text-xs font-semibold sm:hidden backdrop-blur-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
                무심사 비대면 승인 보장
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black text-white leading-[1.25] sm:leading-[1.2] tracking-tight drop-shadow-lg">
                <span className="text-white block">
                  무심사 무보증 가능 합니다
                </span>
                <span className="text-[#38bdf8] block mt-1 sm:mt-1.5 drop-shadow-md">
                  개인회생 파산신청 걱정 마세요
                </span>
                <span className="text-white block mt-1 sm:mt-1.5 font-black">
                  끝까지 책임집니다
                </span>
              </h1>

              <p className="text-sm sm:text-base text-gray-200 font-medium pt-1 sm:pt-2 leading-relaxed drop-shadow-md">
                신용점수 무관 · 소득증빙 무관 · 전국 어디서나 비대면 즉시 계약
              </p>
            </div>

            {/* 빠른 견적상담 CTA 버튼 */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={handleScrollToQuote}
                className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-[#1d7ef3] to-[#0284c7] hover:from-[#156cd4] hover:to-[#0369a1] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#1d7ef3]/30 transition-all hover:scale-102 active:scale-[0.98] flex items-center gap-2 cursor-pointer"
              >
                <span>무심사 빠른 견적 상담받기</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-semibold text-white/90">전문 매니저 1:1 실시간 배정 중</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
