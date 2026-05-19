import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 — 제로카즈",
  description: "제로카즈(ZeroCarz) 개인정보처리방침입니다.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[800px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text)] mb-8">개인정보처리방침</h1>

        <div className="prose max-w-none text-sm text-[var(--color-text-muted)] leading-relaxed space-y-10">
          <p className="text-[var(--color-text)]">
            주식회사 한신종합기획(이하 &quot;회사&quot;라 합니다)이 운영하는 제로카즈(이하 &quot;서비스&quot;라 합니다)는 「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」, 「전기통신사업법」 등 관련 법령을 준수하며, 이용자의 개인정보를 보호하기 위해 본 개인정보처리방침을 수립·공개합니다.
            <br />
            본 방침은 정부의 법률·지침 변경 또는 회사 내부방침 변경 시 개정될 수 있으며, 변경 시 서비스 공지사항을 통해 안내합니다.
          </p>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">제1조 (개인정보 수집에 대한 동의)</h2>
            <p>
              회사는 이용자가 본 방침 및 이용약관의 내용에 대해 「동의함」 또는 「동의하지 않음」을 선택할 수 있는 절차를 마련하고 있으며, 「동의함」 선택 시 개인정보 수집에 동의한 것으로 간주합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">제2조 (개인정보의 수집 항목 및 방법)</h2>
            
            <h3 className="text-base font-bold text-[var(--color-text)] mb-2">가. 수집 항목</h3>
            <h4 className="text-sm font-bold text-[var(--color-text)] mb-2">1) 견적 문의 시 (필수)</h4>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse border border-[var(--color-border)] text-left">
                <thead className="bg-[var(--color-bg-subtle)]">
                  <tr>
                    <th className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">항목</th>
                    <th className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">수집 형태</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)]">이름</td>
                    <td className="p-3 border border-[var(--color-border)]">직접 입력</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)]">휴대폰번호</td>
                    <td className="p-3 border border-[var(--color-border)]">직접 입력</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)]">안내방법 (전화/문자/카톡)</td>
                    <td className="p-3 border border-[var(--color-border)]">선택 입력</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)]">상담가능시간</td>
                    <td className="p-3 border border-[var(--color-border)]">선택 입력</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)]">차량 정보</td>
                    <td className="p-3 border border-[var(--color-border)]">견적 페이지 선택</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)]">관심차량</td>
                    <td className="p-3 border border-[var(--color-border)]">직접 입력</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 className="text-sm font-bold text-[var(--color-text)] mb-2">2) 서비스 이용 과정에서 자동 수집되는 정보</h4>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse border border-[var(--color-border)] text-left">
                <thead className="bg-[var(--color-bg-subtle)]">
                  <tr>
                    <th className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">항목</th>
                    <th className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">수집 도구</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)]">IP 주소, 접속 일시</td>
                    <td className="p-3 border border-[var(--color-border)]">서버 로그</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)]">쿠키(Cookie)</td>
                    <td className="p-3 border border-[var(--color-border)]">브라우저</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)]">페이지 방문 기록, 체류 시간, 이탈률</td>
                    <td className="p-3 border border-[var(--color-border)]">Google Analytics 4</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)]">브라우저 종류, OS, 기기 정보</td>
                    <td className="p-3 border border-[var(--color-border)]">Google Analytics 4</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)]">검색어, 유입 경로</td>
                    <td className="p-3 border border-[var(--color-border)]">Google Analytics 4</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-base font-bold text-[var(--color-text)] mb-2">나. 수집 방법</h3>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li>홈페이지 견적 문의 폼</li>
              <li>카카오톡 채널 상담</li>
              <li>유선 상담</li>
              <li>자동 수집 도구 (쿠키, GA4)</li>
            </ul>

            <p className="mt-2 text-[var(--color-text)]">
              회사는 서비스 제공에 필요한 최소한의 개인정보만 수집하며, 인종, 종교, 정치적 성향, 건강상태 등 민감정보는 일절 수집하지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">제3조 (개인정보의 수집·이용 목적)</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-[var(--color-border)] text-left">
                <thead className="bg-[var(--color-bg-subtle)]">
                  <tr>
                    <th className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">수집 항목</th>
                    <th className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">이용 목적</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)]">이름, 휴대폰번호</td>
                    <td className="p-3 border border-[var(--color-border)]">본인 확인, 문의 접수, 견적 결과 안내, 상담 진행</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)]">안내방법, 상담가능시간</td>
                    <td className="p-3 border border-[var(--color-border)]">고객 맞춤형 상담 일정 조율</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)]">차량 정보, 관심차량</td>
                    <td className="p-3 border border-[var(--color-border)]">장기렌탈 견적 산출 및 맞춤형 제안</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)]">자동 수집 정보 (IP, 쿠키, GA4 데이터)</td>
                    <td className="p-3 border border-[var(--color-border)]">서비스 개선, 부정이용 방지, 트래픽 통계 분석</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">제4조 (개인정보의 보유 및 이용기간)</h2>
            <p className="mb-2">① 회사는 이용자가 서비스를 이용하는 기간 동안 개인정보를 보유합니다.</p>
            <p className="mb-2">② 이용자가 수집·이용 동의를 철회하거나 삭제를 요청한 경우 지체 없이 파기합니다. 단, 분쟁 해결 및 민원 처리를 위해 요청일로부터 1년간 보관 후 완전 파기합니다.</p>
            <p className="mb-4">③ 관계 법령에 따라 다음 정보는 명시된 기간 동안 보관합니다.</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-[var(--color-border)] text-left">
                <thead className="bg-[var(--color-bg-subtle)]">
                  <tr>
                    <th className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">보관 정보</th>
                    <th className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">보존 근거</th>
                    <th className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">보존 기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)]">소비자 불만 및 분쟁 처리 기록</td>
                    <td className="p-3 border border-[var(--color-border)]">전자상거래 등에서의 소비자보호에 관한 법률</td>
                    <td className="p-3 border border-[var(--color-border)]">3년</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)]">본인확인 기록</td>
                    <td className="p-3 border border-[var(--color-border)]">정보통신망 이용촉진 및 정보보호 등에 관한 법률</td>
                    <td className="p-3 border border-[var(--color-border)]">6개월</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)]">접속 기록</td>
                    <td className="p-3 border border-[var(--color-border)]">통신비밀보호법</td>
                    <td className="p-3 border border-[var(--color-border)]">3개월</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">제5조 (개인정보의 제3자 제공)</h2>
            <p className="mb-4">
              회사는 이용자의 개인정보를 본 방침에 명시된 목적 외로 이용하거나 제3자에게 제공하지 않습니다. 단, 아래의 경우에는 예외로 합니다.
            </p>
            
            <h3 className="text-base font-bold text-[var(--color-text)] mb-2">가. 제3자 제공 현황</h3>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse border border-[var(--color-border)] text-left">
                <thead className="bg-[var(--color-bg-subtle)]">
                  <tr>
                    <th className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">제공받는 자</th>
                    <th className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">제공 목적</th>
                    <th className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">제공 항목</th>
                    <th className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">보유·이용 기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)]">오토플래닛</td>
                    <td className="p-3 border border-[var(--color-border)]">장기렌탈 견적 산출 및 계약 체결 지원</td>
                    <td className="p-3 border border-[var(--color-border)]">
                      이름, 휴대폰번호, 안내방법, 상담가능시간, 차량 정보, 관심차량
                    </td>
                    <td className="p-3 border border-[var(--color-border)]">제공 목적 달성 시까지 (최대 1년)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mb-4 text-xs">
              제공 시점: 견적 문의 폼 제출 즉시 자동 전송
              <br />
              이용자는 제3자 제공에 대한 동의를 거부할 권리가 있으며, 동의 거부 시 견적 서비스 이용이 제한될 수 있습니다.
            </p>

            <h3 className="text-base font-bold text-[var(--color-text)] mb-2">나. 예외적 제공</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령에 의거 적법한 절차에 따른 정부기관·수사기관의 요청이 있는 경우</li>
              <li>통계작성, 학술연구 등 목적으로 특정 개인을 식별할 수 없는 형태로 가공하여 제공하는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">제6조 (개인정보 처리위탁)</h2>
            <p className="mb-4">회사는 서비스 제공을 위해 다음과 같이 개인정보 처리 업무를 위탁하고 있습니다.</p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse border border-[var(--color-border)] text-left">
                <thead className="bg-[var(--color-bg-subtle)]">
                  <tr>
                    <th className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">수탁업체</th>
                    <th className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">위탁 업무</th>
                    <th className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">위탁 국가</th>
                    <th className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">보유·이용 기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)]">Netlify, Inc.</td>
                    <td className="p-3 border border-[var(--color-border)]">웹사이트 호스팅, 폼 데이터 수신</td>
                    <td className="p-3 border border-[var(--color-border)]">미국</td>
                    <td className="p-3 border border-[var(--color-border)]">위탁 계약 종료 시까지</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)]">Neon, Inc.</td>
                    <td className="p-3 border border-[var(--color-border)]">데이터베이스 저장 및 관리</td>
                    <td className="p-3 border border-[var(--color-border)]">싱가포르</td>
                    <td className="p-3 border border-[var(--color-border)]">위탁 계약 종료 시까지</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)]">Google LLC</td>
                    <td className="p-3 border border-[var(--color-border)]">웹사이트 트래픽 분석 (Google Analytics 4)</td>
                    <td className="p-3 border border-[var(--color-border)]">미국</td>
                    <td className="p-3 border border-[var(--color-border)]">위탁 계약 종료 시까지</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              회사는 위탁계약 체결 시 「개인정보 보호법」 제26조에 따라 위탁업무 수행 목적 외 개인정보 처리 금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등의 사항을 계약서에 명시합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">제7조 (개인정보의 국외 이전)</h2>
            <p className="mb-4">회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보를 국외로 이전합니다.</p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse border border-[var(--color-border)] text-left text-xs">
                <thead className="bg-[var(--color-bg-subtle)]">
                  <tr>
                    <th className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">이전받는 자</th>
                    <th className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">이전 국가</th>
                    <th className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">이전 일시 및 방법</th>
                    <th className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">이전 항목</th>
                    <th className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">이용 목적</th>
                    <th className="p-3 border border-[var(--color-border)] font-bold text-[var(--color-text)]">보유·이용 기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)]">Netlify, Inc.</td>
                    <td className="p-3 border border-[var(--color-border)]">미국</td>
                    <td className="p-3 border border-[var(--color-border)]">서비스 이용 시점, 네트워크를 통한 전송</td>
                    <td className="p-3 border border-[var(--color-border)]">견적 문의 시 수집 항목 일체</td>
                    <td className="p-3 border border-[var(--color-border)]">호스팅 및 폼 데이터 수신</td>
                    <td className="p-3 border border-[var(--color-border)]">위탁 계약 종료 시까지</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)]">Neon, Inc.</td>
                    <td className="p-3 border border-[var(--color-border)]">싱가포르</td>
                    <td className="p-3 border border-[var(--color-border)]">서비스 이용 시점, 네트워크를 통한 전송</td>
                    <td className="p-3 border border-[var(--color-border)]">견적 문의 시 수집 항목 일체</td>
                    <td className="p-3 border border-[var(--color-border)]">데이터베이스 저장·관리</td>
                    <td className="p-3 border border-[var(--color-border)]">위탁 계약 종료 시까지</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[var(--color-border)]">Google LLC</td>
                    <td className="p-3 border border-[var(--color-border)]">미국</td>
                    <td className="p-3 border border-[var(--color-border)]">페이지 방문 시점, 네트워크를 통한 전송</td>
                    <td className="p-3 border border-[var(--color-border)]">IP, 쿠키, 페이지 방문 기록 등 자동 수집 정보</td>
                    <td className="p-3 border border-[var(--color-border)]">트래픽 분석</td>
                    <td className="p-3 border border-[var(--color-border)]">Google 정책에 따름</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              이용자는 개인정보의 국외 이전에 대한 동의를 거부할 권리가 있으나, 거부 시 서비스 이용이 제한될 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">제8조 (정보주체의 권리·의무 및 행사 방법)</h2>
            <p className="mb-2">이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리 정지 요구</li>
              <li>수집·이용·제3자 제공 동의의 철회</li>
            </ul>
            <p className="mb-2">
              권리 행사는 회사 고객센터(010-5813-8090) 또는 이메일(umjc25@gmail.com)을 통해 요청할 수 있으며, 회사는 지체 없이 조치합니다.
            </p>
            <p>
              만 14세 미만 아동의 법정대리인은 아동의 개인정보 열람, 정정, 삭제, 처리정지 요구권을 행사할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">제9조 (개인정보의 안전성 확보 조치)</h2>
            <p className="mb-4">회사는 개인정보 보호를 위해 다음과 같은 조치를 취하고 있습니다.</p>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text)] mb-1">기술적 조치</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>개인정보의 암호화 전송 (HTTPS/TLS)</li>
                  <li>데이터베이스 암호화 저장</li>
                  <li>해킹·바이러스 방지를 위한 보안 시스템 운영</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-bold text-[var(--color-text)] mb-1">관리적 조치</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>개인정보 취급 인원 최소화</li>
                  <li>개인정보 취급자 정기 교육</li>
                  <li>접근 권한 관리</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-bold text-[var(--color-text)] mb-1">물리적 조치</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>전자적 파일 형태의 개인정보 파기 시 복구 불가능한 기술적 방법 사용</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">제10조 (자동수집장치의 설치·운영 및 거부)</h2>
            
            <h3 className="text-base font-bold text-[var(--color-text)] mb-2">가. 쿠키(Cookie)</h3>
            <p className="mb-2">회사는 이용자에게 개인화된 서비스를 제공하기 위해 쿠키를 사용합니다.</p>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li>사용 목적: 접속 빈도, 방문 시간, 이용 형태 분석을 통한 맞춤 서비스 제공</li>
              <li>설치·운영 및 거부 방법: 웹브라우저 설정 → 개인정보 → 쿠키 저장 거부 선택 가능</li>
              <li>거부 시 영향: 일부 서비스 이용에 제한이 있을 수 있음</li>
            </ul>

            <h3 className="text-base font-bold text-[var(--color-text)] mb-2">나. Google Analytics 4</h3>
            <p className="mb-2">회사는 웹사이트 트래픽 분석을 위해 Google Analytics 4를 사용합니다.</p>
            <ul className="list-disc list-inside space-y-1">
              <li>수집 정보: 페이지 방문 기록, 체류 시간, 이탈률, 유입 경로, 기기 정보</li>
              <li>거부 방법: Google Analytics 옵트아웃 부가기능 설치</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">제11조 (만 14세 미만 아동의 개인정보 처리)</h2>
            <p>
              회사는 만 14세 미만 아동의 개인정보를 수집하지 않습니다. 만약 만 14세 미만 아동의 개인정보가 수집된 사실이 확인될 경우 즉시 파기합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">제12조 (개인정보 보호책임자 및 연락처)</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-[var(--color-border)] text-left">
                <tbody>
                  <tr>
                    <th className="p-3 border border-[var(--color-border)] bg-[var(--color-bg-subtle)] font-bold text-[var(--color-text)] w-1/3">회사명</th>
                    <td className="p-3 border border-[var(--color-border)] text-[var(--color-text)]">주식회사 한신종합기획</td>
                  </tr>
                  <tr>
                    <th className="p-3 border border-[var(--color-border)] bg-[var(--color-bg-subtle)] font-bold text-[var(--color-text)]">브랜드</th>
                    <td className="p-3 border border-[var(--color-border)] text-[var(--color-text)]">제로카즈</td>
                  </tr>
                  <tr>
                    <th className="p-3 border border-[var(--color-border)] bg-[var(--color-bg-subtle)] font-bold text-[var(--color-text)]">개인정보 보호책임자</th>
                    <td className="p-3 border border-[var(--color-border)] text-[var(--color-text)]">이예찬 (대표)</td>
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
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">제13조 (권익침해 구제 방법)</h2>
            <p className="mb-2">개인정보 침해로 인한 신고나 상담이 필요한 경우 아래 기관에 문의할 수 있습니다.</p>
            <ul className="list-disc list-inside space-y-1">
              <li>개인정보분쟁조정위원회: 1833-6972 (www.kopico.go.kr)</li>
              <li>개인정보침해신고센터: 118 (privacy.kisa.or.kr)</li>
              <li>대검찰청 사이버수사과: 1301 (www.spo.go.kr)</li>
              <li>경찰청 사이버안전국: 182 (cyberbureau.police.go.kr)</li>
            </ul>
          </section>

          <div className="pt-6 border-t border-[var(--color-border)] text-xs">
            <p>최종 수정일: 2026년 5월 18일</p>
          </div>
        </div>
      </div>
    </div>
  );
}
