"use client";

import Link from "next/link";
import { Home, Phone, MessageCircle, Car, FileText } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "홈", href: "/", icon: Home },
  { label: "전화걸기", href: "tel:1577-2617", icon: Phone },
  { label: "카톡문의", href: "http://pf.kakao.com/_LUDxcn/chat", icon: MessageCircle, external: true },
  { label: "즉시출고", href: "/cars/instant", icon: Car },
  { label: "상담신청", href: "/cars/quick-quote", icon: FileText, highlight: true },
];

export default function FloatingCTA() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-gray-200 bg-white safe-area-bottom">
      <div className="flex items-stretch h-14">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 bg-[#469BD9] text-white active:bg-[#3a8dc7] transition-colors"
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors",
                isActive ? "text-[#469BD9]" : "text-gray-500 active:text-gray-700"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
