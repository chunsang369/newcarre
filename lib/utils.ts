import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const CONTACT_LABELS: Record<string, string> = {
  phone: "전화",
  sms: "문자",
  kakao: "카톡",
};

export function formatContactMethod(method: string | null | undefined): string {
  if (!method) return "-";
  return method
    .split(",")
    .map((m) => CONTACT_LABELS[m.trim()] || m.trim())
    .join(", ");
}

const TIME_LABELS: Record<string, string> = {
  "": "언제든 가능",
  "09-12": "오전 (09~12시)",
  "12-15": "오후 (12~15시)",
  "15-18": "오후 (15~18시)",
  "18-21": "저녁 (18~21시)",
};

export function formatAvailableTime(time: string | null | undefined): string {
  if (!time) return "언제든 가능";
  return TIME_LABELS[time] || time;
}

export function formatPrice(num: number): string {
  if (!num) return "0";
  return num.toLocaleString();
}

export function formatPriceManwon(num: number): string {
  if (!num || num <= 0) return "상담 문의";
  const manwon = Math.floor(num / 10000);
  if (manwon > 0) {
    return `월 ${manwon.toLocaleString()}만원~`;
  }
  return `월 ${num.toLocaleString()}원~`;
}

