"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  MousePointerClick, 
  Globe, 
  FileText, 
  Layers, 
  ArrowLeft, 
  Award,
  RefreshCw,
  FileCheck,
  Calendar,
  ExternalLink
} from "lucide-react";

interface StatsData {
  summary: {
    totalVisits: number;
    uniqueVisitors: number;
    totalClicks: number;
    totalQuotes: number;
    conversionRate: string;
  };
  topReferrers: { domain: string; count: number }[];
  topReferrerUrls: { url: string; count: number }[];
  topPages: { path: string; count: number }[];
  topUtmSources: { source: string; count: number }[];
  topClicks: { text: string; path: string; count: number }[];
  dailyTrend: { date: string; visits: number; clicks: number }[];
}

export default function AdminAnalyticsPage() {
  const [viewMode, setViewMode] = useState<"period" | "single">("period");
  const [range, setRange] = useState<number>(7);
  
  // 외부 유입 랭킹 탭 상태 ("domain" | "url")
  const [referrerTab, setReferrerTab] = useState<"domain" | "url">("domain");
  
  // 기본 설정일: 2026-05-26
  const [selectedDate, setSelectedDate] = useState<string>("2026-05-26");
  
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = "/api/analytics/stats";
      if (viewMode === "single") {
        url += `?date=${selectedDate}`;
      } else {
        url += `?range=${range}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("어드민 권한이 필요합니다. 다시 로그인해주세요.");
        }
        throw new Error("통계 데이터를 불러오는 데 실패했습니다.");
      }
      const stats = await res.json();
      setData(stats);
    } catch (err: any) {
      setError(err.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [viewMode, range, selectedDate]);

  // 커스텀 SVG 선 그래프 렌더러
  const renderTrendChart = () => {
    if (!data || data.dailyTrend.length === 0) return null;

    const trend = data.dailyTrend;
    const maxVal = Math.max(...trend.map(d => Math.max(d.visits, d.clicks)), 10);
    
    const width = 500;
    const height = 180;
    const padding = 30;
    
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const pointsVisits = trend.map((d, i) => {
      const x = padding + (i / (trend.length - 1)) * chartWidth;
      const y = padding + chartHeight - (d.visits / maxVal) * chartHeight;
      return { x, y };
    });

    const pointsClicks = trend.map((d, i) => {
      const x = padding + (i / (trend.length - 1)) * chartWidth;
      const y = padding + chartHeight - (d.clicks / maxVal) * chartHeight;
      return { x, y };
    });

    const visitsPath = pointsVisits.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const clicksPath = pointsClicks.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full text-zinc-300">
        {/* 가로 보조선 그리드 */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const y = padding + chartHeight * ratio;
          const val = Math.round(maxVal * (1 - ratio));
          return (
            <g key={index} className="opacity-40">
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e4e4e7" strokeWidth="1" />
              <text x={padding - 8} y={y + 4} textAnchor="end" className="text-[9px] fill-zinc-500 font-semibold">{val}</text>
            </g>
          );
        })}

        {/* X축 */}
        {trend.map((d, i) => {
          const x = padding + (i / (trend.length - 1)) * chartWidth;
          const shouldShow = trend.length > 8 ? (i % 2 === 0) : true;
          if (!shouldShow) return null;
          return (
            <text key={i} x={x} y={height - 5} textAnchor="middle" className="text-[9px] fill-zinc-500 font-semibold">
              {d.date}
            </text>
          );
        })}

        {/* 유입량 (블루) */}
        <path
          d={visitsPath}
          fill="none"
          stroke="url(#blueGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_2px_6px_rgba(37,99,235,0.15)]"
        />

        {/* 클릭량 (로즈) */}
        <path
          d={clicksPath}
          fill="none"
          stroke="url(#roseGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_2px_6px_rgba(225,29,72,0.15)]"
        />

        {/* 앵커 서클 */}
        {pointsVisits.map((p, i) => (
          <circle key={`v-${i}`} cx={p.x} cy={p.y} r="3.5" className="fill-blue-600 stroke-white stroke-2" />
        ))}
        {pointsClicks.map((p, i) => (
          <circle key={`c-${i}`} cx={p.x} cy={p.y} r="3.5" className="fill-rose-500 stroke-white stroke-2" />
        ))}

        <defs>
          <linearGradient id="blueGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="roseGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#be123c" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 p-6 md:p-10 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 상단바 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-zinc-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-zinc-500 text-sm hover:text-zinc-800 transition-colors mb-2 font-medium">
              <ArrowLeft className="w-4 h-4" />
              <Link href="/admin">어드민 홈</Link>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 bg-clip-text text-transparent">
              실시간 유입 및 사용자 클릭 분석
            </h1>
            <p className="text-zinc-500 mt-1 text-sm md:text-base font-medium">
              외부 검색 포털 유입과 마케팅 UTM 배너 효율, 날짜별 하루 접속 시간 추이를 모니터링합니다.
            </p>
          </div>

          {/* 상단 컨트롤 툴 바 */}
          <div className="flex flex-wrap items-center gap-4 bg-white border border-zinc-200/80 p-2 rounded-2xl shadow-sm">
            {/* 모드 선택 탭 */}
            <div className="flex bg-zinc-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("period")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 ${
                  viewMode === "period"
                    ? "bg-white text-zinc-950 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                기간 조회
              </button>
              <button
                onClick={() => setViewMode("single")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 ${
                  viewMode === "single"
                    ? "bg-white text-zinc-950 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                일자별 조회
              </button>
            </div>

            {/* 모드에 따른 필터 */}
            {viewMode === "period" && (
              <div className="flex items-center gap-1">
                {[
                  { label: "7일", val: 7 },
                  { label: "30일", val: 30 },
                ].map(b => (
                  <button
                    key={b.val}
                    onClick={() => setRange(b.val)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      range === b.val
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                        : "text-zinc-650 hover:bg-zinc-100"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            )}

            {viewMode === "single" && (
              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 pointer-events-none" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs font-bold bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-blue-500 text-zinc-850"
                  />
                </div>
              </div>
            )}

            <button 
              onClick={fetchStats}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-xl hover:bg-zinc-100 transition-colors"
              title="새로고침"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm flex items-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            오류: {error}
          </div>
        )}

        {/* 로딩 스켈레톤 */}
        {loading && !data ? (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-28 bg-white border border-zinc-200 rounded-2xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 h-64 bg-white border border-zinc-200 rounded-2xl" />
              <div className="h-64 bg-white border border-zinc-200 rounded-2xl" />
            </div>
          </div>
        ) : data ? (
          <div className="space-y-8">
            
            {/* 요약 카드 목록 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              {[
                {
                  title: "총 유입량 (PV)",
                  value: data.summary.totalVisits.toLocaleString(),
                  desc: viewMode === "single" ? "해당 날짜 누적 뷰" : "전체 페이지 이동 뷰",
                  icon: TrendingUp,
                  color: "from-blue-500/8 to-blue-500/2",
                  textColor: "text-blue-600"
                },
                {
                  title: "고유 방문자 (UV)",
                  value: data.summary.uniqueVisitors.toLocaleString(),
                  desc: "중복 제외 실방문 기기수",
                  icon: Globe,
                  color: "from-indigo-500/8 to-indigo-500/2",
                  textColor: "text-indigo-600"
                },
                {
                  title: "사용자 클릭량",
                  value: data.summary.totalClicks.toLocaleString(),
                  desc: "인터랙션 액션 로깅 합산",
                  icon: MousePointerClick,
                  color: "from-rose-500/8 to-rose-500/2",
                  textColor: "text-rose-600"
                },
                {
                  title: "신규 접수 견적",
                  value: data.summary.totalQuotes.toLocaleString(),
                  desc: "견적 신청 데이터베이스 누계",
                  icon: FileCheck,
                  color: "from-emerald-500/8 to-emerald-500/2",
                  textColor: "text-emerald-600"
                },
                {
                  title: "평균 전환율",
                  value: `${data.summary.conversionRate}%`,
                  desc: "방문수 대비 견적 제출 비율",
                  icon: Award,
                  color: "from-purple-500/8 to-purple-500/2",
                  textColor: "text-purple-600"
                }
              ].map((card, idx) => (
                <div 
                  key={idx} 
                  className="bg-white border border-zinc-200/80 p-5 rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-zinc-300/80 relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl ${card.color} rounded-bl-full filter blur-xl opacity-90`} />
                  <div className="flex justify-between items-start">
                    <p className="text-zinc-500 font-bold text-[10px] tracking-wider uppercase">{card.title}</p>
                    <card.icon className={`w-4 h-4 ${card.textColor}`} />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-zinc-900 mt-3">{card.value}</h3>
                  <p className="text-[10px] text-zinc-400 mt-1 font-medium">{card.desc}</p>
                </div>
              ))}
            </div>

            {/* 시계열 그래프 및 유입 경로 비율 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* SVG 차트 */}
              <div className="lg:col-span-2 bg-white border border-zinc-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-extrabold text-base text-zinc-800 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      {viewMode === "single" ? `${selectedDate} 시간대별 접속 분포` : "일별 유입 및 클릭 트렌드"}
                    </h3>
                    <div className="flex items-center gap-3 text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-zinc-650">
                        <span className="w-2.5 h-2.5 bg-blue-600 rounded-full" /> 유입량 (PV)
                      </span>
                      <span className="flex items-center gap-1.5 text-zinc-650">
                        <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" /> 클릭수
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-450 mb-6 font-medium">
                    {viewMode === "single" 
                      ? "하루 중 시간대별(2시간 단위)로 트래픽 집중도를 나타냅니다." 
                      : "최근 기간 동안의 하루 단위 사이트 트래픽 추이입니다."}
                  </p>
                </div>
                <div className="h-44 w-full flex items-center justify-center">
                  {renderTrendChart()}
                </div>
              </div>

              {/* 외부 유입 경로 랭킹 (도메인 & 상세 URL 링크 지원) */}
              <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <h3 className="font-extrabold text-base text-zinc-800 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-indigo-600" />
                      외부 유입 경로 랭킹
                    </h3>
                    
                    {/* 도메인 vs 상세링크 전환 스위치 */}
                    <div className="flex bg-zinc-100 p-0.5 rounded-lg shrink-0 scale-90">
                      <button
                        onClick={() => setReferrerTab("domain")}
                        className={`px-2 py-1 text-[10px] font-extrabold rounded-md transition-all ${
                          referrerTab === "domain" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-550"
                        }`}
                      >
                        도메인
                      </button>
                      <button
                        onClick={() => setReferrerTab("url")}
                        className={`px-2 py-1 text-[10px] font-extrabold rounded-md transition-all ${
                          referrerTab === "url" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-550"
                        }`}
                      >
                        상세 링크
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-455 mb-5 font-medium">
                    {referrerTab === "domain" 
                      ? "유입이 유발된 외부 플랫폼 도메인 순위입니다." 
                      : "댓글, 카페 글 등 유입된 구체적인 상세 URL 주소 리스트입니다."}
                  </p>
                </div>
                <div className="space-y-4 max-h-[190px] overflow-y-auto pr-1">
                  
                  {/* 1. 도메인 탭 활성화 시 */}
                  {referrerTab === "domain" && (
                    data.topReferrers.length === 0 ? (
                      <div className="text-zinc-400 text-xs text-center py-10 font-medium">로그가 기록되지 않았습니다.</div>
                    ) : (
                      data.topReferrers.map((r, i) => {
                        const total = data.summary.totalVisits || 1;
                        const pct = Math.round((r.count / total) * 100);
                        
                        let domainLabel = r.domain;
                        if (domainLabel === "direct") domainLabel = "직접 접속 / 즐겨찾기";
                        
                        return (
                          <div key={i} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-zinc-700 truncate max-w-[190px]">{i + 1}. {domainLabel}</span>
                              <span className="text-zinc-500 font-semibold">{r.count.toLocaleString()}회 ({pct}%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000"
                                style={{ width: `${Math.max(pct, 2)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )
                  )}

                  {/* 2. 상세 URL 링크 탭 활성화 시 */}
                  {referrerTab === "url" && (
                    data.topReferrerUrls.length === 0 ? (
                      <div className="text-zinc-400 text-xs text-center py-10 font-medium">참조(Referrer) 주소가 존재하는 외부 유입이 없습니다.</div>
                    ) : (
                      data.topReferrerUrls.map((r, i) => {
                        const total = data.summary.totalVisits || 1;
                        const pct = Math.round((r.count / total) * 100);
                        
                        const isDirect = r.url === "direct";
                        const labelText = isDirect ? "직접 유입 / 네이티브 앱" : r.url;

                        return (
                          <div key={i} className="space-y-1.5">
                            <div className="flex justify-between items-start text-xs font-bold gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-zinc-500 font-bold shrink-0">{i + 1}.</span>
                                {isDirect ? (
                                  <span className="text-zinc-450 truncate">{labelText}</span>
                                ) : (
                                  <a 
                                    href={r.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 min-w-0"
                                    title="새 창으로 원본 글 링크 열기"
                                  >
                                    <span className="truncate max-w-[170px]">{labelText}</span>
                                    <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                  </a>
                                )}
                              </div>
                              <span className="text-zinc-500 shrink-0 font-semibold">{r.count.toLocaleString()}회 ({pct}%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-rose-500 rounded-full transition-all"
                                style={{ width: `${Math.max(pct, 2)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )
                  )}
                </div>
              </div>
            </div>

            {/* 인기 페이지 & UTM & 주요 버튼 클릭 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* 1. 인기 페이지 */}
              <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-zinc-800 flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    인기 접속 페이지 (Top PV)
                  </h3>
                  <p className="text-xs text-zinc-450 mb-5 font-medium">유저들이 가장 빈번하게 접속하여 조회한 페이지 경로입니다.</p>
                </div>
                <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1">
                  {data.topPages.length === 0 ? (
                    <div className="text-zinc-400 text-xs text-center py-10 font-medium">조회된 트래픽 정보가 없습니다.</div>
                  ) : (
                    data.topPages.map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-zinc-100 last:border-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center font-extrabold shrink-0 text-[10px] ${
                            i === 0 ? "bg-emerald-50 text-emerald-600" :
                            i === 1 ? "bg-emerald-50/70 text-emerald-500" : "bg-zinc-100 text-zinc-500"
                          }`}>
                            {i + 1}
                          </span>
                          <span className="text-zinc-700 font-bold truncate hover:underline cursor-help" title={p.path}>
                            {p.path === "/" ? "메인 홈 (/)" : p.path}
                          </span>
                        </div>
                        <span className="text-zinc-500 font-semibold shrink-0 ml-2">{p.count.toLocaleString()} PV</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 2. UTM 분석 */}
              <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-zinc-800 flex items-center gap-2 mb-2">
                    <Layers className="w-4 h-4 text-purple-600" />
                    캠페인 광고 유입 (UTM Source)
                  </h3>
                  <p className="text-xs text-zinc-455 mb-5 font-medium">유료 배너나 게시글 링크 등을 통해 직접 수집된 마케팅 성과입니다.</p>
                </div>
                <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1">
                  {data.topUtmSources.length === 0 ? (
                    <div className="text-zinc-400 text-xs text-center py-10 font-medium">수집된 캠페인 유입 데이터가 없습니다.</div>
                  ) : (
                    data.topUtmSources.map((u, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-zinc-100 last:border-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center font-extrabold shrink-0 text-[10px] ${
                            i === 0 ? "bg-purple-50 text-purple-600" :
                            i === 1 ? "bg-purple-50/70 text-purple-500" : "bg-zinc-100 text-zinc-500"
                          }`}>
                            {i + 1}
                          </span>
                          <span className="text-zinc-700 font-bold truncate">
                            {u.source}
                          </span>
                        </div>
                        <span className="text-zinc-500 font-semibold shrink-0 ml-2">{u.count.toLocaleString()}회 유입</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 3. 클릭 순위 */}
              <div className="bg-white border border-zinc-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-zinc-800 flex items-center gap-2 mb-2">
                    <MousePointerClick className="w-4 h-4 text-rose-600" />
                    주요 클릭 요소 랭킹
                  </h3>
                  <p className="text-xs text-zinc-455 mb-5 font-medium">페이지 안에서 가장 상호작용 빈도가 높았던 버튼/링크 랭킹입니다.</p>
                </div>
                <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1">
                  {data.topClicks.length === 0 ? (
                    <div className="text-zinc-400 text-xs text-center py-10 font-medium">클릭 로그가 존재하지 않습니다.</div>
                  ) : (
                    data.topClicks.map((c, i) => (
                      <div key={i} className="flex items-start justify-between text-xs py-2 border-b border-zinc-100 last:border-0 min-w-0 gap-3">
                        <div className="flex items-start gap-2 min-w-0">
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center font-extrabold shrink-0 text-[10px] mt-0.5 ${
                            i === 0 ? "bg-rose-50 text-rose-600" :
                            i === 1 ? "bg-rose-50/70 text-rose-500" : "bg-zinc-100 text-zinc-500"
                          }`}>
                            {i + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-zinc-800 font-bold truncate select-all">"{c.text}"</p>
                            <p className="text-[9px] text-zinc-400 truncate font-mono mt-0.5">{c.path}</p>
                          </div>
                        </div>
                        <span className="text-zinc-500 shrink-0 self-center font-bold">{c.count.toLocaleString()}회</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
