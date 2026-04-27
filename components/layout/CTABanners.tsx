import Link from "next/link";
import { Headphones, Gift, Truck } from "lucide-react";

const BANNERS = [
  {
    id: 1,
    icon: Headphones,
    title: "전문 매니저 상세 상담",
    desc: "하이카즈 전문 매니저가 1:1로 최적 견적을 설계합니다",
    cta: "간편견적 받기",
    href: "/cars/quick-quote",
    gradient: "from-[#0a2540] to-[#1e5a9e]",
  },
  {
    id: 2,
    icon: Gift,
    title: "캐시백 최대 100만원",
    desc: "지금 계약하면 하이카즈만의 캐시백 혜택까지",
    cta: "혜택 확인하기",
    href: "/cars/quick-quote",
    gradient: "from-[#ff6b35] to-[#ff8f65]",
  },
  {
    id: 3,
    icon: Truck,
    title: "7일 이내 인도 보장",
    desc: "기다림 없이 바로 출고. 재고 한정 특별 할인",
    cta: "즉시출고 보기",
    href: "/cars/instant",
    gradient: "from-[#10b981] to-[#34d399]",
  },
];

export default function CTABanners() {
  return (
    <section className="py-12 lg:py-24 bg-white" aria-label="프로모션 배너">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {BANNERS.map((banner) => {
            const Icon = banner.icon;
            return (
              <Link
                key={banner.id}
                href={banner.href}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${banner.gradient} p-6 lg:p-8 text-white hover:shadow-xl transition-all hover:scale-[1.02]`}
              >
                {/* 장식 원 */}
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full blur-xl" />

                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold mb-1.5">{banner.title}</h3>
                  <p className="text-sm text-white/80 mb-4">{banner.desc}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-white bg-white/20 px-4 py-2 rounded-lg group-hover:bg-white/30 transition-colors">
                    {banner.cta}
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
