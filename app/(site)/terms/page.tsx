import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관 — 제로카즈",
  description: "제로카즈(ZeroCarz) 서비스 이용약관입니다.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[800px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text)] mb-8">이용약관</h1>

        <div className="prose max-w-none text-sm text-[var(--color-text-muted)] leading-relaxed space-y-10">
          <p className="text-[var(--color-text)]">
            주식회사 한신종합기획(이하 &quot;회사&quot;라 합니다)이 운영하는 제로카즈(이하 &quot;서비스&quot;라 합니다)의 이용 조건 및 절차, 이용자와 회사의 권리·의무·책임사항을 규정함을 목적으로 합니다.
          </p>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">제1조 (목적)</h2>
            <p>
              본 약관은 회사가 제공하는 장기렌탈 견적 중개 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">제2조 (용어의 정의)</h2>
            <p className="mb-4">본 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-[var(--color-border)] text-left">
                <thead className="bg-[var(--color-bg-subtle)]">
                  <tr>
                    <th className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)] w-1/4">용어</th>
                    <th className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">정의</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">회사</td>
                    <td className="p-3 border border-[var(--color-border)]">주식회사 한신종합기획 (브랜드명: 제로카즈)</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">서비스</td>
                    <td className="p-3 border border-[var(--color-border)]">
                      회사가 운영하는 웹사이트(이하 &quot;사이트&quot;)를 통해 제공하는 장기렌탈 견적 중개 및 관련 부대 서비스 일체
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">이용자</td>
                    <td className="p-3 border border-[var(--color-border)]">본 약관에 따라 회사가 제공하는 서비스를 이용하는 자</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">견적 문의</td>
                    <td className="p-3 border border-[var(--color-border)]">
                      이용자가 사이트의 견적 폼을 통해 차량 관련 정보를 입력하고 견적 상담을 요청하는 행위
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">제휴사</td>
                    <td className="p-3 border border-[var(--color-border)]">
                      회사와 견적 정보 중개 계약을 체결한 장기렌탈 사업자 (오토플래닛 등)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">렌탈 계약</td>
                    <td className="p-3 border border-[var(--color-border)]">이용자와 제휴사 간에 직접 체결되는 자동차 장기렌탈 계약</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">제3조 (약관의 명시 및 개정)</h2>
            <p className="mb-2">
              ① 회사는 본 약관의 내용, 상호, 영업소 소재지, 대표자의 성명, 사업자등록번호, 연락처(전화, 전자우편 주소 등)를 이용자가 알 수 있도록 사이트 초기화면에 게시합니다.
            </p>
            <p className="mb-2">
              ② 회사는 「약관의 규제에 관한 법률」, 「전자상거래 등에서의 소비자보호에 관한 법률」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령에 위배되지 않는 범위에서 본 약관을 개정할 수 있습니다.
            </p>
            <p className="mb-2">
              ③ 회사가 약관을 개정할 경우 적용일자 및 개정 사유를 명시하여 현행 약관과 함께 사이트 초기화면에 적용일자 7일 이전부터 공지합니다.
            </p>
            <p>
              ④ 이용자가 개정 약관에 동의하지 않을 경우 서비스 이용을 중단하고 이용계약을 해지할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">제4조 (서비스의 제공)</h2>
            <p className="mb-2">① 회사는 다음과 같은 서비스를 제공합니다.</p>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li>장기렌탈 차량 정보 제공</li>
              <li>장기렌탈 견적 산출 및 안내</li>
              <li>제휴사와의 견적 중개</li>
              <li>기타 회사가 정하는 부대 서비스</li>
            </ul>
            <p className="mb-2">
              ② 회사는 차량의 직접 판매자 또는 렌탈 사업자가 아닙니다. 회사는 이용자와 제휴사 간의 견적 정보 중개 역할만을 수행하며, 실제 렌탈 계약의 당사자가 아닙니다.
            </p>
            <p>
              ③ 회사는 견적 정보의 정확성을 위해 노력하나, 차량 가격, 옵션, 재고, 계약 조건 등은 제휴사의 정책 및 시장 상황에 따라 변동될 수 있습니다. 최종 계약 조건은 이용자와 제휴사 간의 협의에 따라 결정됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">제5조 (서비스의 중단)</h2>
            <p className="mb-2">① 회사는 다음 각 호의 경우 서비스 제공을 일시적으로 중단할 수 있습니다.</p>
            <ol className="list-decimal list-inside space-y-1 mb-4">
              <li>시스템 정기점검, 보수, 교체, 고장 또는 통신 두절이 발생한 경우</li>
              <li>서비스 이용 폭주 등으로 서비스 제공이 곤란한 경우</li>
              <li>천재지변, 비상사태 등 회사가 통제할 수 없는 사유가 발생한 경우</li>
              <li>기타 회사의 운영상 합리적 사유로 서비스 제공이 어려운 경우</li>
            </ol>
            <p className="mb-2">
              ② 서비스 중단 시 회사는 사이트 초기화면 또는 공지사항을 통해 이용자에게 통지합니다. 단, 사전 통지가 곤란한 긴급한 경우에는 사후 통지할 수 있습니다.
            </p>
            <p>
              ③ 회사는 회사의 고의 또는 중대한 과실로 인한 서비스 중단으로 이용자에게 발생한 손해에 대해서만 책임을 부담합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">제6조 (서비스의 이용)</h2>
            <p className="mb-2">① 본 서비스는 별도의 회원가입 절차 없이 비회원 형태로 이용할 수 있습니다.</p>
            <p className="mb-2">
              ② 이용자는 사이트의 견적 문의 폼에 필요한 정보를 정확히 입력하여 견적을 요청할 수 있습니다.
            </p>
            <p className="mb-2">
              ③ 견적 문의 시 입력하는 정보는 진실하고 정확해야 하며, 허위 정보 입력으로 인해 발생하는 모든 책임은 이용자에게 있습니다.
            </p>
            <p>
              ④ 본 서비스는 무료로 제공됩니다. 이용자가 서비스 이용 자체에 대해 회사에 비용을 지불할 의무는 없습니다. 단, 제휴사와의 렌탈 계약 체결 시 발생하는 비용은 제휴사의 약관 및 정책에 따릅니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">제7조 (이용자의 의무)</h2>
            <p className="mb-2">이용자는 다음 행위를 하여서는 안 됩니다.</p>
            <ul className="list-disc list-inside space-y-1">
              <li>견적 문의 시 허위 정보 또는 타인의 정보를 입력하는 행위</li>
              <li>회사가 게시한 정보를 무단으로 변경하거나 도용하는 행위</li>
              <li>회사 또는 제3자의 저작권 등 지적재산권을 침해하는 행위</li>
              <li>회사 또는 제3자의 명예를 훼손하거나 업무를 방해하는 행위</li>
              <li>외설 또는 폭력적인 메시지, 화상, 음성 등 공서양속에 반하는 정보를 사이트에 게시하는 행위</li>
              <li>자동화된 방법(봇, 크롤러 등)을 통해 회사의 서비스를 무단으로 이용하는 행위</li>
              <li>기타 관련 법령 및 본 약관이 금지하는 행위</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">제8조 (개인정보의 보호)</h2>
            <p className="mb-2">① 회사는 이용자의 개인정보를 보호하기 위해 「개인정보 보호법」 등 관련 법령을 준수합니다.</p>
            <p className="mb-2">
              ② 개인정보의 수집·이용·제공·파기 등에 관한 구체적인 사항은 별도의 「개인정보처리방침」에 따릅니다.
            </p>
            <p className="mb-2">
              ③ 이용자는 견적 문의 시 회사의 개인정보처리방침에 동의해야 하며, 동의 없이는 서비스 이용이 제한될 수 있습니다.
            </p>
            <p>
              ④ 회사는 견적 문의를 통해 수집한 개인정보를 본 약관 및 개인정보처리방침에 명시된 목적 외로 사용하지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">제9조 (제휴사와의 관계 및 책임의 한계)</h2>
            <p className="mb-2">
              ① 회사는 이용자의 견적 문의 정보를 제휴사(오토플래닛)에 전달하며, 제휴사는 해당 정보를 바탕으로 이용자에게 견적 및 상담을 제공합니다.
            </p>
            <p className="mb-2">② 회사는 다음 사항에 대해 책임을 부담하지 않습니다.</p>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li>제휴사가 제공하는 견적 내용, 차량 정보, 계약 조건의 정확성</li>
              <li>이용자와 제휴사 간 체결된 렌탈 계약의 이행, 불이행, 해지, 분쟁 등</li>
              <li>제휴사가 이용자에게 제공하는 부가 서비스(보험, 정비 등)와 관련된 사항</li>
              <li>제휴사의 영업 정책 변경으로 인한 견적 조건 변동</li>
            </ul>
            <p className="mb-2">
              ③ 이용자가 제휴사와 렌탈 계약을 체결하는 경우, 해당 계약의 모든 권리·의무는 이용자와 제휴사 간에 발생하며, 회사는 해당 계약의 당사자가 아닙니다.
            </p>
            <p>
              ④ 이용자는 제휴사와의 계약 체결 전 계약 조건을 충분히 검토하고, 의문이 있는 경우 제휴사에 직접 문의해야 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">제10조 (회사의 의무)</h2>
            <p className="mb-2">
              ① 회사는 관련 법령과 본 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며, 안정적인 서비스 제공을 위해 최선을 다합니다.
            </p>
            <p className="mb-2">
              ② 회사는 이용자가 안전하게 서비스를 이용할 수 있도록 개인정보 보호를 위한 보안 시스템을 갖둡니다.
            </p>
            <p className="mb-2">
              ③ 회사는 「표시·광고의 공정화에 관한 법률」을 준수하며, 이용자에게 부당한 표시·광고로 손해를 입힌 경우 이를 배상할 책임을 집니다.
            </p>
            <p>
              ④ 회사는 이용자가 원하지 않는 영리목적의 광고성 정보를 발송하지 않습니다. 단, 이용자가 사전에 동의한 경우는 예외로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">제11조 (저작권의 귀속 및 이용 제한)</h2>
            <p className="mb-2">
              ① 사이트에 게시된 콘텐츠(텍스트, 이미지, 디자인, 로고 등)에 대한 저작권 및 지적재산권은 회사 또는 정당한 권리자에게 귀속됩니다.
            </p>
            <p className="mb-2">
              ② 이용자는 회사의 사전 서면 동의 없이 사이트의 콘텐츠를 복제, 배포, 송신, 출판, 방송, 영리 목적 이용, 제3자 이용 제공 등의 방법으로 사용할 수 없습니다.
            </p>
            <p>
              ③ 이용자가 본 조를 위반하여 회사 또는 제3자에게 손해를 발생시킨 경우, 이용자는 모든 책임을 부담합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">제12조 (면책 조항)</h2>
            <p className="mb-2">① 회사는 다음 각 호의 사유로 인한 손해에 대해 책임을 부담하지 않습니다.</p>
            <ol className="list-decimal list-inside space-y-1 mb-4">
              <li>천재지변, 전쟁, 폭동, 테러, 정부의 명령 등 불가항력적 사유</li>
              <li>이용자의 귀책사유로 인한 서비스 이용 장애</li>
              <li>이용자가 입력한 정보의 부정확성 또는 허위성으로 인한 손해</li>
              <li>제휴사의 귀책사유로 인해 발생한 손해</li>
              <li>회사가 통제할 수 없는 제3자(통신사업자 등)의 서비스 장애</li>
              <li>무료로 제공되는 서비스 이용과 관련하여 발생한 손해 (회사의 고의 또는 중대한 과실이 있는 경우 제외)</li>
            </ol>
            <p>
              ② 회사는 이용자 상호 간 또는 이용자와 제3자 상호 간에 서비스를 매개로 발생한 분쟁에 대해 개입할 의무가 없으며, 이로 인한 손해를 배상할 책임도 없습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">제13조 (이용계약의 해지)</h2>
            <p className="mb-2">
              ① 이용자는 언제든지 회사 고객센터를 통해 개인정보 삭제를 요청함으로써 이용계약을 해지할 수 있습니다.
            </p>
            <p>
              ② 회사는 이용자가 본 약관 제7조의 의무를 위반한 경우 사전 통지 없이 서비스 이용을 제한하거나 이용계약을 해지할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">제14조 (분쟁의 해결)</h2>
            <p className="mb-2">
              ① 회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상 처리하기 위해 최선을 다합니다.
            </p>
            <p>
              ② 회사와 이용자 간 발생한 분쟁에 관하여 이용자의 피해구제 신청이 있는 경우, 「소비자기본법」에 따른 한국소비자원 또는 「전자상거래 등에서의 소비자보호에 관한 법률」에 따른 분쟁조정 기관의 조정에 따를 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">제15조 (재판권 및 준거법)</h2>
            <p className="mb-2">
              ① 회사와 이용자 간 발생한 분쟁에 관한 소송은 「민사소송법」상의 관할법원에 제기합니다.
            </p>
            <p>
              ② 회사와 이용자 간에 제기된 소송에는 대한민국 법령을 적용합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">부칙</h2>
            <p>본 약관은 2026년 5월 18일부터 시행됩니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">사업자 정보</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-[var(--color-border)] text-left">
                <tbody>
                  <tr>
                    <th className="p-3 border border-[var(--color-border)] bg-[var(--color-bg-subtle)] font-bold text-[var(--color-text)] w-1/3">상호</th>
                    <td className="p-3 border border-[var(--color-border)] text-[var(--color-text)]">주식회사 한신종합기획</td>
                  </tr>
                  <tr>
                    <th className="p-3 border border-[var(--color-border)] bg-[var(--color-bg-subtle)] font-bold text-[var(--color-text)]">브랜드</th>
                    <td className="p-3 border border-[var(--color-border)] text-[var(--color-text)]">제로카즈</td>
                  </tr>
                  <tr>
                    <th className="p-3 border border-[var(--color-border)] bg-[var(--color-bg-subtle)] font-bold text-[var(--color-text)]">대표자</th>
                    <td className="p-3 border border-[var(--color-border)] text-[var(--color-text)]">이예찬</td>
                  </tr>
                  <tr>
                    <th className="p-3 border border-[var(--color-border)] bg-[var(--color-bg-subtle)] font-bold text-[var(--color-text)]">사업자등록번호</th>
                    <td className="p-3 border border-[var(--color-border)] text-[var(--color-text)]">836-12-01570</td>
                  </tr>
                  <tr>
                    <th className="p-3 border border-[var(--color-border)] bg-[var(--color-bg-subtle)] font-bold text-[var(--color-text)]">통신판매업 신고번호</th>
                    <td className="p-3 border border-[var(--color-border)] text-[var(--color-text)]">제2024-경기오산-0333호</td>
                  </tr>
                  <tr>
                    <th className="p-3 border border-[var(--color-border)] bg-[var(--color-bg-subtle)] font-bold text-[var(--color-text)]">주소</th>
                    <td className="p-3 border border-[var(--color-border)] text-[var(--color-text)]">경기도 오산시 운천로165번길 56-1, 301호(오산동, 대교주택)</td>
                  </tr>
                  <tr>
                    <th className="p-3 border border-[var(--color-border)] bg-[var(--color-bg-subtle)] font-bold text-[var(--color-text)]">고객센터</th>
                    <td className="p-3 border border-[var(--color-border)] text-[var(--color-text)]">010-5813-8090</td>
                  </tr>
                  <tr>
                    <th className="p-3 border border-[var(--color-border)] bg-[var(--color-bg-subtle)] font-bold text-[var(--color-text)]">이메일</th>
                    <td className="p-3 border border-[var(--color-border)] text-[var(--color-text)]">umjc25@gmail.com</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">개정 이력</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-[var(--color-border)] text-left">
                <thead className="bg-[var(--color-bg-subtle)]">
                  <tr>
                    <th className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">버전</th>
                    <th className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">시행일</th>
                    <th className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">주요 변경사항</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)]">v1.0</td>
                    <td className="p-3 border border-[var(--color-border)]">2026년 5월 18일</td>
                    <td className="p-3 border border-[var(--color-border)]">최초 제정</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
