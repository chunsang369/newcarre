import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { popularCars } from "@/prisma/car-data";

// prisma/seed.ts의 generatePriceMatrix 구조를 재사용
function generatePriceMatrixHelper(scrapedMatrix: any) {
  const periods = [36, 48, 60];
  const deposits = ['PREPAY_30', 'DEPOSIT_30', 'NO_DEPOSIT'];
  const mileages = [10000, 20000, 30000];

  const periodFactor = { 36: 1.0, 48: 0.82, 60: 0.70 };
  const mileageFactor = { 10000: 0.92, 20000: 1.0, 30000: 1.12 };

  const depositKeys: Record<string, string> = {
    PREPAY_30: 'prepay',
    DEPOSIT_30: 'deposit',
    NO_DEPOSIT: 'none',
  };

  const matrix: Record<string, { rent: number; lease: number }> = {};

  for (const p of periods) {
    for (const d of deposits) {
      for (const m of mileages) {
        const key = `${p}_${d}_${m}`;
        const dKey = depositKeys[d];
        
        const baseRent = scrapedMatrix?.rent?.[dKey] || 0;
        const baseLease = scrapedMatrix?.lease?.[dKey] || 0;

        const factor =
          periodFactor[p as 36 | 48 | 60] *
          mileageFactor[m as 10000 | 20000 | 30000];
          
        matrix[key] = {
          rent: Math.round(baseRent * factor),
          lease: Math.round(baseLease * factor),
        };
      }
    }
  }
  return matrix;
}

export async function POST(request: Request) {
  try {
    const { action, type, amount, filters } = await request.json();

    if (action === "adjust") {
      const parsedAmount = parseInt(amount, 10);
      if (isNaN(parsedAmount)) {
        return NextResponse.json({ error: "올바르지 않은 금액 형식입니다." }, { status: 400 });
      }

      const cars = await prisma.car.findMany();
      
      let updateCount = 0;
      for (const car of cars) {
        // 차량 단위 필터 조건 검증 (브랜드, 모델명 지정 시 통과 여부 검사)
        if (filters) {
          if (filters.brandId && car.brandId !== filters.brandId) continue;
          if (filters.modelName && car.modelName !== filters.modelName) continue;
        }

        const matrix = car.priceMatrix as Record<string, { rent: number; lease: number }>;
        if (!matrix) continue;

        // 원본 가격 매트릭스 바인딩 (개별 항목 원가 판단용)
        const originalCar = popularCars.find((c) => c.slug === car.slug);
        let origMatrix: Record<string, { rent: number; lease: number }> = {};
        if (originalCar && originalCar.priceMatrix) {
          origMatrix = originalCar.priceMatrix as any;
          if (origMatrix && typeof (origMatrix as any).rent === 'object') {
            origMatrix = generatePriceMatrixHelper(origMatrix);
          }
        }
        
        const updatedMatrix: typeof matrix = {};
        let isCarUpdated = false;

        for (const [key, value] of Object.entries(matrix)) {
          let updatedRent = value.rent;
          let updatedLease = value.lease;
          
          // 개별 매트릭스 항목의 최초 원가 값 (폴백 처리)
          const origRentVal = origMatrix[key]?.rent ?? Math.round(car.basePrice * 0.0091);
          const origLeaseVal = origMatrix[key]?.lease ?? Math.round(car.basePrice * 0.0078);
          
          // 렌트 조건부 가감
          if (type === "rent" || type === "all") {
            let passRentFilter = true;
            if (filters && filters.originalTier !== undefined && filters.originalTier !== null && filters.originalTier !== "") {
              const itemTier = Math.floor(origRentVal / 100000);
              const targetTier = parseInt(filters.originalTier, 10);
              if (itemTier !== targetTier) passRentFilter = false;
            }
            if (passRentFilter) {
              const nextRent = value.rent + parsedAmount;
              updatedRent = Math.max(0, nextRent);
              if (updatedRent !== value.rent) isCarUpdated = true;
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
              const nextLease = value.lease + parsedAmount;
              updatedLease = Math.max(0, nextLease);
              if (updatedLease !== value.lease) isCarUpdated = true;
            }
          }
          
          updatedMatrix[key] = {
            rent: updatedRent,
            lease: updatedLease
          };
        }
        
        // 변경 내역이 있을 때만 DB 업데이트 실행
        if (isCarUpdated) {
          await prisma.car.update({
            where: { id: car.id },
            data: { priceMatrix: updatedMatrix }
          });
          updateCount++;
        }
      }
      
      // @ts-ignore
      revalidateTag("cars");
      return NextResponse.json({ 
        success: true, 
        message: `조건에 부합하는 ${updateCount}대 차량의 개별 요금제 항목이 성공적으로 일괄 수정되었습니다.` 
      });
    }
    
    if (action === "reset") {
      const cars = await prisma.car.findMany();
      for (const car of cars) {
        const originalCar = popularCars.find(c => c.slug === car.slug);
        if (originalCar && originalCar.priceMatrix) {
          let priceMatrix = originalCar.priceMatrix as any;
          if (priceMatrix && typeof priceMatrix.rent === 'object') {
            priceMatrix = generatePriceMatrixHelper(originalCar.priceMatrix);
          }
          
          await prisma.car.update({
            where: { id: car.id },
            data: { priceMatrix }
          });
        }
      }
      
      // @ts-ignore
      revalidateTag("cars");
      return NextResponse.json({ success: true, message: "요금이 기본값으로 초기화되었습니다." });
    }

    return NextResponse.json({ error: "잘못된 요청 작업입니다." }, { status: 400 });
  } catch (error) {
    console.error("Failed batch pricing action:", error);
    return NextResponse.json({ error: "작업 처리 중 서버 오류가 발생했습니다." }, { status: 500 });
  }
}
