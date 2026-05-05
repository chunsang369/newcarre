const fs = require('fs');
const html = fs.readFileSync('scratch/view_page.html', 'utf8');
const matches = html.match(/data-nTreeCar-.*?=[\"\'].*?[\"\']/g);
if (matches) {
  console.log(Array.from(new Set(matches)).join('\n'));
}
