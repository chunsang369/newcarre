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
        .replace(/\n\s*\n/g, '\n')
        .replace(/\s+/g, ' ')
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
    
    // Extract planner name from title (format: "XXX 차장님/팀장님/대리님 ...")
    const plannerMatch = r.title.match(/^(\S+)\s+(차장|팀장|대리|과장|부장|매니저|실장|지점장)님?/);
    const plannerName = plannerMatch ? `${plannerMatch[1]} ${plannerMatch[2]}` : null;
    
    await prisma.review.create({
      data: {
        title: r.title,
        content: r.content || r.title,
        thumbnailUrl: r.thumbnailUrl,
        imageUrl: r.imageUrl,
        sourceUrl: r.sourceUrl,
        carModel: '',
        customerName: r.author,
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
