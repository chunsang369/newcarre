import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

import ChannelTalk from "@/components/ChannelTalk";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "제로카즈 — 신차 장기렌트·리스 견적 비교",
  description:
    "신차 장기렌트, 리스 최저가 견적을 비교하고 전문 매니저 상담을 무료로 받으세요. 국산·수입차 전 모델 대응.",
  keywords: ["장기렌트", "리스", "신차", "견적", "비교", "제로카즈"],
  openGraph: {
    title: "제로카즈 — 신차 장기렌트·리스 견적 비교",
    description: "신차 장기렌트, 리스 최저가 견적 비교 플랫폼",
    type: "website",
    locale: "ko_KR",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={cn("h-full", "font-sans", geist.variable)} suppressHydrationWarning>
      <head>
        {/* 1차 차단막: Next.js 개발 에러 오버레이 화면 원천 은폐용 극초기 CSS (nextjs-portal은 지능형 필터에 의해 제어되므로 제외) */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              #nextjs-dev-overlay,
              .__next-dev-overlay,
              .nextjs-container,
              [data-nextjs-dialog] {
                /* 필요 시 가리기 위한 기본 설정이나, nextjs-portal은 지능형 스크립트로 분기 처리합니다. */
              }
            `
          }}
        />
        {/* 2차 및 3차 차단막: 브라우저 확장 프로그램으로 인한 Hydration Mismatch 개발 오버레이 지능형 선택적 차단 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // 0. 브라우저 확장 프로그램(드래그 해제 등)의 user-select 주입으로 인한 Hydration Mismatch 원천 차단
                if (typeof window !== 'undefined') {
                  const cleanEl = (el) => {
                    if (!el || typeof el.getAttribute !== 'function') return;
                    const styleAttr = el.getAttribute('style');
                    if (styleAttr && styleAttr.indexOf('user-select') !== -1) {
                      const cleanStyle = styleAttr
                        .split(';')
                        .map(s => s.trim())
                        .filter(s => s && s.indexOf('user-select') === -1)
                        .join(';');
                      if (cleanStyle) {
                        el.setAttribute('style', cleanStyle);
                      } else {
                        el.removeAttribute('style');
                      }
                    }
                  };

                  const cleanupUserSelect = () => {
                    try {
                      cleanEl(document.documentElement);
                      cleanEl(document.head);
                      cleanEl(document.body);
                      const elements = document.querySelectorAll('*');
                      for (let i = 0; i < elements.length; i++) {
                        cleanEl(elements[i]);
                      }
                    } catch (e) {}
                  };

                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', cleanupUserSelect);
                  } else {
                    cleanupUserSelect();
                  }

                  // React Hydration 과정 중에도 실시간으로 주입될 수 있으므로 MutationObserver로 초정밀 밀착 감시
                  const domObserver = new MutationObserver((mutations) => {
                    mutations.forEach(mutation => {
                      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        cleanEl(mutation.target);
                      } else if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(node => {
                          if (node.nodeType === 1) { // ELEMENT_NODE
                            cleanEl(node);
                            const childs = node.querySelectorAll('*');
                            for (let i = 0; i < childs.length; i++) {
                              cleanEl(childs[i]);
                            }
                          }
                        });
                      }
                    });
                  });

                  domObserver.observe(document.documentElement, {
                    attributes: true,
                    childList: true,
                    subtree: true,
                    attributeFilter: ['style']
                  });

                  // Hydration이 완료될 10초 후에 관찰을 안전하게 중단하여 브라우저의 성능 리소스 점유 최소화
                  setTimeout(() => {
                    domObserver.disconnect();
                  }, 10000);
                }

                // 1. window.customElements.define 가로채기 (지능형 에러 오버레이 선별 렌더링 시스템)
                if (typeof window !== 'undefined' && window.customElements) {
                  const origDefine = window.customElements.define;
                  window.customElements.define = function(name, constructor, options) {
                    if (name === 'nextjs-portal') {
                      const OrigClass = constructor;
                      class FilteredPortal extends OrigClass {
                        constructor() {
                          super();
                        }
                        connectedCallback() {
                          if (super.connectedCallback) {
                            super.connectedCallback();
                          }
                          
                          if (this.shadowRoot) {
                            const shadow = this.shadowRoot;
                            const checkAndFilter = () => {
                              const text = shadow.textContent || "";
                              
                              // 단순 확장 프로그램 및 hydration mismatch 에러 판별
                              const hasHydrationMismatch = 
                                text.indexOf('hydration') !== -1 ||
                                text.indexOf('Hydration') !== -1 ||
                                text.indexOf('did not match') !== -1 ||
                                text.indexOf('user-select') !== -1 ||
                                text.indexOf('suppressHydrationWarning') !== -1;
                              
                              // 실제 소스코드 상의 런타임/컴파일 에러 판별
                              const hasRealError = 
                                text.indexOf('TypeError') !== -1 ||
                                text.indexOf('ReferenceError') !== -1 ||
                                text.indexOf('SyntaxError') !== -1 ||
                                text.indexOf('Compile Error') !== -1 ||
                                text.indexOf('Failed to compile') !== -1 ||
                                text.indexOf('Runtime Error') !== -1 ||
                                text.indexOf('Error:') !== -1 ||
                                (text.length > 50 && !hasHydrationMismatch);
                                
                              if (hasHydrationMismatch && !hasRealError) {
                                // 단순 hydration 에러인 경우 오버레이를 감춤
                                this.style.setProperty('display', 'none', 'important');
                              } else if (text.length > 0) {
                                // 실제 개발 중인 소스코드 에러가 발생한 경우 오류 콘솔을 투명하게 노출
                                this.style.setProperty('display', 'block', 'important');
                              }
                            };
                            
                            // 초기 검사 및 shadow DOM 내부 변화 실시간 모니터링
                            checkAndFilter();
                            const shadowObserver = new MutationObserver(checkAndFilter);
                            shadowObserver.observe(shadow, {
                              childList: true,
                              subtree: true,
                              characterData: true
                            });
                          }
                        }
                      }
                      return origDefine.call(this, name, FilteredPortal, options);
                    }
                    return origDefine.call(this, name, constructor, options);
                  };
                }

                // 2. console.error 차단 (문자열, 에러 객체 전방위 검사)
                const origError = console.error;
                console.error = function(...args) {
                  const isHydration = args.some(arg => {
                    if (!arg) return false;
                    const str = typeof arg === 'string' ? arg : (arg.message || arg.stack || String(arg));
                    return (
                      str.indexOf('hydration-mismatch') !== -1 ||
                      str.indexOf('Hydration') !== -1 ||
                      str.indexOf('did not match') !== -1 ||
                      str.indexOf('user-select') !== -1 ||
                      str.indexOf('suppressHydrationWarning') !== -1
                    );
                  });
                  if (isHydration) return;
                  origError.apply(console, args);
                };

                // 3. window 에러 이벤트 차단 (오직 Hydration Mismatch 관련 전파만 차단)
                window.addEventListener('error', function(e) {
                  if (e.message && (
                    e.message.indexOf('hydration') !== -1 ||
                    e.message.indexOf('Hydration') !== -1 ||
                    e.message.indexOf('did not match') !== -1 ||
                    e.message.indexOf('user-select') !== -1
                  )) {
                    // 실제 소스코드 에러(TypeError, ReferenceError 등)는 전파를 가로채지 않고 정상 작동하도록 보장
                    const isRealError = 
                      e.message.indexOf('Type') !== -1 ||
                      e.message.indexOf('Reference') !== -1 ||
                      e.message.indexOf('Syntax') !== -1;
                    if (!isRealError) {
                      e.stopImmediatePropagation();
                      e.preventDefault();
                    }
                  }
                }, true);

                // 4. Promise Rejection 에러 차단
                window.addEventListener('unhandledrejection', function(e) {
                  const reason = e.reason;
                  if (reason) {
                    const str = reason.message || reason.stack || String(reason);
                    if (
                      str.indexOf('hydration') !== -1 ||
                      str.indexOf('Hydration') !== -1 ||
                      str.indexOf('did not match') !== -1 ||
                      str.indexOf('user-select') !== -1
                    ) {
                      const isRealError = 
                        str.indexOf('Type') !== -1 ||
                        str.indexOf('Reference') !== -1 ||
                        str.indexOf('Syntax') !== -1;
                      if (!isRealError) {
                        e.stopImmediatePropagation();
                        e.preventDefault();
                      }
                    }
                  }
                }, true);
              })();
            `
          }}
        />
        {/* Pretendard 가변 폰트 CDN */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col antialiased" suppressHydrationWarning>
        {children}
        <ChannelTalk />
      </body>
    </html>
  );
}
