const fs = require('fs');
const html = fs.readFileSync('scratch/review_detail_sample.html', 'utf8');

// board_view starts at ~272627
// Look for the editor_box or post content AFTER that point
const boardViewStart = 272627;
const afterBoardView = html.substring(boardViewStart);

// Find editor_box in the actual HTML (not CSS)
console.log('=== EDITOR BOX IN BOARD VIEW ===\n');
const editorIdx = afterBoardView.indexOf('editor_box');
if (editorIdx > -1) {
  console.log('editor_box found at relative offset:', editorIdx);
  const editorContext = afterBoardView.substring(editorIdx - 100, editorIdx + 3000);
  console.log(editorContext);
}

// Also look for fr-view in the content area
console.log('\n\n=== FR-VIEW IN BOARD VIEW ===\n');
const frIdx = afterBoardView.indexOf('fr-view');
if (frIdx > -1) {
  console.log('fr-view found at relative offset:', frIdx);
  const frContext = afterBoardView.substring(frIdx - 200, frIdx + 5000);
  console.log(frContext);
} else {
  console.log('No fr-view found in board_view area');
}

// Let's also search for any img tags in the board_view area
console.log('\n\n=== IMAGES IN BOARD VIEW AREA ===');
const boardViewHtml = afterBoardView.substring(0, 20000); // Get generous section
const imgTags = boardViewHtml.match(/<img[^>]+>/gi);
console.log('Image tags found:', imgTags ? imgTags.length : 0);
if (imgTags) imgTags.forEach(t => console.log('  ', t.substring(0, 200)));

// Look for data-src patterns (lazy loading)
const dataSrcs = boardViewHtml.match(/data-src=["'][^"']+["']/gi);
console.log('\ndata-src attributes:', dataSrcs ? dataSrcs.length : 0);
if (dataSrcs) dataSrcs.forEach(d => console.log('  ', d));

// Try to extract the entire board_view section
console.log('\n\n=== FULL BOARD VIEW CONTENT (first 8000 chars) ===');
console.log(afterBoardView.substring(0, 8000));
