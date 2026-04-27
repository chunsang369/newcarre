const fs = require('fs');
const html = fs.readFileSync('hicarz_page.html', 'utf8');
const regex = /name="search\[where\]\[idxMaker\]"\s*value="(.*?)"[\s\S]*?<label[\s\S]*?>(.*?)<\/label>/g;
let m;
const makers = [];
while(m = regex.exec(html)) {
  makers.push({ id: m[1], name: m[2].replace(/<[^>]*>?/gm, '').trim() });
}
console.log(JSON.stringify(makers, null, 2));
