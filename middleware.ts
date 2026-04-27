import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 어드민 경로인지 확인
  if (pathname.startsWith("/admin")) {
    // 2. 로그인 페이지는 제외 (무한 루프 방지)
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    // 3. 세션 쿠키 확인
    const session = request.cookies.get("admin_session");

    if (!session || session.value !== "true") {
      // 로그인이 안 되어 있으면 로그인 페이지로 리다이렉트
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// 미들웨어가 실행될 경로 지정
export const config = {
  matcher: ["/admin/:path*"],
};
