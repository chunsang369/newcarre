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

      {/* ── 2. Dark Overlay ── */}
      {/* 모바일: 전체 어두운 단일 오버레이 / 데스크탑: 좌→우 그라데이션 */}
      <div
        className="absolute inset-0 z-10 bg-black/60 lg:bg-transparent"
        style={{}}
      />
      <div
        className="absolute inset-0 z-10 hidden lg:block"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 100%)",
        }}
      />

      {/* ── 3. Content Area ── */}
      <div className="relative z-20 h-full flex flex-col justify-center container mx-auto px-6 lg:px-16 py-20 lg:py-32">
        <div className="w-full lg:w-1/2 flex flex-col items-start gap-[22px]">
          {/* 3축 가로 배치: 가격 / 심사 / 출고 */}
          <div className="flex items-end gap-[22px] lg:gap-[28px]">
            {PILLARS.map((p) => (
              <div key={p.num} className="flex flex-col items-start group cursor-default">
                <span className="text-white/40 text-xs font-medium tracking-[2px] mb-2">
                  {p.num}
                </span>
                <span className="text-white text-[32px] lg:text-[46px] font-medium leading-none tracking-[-1.5px] group-hover:text-white/80 transition-colors">
                  {p.label}
                </span>
                <div className="w-8 h-0.5 bg-white mt-3.5 group-hover:w-12 transition-all duration-300" />
              </div>
            ))}
          </div>

          {/* 소제목 */}
          <p className="text-white/85 text-xl leading-relaxed">
            다 비교하고 오세요.
          </p>

          {/* 메인 슬로건 (파란 하이라이트) */}
          <h1 className="text-[24px] lg:text-[36px] font-medium leading-tight tracking-[-1.2px]">
            <span className="bg-[#4a7fc9] text-white px-2.5 py-0.5 inline-block">
              지지 않습니다.
            </span>
          </h1>

          {/* 서브텍스트 */}
          <p className="text-white/55 text-[13px] leading-relaxed">
            3분이면 검증 끝.{" "}
            <span className="underline underline-offset-4">
              견적서 사진 한장만 주세요.
            </span>
          </p>

          {/* CTA 버튼 */}
          <Link
            href="/cars/quick-quote"
            className="inline-block bg-white text-[#0a0a0a] px-7 py-3.5 rounded text-sm font-medium hover:bg-white/90 active:scale-95 transition-all"
          >
            빠른 간편 견적 →
          </Link>
        </div>
      </div>
    </section>
  );
}
