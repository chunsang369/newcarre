const { chromium } = require('playwright');
const cheerio = require('cheerio');
const zlib = require('zlib');

async function testPalisade() {
  console.log('Testing Palisade crawl...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Palisade pack (from previous log)
  const pack = 'eNqrVipSslIyNDS0MDM1MrcwNze1NLOwNLcwMbcwN7cyNrcyMzfSUTI0NzZXMjUzNDEwNTUzNTY3MzfUUTI0NzZXMjUzM1eyMlayUisuzkxKzS9IBAonJ-bnZeaV5CSm5pUklqUWlxSlluSXJGckZqYm55ekFuUm5pcUlySWJGalJpWAFKck5pfmFqXm5ZekZpZkFqUWp6Xm5ScX5VfmZaalFyUWF6ck5qcWpSZnJuclFyWWAACKH3C4';
  
  console.log('Navigating to view page...');
  await page.goto(`https://m.hicarzautoplan.com/cars/index/view/?pack=${encodeURIComponent(pack)}`);
  
  const buf = Buffer.from(pack, 'base64');
  const resStr = zlib.inflateSync(buf).toString();
  const packData = JSON.parse(resStr);
  const params = packData.param;
  console.log('Params:', params);

  const treeParams = new URLSearchParams();
  treeParams.append('input[idxMaker]', params.idxMaker);
  treeParams.append('input[idxName]', params.idxName);
  treeParams.append('input[idxModel]', params.idxModel);
  treeParams.append('ajax', 'true');

  console.log('Fetching grades...');
  const modelDataStr = await page.evaluate(async (p) => {
    const res = await fetch('/app/nTreeCar/treeCheck/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' },
      body: p
    });
    return await res.text();
  }, treeParams.toString());

  console.log('Grades response received');
  const modelData = JSON.parse(modelDataStr);
  console.log('Grades count:', Object.keys(modelData.tree?.idxGrade || {}).length);

  await browser.close();
}

testPalisade().catch(console.error);
