"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// 고유 문자열 발급 헬퍼
function generateUniqueId() {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return "v1-" + Math.random().toString(36).substring(2, 15) + "-" + Date.now().toString(36);
}

function AnalyticsTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstVisitRef = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. 세션 식별자 발급 및 캐싱
    let visitorId = localStorage.getItem("analytics_visitor_id");
    if (!visitorId) {
      visitorId = generateUniqueId();
      localStorage.setItem("analytics_visitor_id", visitorId);
    }

    let sessionId = sessionStorage.getItem("analytics_session_id");
    if (!sessionId) {
      sessionId = generateUniqueId();
      sessionStorage.setItem("analytics_session_id", sessionId);
    }

    // 2. 유입량 및 레퍼러 기록 API 요청
    const recordVisit = async (pathStr: string) => {
      try {
        const utmSource = searchParams.get("utm_source");
        const utmMedium = searchParams.get("utm_medium");
        const utmCampaign = searchParams.get("utm_campaign");
        
        let referrer = document.referrer || null;
        if (referrer) {
          try {
            const refUrl = new URL(referrer);
            // 내부 이동에 따른 레퍼러 수집 제거
            if (refUrl.hostname === window.location.hostname) {
              referrer = null;
            }
          } catch (e) {
            referrer = null;
          }
        }

        await fetch("/api/analytics/visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            visitorId,
            path: pathStr,
            referrer,
            utmSource,
            utmMedium,
            utmCampaign,
          }),
        });
      } catch (e) {
        console.error("[Analytics] Failed to record visit:", e);
      }
    };

    // 첫 방문 로드 및 라우트 변경 감지 트리거
    if (isFirstVisitRef.current) {
      isFirstVisitRef.current = false;
      recordVisit(pathname);
    } else {
      recordVisit(pathname);
    }

    // 3. 전역 마우스 클릭 인터랙션 핸들링 (Capturing 단계)
    const handleGlobalClick = async (event: MouseEvent) => {
      try {
        const target = event.target as HTMLElement;
        if (!target) return;

        // 클릭된 위치 상위의 버튼이나 앵커 태그 분석
        const interactiveElement = target.closest("button, a, [role='button'], [data-track-click]");
        if (!interactiveElement) return;

        const elementId = interactiveElement.id || null;
        
        // 텍스트는 간결하게 잘라 유효 텍스트만 기록
        let elementText = interactiveElement.textContent?.trim().replace(/\s+/g, " ").substring(0, 40) || null;
        
        // 무의미하거나 아주 긴 텍스트 클릭 필터링
        if (!elementId && (!elementText || elementText.length < 2)) return;

        const payload = {
          sessionId,
          pagePath: window.location.pathname,
          elementId,
          elementText,
        };

        // Beacon을 통한 백그라운드 스레드 전달 (네트워크 지연 최소화)
        if (navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
          navigator.sendBeacon("/api/analytics/click", blob);
        } else {
          fetch("/api/analytics/click", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
      } catch (err) {
        // 추적 장애가 사용자 브라우징을 방해하지 않도록 보장
      }
    };

    window.addEventListener("click", handleGlobalClick, { capture: true });
    return () => {
      window.removeEventListener("click", handleGlobalClick, { capture: true });
    };
  }, [pathname, searchParams]);

  return null;
}

import { Suspense } from "react";

export default function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <AnalyticsTrackerInner />
    </Suspense>
  );
}
