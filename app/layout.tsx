import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

import ChannelTalk from "@/components/ChannelTalk";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "하이카즈 — 신차 장기렌트·리스 견적 비교",
  description:
    "신차 장기렌트, 리스 최저가 견적을 비교하고 전문 매니저 상담을 무료로 받으세요. 국산·수입차 전 모델 대응.",
  keywords: ["장기렌트", "리스", "신차", "견적", "비교", "하이카즈"],
  openGraph: {
    title: "하이카즈 — 신차 장기렌트·리스 견적 비교",
    description: "신차 장기렌트, 리스 최저가 견적 비교 플랫폼",
    type: "website",
    locale: "ko_KR",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={cn("h-full", "font-sans", geist.variable)}>
      <head>
        {/* Pretendard 가변 폰트 CDN */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <ChannelTalk />
      </body>
    </html>
  );
}
