"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

// ─── Types ───
interface CarBrand {
  name: string;
  nameEn: string | null;
  slug: string;
  logoUrl: string;
}

interface CarData {
  id: string;
  slug: string;
  modelName: string;
  trimName: string;
  year: number;
  category: string;
  fuelType: string;
  basePrice: number;
  thumbnailUrl: string;
  galleryUrls: string[];
  catalogUrl: string | null;
  specSheetUrl: string | null;
  options: Record<string, unknown>;
  priceMatrix: Record<string, { rent: number; lease: number }>;
  brand: CarBrand;
}

// ─── Helpers ───
function formatPrice(v: number) {
  return v.toLocaleString("ko-KR");
}

function formatPriceWon(v: number) {
  if (v >= 100000000) {
    const uk = Math.floor(v / 100000000);
    const man = Math.floor((v % 100000000) / 10000);
    return man > 0 ? `${uk}억 ${formatPrice(man)}만원` : `${uk}억원`;
  }
  return `${formatPrice(Math.floor(v / 10000))}만원`;
}

const FUEL_LABEL: Record<string, string> = {
  GASOLINE: "가솔린",
  DIESEL: "디젤",
  HYBRID: "하이브리드",
  EV: "전기",
  LPG: "LPG",
};

const CATEGORY_LABEL: Record<string, string> = {
  SEDAN: "세단",
  SUV: "SUV",
  HATCHBACK: "해치백",
  VAN: "밴/MPV",
  COUPE: "쿠페",
  TRUCK: "트럭",
};

// ─── Constants ───
const PERIODS = [36, 48, 60] as const;
const DEPOSITS = [
  { key: "PREPAY_30", label: "선납금 30%" },
  { key: "DEPOSIT_30", label: "보증금 30%" },
  { key: "NO_DEPOSIT", label: "무보증" },
] as const;
const MILEAGES = [
  { key: 10000, label: "연 1만km" },
  { key: 20000, label: "연 2만km" },
  { key: 30000, label: "연 3만km" },
] as const;

