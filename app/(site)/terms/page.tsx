import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관 — 하이카즈",
  description: "하이카즈 오토플랜 서비스 이용약관입니다.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[800px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text)] mb-8">이용약관</h1>

        <div className="prose max-w-none text-sm text-[var(--color-text-muted)] leading-relaxed space-y-6">
          <section>
            <h2 className="text-base font-bold text-[var(--color-text)] mb-2">제1조 (목적)</h2>
            <p>이 약관은 하이카즈 오토플랜(이하 &quot;회사&quot;)이 제공하는 신차 장기렌트·리스 견적 비교 서비스(이하 &quot;서비스&quot;)의 이용조건 및 절차, 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--color-text)] mb-2">제2조 (정의)</h2>
            <p>① &quot;서비스&quot;란 회사가 제공하는 신차 장기렌트·리스 견적 비교 및 상담 연결 서비스를 말합니다.</p>
            <p>② &quot;이용자&quot;란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 자를 말합니다.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--color-text)] mb-2">제3조 (약관의 효력 및 변경)</h2>
            <p>① 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</p>
            <p>② 회사는 합리적인 사유가 발생할 경우 약관을 변경할 수 있으며, 변경된 약관은 공지사항을 통해 공지합니다.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--color-text)] mb-2">제4조 (서비스의 제공)</h2>
            <p>회사는 다음과 같은 서비스를 제공합니다:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>신차 장기렌트·리스 견적 비교 서비스</li>
              <li>전문 매니저 상담 연결 서비스</li>
              <li>차량 정보 제공 서비스</li>
              <li>기타 회사가 정하는 서비스</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--color-text)] mb-2">제5조 (면책)</h2>
            <p>① 회사는 견적 비교 서비스를 통해 제공되는 가격 정보가 실제 계약 조건과 다를 수 있으며, 이에 대해 책임을 지지 않습니다.</p>
            <p>② 실제 렌트·리스 계약은 해당 금융사 및 렌터카 회사와 직접 체결되며, 회사는 중개 역할만 수행합니다.</p>
          </section>

          <div className="pt-6 border-t border-[var(--color-border)] text-xs">
            <p>시행일: 2024년 1월 1일</p>
          </div>
        </div>
      </div>
    </div>
  );
}
