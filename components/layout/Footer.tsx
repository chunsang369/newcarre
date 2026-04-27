import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

const COMPANY_INFO = {
  name: "하이카즈오토플랜",
  ceo: "홍길동",
  address: "서울특별시 강남구 테헤란로 123, 12층",
  businessNo: "123-45-67890",
  ecommerceNo: "제2024-서울강남-12345호",
  phone: "1577-0000",
  email: "contact@hicarz.co.kr",
};

const MENU_LINKS = [
  { label: "빠른 간편견적", href: "/cars/quick-quote" },
  { label: "즉시출고", href: "/cars/instant" },
  { label: "계약후기", href: "/reviews" },
  { label: "FAQ", href: "/faq" },
  { label: "회사소개", href: "/company" },
];

const LEGAL_LINKS = [
  { label: "이용약관", href: "/terms" },
  { label: "개인정보처리방침", href: "/privacy", bold: true },
  { label: "이메일무단수집거부", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0a2540] text-gray-300" aria-label="사이트 정보">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8 py-12 lg:py-16">
        {/* 데스크톱: 4컬럼 / 모바일: 스택 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* 1. 회사 정보 */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                하이카즈
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              신차 장기렌트 · 리스 최저가 견적 비교 플랫폼.
              <br />
              전 차종 무보증, 한 번에 비교하세요.
            </p>
          </div>

          {/* 2. 메뉴 */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">서비스</h3>
            <ul className="space-y-2.5">
              {MENU_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. 연락처 */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">연락처</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={`tel:${COMPANY_INFO.phone}`}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 shrink-0" />
                  {COMPANY_INFO.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${COMPANY_INFO.email}`}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  {COMPANY_INFO.email}
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                {COMPANY_INFO.address}
              </li>
            </ul>
            <div className="mt-5 text-xs text-gray-500 space-y-1">
              <p>상호: {COMPANY_INFO.name}</p>
              <p>대표: {COMPANY_INFO.ceo}</p>
              <p>사업자등록번호: {COMPANY_INFO.businessNo}</p>
              <p>통신판매업신고: {COMPANY_INFO.ecommerceNo}</p>
            </div>
          </div>

          {/* 4. 약관 */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">법적 고지</h3>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={`text-sm transition-colors ${
                      link.bold
                        ? "text-white font-semibold hover:text-gray-200"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 구분선 + 카피라이트 */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-xs text-gray-500 text-center">
            © {new Date().getFullYear()} {COMPANY_INFO.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