// ─── Component ───
export default function CarDetailClient({ car }: { car: CarData }) {
  // Quote simulator state
  const [productType, setProductType] = useState<"rent" | "lease">("rent");
  const [period, setPeriod] = useState<number>(36);
  const [deposit, setDeposit] = useState<string>("PREPAY_30");
  const [mileage, setMileage] = useState<number>(20000);

  // Calculate monthly price
  const monthlyPrice = useMemo(() => {
    const key = `${period}_${deposit}_${mileage}`;
    const entry = car.priceMatrix[key];
    if (!entry) return null;
    return productType === "rent" ? entry.rent : entry.lease;
  }, [productType, period, deposit, mileage, car.priceMatrix]);

  // Comparison
  const comparisonPrice = useMemo(() => {
    const key = `${period}_${deposit}_${mileage}`;
    const entry = car.priceMatrix[key];
    if (!entry) return null;
    return productType === "rent" ? entry.lease : entry.rent;
  }, [productType, period, deposit, mileage, car.priceMatrix]);

  const handleConsult = () => {
    const section = document.getElementById("quick-quote");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)]">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">홈</Link>
            <span>/</span>
            <span>{car.brand.name}</span>
            <span>/</span>
            <span className="text-[var(--color-text)]">{car.modelName}</span>
          </nav>
        </div>
      </div>

      {/* Main 2-column Layout */}
      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-6 lg:py-10">
        <div className="lg:flex lg:gap-10">
          {/* ──────── Left Column: Main Content ──────── */}
          <div className="lg:w-[65%] space-y-8">
            {/* Image Gallery */}
            <section className="relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl overflow-hidden">
              <div className="aspect-[4/3] lg:aspect-[16/10] relative">
                {car.thumbnailUrl ? (
                  <Image
                    src={car.thumbnailUrl}
                    alt={`${car.brand.name} ${car.modelName}`}
                    fill
                    className="object-contain p-6 lg:p-12"
                    priority
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    이미지 준비중
                  </div>
                )}
                {/* Year badge */}
                <span className="absolute top-4 left-4 bg-[var(--color-primary)] text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  {car.year}년형
                </span>
                {/* Fuel badge */}
                <span className="absolute top-4 right-4 bg-white/80 backdrop-blur text-xs font-semibold px-3 py-1.5 rounded-full text-[var(--color-text)]">
                  {FUEL_LABEL[car.fuelType] || car.fuelType}
                </span>
              </div>
            </section>

            {/* Car Info */}
            <section>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white border border-[var(--color-border)] flex items-center justify-center p-1.5 overflow-hidden">
                  {car.brand.logoUrl ? (
                    <Image
                      src={car.brand.logoUrl}
                      alt={car.brand.name}
                      width={28}
                      height={28}
                      className="object-contain"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </div>
                <span className="text-sm font-medium text-[var(--color-text-muted)]">{car.brand.name}</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text)] mb-1">
                {car.modelName}
              </h1>
              <p className="text-base lg:text-lg text-[var(--color-text-muted)] mb-4">
                {car.trimName}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
                  {CATEGORY_LABEL[car.category] || car.category}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
                  {FUEL_LABEL[car.fuelType] || car.fuelType}
                </span>
              </div>
              <div className="bg-[var(--color-bg-subtle)] rounded-xl p-4 lg:p-5">
                <div className="text-sm text-[var(--color-text-muted)] mb-1">차량 기본가</div>
                <div className="text-xl lg:text-2xl font-bold text-[var(--color-text)]">
                  {formatPriceWon(car.basePrice)}
                </div>
              </div>
            </section>

            {/* Mobile-only inline quote simulator */}
            <section className="lg:hidden">
              <QuoteSimulator
                productType={productType}
                setProductType={setProductType}
                period={period}
                setPeriod={setPeriod}
                deposit={deposit}
                setDeposit={setDeposit}
                mileage={mileage}
                setMileage={setMileage}
                monthlyPrice={monthlyPrice}
                comparisonPrice={comparisonPrice}
                onConsult={handleConsult}
              />
            </section>

            {/* Spec Detail */}
            <section>
              <h2 className="text-lg font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                차량 사양
              </h2>
              <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      ["모델명", `${car.brand.name} ${car.modelName}`],
                      ["트림", car.trimName],
                      ["연식", `${car.year}년형`],
                      ["차종", CATEGORY_LABEL[car.category] || car.category],
                      ["연료", FUEL_LABEL[car.fuelType] || car.fuelType],
                      ["기본가격", formatPriceWon(car.basePrice)],
                    ].map(([label, value], i) => (
                      <tr key={label} className={i % 2 === 0 ? "bg-slate-50/50" : ""}>
                        <td className="px-4 py-3 font-medium text-[var(--color-text-muted)] w-28 lg:w-40">{label}</td>
                        <td className="px-4 py-3 text-[var(--color-text)]">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Download Section */}
            {(car.catalogUrl || car.specSheetUrl) && (
              <section>
                <h2 className="text-lg font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  카달로그 / 가격표
                </h2>
                <div className="flex flex-wrap gap-3">
                  {car.catalogUrl && (
                    <a
                      href={car.catalogUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors text-sm font-medium"
                    >
                      📄 카달로그 다운로드
                    </a>
                  )}
                  {car.specSheetUrl && (
                    <a
                      href={car.specSheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors text-sm font-medium"
                    >
                      📋 가격·사양표 다운로드
                    </a>
                  )}
                </div>
              </section>
            )}

            {/* Conditions Note */}
            <section className="bg-amber-50 border border-amber-200 rounded-xl p-4 lg:p-5 text-xs lg:text-sm text-amber-800 leading-relaxed">
              <p className="font-bold mb-2">💡 안내사항</p>
              <ul className="list-disc list-inside space-y-1">
                <li>월 납입료는 만 26세 이상, 일반 신용등급 기준 예시입니다.</li>
                <li>실제 견적은 고객 신용도, 금융사 프로모션에 따라 달라질 수 있습니다.</li>
                <li>정확한 견적은 무료 상담을 통해 확인해주세요.</li>
              </ul>
            </section>

            {/* Inline Quick Quote Form */}
            <section id="quick-quote">
              <QuickConsultInline carName={`${car.brand.name} ${car.modelName} ${car.trimName}`} />
            </section>
          </div>

          {/* ──────── Right Column: Sticky Simulator (Desktop only) ──────── */}
          <div className="hidden lg:block lg:w-[35%]">
            <div className="sticky top-24">
              <QuoteSimulator
                productType={productType}
                setProductType={setProductType}
                period={period}
                setPeriod={setPeriod}
                deposit={deposit}
                setDeposit={setDeposit}
                mileage={mileage}
                setMileage={setMileage}
                monthlyPrice={monthlyPrice}
                comparisonPrice={comparisonPrice}
                onConsult={handleConsult}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ──────── Mobile Sticky Bottom Bar ──────── */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-[var(--color-border)] shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">월 납입료 (렌트 기준)</p>
            <p className="text-xl font-bold text-[var(--color-accent)]">
              {monthlyPrice ? `${formatPrice(monthlyPrice)}원` : "—"}
            </p>
          </div>
          <button
            onClick={handleConsult}
            className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold px-6 py-3 rounded-xl transition-colors active:scale-95"
          >
            상담 신청
          </button>
        </div>
      </div>

      {/* Bottom spacer for mobile sticky bars */}
      <div className="h-32 lg:h-0" />
    </div>
  );
}

// ─────────────────────────────────────────
// QuoteSimulator Sub-component
// ─────────────────────────────────────────
function QuoteSimulator({
  productType,
  setProductType,
  period,
  setPeriod,
  deposit,
  setDeposit,
  mileage,
  setMileage,
  monthlyPrice,
  comparisonPrice,
  onConsult,
}: {
  productType: "rent" | "lease";
  setProductType: (v: "rent" | "lease") => void;
  period: number;
  setPeriod: (v: number) => void;
  deposit: string;
  setDeposit: (v: string) => void;
  mileage: number;
  setMileage: (v: number) => void;
  monthlyPrice: number | null;
  comparisonPrice: number | null;
  onConsult: () => void;
}) {
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--color-primary)] px-5 py-4">
        <h3 className="text-white font-bold text-base lg:text-lg">견적 시뮬레이터</h3>
        <p className="text-white/70 text-xs mt-0.5">조건을 변경하면 월 납입료가 실시간 계산됩니다</p>
      </div>

      <div className="p-5 space-y-5">
        {/* Product Type Tabs */}
        <div className="flex rounded-xl overflow-hidden border border-[var(--color-border)]">
          {(["rent", "lease"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setProductType(type)}
              className={`flex-1 py-3 text-sm font-bold transition-colors ${
                productType === type
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-white text-[var(--color-text-muted)] hover:bg-slate-50"
              }`}
            >
              {type === "rent" ? "장기렌트" : "리스"}
            </button>
          ))}
        </div>

        {/* Period */}
        <div>
          <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">계약 기간</label>
          <div className="grid grid-cols-3 gap-2">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
                  period === p
                    ? "border-[var(--color-accent)] bg-orange-50 text-[var(--color-accent)]"
                    : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-slate-300"
                }`}
              >
                {p}개월
              </button>
            ))}
          </div>
        </div>

        {/* Deposit */}
        <div>
          <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">선납 조건</label>
          <div className="space-y-2">
            {DEPOSITS.map((d) => (
              <button
                key={d.key}
                onClick={() => setDeposit(d.key)}
                className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium border text-left transition-all ${
                  deposit === d.key
                    ? "border-[var(--color-accent)] bg-orange-50 text-[var(--color-accent)]"
                    : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-slate-300"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mileage */}
        <div>
          <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">연간 주행거리</label>
          <div className="grid grid-cols-3 gap-2">
            {MILEAGES.map((m) => (
              <button
                key={m.key}
                onClick={() => setMileage(m.key)}
                className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
                  mileage === m.key
                    ? "border-[var(--color-accent)] bg-orange-50 text-[var(--color-accent)]"
                    : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-slate-300"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <hr className="border-[var(--color-border)]" />

        {/* Result */}
        <div className="text-center space-y-3">
          <p className="text-xs text-[var(--color-text-muted)]">
            예상 월 납입료 ({productType === "rent" ? "장기렌트" : "리스"})
          </p>
          <p className="text-3xl lg:text-4xl font-extrabold text-[var(--color-accent)]">
            {monthlyPrice ? `${formatPrice(monthlyPrice)}원` : "—"}
          </p>
          {comparisonPrice && (
            <p className="text-xs text-[var(--color-text-muted)]">
              {productType === "rent" ? "리스" : "렌트"} 기준:{" "}
              <span className="font-semibold">{formatPrice(comparisonPrice)}원</span>
            </p>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={onConsult}
          className="w-full py-4 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-base transition-all active:scale-[0.98] shadow-md"
        >
          무료 상담 신청하기
        </button>
        <div className="flex justify-center gap-4 text-xs text-[var(--color-text-muted)]">
          <a href="tel:1577-0000" className="flex items-center gap-1 hover:text-[var(--color-primary)]">
            📞 1577-0000
          </a>
          <a href="http://pf.kakao.com/_XXXXX/chat" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[var(--color-primary)]">
            💬 카톡 상담
          </a>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Quick Consult Inline Form
// ─────────────────────────────────────────
function QuickConsultInline({ carName }: { carName: string }) {
  const [form, setForm] = useState({ name: "", phone: "", contactMethod: "phone", consent: false });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handlePhoneChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    let formatted = digits;
    if (digits.length > 3 && digits.length <= 7) formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
    else if (digits.length > 7) formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    setForm((f) => ({ ...f, phone: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.consent) {
      setError("필수 항목을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, carOfInterest: carName }),
      });
      if (!res.ok) throw new Error("Failed");
      setSuccess(true);
    } catch {
      setError("전송에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">✅</div>
        <h3 className="text-lg font-bold text-green-800 mb-2">상담 신청이 완료되었습니다!</h3>
        <p className="text-sm text-green-700">빠른 시간 내에 전문 매니저가 연락드리겠습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-primary)] rounded-2xl p-6 lg:p-8">
      <h2 className="text-white font-bold text-xl mb-1">💬 빠른 상담 신청</h2>
      <p className="text-white/70 text-sm mb-6">
        관심 차량: <span className="text-white font-medium">{carName}</span>
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="이름 *"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-[var(--color-accent)] transition-colors text-sm"
          required
        />
        <input
          type="tel"
          placeholder="전화번호 *"
          value={form.phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-[var(--color-accent)] transition-colors text-sm"
          required
        />
        <div className="flex gap-3">
          {[
            { key: "phone", label: "📞 전화" },
            { key: "sms", label: "💬 문자" },
            { key: "kakao", label: "🟡 카톡" },
          ].map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setForm((f) => ({ ...f, contactMethod: m.key }))}
              className={`flex-1 py-2.5 rounded-lg text-xs font-medium border transition-all ${
                form.contactMethod === m.key
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/20 text-white"
                  : "border-white/20 text-white/60 hover:border-white/40"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <label className="flex items-start gap-2 text-white/70 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
            className="mt-0.5 rounded accent-[var(--color-accent)]"
          />
          <span>개인정보 수집 및 이용에 동의합니다. (필수)</span>
        </label>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-base transition-all active:scale-[0.98] disabled:opacity-60"
        >
          {submitting ? "전송 중..." : "견적 상담 신청하기"}
        </button>
      </form>
    </div>
  );
}
