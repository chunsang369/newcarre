/**
 * 차살때닷컴 최근후기 51개 크롤링 스크립트
 * Usage: node scripts/crawl-reviews.js
 */

const http = require('http');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE_URL = 'http://xn--ok0b00qt3i0xd99aspn41d.com';
const LIST_PATH = '/18/?q=YToxOntzOjEyOiJrZXl3b3JkX3R5cGUiO3M6MzoiYWxsIjt9&only_photo=Y';
const TARGET_COUNT = 51;
const PER_PAGE = 16;

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    http.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function parseListPage(html) {
  const reviews = [];
  // Split by card wrap
  const cards = html.split("list-style-card _card_wrap");
  
  for (let i = 1; i < cards.length; i++) {
    const card = cards[i];
    
    // Extract thumbnail URL
    const thumbMatch = card.match(/background-image:\s*url\((https?:\/\/[^)]+)\)/);
    const thumbnailUrl = thumbMatch ? thumbMatch[1] : null;
    
    // Extract link idx
    const idxMatch = card.match(/bmode=view&(?:amp;)?idx=(\d+)/);
    const idx = idxMatch ? idxMatch[1] : null;
    
    // Extract title: text between </span> and the HTML comment or icons span
    // The title sits after the closing </span> of the category and before <!--
    const titleBlock = card.match(/title-block">([\s\S]*?)<\/div>/);
    let title = '';
    if (titleBlock) {
      // Remove all HTML tags and extract clean text
      let titleText = titleBlock[1]
        .replace(/<em[^>]*>.*?<\/em>/g, '')  // Remove em tags (notice, N badge, etc)
        .replace(/<span[^>]*>.*?<\/span>/g, '')  // Remove span tags (icons)
        .replace(/<!--[\s\S]*?-->/g, '')  // Remove HTML comments
        .replace(/<[^>]+>/g, '')  // Remove remaining HTML tags
        .replace(/\t/g, '')
        .replace(/\n/g, '')
        .trim();
      title = titleText;
    }
    
    // Extract author name
    const authorMatch = card.match(/<div class="writer">\s*([\s\S]*?)\s*<\/div>/);
    let author = '';
    if (authorMatch) {
      author = authorMatch[1].replace(/\t/g, '').replace(/\n/g, '').trim();
    }
    
    // Extract date
    const dateMatch = card.match(/title="(\d{4}-\d{2}-\d{2}[^"]*)"/);
    let date = '';
    if (dateMatch) {
      date = dateMatch[1];
    }
    
    if (title && idx) {
      reviews.push({
        idx,
        title,
        thumbnailUrl,
        author,
        date,
        sourceUrl: `${BASE_URL}/18/?bmode=view&idx=${idx}&t=board`,
      });
    }
  }
  
  return reviews;
}

async function fetchReviewDetail(idx) {
  const url = `${BASE_URL}/18/?q=YToyOntzOjEyOiJrZXl3b3JkX3R5cGUiO3M6MzoiYWxsIjtzOjQ6InBhZ2UiO2k6MTt9&bmode=view&idx=${idx}&t=board`;
  try {
    const html = await fetchPage(url);
    
    // Strategy 1: Extract content from board_txt_area fr-view > _comment_body_
    let content = '';
    const bodyMatch = html.match(/class=['"]board_txt_area\s+fr-view['"][^>]*>([\s\S]*?)<\/div>\s*(?:<div class=['"](?:file_area|comment_section))/);
    if (bodyMatch) {
      content = bodyMatch[1]
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/[ \t]+/g, ' ')
        .split('\n')
        .map(line => line.trim())
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    }
    
    // Strategy 2: Fallback to og:description meta tag
    if (!content) {
      const ogDescMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/);
      if (ogDescMatch) {
        content = ogDescMatch[1]
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"');
      }
    }
    
    // Strategy 3: Fallback to meta description
    if (!content) {
      const metaDescMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
      if (metaDescMatch) {
        content = metaDescMatch[1]
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"');
      }
    }
    
    // Trim content to reasonable length
    if (content.length > 1000) {
      content = content.substring(0, 1000);
    }
    
    // Image Strategy 1: Extract og:image (thumbnail/representative image)
    let imageUrl = null;
    const ogImgMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/);
    if (ogImgMatch) {
      imageUrl = ogImgMatch[1];
    }
    
    // Image Strategy 2: Extract inline images from post body (fr-view area)
    if (!imageUrl) {
      // Look for images inside board_txt_area/fr-view content
      const contentImgMatch = html.match(/board_txt_area[\s\S]*?<img[^>]+src=["'](https?:\/\/cdn\.imweb\.me\/upload\/[^"']+)["']/);
      if (contentImgMatch) {
        imageUrl = contentImgMatch[1];
      }
    }
    
    // Image Strategy 3: Fallback to any cdn.imweb.me upload image (jpeg/png)
    if (!imageUrl) {
      const imgMatch = html.match(/https?:\/\/cdn\.imweb\.me\/(?:upload|thumbnail)\/[^"'\s)]+\.(jpe?g|png|webp)/i);
      if (imgMatch) {
        imageUrl = imgMatch[0];
      }
    }
    
    return { content, imageUrl };
  } catch (e) {
    console.error(`  Failed to fetch detail for idx=${idx}:`, e.message);
    return { content: '', imageUrl: null };
  }
}

