const fs = require('fs');
const html = fs.readFileSync('scratch/review_detail_sample.html', 'utf8');

// Find editor_box or board_view content area
console.log('=== SEARCHING FOR CONTENT CONTAINERS ===\n');

const markers = ['editor_box', 'board_view_content', 'board_txt_area', 'view-body', 'board_txt', 'content-area', 'bbs_view', 'post_area'];
markers.forEach(m => {
  const idx = html.indexOf(m);
  if (idx > -1) {
    console.log(`Found "${m}" at offset ${idx}`);
    // Show div context
    const start = html.lastIndexOf('<', idx);
    console.log('  Context:', html.substring(start, start + 300), '\n');
  }
});

// Look for the actual post images - search for img tags with review-specific URLs 
// The og:image showed: https://cdn.imweb.me/thumbnail/20260511/062d32be469c0.jpeg
// This is a thumbnail version. Let's find the full-size versions
console.log('\n=== SEARCHING FOR CONTENT IMAGES ===');

// Find all cdn.imweb.me image references that look like uploaded content (not site assets)
const contentImgPattern = /https?:\/\/cdn(?:-optimized)?\.imweb\.me\/(?:upload|thumbnail)\/(?:S\d+\/)?[a-f0-9]+\.(?:jpe?g|png|webp)/gi;
const contentImgs = [...html.matchAll(contentImgPattern)].map(m => m[0]);
const uniqueImgs = [...new Set(contentImgs)];
console.log('\nAll CDN images:', uniqueImgs.length);
uniqueImgs.forEach((u, i) => console.log(`  ${i+1}. ${u}`));

// Now look for the board_view or view section of the page (not CSS)
console.log('\n\n=== FINDING BOARD VIEW HTML SECTION ===');

// Look for board_view class in actual HTML elements (not CSS)
let viewIdx = 0;
let count = 0;
while ((viewIdx = html.indexOf('board_view', viewIdx)) !== -1) {
  // Check if this is an HTML element (look for < before it)
  const lineStart = html.lastIndexOf('\n', viewIdx);
  const line = html.substring(lineStart, viewIdx + 50).trim();
  if (line.includes('<div') || line.includes('class=')) {
    if (!line.includes('{') && !line.includes('#s2022') && !line.includes('.board_view')) {
      count++;
      console.log(`\nHTML board_view #${count} at offset ${viewIdx}:`);
      console.log(html.substring(viewIdx - 100, viewIdx + 500));
    }
  }
  viewIdx++;
}

// Let's also search for the specific review text that we know from og:description
console.log('\n\n=== FINDING CONTENT TEXT LOCATION ===');
const textSnippet = '주균필 차장님 덕분에';
const textIdx = html.indexOf(textSnippet);
console.log(`Text snippet "${textSnippet}" found at offset:`, textIdx);
if (textIdx > -1) {
  // Show surrounding HTML
  const start = html.lastIndexOf('<div', textIdx);
  console.log('\nSurrounding HTML:');
  console.log(html.substring(start, textIdx + 500));
}
