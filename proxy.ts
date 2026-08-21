import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_API = ["/api/admin/login", "/api/admin/logout"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname.startsWith("/admin");
  const isProtectedApi =
    pathname.startsWith("/api/admin") ||
    /^\/api\/quotes\/[^/]+$/.test(pathname);

  if (!isAdminPage && !isProtectedApi) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();
  if (PUBLIC_API.includes(pathname)) return NextResponse.next();

  const session = request.cookies.get("admin_session");
  if (session?.value === "true") return NextResponse.next();

  if (isProtectedApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/quotes/:path*"],
};
