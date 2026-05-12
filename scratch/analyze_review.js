/**
 * Analyze review HTML structure to find content + images
 */
const fs = require('fs');
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

async function main() {
  // Step 1: Parse list page to get first review idx
  const listHtml = fs.readFileSync('scratch/review_list.html', 'utf8');
  const idxMatches = listHtml.match(/bmode=view&(?:amp;)?idx=(\d+)/g);
  const uniqueIds = [...new Set(idxMatches.map(m => m.match(/idx=(\d+)/)[1]))];
  console.log('Found review IDs:', uniqueIds.slice(0, 5));
  
  // Step 2: Fetch first review detail page
  const firstIdx = uniqueIds[0];
  const detailUrl = `${BASE_URL}/18/?q=YToyOntzOjEyOiJrZXl3b3JkX3R5cGUiO3M6MzoiYWxsIjtzOjQ6InBhZ2UiO2k6MTt9&bmode=view&idx=${firstIdx}&t=board`;
  console.log('\nFetching detail page:', detailUrl);
  
  const html = await fetchPage(detailUrl);
  fs.writeFileSync('scratch/review_detail_sample.html', html, 'utf8');
  console.log('Saved detail page HTML. Length:', html.length);
  
  // Step 3: Analyze content structure
  console.log('\n=== CONTENT ANALYSIS ===');
  
  // Check for se-main-container (current regex target)
  const seMain = html.match(/se-main-container/);
  console.log('Has se-main-container:', !!seMain);
  
  // Check for common content containers
  const containers = [
    'board_view_content', 'view_content', 'post_content',
    'board_content', 'entry-content', 'article_content',
    'rd_body', 'xe_content', 'post-body', 'board-body',
    'content_view', 'view-body', 'fr-view'
  ];
  containers.forEach(c => {
    if (html.includes(c)) console.log(`  Found container: "${c}"`);
  });
  
  // Step 4: Analyze image structure
  console.log('\n=== IMAGE ANALYSIS ===');
  
  // Check cdn.imweb.me (current regex target)
  const imwebImgs = html.match(/cdn\.imweb\.me\/upload\/[^"'\s)]+/g);
  console.log('cdn.imweb.me images:', imwebImgs ? imwebImgs.length : 0);
  if (imwebImgs) imwebImgs.slice(0, 3).forEach(u => console.log('  ', u));
  
  // Check all image sources
  const allImgs = html.match(/<img[^>]+src=["']([^"']+)["']/g);
  console.log('\nAll <img> tags:', allImgs ? allImgs.length : 0);
  if (allImgs) allImgs.slice(0, 10).forEach(u => console.log('  ', u.substring(0, 200)));
  
  // Check background images
  const bgImgs = html.match(/background-image:\s*url\(([^)]+)\)/g);
  console.log('\nBackground images:', bgImgs ? bgImgs.length : 0);
  if (bgImgs) bgImgs.slice(0, 5).forEach(u => console.log('  ', u.substring(0, 200)));
  
  // Step 5: Try to find the actual content area
  console.log('\n=== CONTENT BODY SEARCH ===');
  
  // Look for view area
  const viewBodyMatch = html.match(/<div[^>]*class="[^"]*(?:board_view|view_content|rd_body|xe_content|fr-view)[^"]*"[^>]*>([\s\S]*?)(?:<div class="[^"]*(?:post_footer|board_act|comment)|$)/);
  if (viewBodyMatch) {
    const text = viewBodyMatch[1].replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    console.log('View body content (first 500 chars):', text.substring(0, 500));
  } else {
    console.log('No standard view body found');
  }
  
  // Look for data-* content containers  
  const dataContainers = html.match(/data-[a-z-]+="[^"]*content[^"]*"/gi);
  if (dataContainers) {
    console.log('\nData-attribute content containers:', dataContainers.slice(0, 5));
  }
  
  // Extract a portion around the main content area
  console.log('\n=== RAW HTML AROUND CONTENT (2000 chars snippet) ===');
  // Find the view area
  const viewIdx = html.indexOf('board_view') || html.indexOf('view_content') || html.indexOf('rd_body');
  if (viewIdx > -1) {
    console.log(html.substring(viewIdx, viewIdx + 2000));
  } else {
    // Try to find any content marker
    const contentIdx = html.indexOf('bmode=view');
    if (contentIdx > -1) {
      // Go forward to find the main content
      const afterContent = html.indexOf('<div', contentIdx + 1000);
      if (afterContent > -1) {
        console.log('Content area starting from offset', afterContent, ':');
        console.log(html.substring(afterContent, afterContent + 2000));
      }
    }
  }
}

main().catch(console.error);
