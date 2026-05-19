"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, MessageCircle, ShieldCheck, Clock, Users } from "lucide-react";

export default function QuickQuoteForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    contactMethod: "phone",
    availableTime: "",
    carOfInterest: "",
    consent1: false,
    consent2: false,
    consent3: false,
    consent4: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 전화번호 자동 하이픈
  function formatPhone(value: string): string {
    const nums = value.replace(/\D/g, "").slice(0, 11);
    if (nums.length <= 3) return nums;
    if (nums.length <= 7) return `${nums.slice(0, 3)}-${nums.slice(3)}`;
    return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7)}`;
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({ ...prev, phone: formatPhone(e.target.value) }));
  }

  const handleContactMethodToggle = (value: string) => {
    setFormData((prev) => {
      const currentMethods = prev.contactMethod ? prev.contactMethod.split(",") : [];
      let newMethods: string[];
      if (currentMethods.includes(value)) {
        if (currentMethods.length > 1) {
          newMethods = currentMethods.filter((m) => m !== value);
        } else {
          newMethods = currentMethods;
        }
      } else {
        newMethods = [...currentMethods, value];
      }
      return {
        ...prev,
        contactMethod: newMethods.join(","),
      };
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.consent1 || !formData.consent2 || !formData.consent3) return;

    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      alert("휴대폰 번호를 정확하게 입력해주세요. (숫자 10~11자리)");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          consent: true,
        }),
      });
      if (res.ok) {
        setIsSubmitted(true);
      } else {
        const errorData = await res.json();
        alert(errorData.error || "전송에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (err: any) {
      alert(err.message || "전송에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <section id="quote-form" className="py-12 lg:py-24 bg-[#f7f8fa]" aria-label="상담 신청 완료">
        <div className="mx-auto max-w-[600px] px-4 text-center">
          <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-sm border border-gray-100">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">상담 신청이 완료되었습니다</h3>
            <p className="text-sm text-gray-500 mb-6">
              전문 매니저가 영업일 기준 24시간 이내 연락드립니다.
            </p>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setFormData({ name: "", phone: "", contactMethod: "phone", availableTime: "", carOfInterest: "", consent1: false, consent2: false, consent3: false, consent4: false });
              }}
              className="px-6 py-2.5 rounded-xl bg-[#0a2540] text-white text-sm font-semibold hover:bg-[#143a66] transition-colors"
            >
              추가 상담 신청
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="quote-form" className="py-12 lg:py-24 bg-[#f7f8fa]" aria-label="간편견적문의">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        <div className="text-center mb-8 lg:mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-[#0a2540] mb-2">
            간편견적문의
          </h2>
          <p className="text-sm lg:text-base text-gray-500">
            간단한 정보를 입력하시면 견적확인이 가능합니다.
          </p>
        </div>

        <div className="mx-auto max-w-[700px]">
          {/* 폼 */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100"
          >
            <div className="space-y-5">
              {/* 이름 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="홍길동"
                  required
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#469BD9] focus:ring-2 focus:ring-[#469BD9]/20 transition-all"
                />
              </div>

              {/* 전화번호 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  전화번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="010-1234-5678"
                  required
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#469BD9] focus:ring-2 focus:ring-[#469BD9]/20 transition-all"
                />
              </div>

              {/* 안내방법 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  안내방법 (중복 선택 가능) <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  {[
                    { value: "phone", label: "전화" },
                    { value: "sms", label: "문자" },
                    { value: "kakao", label: "카톡" },
                  ].map((m) => {
                    const isSelected = formData.contactMethod.split(",").includes(m.value);
                    return (
                      <label
                        key={m.value}
                        onClick={() => handleContactMethodToggle(m.value)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border cursor-pointer text-sm font-medium transition-all ${
                          isSelected
                            ? "border-[#469BD9] bg-[#469BD9]/5 text-[#469BD9]"
                            : "border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          name="contactMethod"
                          value={m.value}
                          checked={isSelected}
                          readOnly
                          className="sr-only"
                        />
                        {m.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 상담 가능 시간 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  상담가능시간
                </label>
                <select
                  value={formData.availableTime}
                  onChange={(e) => setFormData((p) => ({ ...p, availableTime: e.target.value }))}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[#469BD9] focus:ring-2 focus:ring-[#469BD9]/20 transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M3%205l3%203%203-3%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_16px_center]"
                >
                  <option value="">언제든 가능</option>
                  <option value="09-12">오전 (09~12시)</option>
                  <option value="12-15">오후 (12~15시)</option>
                  <option value="15-18">오후 (15~18시)</option>
                  <option value="18-21">저녁 (18~21시)</option>
                </select>
              </div>

              {/* 차량 (읽기 전용 표시) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  차량
                </label>
                <div className="w-full h-12 px-4 flex items-center rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-500">
                  -
                </div>
              </div>

              {/* 관심 차량 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  관심차량
                </label>
                <input
                  type="text"
                  value={formData.carOfInterest}
                  onChange={(e) => setFormData((p) => ({ ...p, carOfInterest: e.target.value }))}
                  placeholder="예: 그랜저, K8, BMW 5시리즈"
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#469BD9] focus:ring-2 focus:ring-[#469BD9]/20 transition-all"
                />
              </div>

              {/* 개인정보 및 서비스 동의 */}
              <div className="space-y-2 mt-4 border border-gray-100 p-4 rounded-xl bg-gray-50/50">
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer pb-2 border-b border-gray-100 mb-2 text-gray-800">
                  <input 
                    type="checkbox" 
                    checked={formData.consent1 && formData.consent2 && formData.consent3 && formData.consent4}
                    onChange={e => setFormData({ 
                      ...formData, 
                      consent1: e.target.checked, 
                      consent2: e.target.checked, 
                      consent3: e.target.checked,
                      consent4: e.target.checked 
                    })}
                    className="w-4 h-4 rounded border-gray-300 text-[#469BD9] focus:ring-[#469BD9]" 
                  />
                  전체 동의
                </label>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[11px] text-gray-600 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.consent1} 
                      onChange={e => setFormData({...formData, consent1: e.target.checked})} 
                      className="w-3.5 h-3.5 rounded border-gray-300 text-[#469BD9] focus:ring-[#469BD9]" 
                    />
                    [필수] 서비스 이용약관에 동의
                  </label>
                  <Link href="/terms" target="_blank" className="text-[11px] text-gray-400 hover:text-gray-600 underline">
                    [자세히 보기]
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[11px] text-gray-600 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.consent2} 
                      onChange={e => setFormData({...formData, consent2: e.target.checked})} 
                      className="w-3.5 h-3.5 rounded border-gray-300 text-[#469BD9] focus:ring-[#469BD9]" 
                    />
                    [필수] 개인정보 수집·이용에 동의
                  </label>
                  <Link href="/privacy" target="_blank" className="text-[11px] text-gray-400 hover:text-gray-600 underline">
                    [자세히 보기]
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[11px] text-gray-600 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.consent3} 
                      onChange={e => setFormData({...formData, consent3: e.target.checked})} 
                      className="w-3.5 h-3.5 rounded border-gray-300 text-[#469BD9] focus:ring-[#469BD9]" 
                    />
                    [필수] 개인정보 제3자 제공에 동의
                  </label>
                  <Link href="/privacy" target="_blank" className="text-[11px] text-gray-400 hover:text-gray-600 underline">
                    [자세히 보기]
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[11px] text-gray-600 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.consent4} 
                      onChange={e => setFormData({...formData, consent4: e.target.checked})} 
                      className="w-3.5 h-3.5 rounded border-gray-300 text-[#469BD9] focus:ring-[#469BD9]" 
                    />
                    [선택] 마케팅 정보 수신에 동의
                  </label>
                </div>
              </div>

              {/* 제출 버튼 */}
              <button
                type="submit"
                disabled={isSubmitting || !formData.consent1 || !formData.consent2 || !formData.consent3}
                className="w-full h-[52px] rounded-xl bg-[#469BD9] text-white text-base font-bold hover:bg-[#3a8dc7] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#469BD9]/20"
              >
                {isSubmitting ? "전송 중..." : "견적 확인하기"}
              </button>
            </div>
          </form>

        </div>
      </div>
    </section>
  );
}

