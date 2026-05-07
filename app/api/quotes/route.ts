import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      phone, 
      contactMethod, 
      availableTime, 
      carOfInterest, 
      carConfig, 
      consent,
      source 
    } = body;

    // 필수 필드 검증
    if (!name || !phone || !consent) {
      return NextResponse.json(
        { error: "필수 항목을 입력해주세요." },
        { status: 400 }
      );
    }

    // 전화번호 포맷 정리
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return NextResponse.json(
        { error: "올바른 전화번호를 입력해주세요." },
        { status: 400 }
      );
    }

    // DB 저장
    const quote = await prisma.quoteRequest.create({
      data: {
        name,
        phone: cleanPhone,
        contactMethod: contactMethod || "phone",
        availableTime: availableTime || null,
        carOfInterest: carOfInterest || null,
        carConfig: carConfig || null,
        consentPrivacy: consent,
        source: source || "HOMEPAGE_FORM",
        status: "NEW",
      },
    });

    return NextResponse.json(
      { success: true, id: quote.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/quotes] Error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
