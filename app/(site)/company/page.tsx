import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "회사소개 — 하이카즈",
  description: "하이카즈 오토플랜은 신차 장기렌트·리스 전문 컨설팅 기업입니다. 고객 맞춤형 최저가 견적을 제공합니다.",
};

export default function CompanyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[var(--color-primary)] to-[#1a3d6e] text-white">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-16 lg:py-24 text-center">
          <h1 className="text-3xl lg:text-5xl font-bold mb-4">하이카즈 오토플랜</h1>
          <p className="text-white/80 text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
            고객 한 분 한 분의 상황에 맞춘<br className="hidden lg:block" />
            최적의 장기렌트·리스 솔루션을 제공합니다
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-12 lg:py-20 space-y-16 lg:space-y-24">
        {/* About */}
        <section className="lg:flex lg:items-center lg:gap-16">
          <div className="lg:w-1/2 mb-8 lg:mb-0">
            <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl p-12 lg:p-16 text-center">
              <div className="text-6xl lg:text-8xl mb-4">🚗</div>
              <p className="text-lg font-bold text-[var(--color-primary)]">Since 2018</p>
            </div>
          </div>
          <div className="lg:w-1/2">
            <h2 className="text-2xl lg:text-3xl font-bold text-[var(--color-text)] mb-4">CEO 인사말</h2>
            <div className="space-y-4 text-[var(--color-text-muted)] leading-relaxed text-sm lg:text-base">
              <p>안녕하세요. 하이카즈 오토플랜 대표입니다.</p>
              <p>저희는 신차 장기렌트와 리스 시장에서 고객에게 가장 합리적이고 투명한 견적을 제공하기 위해 설립되었습니다. 복잡한 금융 조건과 다양한 옵션 사이에서 고객이 최적의 선택을 할 수 있도록 전문 매니저가 1:1 맞춤 상담을 진행합니다.</p>
              <p>국산차부터 수입차까지, 전 브랜드 전 모델을 아우르는 폭넓은 네트워크와 축적된 경험으로 최저가 견적을 보장합니다.</p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section>
          <h2 className="text-2xl lg:text-3xl font-bold text-[var(--color-text)] text-center mb-10">핵심 가치</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "💎", title: "투명한 가격", desc: "숨겨진 비용 없이 명확한 견적을 제공합니다. 고객이 직접 비교하고 선택할 수 있습니다." },
              { icon: "🤝", title: "1:1 전문 상담", desc: "차량 선택부터 계약까지, 전담 매니저가 고객의 상황에 맞는 최적의 조건을 찾아드립니다." },
              { icon: "⚡", title: "신속한 처리", desc: "상담 신청 후 30분 이내 연락, 계약 후 최단 7일 이내 인도를 목표로 합니다." },
            ].map((v) => (
              <div key={v.title} className="bg-[var(--color-bg-subtle)] rounded-2xl p-6 lg:p-8 text-center hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">{v.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Info */}
        <section className="bg-[var(--color-bg-subtle)] rounded-2xl p-6 lg:p-10">
          <h2 className="text-xl font-bold text-[var(--color-text)] mb-6">회사 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {[
              ["상호", "하이카즈 오토플랜"],
              ["대표자", "홍길동"],
              ["사업자등록번호", "123-45-67890"],
              ["통신판매업신고", "제2024-서울강남-0000호"],
              ["대표전화", "1577-0000"],
              ["이메일", "info@hicarzautoplan.com"],
              ["주소", "서울특별시 강남구 테헤란로 123, 4층"],
            ].map(([label, value]) => (
              <div key={label} className="flex">
                <span className="w-32 lg:w-40 text-[var(--color-text-muted)] flex-shrink-0">{label}</span>
                <span className="text-[var(--color-text)] font-medium">{value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-xl lg:text-2xl font-bold text-[var(--color-text)] mb-4">지금 바로 무료 상담 받아보세요</h2>
          <p className="text-[var(--color-text-muted)] text-sm mb-6">전문 매니저가 고객님만을 위한 최저가 견적을 준비해드립니다</p>
          <Link
            href="/cars/quick-quote"
            className="inline-flex px-8 py-4 rounded-xl bg-[var(--color-accent)] text-white font-bold text-base hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            간편 견적 신청하기
          </Link>
        </section>
      </div>
    </div>
  );
}
