const { chromium } = require('playwright');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('Launching browser to intercept requests...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.setViewportSize({ width: 1280, height: 1000 });

  // 네트워크 요청 가로채기 리스너 추가
  page.on('request', request => {
    const url = request.url();
    // 이미지, CSS, JS 번들 등 정적 파일 요청은 로깅 제외
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.css') || url.includes('.js') || url.includes('.woff') || url.includes('svg')) {
      return;
    }
    console.log(`[REQUEST] Method: ${request.method()} | URL: ${url}`);
    const headers = request.headers();
    if (headers['next-action']) {
      console.log(`  -> Next-Action: ${headers['next-action']}`);
    }
    const postData = request.postData();
    if (postData) {
      console.log(`  -> PostData: ${postData.substring(0, 300)}`);
    }
  });

  page.on('response', response => {
    const url = response.url();
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.css') || url.includes('.js') || url.includes('.woff') || url.includes('svg')) {
      return;
    }
    console.log(`[RESPONSE] Status: ${response.status()} | URL: ${url}`);
  });

  const trimId = '6342';
  const url = `https://chasalddae.com/leaserent/leaserent_detail?trim_id=${trimId}`;
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle' });
  await sleep(1000);

  // 1. 렌트 클릭
  console.log('\n--- Clicking Rent ---');
  await page.locator('label:has(input[name="purchaseType"][value="2"])').click();
  await sleep(1000);

  // 2. 36개월 클릭
  console.log('\n--- Clicking 36 Months ---');
  await page.locator('label:has(input[name="period"][value="36"])').click();
  await sleep(1000);

  // 3. 무보증 클릭 (adPayment=0)
  console.log('\n--- Clicking No Deposit (adPayment=0) ---');
  await page.locator('label:has(input[name="adPayment"][value="0"])').click();
  await sleep(1000);

  await browser.close();
  console.log('\nDone.');
}

main().catch(console.error);
