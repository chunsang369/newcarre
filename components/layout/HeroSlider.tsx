"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

const SLIDES = [
  {
    id: 1,
    title: "신차 장기렌트 · 리스",
    subtitle: "최저가 견적 비교",
    description: "전 차종 무보증 · 개인 · 법인\n한 번에 비교하고 최저가로 출고하세요",
    gradient: "from-[#0a2540] via-[#143a66] to-[#1e5a9e]",
    accent: "오렌지",
  },
  {
    id: 2,
    title: "이달의 특가",
    subtitle: "캐시백 최대 100만원",
    description: "지금 계약하면 캐시백 혜택까지\n하이카즈만의 특별한 조건",
    gradient: "from-[#1a1a2e] via-[#16213e] to-[#0f3460]",
    accent: "블루",
  },
  {
    id: 3,
    title: "7일 이내 인도 보장",
    subtitle: "즉시출고 특가",
    description: "기다림 없이 바로 출고\n재고 차량 한정 특별 할인",
    gradient: "from-[#0d1117] via-[#161b22] to-[#21262d]",
    accent: "그린",
  },
];

const AUTOPLAY_INTERVAL = 4000;

export default function HeroSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // 자동 순환 (4초)
  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, AUTOPLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleCtaClick = () => {
    const formSection = document.getElementById("quote-form");
    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="hero-slider" aria-label="메인 배너">
      <div className="hero-slider__viewport" ref={emblaRef}>
        <div className="hero-slider__container">
          {SLIDES.map((slide) => (
            <div key={slide.id} className="hero-slider__slide">
              <div
                className={`hero-slider__bg bg-gradient-to-br ${slide.gradient}`}
              >
                {/* 장식 요소 */}
                <div className="hero-slider__decoration">
                  <div className="hero-slider__circle hero-slider__circle--1" />
                  <div className="hero-slider__circle hero-slider__circle--2" />
                  <div className="hero-slider__circle hero-slider__circle--3" />
                </div>

                <div className="hero-slider__content">
                  <p className="hero-slider__subtitle">{slide.subtitle}</p>
                  <h2 className="hero-slider__title">{slide.title}</h2>
                  <p className="hero-slider__description">
                    {slide.description.split("\n").map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < slide.description.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                  <button
                    onClick={handleCtaClick}
                    className="hero-slider__cta"
                    aria-label="간편 빠른상담 신청하기"
                  >
                    간편 빠른상담 신청하기
                    <svg
                      className="hero-slider__cta-icon"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 인디케이터 */}
      <div className="hero-slider__dots">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`hero-slider__dot ${
              index === selectedIndex ? "hero-slider__dot--active" : ""
            }`}
            aria-label={`슬라이드 ${index + 1}로 이동`}
          />
        ))}
      </div>
    </section>
  );
}
