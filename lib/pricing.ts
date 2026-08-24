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
  type: "rent" | "lease",
  period: "36" | "48" | "60" = "36",
  deposit: "PREPAY_30" | "DEPOSIT_30" | "NO_DEPOSIT" = "NO_DEPOSIT",
  mileage: "10000" | "20000" | "30000" = "20000"
): number {
  const matrix = typeof car.priceMatrix === "string" ? JSON.parse(car.priceMatrix) : car.priceMatrix;
  const key = `${period}_${deposit}_${mileage}`;
  const baseEntry = matrix?.[key] || { rent: 0, lease: 0 };
  let baseMonthly = baseEntry?.[type] || 0;

  const basePrice = car.basePrice || 0;
  const currentTrimPrice = Number(trim.price) || basePrice || 0;
  const trimPriceDiff = Math.max(0, currentTrimPrice - basePrice);

  const minThresholdRatio = deposit === "PREPAY_30" ? 0.0045 : 0.0075;
  const minAllowedMonthly = Math.floor(basePrice * minThresholdRatio);

  const subsidyFactor = getSubsidyFactor(car.fuelType, car.slug);

  let isFallback = false;
  if (!baseMonthly || baseMonthly < minAllowedMonthly || baseMonthly <= 20000) {
    isFallback = true;
    const baseRatio = type === "rent" ? 0.0165 : 0.0135;
    const fallbackBase = Math.floor(currentTrimPrice * baseRatio * subsidyFactor);
    baseMonthly = fallbackBase;
    if (deposit === "PREPAY_30") baseMonthly = Math.floor(fallbackBase * 0.66);
    if (deposit === "DEPOSIT_30") baseMonthly = Math.floor(fallbackBase * 0.88);
  }

  let ratio = 0.018; 
  if (deposit === "DEPOSIT_30") ratio = 0.015;
  if (deposit === "PREPAY_30") ratio = 0.009;
  
  const added = Math.floor(trimPriceDiff * ratio);
  
  let multiplier = 1.0;
  if (period === "48") multiplier = 0.90; 
  if (period === "60") multiplier = 0.82;

  let finalMonthly = 0;
  if (isFallback) {
    finalMonthly = Math.floor((baseMonthly + added) * multiplier);
  } else {
    finalMonthly = Math.floor(baseMonthly + (added * multiplier));
  }

  const offset = type === "rent" ? (trim.rentOffset || 0) : (trim.leaseOffset || 0);
  return finalMonthly + offset;
}

