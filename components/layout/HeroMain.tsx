"use client";

import Link from "next/link";

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
  backgroundImage,
  backgroundVideo,
  backgroundVideoWebm,
}: HeroMainProps) {
  return (
    <section
      className="relative w-full min-h-[70vh] lg:min-h-[600px] lg:h-[80vh] overflow-hidden bg-[#0a0a0a]"
      aria-label="메인 히어로"
    >
      {/* ── 1. Background Slot ── */}
      <div className="absolute inset-0 z-0">
        {backgroundVideo ? (
          <video
            autoPlay
            muted
            playsInline
            poster={backgroundImage}
            // @ts-expect-error fetchPriority is not natively supported on video types
            fetchPriority="high"
            className="w-full h-full object-cover transition-transform duration-1000"
            style={{ transform: "scale(1.15)" }}
          >
            <source src={backgroundVideo} type="video/mp4" />
            {backgroundVideoWebm && (
              <source src={backgroundVideoWebm} type="video/webm" />
            )}
          </video>
        ) : backgroundImage ? (
          <img
            src={backgroundImage}
            alt="배경 이미지"
            className="w-full h-full object-cover"
          />
        ) : null}
      </div>

      {/* ── 2. Overlay ── */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/30 z-10" />

      {/* ── 3. Content Area ── */}
      <div className="relative z-20 h-full flex flex-col justify-center container mx-auto px-6 lg:px-16 py-20 lg:py-32">
        <div className="w-full lg:w-1/2 flex flex-col items-start gap-[22px]">
          {/* 3축 가로 배치: 가격 / 심사 / 출고 */}
          <div className="flex items-end gap-[33px] lg:gap-[42px]">
            {PILLARS.map((p) => (
              <div key={p.num} className="flex flex-col items-start group cursor-default">
                <span className="text-white/50 text-sm font-medium tracking-[2px] mb-2">
                  {p.num}
                </span>
                <span className="text-white text-[32px] lg:text-[46px] font-normal leading-none tracking-tight group-hover:text-white/80 transition-colors">
                  {p.label}
                </span>
                <div className="w-full h-[3px] bg-white mt-3" />
              </div>
            ))}
          </div>

          {/* 소제목 */}
          <p className="text-white font-medium text-lg lg:text-xl tracking-tight">
            다 비교하고 오세요.
          </p>

          {/* 메인 슬로건 */}
          <h1 className="text-white text-3xl lg:text-5xl font-bold tracking-tight">
            지지 않습니다.
          </h1>

          {/* 서브텍스트 */}
          <p className="text-gray-400 text-sm leading-relaxed">
            3분이면 검증 끝.{" "}
            <span className="underline underline-offset-4">
              견적서 사진 한장만 주세요.
            </span>
          </p>

          {/* CTA 버튼 */}
          <Link
            href="/cars/quick-quote"
            className="inline-block bg-white text-[#0a0a0a] px-10 py-4 rounded-full text-base font-semibold hover:bg-gray-100 hover:scale-[1.02] transition-all duration-200 active:scale-95"
          >
            빠른 간편 견적 &gt;
          </Link>
        </div>
      </div>
    </section>
  );
}
