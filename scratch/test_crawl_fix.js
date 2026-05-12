/**
 * Test the fixed crawl logic on a single review
 */
const http = require('http');

const BASE_URL = 'http://xn--ok0b00qt3i0xd99aspn41d.com';

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
    
    // Image Strategy 1: Extract og:image
    let imageUrl = null;
    const ogImgMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/);
    if (ogImgMatch) {
      imageUrl = ogImgMatch[1];
    }
    
    // Image Strategy 2: Extract inline images from post body
    if (!imageUrl) {
      const contentImgMatch = html.match(/board_txt_area[\s\S]*?<img[^>]+src=["'](https?:\/\/cdn\.imweb\.me\/upload\/[^"']+)["']/);
      if (contentImgMatch) {
        imageUrl = contentImgMatch[1];
      }
    }
    
    // Image Strategy 3: Fallback
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
  // Test with the first review
  const testIdx = '171229635';
  console.log(`Testing review idx=${testIdx}...\n`);
  
  const result = await fetchReviewDetail(testIdx);
  
  console.log('=== CONTENT ===');
  console.log(`Length: ${result.content.length}`);
  console.log(`Content: ${result.content}\n`);
  
  console.log('=== IMAGE ===');
  console.log(`URL: ${result.imageUrl}\n`);
  
  // Test a second review
  const testIdx2 = '171223114';
  console.log(`\nTesting review idx=${testIdx2}...\n`);
  
  const result2 = await fetchReviewDetail(testIdx2);
  
  console.log('=== CONTENT ===');
  console.log(`Length: ${result2.content.length}`);
  console.log(`Content: ${result2.content}\n`);
  
  console.log('=== IMAGE ===');
  console.log(`URL: ${result2.imageUrl}\n`);
}

main().catch(console.error);
