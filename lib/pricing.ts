// lib/pricing.ts

export function getSubsidyFactor(fuelType: string, slug: string): number {
  const fType = fuelType?.toUpperCase() || "";
  if (fType === "ELECTRIC" || fType === "EV") {
    const s = slug?.toLowerCase() || "";
    if (s.includes("casper")) {
      return 0.298; // 캐스퍼 일렉트릭 특별 보조금
    } else if (s.includes("tesla") || s.includes("model-3") || s.includes("model-y")) {
      return 0.85; // 테슬라 평균 보조금
    }
    return 0.88; // 일반 전기차 평균 보조금
  }
  return 1.0;
}

export interface MinimalCarForPricing {
  slug: string;
  fuelType: string;
  basePrice: number;
  priceMatrix: any;
}

export function resolveListPrices(car: MinimalCarForPricing) {
  const matrix = typeof car.priceMatrix === "string" ? JSON.parse(car.priceMatrix) : car.priceMatrix;
  
  // 목록 노출 기본 조건: 36개월, 선수금 30%, 연 2만km (36_PREPAY_30_20000)
  const baseKey = "36_PREPAY_30_20000";
  let rent = matrix?.[baseKey]?.rent || 0;
  let lease = matrix?.[baseKey]?.lease || 0;

  const subsidyFactor = getSubsidyFactor(car.fuelType, car.slug);

  // 오류 가격 필터링 기준 (선수금 30% 조건이므로 차량 가격의 0.45% / 0.35%)
  const minAllowedRent = Math.floor(car.basePrice * 0.0045);
  const minAllowedLease = Math.floor(car.basePrice * 0.0035);

  // 렌트 최저가 검사 및 보정
  if (!rent || rent === 0 || rent < minAllowedRent || rent < 50000) {
    // RENT 표준 36개월 무보증 요율(1.65%) * 선수금 30% 감액비율(0.66) * 보조금팩터
    rent = Math.round(car.basePrice * 0.0165 * 0.66 * subsidyFactor);
  }

  // 리스 최저가 검사 및 보정
  if (!lease || lease === 0 || lease < minAllowedLease || lease < 50000) {
    // LEASE 표준 36개월 무보증 요율(1.35%) * 선수금 30% 감액비율(0.66) * 보조금팩터
    lease = Math.round(car.basePrice * 0.0135 * 0.66 * subsidyFactor);
  }

  // 최저가 기본 트림의 오프셋 반영
  let rentOffset = 0;
  let leaseOffset = 0;
  try {
    const options = typeof (car as any).options === "string"
      ? JSON.parse((car as any).options)
      : (car as any).options;
    const firstTrim = options?.grades?.[0]?.trims?.[0];
    if (firstTrim) {
      rentOffset = Number(firstTrim.rentOffset) || 0;
      leaseOffset = Number(firstTrim.leaseOffset) || 0;
    }
  } catch (e) {
    // options 파싱 실패 시 패스
  }

  return { rent: rent + rentOffset, lease: lease + leaseOffset };
}

export function resolveTrimRepresentativePrice(
  car: MinimalCarForPricing,
  trim: { price: number; rentOffset?: number; leaseOffset?: number },
  type: "rent" | "lease"
): number {
  const matrix = typeof car.priceMatrix === "string" ? JSON.parse(car.priceMatrix) : car.priceMatrix;
  const key = "36_PREPAY_30_20000";
  const baseEntry = matrix?.[key] || { rent: 0, lease: 0 };
  let baseMonthly = baseEntry?.[type] || 0;

  const basePrice = car.basePrice || 0;
  const currentTrimPrice = Number(trim.price) || basePrice || 0;
  const trimPriceDiff = Math.max(0, currentTrimPrice - basePrice);

  const minThresholdRatio = type === "rent" ? 0.0045 : 0.0035;
  const minAllowedMonthly = Math.floor(basePrice * minThresholdRatio);

  const subsidyFactor = getSubsidyFactor(car.fuelType, car.slug);

  if (!baseMonthly || baseMonthly < minAllowedMonthly || baseMonthly <= 20000 || car.slug?.includes("casper")) {
    const baseRatio = type === "rent" ? 0.0165 : 0.0135;
    const fallbackBase = Math.floor(currentTrimPrice * baseRatio * subsidyFactor);
    baseMonthly = Math.floor(fallbackBase * 0.66); // PREPAY_30 감액
  } else {
    const added = Math.floor(trimPriceDiff * 0.009); // PREPAY_30 감액 비율 요율 0.009
    baseMonthly = baseMonthly + added;
  }

  const offset = type === "rent" ? (trim.rentOffset || 0) : (trim.leaseOffset || 0);
  return baseMonthly + offset;
}
