import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 — 하이카즈",
  description: "하이카즈 오토플랜 개인정보처리방침입니다.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[800px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text)] mb-8">개인정보처리방침</h1>

        <div className="prose max-w-none text-sm text-[var(--color-text-muted)] leading-relaxed space-y-6">
          <section>
            <h2 className="text-base font-bold text-[var(--color-text)] mb-2">1. 개인정보의 수집 및 이용 목적</h2>
            <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>견적 상담 요청 처리 및 상담 연락</li>
              <li>서비스 이용에 따른 본인 확인</li>
              <li>고객 만족도 조사 및 서비스 개선</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--color-text)] mb-2">2. 수집하는 개인정보 항목</h2>
            <p>회사는 견적 상담을 위해 아래와 같은 개인정보를 수집합니다:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>필수항목</strong>: 이름, 전화번호</li>
              <li><strong>선택항목</strong>: 관심 차량, 선호 연락 방법, 상담 가능 시간</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--color-text)] mb-2">3. 개인정보의 보유 및 이용 기간</h2>
            <p>이용자의 개인정보는 수집 목적이 달성된 후 <strong>1년간</strong> 보유하며, 이후 지체 없이 파기합니다.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--color-text)] mb-2">4. 개인정보의 파기</h2>
            <p>회사는 원칙적으로 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--color-text)] mb-2">5. 개인정보의 제3자 제공</h2>
            <p>회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의한 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--color-text)] mb-2">6. 개인정보 보호책임자</h2>
            <div className="bg-[var(--color-bg-subtle)] rounded-xl p-4 mt-2">
              <p>이름: 홍길동 (대표)</p>
              <p>전화: 1577-0000</p>
              <p>이메일: privacy@hicarzautoplan.com</p>
            </div>
          </section>

          <div className="pt-6 border-t border-[var(--color-border)] text-xs">
            <p>시행일: 2024년 1월 1일</p>
          </div>
        </div>
      </div>
    </div>
  );
}
