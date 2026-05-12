/**
 * Deep analysis of fr-view content area and images
 */
const fs = require('fs');

const html = fs.readFileSync('scratch/review_detail_sample.html', 'utf8');

// Find fr-view container
console.log('=== FR-VIEW CONTENT ANALYSIS ===\n');

const frViewIdx = html.indexOf('fr-view');
if (frViewIdx > -1) {
  // Go back to find the opening div
  const divStart = html.lastIndexOf('<div', frViewIdx);
  console.log('fr-view starts at offset:', divStart);
  
  // Extract a generous snippet around fr-view
  const snippet = html.substring(divStart, divStart + 5000);
  console.log('\nfr-view HTML (first 5000 chars):\n');
  console.log(snippet);
}

console.log('\n\n=== ALL IMAGE URLs IN PAGE ===\n');

// Extract ALL image URLs (src, data-src, etc)
const allImgUrls = new Set();

// <img src="...">
const srcMatches = html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi);
for (const m of srcMatches) allImgUrls.add(m[1]);

// data-src
const dataSrcMatches = html.matchAll(/data-src=["']([^"']+)["']/gi);
for (const m of dataSrcMatches) allImgUrls.add(m[1]);

// data-original  
const dataOrigMatches = html.matchAll(/data-original=["']([^"']+)["']/gi);
for (const m of dataOrigMatches) allImgUrls.add(m[1]);

// Filter only meaningful image URLs
const imageUrls = [...allImgUrls].filter(u => 
  (u.includes('.jpg') || u.includes('.jpeg') || u.includes('.png') || u.includes('.webp') || u.includes('.gif')) &&
  !u.includes('default_profile') && !u.includes('smlog') && !u.includes('facebook')
);

console.log('Meaningful image URLs:');
imageUrls.forEach((u, i) => console.log(`  ${i+1}. ${u}`));

// Check if content is in an iframe
console.log('\n=== IFRAME CHECK ===');
const iframes = html.match(/<iframe[^>]*>/gi);
console.log('Iframes found:', iframes ? iframes.length : 0);
if (iframes) iframes.forEach(f => console.log('  ', f.substring(0, 200)));

// Check for board_content container
console.log('\n=== BOARD_CONTENT AREA ===');
const bcIdx = html.indexOf('board_content');
if (bcIdx > -1) {
  const bcStart = html.lastIndexOf('<div', bcIdx);
  const bcSnippet = html.substring(bcStart, bcStart + 3000);
  console.log(bcSnippet);
}
