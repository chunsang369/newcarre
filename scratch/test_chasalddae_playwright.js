const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const cars = [];
  
  // Intercept API calls to see if there's a JSON endpoint
  page.on('response', async (response) => {
    if (response.url().includes('ajax') || response.url().includes('list')) {
      console.log('API response:', response.url());
      try {
        const type = response.headers()['content-type'];
        if (type && type.includes('json')) {
            const json = await response.json();
            console.log('JSON Keys:', Object.keys(json));
        }
      } catch(e) {}
    }
  });

  await page.goto('https://chasalddae.com/leaserent/leaserent_search', { waitUntil: 'networkidle' });
  
  // Click "더보기" (Load More) if it exists, or just scroll down to load all cars
  console.log('Scrolling to load all cars...');
  let previousHeight = 0;
  let noChangeCount = 0;
  while (true) {
    const currentHeight = await page.evaluate('document.body.scrollHeight');
    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    await page.waitForTimeout(1000);
    
    // Check if there is a "Load More" button
    const loadMoreBtn = await page.$('button:has-text("더보기"), a:has-text("더보기")');
    if (loadMoreBtn) {
        const isVisible = await loadMoreBtn.isVisible();
        if (isVisible) {
            await loadMoreBtn.click();
            await page.waitForTimeout(1000);
        }
    }

    if (currentHeight === previousHeight) {
      noChangeCount++;
      if (noChangeCount >= 3) break;
    } else {
      noChangeCount = 0;
    }
    previousHeight = currentHeight;
  }
  
  const links = await page.$$eval('a[href*="trim_id="]', els => els.map(el => {
    const href = el.getAttribute('href');
    const text = el.innerText;
    return { href, text };
  }));
  
  console.log(`Found ${links.length} car links.`);
  fs.writeFileSync('scratch/chasalddae_links.json', JSON.stringify(links, null, 2));
  
  await browser.close();
}

main().catch(console.error);
