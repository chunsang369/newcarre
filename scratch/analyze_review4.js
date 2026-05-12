const fs = require('fs');
const html = fs.readFileSync('scratch/review_detail_sample.html', 'utf8');

// Find fr-view location
const frIdx = html.indexOf('fr-view');
console.log('fr-view at offset:', frIdx);

if (frIdx > -1) {
  // Show 200 chars before and 5000 after
  const start = Math.max(0, frIdx - 200);
  console.log('\n--- Context around fr-view ---');
  console.log(html.substring(start, frIdx + 5000));
}

// Also check how many fr-view occurrences
let count = 0;
let pos = 0;
while ((pos = html.indexOf('fr-view', pos)) !== -1) {
  count++;
  console.log(`\nfr-view occurrence #${count} at offset ${pos}`);
  console.log(html.substring(pos - 50, pos + 100));
  pos++;
}
