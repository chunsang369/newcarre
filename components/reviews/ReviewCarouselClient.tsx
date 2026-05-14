"use client";

import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronRight } from "lucide-react";

interface Review {
  id: string;
  title: string;
  content: string;
  thumbnailUrl: string | null;
  customerName: string;
  plannerName: string | null;
  contractDate: string;
}

export default function ReviewCarouselClient({ reviews }: { reviews: Review[] }) {
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
  });

  if (reviews.length === 0) return null;

  return (
    <section className="py-8 bg-white" aria-label="이용후기">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
            하이카즈 이용후기
          </h2>
          <Link
            href="/reviews"
            className="flex items-center gap-0.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            전체보기
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 캐러셀 */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="flex-[0_0_75%] md:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0"
              >
                <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                  {/* 상단: 썸네일 이미지 */}
                  <div className="relative">
                    {review.thumbnailUrl ? (
                      <div className="aspect-[16/10] overflow-hidden">
                        <img
                          src={review.thumbnailUrl}
                          alt={review.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[16/10] bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25m-2.25 0V5.625A2.625 2.625 0 0 0 9.375 3H5.25A2.25 2.25 0 0 0 3 5.25v8.25" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* 하단: 텍스트 */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
                      {review.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2 flex-1 line-clamp-2 leading-relaxed">
                      {review.content}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-auto">
                      <span>{review.customerName}</span>
                      <span>·</span>
                      <span>{new Date(review.contractDate).toLocaleDateString("ko-KR")}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