// ──────────────────────────────────────────
// 제트카(Jetcar.co.kr) 신차/저신용 장기렌트 실거래가 매핑 테이블
// ──────────────────────────────────────────
export const JETCAR_LOW_CREDIT_PRICE_MAP: Record<string, number> = {
  // ── 기아 (Kia) ──
  "kia-the-new-sorento-hev": 870000,       // 쏘렌토 HEV 1.6: 870,000원
  "kia-the-new-sorento": 820000,           // 쏘렌토 2.2 디젤/가솔린: 820,000원
  "kia-the-new-seltos": 585000,            // 셀토스 1.6T: 585,000원
  "kia-the-all-new-seltos": 585000,        // 셀토스 1.6T: 585,000원
  "kia-the-all-new-seltos-hev": 640000,    // 셀토스 HEV: 640,000원
  "kia-ev3": 850000,                       // EV3 에어 롱레인지: 850,000원
  "kia-ev3-gt": 875000,                    // EV3 GT: 875,000원
  "kia-ev4": 850000,                       // EV4 롱레인지: 850,000원
  "kia-ev4-gt": 890000,                    // EV4 GT: 890,000원
  "kia-ev5": 990000,                       // EV5 어스 롱레인지: 990,000원
  "kia-ev5-gt": 1050000,                   // EV5 GT: 1,050,000원
  "kia-the-new-sportage": 660000,          // 스포티지 1.6T: 660,000원
  "kia-the-new-sportage-hev": 670000,      // 스포티지 HEV: 670,000원
  "kia-the-new-carnival-hev": 930000,      // 카니발 1.6 HEV 9인승: 930,000원
  "kia-the-new-carnival": 850000,          // 카니발 3.5 가솔린 9인승: 850,000원
  "kia-carnival": 850000,                  // 카니발: 850,000원
  "kia-the-new-k5": 572000,                // K5 2.0 가솔린/LPi: 572,000원
  "kia-the-new-k5-hev": 690000,            // K5 HEV: 690,000원
  "kia-the-new-ray": 451000,               // 레이 1.0 가솔린: 451,000원
  "kia-ray-ev": 520000,                    // 레이 EV: 520,000원
  "kia-the-new-k8": 800000,                // K8 2.5: 800,000원
  "kia-the-new-morning": 390000,           // 모닝: 390,000원
  "kia-the-new-ev6": 890000,               // EV6: 890,000원
  "kia-the-new-ev6-gt": 980000,            // EV6 GT: 980,000원
  "kia-ev9": 1290000,                      // EV9: 1,290,000원
  "kia-ev9-gt": 1390000,                   // EV9 GT: 1,390,000원
  "kia-the-all-new-niro": 590000,          // 니로 HEV: 590,000원
  "kia-the-new-niro": 590000,              // 니로 HEV: 590,000원
  "kia-the-all-new-niroev": 690000,        // 니로 EV: 690,000원
  "kia-the-newk9": 1180000,                // K9: 1,180,000원
  "kia-the-newbongo": 460000,              // 봉고3: 460,000원
  "kia-the-newbongo-special": 510000,      // 봉고3 특장: 510,000원
  "kia-bongo-ev": 560000,                  // 봉고3 EV: 560,000원
  "kia-bongo-ev-special": 620000,          // 봉고3 EV 특장: 620,000원
  "kia-tasman": 790000,                    // 타스만: 790,000원
  "kia-pv5": 750000,                       // PV5: 750,000원

  // ── 현대 (Hyundai) ──
  "hyundai-the-new-avante": 550000,         // 아반떼 1.6: 550,000원
  "hyundai-the-new-avante-hev": 610000,     // 아반떼 HEV: 610,000원
  "hyundai-the-new-avante-n": 690000,
  "hyundai-the-all-new-grandeur": 910000,   // 그랜저 2.5: 910,000원
  "hyundai-the-all-new-grandeur-hev": 960000,
  "hyundai-the-all-new-santa-fe": 750000,   // 싼타페 2.5T: 750,000원
  "hyundai-the-all-new-santa-fe-hev": 770000, // 싼타페 HEV: 770,000원
  "hyundai-sonata-the-edge": 570000,        // 쏘나타 2.0: 570,000원
  "hyundai-sonata-the-edge-hev": 650000,
  "hyundai-venue": 540000,                  // 베뉴 1.6: 540,000원
  "hyundai-the-new-tucson": 650000,         // 투싼 1.6T: 650,000원
  "hyundai-the-new-tucson-hev": 710000,
  "hyundai-the-all-new-palisade": 890000,   // 팰리세이드: 890,000원
  "hyundai-the-all-new-palisade-hev": 950000,
  "hyundai-casper": 420000,                 // 캐스퍼: 420,000원
  "hyundai-casper-electric": 460000,
  "hyundai-staria": 780000,                 // 스타리아: 780,000원
  "hyundai-staria-hybrid": 840000,
  "hyundai-the-new-ioniq-5": 850000,        // 아이오닉5: 850,000원
  "hyundai-ioniq-6": 840000,                // 아이오닉6: 840,000원
  "hyundai-porter-2": 460000,               // 포터2: 460,000원
  "hyundai-porter-2-electric": 550000,

  // ── 제네시스 (Genesis) ──
  "genesis-the-new-g80": 1700000,           // G80 3.5T: 1,700,000원
  "genesis-gv70": 1350000,                  // GV70: 1,350,000원
  "genesis-the-new-gv80": 1650000,          // GV80: 1,650,000원
  "genesis-the-new-g70": 1150000,
  "genesis-the-new-g90": 2300000,
  "genesis-gv60": 1250000,

  // ── 르노 코리아 (Renault) ──
  "renault-arcana": 490000,                 // 아르카나: 490,000원
  "renault-grand-koleos": 790000,           // 그랑콜레오스: 790,000원
  "renault-qm6": 580000,

  // ── KG모빌리티 (KGM) ──
  "kgm-torres": 625000,                     // 토레스: 625,000원
  "kgm-tivoli": 460000,                     // 티볼리: 460,000원
  "kgm-actyon": 680000,                     // 액티언: 680,000원
  "kgm-actyon-hev": 770000,                 // 액티언 HEV: 770,000원
  "kgm-rexton": 880000,                     // 렉스턴: 880,000원
  "kgm-rexton-sports": 560000,
  "kgm-rexton-sports-khan": 590000,

  // ── 쉐보레 (Chevrolet) ──
  "chevrolet-trax-crossover": 510000,       // 트랙스 크로스오버: 510,000원
  "chevrolet-trailblazer": 570000,
};

