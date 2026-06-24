export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // 1. 관리자 세션 쿠키 검사 (관리자 트래킹 오염 방지)
    const adminSession = request.cookies.get("admin_session");
    if (adminSession && adminSession.value === "true") {
      return NextResponse.json({ success: true, ignored: true });
    }

    const body = await request.json();
    const { sessionId, visitorId, path, referrer, utmSource, utmMedium, utmCampaign } = body;

    if (!sessionId || !visitorId || !path) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userAgent = request.headers.get("user-agent") || "";
    const uaUpper = userAgent.toUpperCase();

    // 2. Referrer 파싱하여 referringDomain 도메인 추출
    let referringDomain: string | null = null;

    // 모바일 인앱 브라우저 시그니처 정밀 탐지 (referrer 헤더 유실 대응)
    if (uaUpper.includes("KAKAOTALK")) {
      referringDomain = "kakaotalk (App)";
    } else if (uaUpper.includes("INSTAGRAM")) {
      referringDomain = "instagram (App)";
    } else if (uaUpper.includes("FBAV") || uaUpper.includes("FBAN")) {
      referringDomain = "facebook (App)";
    } else if (referrer) {
      try {
        const url = new URL(referrer);
        const host = url.hostname.toLowerCase();
        
        // 주요 도메인 단순화 (e.g. m.search.naver.com -> naver.com)
        if (host.includes("naver.com")) {
          referringDomain = "naver.com";
        } else if (host.includes("google.com")) {
          referringDomain = "google.com";
        } else if (host.includes("daum.net") || host.includes("kakao.com")) {
          referringDomain = "daum/kakao";
        } else if (host.includes("facebook.com")) {
          referringDomain = "facebook.com";
        } else if (host.includes("instagram.com")) {
          referringDomain = "instagram.com";
        } else if (host.includes("youtube.com")) {
          referringDomain = "youtube.com";
        } else {
          referringDomain = host;
        }
      } catch (e) {
        referringDomain = "unknown";
      }
    } else {
      referringDomain = "direct";
    }
    
    // 3. IP 주소 추출 및 마스킹 (개인정보 보호 준수)
    let ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null;
    if (ipAddress) {
      ipAddress = ipAddress.split(",")[0].trim();
      const parts = ipAddress.split(".");
      if (parts.length === 4) {
        ipAddress = `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
      }
    }

    // 4. 데이터베이스에 유입 로그 생성
    const visit = await prisma.visitLog.create({
      data: {
        sessionId,
        visitorId,
        path,
        referrer: referrer || null,
        referringDomain,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        userAgent,
        ipAddress,
      },
    });

    return NextResponse.json({ success: true, visitId: visit.id });
  } catch (error: any) {
    console.error("Error creating visit log:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
