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

    // 텔레그램 알림
    try {
      const telegramToken = '8734012174:AAE8PYV7W8dzrauAzetXC3CUJmEnOKR_dkg';
      const chatId = '-1003951663293';
      const message =
        `🚗 *신차 구매 신규 접수*\n` +
        `─────────────────\n` +
        `🆔 접수번호: ${quote.id}\n` +
        `👤 고객명: ${name}\n` +
        `📞 연락처: ${cleanPhone}\n` +
        `📱 연락방법: ${contactMethod || '-'}\n` +
        `⏰ 연락가능시간: ${availableTime || '-'}\n` +
        `🚘 관심차량: ${carOfInterest || '-'}\n` +
        `⚙️ 차량옵션: ${carConfig || '-'}\n` +
        `🕐 접수시간: ${new Date().toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'})}`;

      await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' })
      });
    } catch (tgErr) {
      console.error('Telegram notify error:', tgErr);
    }

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
