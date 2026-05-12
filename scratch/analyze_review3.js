/**
 * Extract fr-view content and all post images
 */
const fs = require('fs');

const html = fs.readFileSync('scratch/review_detail_sample.html', 'utf8');

// Find fr-view content
console.log('=== FR-VIEW EXTRACTION ===\n');

// The content is typically in: <div class="fr-view">...</div>
// Need to find the right nesting
const frViewRegex = /<div\s+class="fr-view">([\s\S]*?)<\/div>\s*(?:<\/div>|<div\s+class)/;
const frViewMatch = html.match(frViewRegex);

if (frViewMatch) {
  console.log('Found fr-view content, raw length:', frViewMatch[1].length);
  console.log('\nRaw HTML (first 2000 chars):');
  console.log(frViewMatch[1].substring(0, 2000));
  
  // Extract text
  const text = frViewMatch[1]
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n\s*\n/g, '\n')
    .trim();
  
  console.log('\nExtracted text:');
  console.log(text);
  
  // Extract images from fr-view
  const imgs = frViewMatch[1].match(/<img[^>]+src=["']([^"']+)["']/gi);
  console.log('\nImages in fr-view:', imgs ? imgs.length : 0);
  if (imgs) imgs.forEach(i => console.log('  ', i));
} else {
  console.log('fr-view regex did not match. Trying broader search...\n');
  
  // Try to find the fr-view start and manually extract
  const frIdx = html.indexOf('class="fr-view"');
  if (frIdx > -1) {
    console.log('Found fr-view at offset:', frIdx);
    const afterFrView = html.substring(frIdx, frIdx + 10000);
    console.log('\nContent after fr-view (first 5000 chars):');
    console.log(afterFrView.substring(0, 5000));
  }
}

// Also extract from og:description as fallback
console.log('\n\n=== OG:DESCRIPTION CONTENT ===');
const ogDescMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/);
if (ogDescMatch) {
  console.log(ogDescMatch[1]);
}

// Extract og:image
console.log('\n=== OG:IMAGE ===');
const ogImgMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/);
if (ogImgMatch) {
  console.log(ogImgMatch[1]);
}

// Also check meta description
console.log('\n=== META DESCRIPTION ===');
const metaDescMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
if (metaDescMatch) {
  console.log(metaDescMatch[1].substring(0, 300));
}
