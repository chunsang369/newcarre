import { Shield, Car, FileText } from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: Shield,
    title: "책임 보상제 시행",
    desc: "계약 내용과 약속된 조건을 그대로 보장해 드려요",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    icon: FileText,
    title: "무료 견적 상담",
    desc: "예약금 0원, 전문 매니저가 맞춤 견적을 제안해 드려요",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
];

export default function ServiceTrust() {
  return (
    <section className="py-12 lg:py-20 bg-white" aria-label="서비스 신뢰 지표">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        {/* 섹션 헤더 */}
        <div className="text-center mb-10 lg:mb-14">
          <p className="text-sm font-semibold text-blue-600 tracking-wide uppercase mb-2">
            Trust & Service
          </p>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
            빠르고 확실한, 믿을 수 있는 서비스
          </h2>
          <p className="text-gray-500 text-sm lg:text-base">
            선택부터 인도까지 책임질게요
          </p>
        </div>

        {/* 3열 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {TRUST_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group flex flex-col items-center text-center p-8 lg:p-10 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                {/* 아이콘 */}
                <div className={`w-16 h-16 rounded-2xl ${item.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-7 h-7 ${item.iconColor}`} />
                </div>

                {/* 제목 */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>

                {/* 설명 */}
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