async function main() {
  console.log('🔍 차살때닷컴 후기 크롤링 시작...');
  
  const allReviews = [];
  const pagesNeeded = Math.ceil(TARGET_COUNT / PER_PAGE);
  
  for (let page = 1; page <= pagesNeeded; page++) {
    const url = `${BASE_URL}${LIST_PATH}&page=${page}`;
    console.log(`📄 페이지 ${page} 크롤링 중... (${url})`);
    
    const html = await fetchPage(url);
    const reviews = parseListPage(html);
    console.log(`  → ${reviews.length}개 후기 파싱`);
    allReviews.push(...reviews);
    
    if (allReviews.length >= TARGET_COUNT) break;
    
    // Rate limiting
    await new Promise(r => setTimeout(r, 500));
  }
  
  const targetReviews = allReviews.slice(0, TARGET_COUNT);
  console.log(`\n📦 총 ${targetReviews.length}개 후기 수집 완료. 상세 정보 크롤링 중...`);
  
  // Fetch detail for each review (with rate limiting)
  for (let i = 0; i < targetReviews.length; i++) {
    const review = targetReviews[i];
    console.log(`  [${i + 1}/${targetReviews.length}] ${review.title}`);
    const detail = await fetchReviewDetail(review.idx);
    review.content = detail.content || review.title;
    review.imageUrl = detail.imageUrl;
    await new Promise(r => setTimeout(r, 300));
  }
  
  // 브랜드 리브랜딩 치환 헬퍼
  function rebrandText(text) {
    if (!text) return "";
    return text
      .replace(/황제오토플랜/g, "제로카즈")
      .replace(/황제오토/g, "제로카즈")
      .replace(/하이카즈/g, "제로카즈")
      .replace(/차살때닷컴/g, "제로카즈")
      .replace(/차살때/g, "제로카즈")
      .replace(/마지막으로 제로카즈에게!/g, "제로카즈 이용 후기")
      .replace(/마지막으로 하이카즈에게!/g, "제로카즈 이용 후기")
      .replace(/마지막으로 황제오토플랜에게!/g, "제로카즈 이용 후기");
  }

  // 플래너 이름 + 직급 + 잔여 조사 완전 제거
  function sanitizePlannerName(text) {
    if (!text) return "";
    let t = text;

    // 1. 실명+직급+님+조사 패턴 (풀네임)
    t = t.replace(/[가-힣]{2,4}\s*(차장|팀장|대리|과장|부장|매니저|실장|지점장)님?(에게|께|한테|과|와|이|가|은|는|을|를|도|의)?/g, "");

    // 2. 구체적 인물명 단독 언급
    t = t.replace(/박형록|박다예|윤석철|주균필|양민수|박형식/g, "");

    // 3. 성씨+팀장/차장 축약 패턴
    t = t.replace(/[가-힣]\s*(차장|팀장|대리|과장|부장|매니저|실장|지점장)님?(에게|께|한테|과|와|이|가|은|는|을|를|도|의)?/g, "");

    // 4. "팀장님", "차장님" 단독 잔재
    t = t.replace(/(차장|팀장|대리|과장|부장|매니저|실장|지점장)님?(에게|께|한테)?/g, "");

    // 5. "께", "에게" 등 잔여 조사 제거
    t = t
      .replace(/^(께|에게|한테|님)\s*/g, "")
      .replace(/\s+(께|에게|한테|님)\s*/g, " ");

    // 잔여 특수문자 정리
    t = t
      .replace(/\s+/g, " ")
      .replace(/^[\s,.\-~!@#$%^&*()_+=\[\]{};:'"<>?\/\\·]+/, "")
      .replace(/[\s,.\-~!@#$%^&*()_+=\[\]{};:'"<>?\/\\·]+$/, "")
      .trim();

    return t;
  }

  // 빈약한 제목 판별 헬퍼
  const FALLBACK_TITLES = [
    "신차 장기렌트 출고 대만족입니다",
    "친절한 상담과 빠른 출고, 감사합니다!",
    "장기렌트 이용 후기 남깁니다",
    "깔끔한 상담에 만족스러운 출고까지",
    "믿고 맡길 수 있었던 장기렌트 후기",
    "첫 장기렌트, 성공적으로 마무리했습니다",
    "꼼꼼한 상담 덕분에 좋은 차량 받았습니다",
    "장기렌트 출고 후기입니다",
    "빠르고 정확한 상담에 감동받았습니다",
    "제로카즈 덕분에 마음에 드는 차량 수령했습니다",
    "장기렌트 진행부터 출고까지 만족합니다",
    "신차 출고 완료! 대만족 후기입니다",
    "편리한 상담과 신속한 출고, 추천합니다",
    "걱정 없이 진행한 장기렌트 후기",
    "원하던 차량 무사히 출고 받았습니다",
    "전문적이고 친절한 상담, 고맙습니다",
    "나의 신차 출고 리얼 후기!",
    "장기렌트 알아보시는 분들께 추천드립니다",
    "처음부터 끝까지 만족스러웠습니다",
    "차량 수령 완료, 감사 후기 남깁니다"
  ];
  let fallbackIdx = 0;

  function isTitleTooWeak(title) {
    if (!title || title.length < 5) return true;
    const weakPatterns = [
      /^감사합니다[.!^~ ]*$/,
      /^감사드립니다[.!^~ ]*$/,
      /^출고후기[.! ]*$/,
      /^후기[에요ㅎ.! ]*$/,
      /^최고[.! ]*$/,
      /^차량출고후기[.! ]*$/,
      /^차량잘받았습니다[.! ]*$/,
    ];
    for (const p of weakPatterns) {
      if (p.test(title.trim())) return true;
    }
    return false;
  }

  // 제목 정밀 보정 헬퍼
  function refineTitle(title) {
    // 1. 플래너 이름 및 직급 제거
    let cleaned = sanitizePlannerName(title);
    
    // 2. 브랜드 치환
    cleaned = rebrandText(cleaned);
    
    // 3. 가공 후 제목이 빈약하면 자연스러운 대체 제목 부여
    if (isTitleTooWeak(cleaned)) {
      const t = FALLBACK_TITLES[fallbackIdx % FALLBACK_TITLES.length];
      fallbackIdx++;
      return t;
    }
    
    return cleaned;
  }

  // 고객명 간편 마스킹 헬퍼
  function maskCustomerName(name) {
    if (!name) return "고객";
    const trimmed = name.trim();
    if (trimmed.length <= 1) return trimmed;
    if (trimmed.length === 2) return trimmed.charAt(0) + "*";
    return trimmed.charAt(0) + "*" + trimmed.substring(2);
  }

  // Clear existing reviews and insert new ones
  console.log('\n🗑️  기존 후기 데이터 삭제 중...');
  await prisma.review.deleteMany({});
  
  console.log('💾 새 후기 데이터 저장 중...');
  for (let i = 0; i < targetReviews.length; i++) {
    const r = targetReviews[i];
    
    // Parse date
    let contractDate;
    try {
      contractDate = new Date(r.date.split(' ')[0]);
      if (isNaN(contractDate.getTime())) contractDate = new Date();
    } catch {
      contractDate = new Date();
    }
    
    // 1. 제목 및 본문 정제 (플래너 완전 제거 및 제로카즈 치환)
    const cleanTitle = refineTitle(r.title);
    const cleanContent = rebrandText(sanitizePlannerName(r.content || r.title));
    
    // 2. 플래너 무기명화에 따른 null 설정
    const plannerName = null;
    
    // 3. 고객 작성자명 마스킹
    const cleanCustomerName = maskCustomerName(r.author);

    await prisma.review.create({
      data: {
        title: cleanTitle,
        content: cleanContent,
        thumbnailUrl: r.thumbnailUrl,
        imageUrl: r.imageUrl,
        sourceUrl: r.sourceUrl,
        carModel: '',
        customerName: cleanCustomerName,
        plannerName: plannerName,
        contractDate: contractDate,
        isPublished: true,
        sortOrder: i,
      }
    });
  }
  
  console.log(`\n✅ ${targetReviews.length}개 후기 저장 완료!`);
  await prisma.$disconnect();
}

main().catch(e => {
  console.error('Error:', e);
  prisma.$disconnect();
  process.exit(1);
});
