// 견적 계산 유틸리티
// priceMatrix JSON에서 조건별 월납입료를 조회하는 헬퍼
// TODO: Sprint 2에서 구현

export interface QuoteParams {
  contractMonths: 36 | 48 | 60;
  prepayment: "선납30" | "보증금30" | "무보증";
  annualMileage: 10000 | 15000 | 20000 | 30000;
  driverAge: 21 | 26;
  productType: "렌트" | "리스";
}

export interface QuoteResult {
  basePrice: number;
  optionPrice: number;
  monthlyPayment: number;
  vatIncluded: boolean;
}

export function calculateQuote(
  priceMatrix: Record<string, number>,
  params: QuoteParams,
  selectedOptions: { name: string; price: number }[] = []
): QuoteResult | null {
  // TODO: priceMatrix에서 키 조합으로 월납입료 조회
  return null;
}
