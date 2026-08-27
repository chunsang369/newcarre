"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Zap, ShieldCheck } from "lucide-react";

interface HeroMainProps {
  backgroundImage?: string;
  backgroundVideo?: string;
  backgroundVideoWebm?: string;
}

const PILLARS = [
  { num: "01", label: "가격" },
  { num: "02", label: "심사" },
  { num: "03", label: "출고" },
] as const;

export default function HeroMain({
  backgroundImage = "/hero/hero-bg.jpg",
  backgroundVideo = "/hero/luxury-hero.mp4",
  backgroundVideoWebm,
}: HeroMainProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const totalSlides = 2;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // 자동 롤링 타이머 (6초)
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, 6000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide]);

  const scrollToQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("quote-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      const nameInput = el.querySelector<HTMLInputElement>("input[required]");
      if (nameInput) {
        setTimeout(() => nameInput.focus(), 500);
      }
    }
  };

  return (
    <section
      className="relative w-full min-h-[580px] sm:min-h-[640px] lg:min-h-[680px] lg:h-[80vh] overflow-hidden bg-[#0a0a0a] select-none"
      aria-label="메인 히어로 롤링 배너"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ── 슬라이드 1: 제로카즈 메인 (가격·심사·출고 비디오) ── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
          currentSlide === 0 ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
        }`}
      >
        {/* 비디오/이미지 배경 */}
        <div className="absolute inset-0 z-0">
          {backgroundVideo ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              poster={backgroundImage}
              // @ts-expect-error fetchPriority is not natively supported on video types
              fetchPriority="high"
              className="w-full h-full object-cover transition-transform duration-1000 scale-[1.08]"
            >
              <source src={backgroundVideo} type="video/mp4" />
              {backgroundVideoWebm && <source src={backgroundVideoWebm} type="video/webm" />}
            </video>
          ) : (
            <img src={backgroundImage} alt="배경 이미지" className="w-full h-full object-cover" />
          )}
        </div>

        {/* 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/30 z-10" />

        {/* 콘텐츠 */}
        <div className="relative z-20 h-full flex flex-col justify-center container mx-auto px-6 lg:px-16 py-16 lg:py-24">
          <div className="w-full lg:w-3/5 flex flex-col items-start gap-4 sm:gap-5">
            {/* 3축 가로 배치 */}
            <div className="flex items-end gap-7 sm:gap-10 lg:gap-12">
              {PILLARS.map((p) => (
                <div key={p.num} className="flex flex-col items-start group cursor-default">
                  <span className="text-white/50 text-xs sm:text-sm font-medium tracking-[2px] mb-1.5 sm:mb-2">
                    {p.num}
                  </span>
                  <span className="text-white text-2xl sm:text-3xl lg:text-[44px] font-normal leading-none tracking-tight">
                    {p.label}
                  </span>
                  <div className="w-full h-[3px] bg-white mt-2 sm:mt-3" />
                </div>
              ))}
            </div>

            <p className="text-white font-medium text-base sm:text-lg lg:text-xl tracking-tight pt-1">
              다 비교하고 오세요.
            </p>

            <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              지지 않습니다.
            </h1>

            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-md">
              3분이면 검증 끝.{" "}
              <span className="underline underline-offset-4 text-gray-200">
                견적서 사진 한장만 주세요.
              </span>
            </p>

            <div className="pt-2 sm:pt-4 flex items-center gap-3.5 sm:gap-4">
              <button
                type="button"
                onClick={scrollToQuote}
                className="inline-flex items-center gap-2 bg-white text-[#0a0a0a] px-8 sm:px-10 py-3.5 sm:py-4 rounded-full text-sm sm:text-base font-bold hover:bg-gray-100 hover:scale-[1.02] transition-all duration-200 active:scale-95 cursor-pointer shadow-xl"
              >
                <span>빠른 간편 견적</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="relative flex items-center shrink-0 select-none">
                <img
                  src="/images/credit-approval-badge-transparent.png"
                  alt="신용무관승인제 공식 등록 업체"
                  className="w-14 h-14 sm:w-16 sm:h-16 lg:w-[72px] lg:h-[72px] object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)] transition-transform duration-200 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ── 슬라이드 2: 저신용 장기렌트 전용 배너 ── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
          currentSlide === 1 ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
        }`}
      >
        {/* 저신용 전용 배경 이미지: 모바일에서는 차량이 있는 68% 지점을 포커싱 */}
        <div
          className="absolute inset-0 bg-cover bg-[68%_center] sm:bg-[72%_center] md:bg-[right_center] bg-no-repeat pointer-events-none"
          style={{
            backgroundImage: `url('/images/low-credit-hero.png')`,
          }}
        />

        {/* 텍스트 가독성용 초경량 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 sm:via-black/30 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:hidden pointer-events-none" />

        {/* 콘텐츠 */}
        <div className="relative z-20 h-full flex flex-col justify-center container mx-auto px-5 sm:px-10 lg:px-16 py-12 sm:py-20">
          <div className="w-full lg:w-3/5 flex flex-col items-start gap-3.5 sm:gap-5 max-w-[700px]">
            {/* 상단 로고 & 배지 */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-md inline-flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="제로카즈 로고"
                  className="h-5 sm:h-6 md:h-7 w-auto object-contain"
                />
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1d7ef3]/30 border border-[#1d7ef3]/50 text-[#60a5fa] text-[11px] sm:text-xs font-bold tracking-tight backdrop-blur-xs">
                <Zap className="w-3 h-3 text-[#38bdf8]" />
                무심사 저신용 장기렌트
              </span>
            </div>

            {/* 메인 문구 */}
            <div className="space-y-1 sm:space-y-2">
              <h2 className="text-[22px] sm:text-3xl md:text-4xl lg:text-[44px] font-black text-white leading-[1.25] sm:leading-[1.2] tracking-tight drop-shadow-xl">
                <span className="text-white block">무심사 무보증 가능 합니다</span>
                <span className="text-[#38bdf8] block mt-1 drop-shadow-md">
                  개인회생 파산신청 걱정 마세요
                </span>
                <span className="text-white block mt-1 font-black">
                  끝까지 책임집니다
                </span>
              </h2>

              <p className="text-xs sm:text-sm md:text-base text-gray-200 font-medium pt-1 leading-relaxed drop-shadow-md">
                신용점수 무관 · 소득증빙 무관 · 전국 어디서나 비대면 즉시 계약
              </p>
            </div>

            {/* CTA 버튼 그룹 */}
            <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-2.5 sm:gap-3.5">
              <Link
                href="/low-credit"
                className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-[#1d7ef3] to-[#0284c7] text-white px-5 sm:px-9 py-3 sm:py-4 rounded-full text-xs sm:text-base font-bold shadow-lg shadow-[#1d7ef3]/30 hover:from-[#156cd4] hover:to-[#0369a1] hover:scale-[1.02] transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <span>저신용 차량 전체보기</span>
                <ChevronRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={scrollToQuote}
                className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-full text-xs sm:text-base font-semibold transition-all cursor-pointer"
              >
                <span>빠른 상담 신청</span>
              </button>

              <div className="relative flex items-center shrink-0 select-none pl-1">
                <img
                  src="/images/credit-approval-badge-transparent.png"
                  alt="신용무관승인제 공식 등록 업체"
                  className="w-13 h-13 sm:w-15 sm:h-15 lg:w-[68px] lg:h-[68px] object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)] transition-transform duration-200 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ── 롤링 네비게이션 컨트롤 (데스크톱 좌우 화살표 & 하단 인디케이터) ── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      
      {/* 데스크톱/태블릿 전용 좌측 이전 버튼 (모바일에서는 글씨 가림 방지를 위해 숨김) */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="이전 배너"
        className="hidden sm:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white items-center justify-center backdrop-blur-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
      </button>

      {/* 데스크톱/태블릿 전용 우측 다음 버튼 (모바일에서는 글씨 가림 방지를 위해 숨김) */}
      <button
        type="button"
        onClick={nextSlide}
        aria-label="다음 배너"
        className="hidden sm:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white items-center justify-center backdrop-blur-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
      >
        <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
      </button>

      {/* 하단 페이지네이션 & 프로그레스 바 (가로로 넉넉하고 시원한 캡슐 디자인) */}
      <div className="absolute bottom-5 sm:bottom-6 lg:bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center gap-1.5 sm:gap-2.5 bg-black/75 backdrop-blur-md px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/20 shadow-2xl shrink-0 whitespace-nowrap">
        {/* 모바일용 좌측 화살표 */}
        <button
          type="button"
          onClick={prevSlide}
          className="sm:hidden p-1.5 text-white/80 hover:text-white shrink-0 active:scale-90 transition-transform"
          aria-label="이전 배너"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* 슬라이드 1 탭 */}
        <button
          type="button"
          onClick={() => setCurrentSlide(0)}
          className={`text-[12px] sm:text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            currentSlide === 0
              ? "bg-white text-black shadow-md scale-102"
              : "text-white/70 hover:text-white"
          }`}
        >
          신차 견적비교
        </button>

        {/* 슬라이드 2 탭 */}
        <button
          type="button"
          onClick={() => setCurrentSlide(1)}
          className={`text-[12px] sm:text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            currentSlide === 1
              ? "bg-[#1d7ef3] text-white shadow-md scale-102"
              : "text-white/70 hover:text-white"
          }`}
        >
          무심사 저신용
        </button>

        {/* 모바일용 우측 화살표 */}
        <button
          type="button"
          onClick={nextSlide}
          className="sm:hidden p-1.5 text-white/80 hover:text-white shrink-0 active:scale-90 transition-transform"
          aria-label="다음 배너"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <span className="text-[11px] font-semibold text-white/60 pl-2 pr-1 border-l border-white/20 whitespace-nowrap shrink-0 tracking-wider">
          0{currentSlide + 1} / 0{totalSlides}
        </span>
      </div>
    </section>
  );
}
