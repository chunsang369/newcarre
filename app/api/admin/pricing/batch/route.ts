export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { resolveTrimRepresentativePrice } from "@/lib/pricing";

export async function POST(request: Request) {
  console.log("=== API Route /api/admin/pricing/batch HIT ===");
  try {
    const { action, type, amount, filters } = await request.json();

    if (action === "adjust") {
      const parsedAmount = parseInt(amount, 10);
      if (isNaN(parsedAmount)) {
        return NextResponse.json({ error: "올바르지 않은 금액 형식입니다." }, { status: 400 });
      }

      const cars = await prisma.car.findMany({
        include: { brand: true }
      });
      
      let updateCount = 0;
      for (const car of cars) {
        // 차량 단위 필터 조건 검증 (브랜드, 모델명 지정 시 통과 여부 검사)
        if (filters) {
          if (filters.brandId && car.brandId !== filters.brandId) continue;
          if (filters.modelName && car.modelName !== filters.modelName) continue;
        }

        const options = typeof car.options === "string"
          ? JSON.parse(car.options)
          : (car.options || {});

        if (!options || !options.grades) continue;

        let isCarUpdated = false;

        // options.grades 아래의 모든 트림 순회
        for (const grade of options.grades) {
          if (!grade.trims) continue;
          for (const trim of grade.trims) {
            // 원본 대표 요금 계산 (오프셋 배제된 상태로 원가 계산을 수행하기 위해 임시로 오프셋이 없는 객체를 넘김)
            const cleanTrimForOrig = {
              price: Number(trim.price) || car.basePrice,
              rentOffset: 0,
              leaseOffset: 0
            };

            // 렌트 원가와 리스 원가 구하기
            const origRentVal = resolveTrimRepresentativePrice(car, cleanTrimForOrig, "rent");
            const origLeaseVal = resolveTrimRepresentativePrice(car, cleanTrimForOrig, "lease");

            // 렌트 조건부 가감
            if (type === "rent" || type === "all") {
              let passRentFilter = true;
              if (filters && filters.originalTier !== undefined && filters.originalTier !== null && filters.originalTier !== "") {
                const itemTier = Math.floor(origRentVal / 100000);
                const targetTier = parseInt(filters.originalTier, 10);
                if (itemTier !== targetTier) passRentFilter = false;
              }
              if (passRentFilter) {
                const currentOffset = parseInt(trim.rentOffset, 10) || 0;
                trim.rentOffset = currentOffset + parsedAmount;
                isCarUpdated = true;
              }
            }

            // 리스 조건부 가감
            if (type === "lease" || type === "all") {
              let passLeaseFilter = true;
              if (filters && filters.originalTier !== undefined && filters.originalTier !== null && filters.originalTier !== "") {
                const itemTier = Math.floor(origLeaseVal / 100000);
                const targetTier = parseInt(filters.originalTier, 10);
                if (itemTier !== targetTier) passLeaseFilter = false;
              }
              if (passLeaseFilter) {
                const currentOffset = parseInt(trim.leaseOffset, 10) || 0;
                trim.leaseOffset = currentOffset + parsedAmount;
                isCarUpdated = true;
              }
            }
          }
        }

        // 변경 내역이 있을 때만 DB 업데이트 실행 (options 필드를 업데이트)
        if (isCarUpdated) {
          await prisma.car.update({
            where: { id: car.id },
            data: { options }
          });
          updateCount++;
        }
      }
      
      // @ts-ignore
      revalidateTag("cars");
      return NextResponse.json({ 
        success: true, 
        message: `조건에 부합하는 ${updateCount}대 차량의 개별 트림 요금이 성공적으로 일괄 수정되었습니다.` 
      });
    }
    
    if (action === "reset") {
      const cars = await prisma.car.findMany();
      let updateCount = 0;
      for (const car of cars) {
        const options = typeof car.options === "string"
          ? JSON.parse(car.options)
          : (car.options || {});

        if (!options || !options.grades) continue;

        let isCarUpdated = false;
        for (const grade of options.grades) {
          if (!grade.trims) continue;
          for (const trim of grade.trims) {
            if (trim.rentOffset !== undefined || trim.leaseOffset !== undefined) {
              delete trim.rentOffset;
              delete trim.leaseOffset;
              isCarUpdated = true;
            }
          }
        }

        if (isCarUpdated) {
          await prisma.car.update({
            where: { id: car.id },
            data: { options }
          });
          updateCount++;
        }
      }
      
      // @ts-ignore
      revalidateTag("cars");
      return NextResponse.json({ success: true, message: `총 ${updateCount}대 차량의 트림별 세부조정 가격이 초기화되었습니다.` });
    }

    return NextResponse.json({ error: "잘못된 요청 작업입니다." }, { status: 400 });
  } catch (error) {
    console.error("Failed batch pricing action:", error);
    return NextResponse.json({ error: "작업 처리 중 서버 오류가 발생했습니다." }, { status: 500 });
  }
}
