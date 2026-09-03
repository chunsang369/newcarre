"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

interface NoticePopupProps {
  /**
   * 팝업 이미지 경로 (기본값: '/images/popup.jpg')
   */
  imageSrc?: string;
  /**
   * 팝업 클릭 시 이동할 링크 URL (기본값: 하단 빠른 견적신청 영역)
   */
  linkUrl?: string;
  /**
   * 링크 새창 열기 여부
   */
  openInNewTab?: boolean;
}

const STORAGE_KEY = "zerocarz_hide_notice_popup_until";

export default function NoticePopup({
  imageSrc = "/images/popup.jpg",
  linkUrl = "#quick-quote",
  openInNewTab = false,
}: NoticePopupProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isImageReady, setIsImageReady] = useState<boolean>(false);
  const [dontShowToday, setDontShowToday] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  useEffect(() => {
    // 1. '오늘 하루 보지 않기' 확인
    try {
      const hideUntil = localStorage.getItem(STORAGE_KEY);
      if (hideUntil) {
        const expiryTime = parseInt(hideUntil, 10);
        // 저장된 만료 시간(오늘 자정)이 지나지 않았으면 팝업을 띄우지 않음
        if (!isNaN(expiryTime) && Date.now() < expiryTime) {
          setIsMounted(true);
          setIsOpen(false);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to read localStorage:", e);
    }

    // 2. 팝업 이미지 프리로딩: 이미지가 메모리에 완전히 로드 및 디코딩된 후 팝업을 오픈
    if (imageSrc) {
      let isCancelled = false;
      const img = new window.Image();
      img.src = imageSrc;

      const handleReady = () => {
        if (isCancelled) return;
        setIsImageReady(true);
        setIsOpen(true);
        setIsMounted(true);
      };

      if (img.complete) {
        if ("decode" in img) {
          img.decode().then(handleReady).catch(handleReady);
        } else {
          handleReady();
        }
      } else {
        img.onload = () => {
          if ("decode" in img) {
            img.decode().then(handleReady).catch(handleReady);
          } else {
            handleReady();
          }
        };
        img.onerror = () => {
          if (isCancelled) return;
          setImageError(true);
          handleReady();
        };
      }

      // 네트워크 지연 발생 시에도 팝업이 무한 대기하지 않도록 안전 타임아웃 (최대 2.5초)
      const timeoutId = setTimeout(() => {
        handleReady();
      }, 2500);

      return () => {
        isCancelled = true;
        clearTimeout(timeoutId);
      };
    } else {
      setIsImageReady(true);
      setIsOpen(true);
      setIsMounted(true);
    }
  }, [imageSrc]);

  // 오늘 자정(23:59:59.999) 타임스탬프 계산
  const getTodayMidnightTimestamp = (): number => {
    const now = new Date();
    const midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );
    return midnight.getTime();
  };

  const handleClose = () => {
    if (dontShowToday) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          getTodayMidnightTimestamp().toString()
        );
      } catch (e) {
        console.error("Failed to save to localStorage:", e);
      }
    }
    setIsOpen(false);
  };

  // SSR Hydration 불일치 방지 및 이미지가 준비되기 전이나 닫힘 상태일 때 미노출
  if (!isMounted || !isOpen || !isImageReady) {
    return null;
  }

  // 팝업 내부 콘텐츠 컴포넌트
  const PopupContent = (
    <div className="relative w-full h-full">
      {imageSrc && !imageError ? (
        <div className="relative w-full h-full">
          <Image
            src={imageSrc}
            alt="제로카즈 프로모션 공지"
            fill
            sizes="(max-width: 768px) 90vw, 420px"
            className="object-cover"
            priority
            unoptimized // 브라우저 프리로드 캐시와 1:1 일치하여 로딩 깜빡임 방지
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        /* 이미지가 아직 준비되지 않았을 때 표시되는 고품질 플레이스홀더 배너 */
        <div className="w-full h-full bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0284C7] p-7 flex flex-col justify-between text-white relative overflow-hidden select-none">
          {/* 장식용 배경 그래픽 */}
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-sky-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* 상단 뱃지 */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-semibold text-blue-200 tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-blue-300 animate-pulse" />
              SPECIAL PROMOTION
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              무심사 맞춤 승인
            </span>
          </div>

          {/* 중앙 타이틀 & 안내 문구 */}
          <div className="relative z-10 my-auto text-left py-2">
            <p className="text-xs sm:text-sm font-semibold text-sky-300 mb-1">
              신차 장기렌트 · 제로카즈 단독 혜택
            </p>
            <h3 className="text-2xl sm:text-[26px] font-black tracking-tight leading-snug">
              저신용자도 OK! <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-100 to-sky-300">
                초기비용 0원 맞춤 출고
              </span>
            </h3>
            <p className="mt-2.5 text-xs sm:text-[13px] text-slate-300 leading-relaxed font-normal">
              신용 상관없이 누구나 최적 견적 승인! <br />
              원하시는 차종을 지금 바로 즉시 확인해보세요.
            </p>
          </div>

          {/* 하단 바로가기 버튼 안내 */}
          <div className="relative z-10 pt-2">
            <div className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 transition-all">
              <span>특별 견적 바로 확인하기</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notice-popup-title"
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-[2px] animate-in fade-in duration-200"
      onClick={(e) => {
        // 배경 클릭 시 팝업 닫기
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      {/* 팝업 모달 카드 (정사각형 1:1 비율) */}
      <div className="relative w-full max-w-[380px] sm:max-w-[420px] rounded-2xl overflow-hidden shadow-2xl bg-neutral-900 border border-neutral-800 transition-all transform animate-in zoom-in-95 duration-200">
        
        {/* 상단 닫기 X 버튼 (빠른 닫기) */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="팝업 닫기"
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white/90 hover:text-white flex items-center justify-center backdrop-blur-sm transition-all focus:outline-hidden"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1:1 정사각형 콘텐츠/이미지 영역 */}
        <div className="w-full aspect-square relative bg-neutral-950">
          {linkUrl ? (
            <Link
              href={linkUrl}
              onClick={handleClose}
              target={openInNewTab ? "_blank" : "_self"}
              rel={openInNewTab ? "noopener noreferrer" : undefined}
              className="block w-full h-full group focus:outline-hidden"
            >
              {PopupContent}
            </Link>
          ) : (
            PopupContent
          )}
        </div>

        {/* 하단 제어 바: '오늘 하루 보지 않기' 체크박스 & '닫기' 버튼 */}
        <div className="bg-neutral-900 px-4 py-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-300 select-none">
          <label className="flex items-center gap-2 cursor-pointer group hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={dontShowToday}
              onChange={(e) => setDontShowToday(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-neutral-900 accent-blue-600 cursor-pointer transition-all"
            />
            <span className="text-[13px] font-medium tracking-tight">오늘 하루 보지 않기</span>
          </label>

          <button
            type="button"
            onClick={handleClose}
            className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-[13px] transition-colors focus:outline-hidden"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
