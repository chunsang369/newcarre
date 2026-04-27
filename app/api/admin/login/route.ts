import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    // 환경변수 읽기 (공백 제거)
    const ADMIN_USER = (process.env.ADMIN_USERNAME || "admin").trim();
    const ADMIN_PASS = (process.env.ADMIN_PASSWORD || "hicarz1234!").trim();

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      // 쿠키 설정
      const cookieStore = await cookies();
      cookieStore.set("admin_session", "true", {
        httpOnly: true,
        // 로컬 http 환경에서 테스트를 위해 secure를 false로 설정하거나 주석 처리
        secure: false, 
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24시간 유지
        path: "/",
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, message: "아이디 또는 비밀번호가 일치하지 않습니다." },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
