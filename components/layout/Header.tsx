"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Phone, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "빠른 간편견적", href: "/cars/quick-quote" },
  { label: "계약후기", href: "/reviews" },
  { label: "FAQ", href: "/faq" },
  { label: "회사소개", href: "/company" },
];

const PHONE_NUMBER = "1577-0000";
const KAKAO_URL = "http://pf.kakao.com/_XXXXX/chat";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 드로어 오픈 시 body 스크롤 잠금
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
            : "bg-white"
        )}
      >
        <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
          <div className="flex h-14 lg:h-16 items-center justify-between">
            {/* 로고 */}
            <Link
              href="/"
              className="flex items-center gap-2 shrink-0"
              aria-label="하이카즈 홈"
            >
              <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-gradient-to-br from-[#0a2540] to-[#1e5a9e] flex items-center justify-center">
                <span className="text-white font-bold text-sm lg:text-base">H</span>
              </div>
              <span className="text-lg lg:text-xl font-bold text-[#0a2540] tracking-tight">
                하이카즈
              </span>
            </Link>

            {/* 데스크톱 GNB (lg+) */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="메인 내비게이션">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#0a2540] hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* 데스크톱 우측 연락처 (lg+) */}
            <div className="hidden lg:flex items-center gap-3">
              <a
                href={`tel:${PHONE_NUMBER}`}
                className="flex items-center gap-1.5 text-sm font-semibold text-[#0a2540]"
              >
                <Phone className="w-4 h-4" />
                {PHONE_NUMBER}
              </a>
              <a
                href={KAKAO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#FEE500] text-[#3C1E1E] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#F5DC00] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                카톡 상담
              </a>
            </div>

            {/* 모바일 우측 아이콘 */}
            <div className="flex lg:hidden items-center gap-2">
              <a
                href={KAKAO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="카카오톡 상담"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href={`tel:${PHONE_NUMBER}`}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="전화 상담"
              >
                <Phone className="w-5 h-5" />
              </a>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label={isOpen ? "메뉴 닫기" : "메뉴 열기"}
                aria-expanded={isOpen}
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 모바일 드로어 (우측 슬라이드) */}
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <nav
        className={cn(
          "fixed top-0 right-0 bottom-0 z-50 w-[280px] bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="모바일 메뉴"
      >
        {/* 드로어 상단 */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-gray-100">
          <span className="text-base font-bold text-[#0a2540]">메뉴</span>
          <button
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="메뉴 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 메뉴 아이템 */}
        <div className="py-4 px-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center px-3 py-3.5 text-[15px] font-medium text-gray-800 hover:text-[#0a2540] hover:bg-gray-50 rounded-xl transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* 드로어 하단 연락처 */}
        <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-gray-100 bg-gray-50/50">
          <a
            href={`tel:${PHONE_NUMBER}`}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#0a2540] text-white text-sm font-semibold hover:bg-[#143a66] transition-colors mb-2.5"
          >
            <Phone className="w-4 h-4" />
            {PHONE_NUMBER} 전화 상담
          </a>
          <a
            href={KAKAO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#FEE500] text-[#3C1E1E] text-sm font-semibold hover:bg-[#F5DC00] transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            카카오톡 상담
          </a>
        </div>
      </nav>

      {/* 헤더 높이만큼 spacer */}
      <div className="h-14 lg:h-16" />
    </>
  );
}