export function resolveLowCreditMonthlyRent(car: {
  slug: string;
  basePrice: number;
  fuelType?: string | null;
  modelName?: string;
}): number {
  // 1. 직접 매핑된 제트카 가격이 있으면 우선 반환
  if (JETCAR_LOW_CREDIT_PRICE_MAP[car.slug]) {
    return JETCAR_LOW_CREDIT_PRICE_MAP[car.slug];
  }

  // 2. 모델명 키워드 매칭 fallback
  const name = (car.modelName || "").toLowerCase();
  if (name.includes("쏘렌토") && (name.includes("하이브리드") || name.includes("hev"))) return 870000;
  if (name.includes("쏘렌토")) return 820000;
  if (name.includes("셀토스")) return 585000;
  if (name.includes("스포티지") && (name.includes("하이브리드") || name.includes("hev"))) return 670000;
  if (name.includes("스포티지")) return 660000;
  if (name.includes("카니발") && (name.includes("하이브리드") || name.includes("hev"))) return 930000;
  if (name.includes("카니발")) return 850000;
  if (name.includes("k5")) return 572000;
  if (name.includes("k8")) return 800000;
  if (name.includes("k9")) return 1180000;
  if (name.includes("레이") && !name.includes("ev")) return 451000;
  if (name.includes("레이")) return 520000;
  if (name.includes("모닝")) return 390000;
  if (name.includes("ev3")) return 850000;
  if (name.includes("ev4")) return 850000;
  if (name.includes("ev5")) return 990000;
  if (name.includes("ev6")) return 890000;
  if (name.includes("ev9")) return 1290000;
  if (name.includes("아반떼")) return 550000;
  if (name.includes("그랜저")) return 910000;
  if (name.includes("싼타페")) return 750000;
  if (name.includes("쏘나타")) return 570000;
  if (name.includes("투싼")) return 650000;
  if (name.includes("팰리세이드")) return 890000;
  if (name.includes("캐스퍼")) return 420000;
  if (name.includes("스타리아")) return 780000;
  if (name.includes("토레스")) return 625000;
  if (name.includes("티볼리")) return 460000;
  if (name.includes("액티언")) return 680000;
  if (name.includes("아르카나")) return 490000;
  if (name.includes("그랑콜레오스")) return 790000;
  if (name.includes("g80")) return 1700000;
  if (name.includes("gv70")) return 1350000;
  if (name.includes("gv80")) return 1650000;

  // 3. 비례 산정 (제트카 저신용 무심사 렌트 요율: 차량가의 약 2.0% 수준)
  const basePrice = car.basePrice || 30000000;
  const subsidy = getSubsidyFactor(car.fuelType || "", car.slug);
  const calculated = Math.round((basePrice * 0.0215 * subsidy) / 10000) * 10000;
  return Math.max(390000, calculated);
}

