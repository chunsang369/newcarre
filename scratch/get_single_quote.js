const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  const url = 'https://chasalddae.com/leaserent/leaserent_detail?trim_id=5065&purchase_type=2&period=60&distance=2m&ad_payment=0&deposit=0&insurance_age=26';
  console.log('Navigating to:', url);
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000); // Wait for API

  let text = await page.evaluate(() => {
    return document.body.innerText;
  });

  console.log('--- 최초 로드 시 본문 가격 부분 ---');
  printPriceSection(text);

  // 클릭 시도
  console.log('\n--- 강제 요소 클릭 시도 ---');
  try {
    // 렌트 클릭
    await page.locator('label:has(input[name="purchaseType"][value="2"])').click({ force: true });
    await page.waitForTimeout(500);
    // 60개월 클릭
    await page.locator('label:has(input[name="period"][value="60"])').click({ force: true });
    await page.waitForTimeout(500);
    // 2만km 클릭
    await page.locator('label:has(input[name="distance"][value="2m"])').click({ force: true });
    await page.waitForTimeout(500);
    // 선수금 0% 클릭
    await page.locator('label:has(input[name="adPayment"][value="0"])').click({ force: true });
    await page.waitForTimeout(500);
    // 보증금 0% 클릭
    await page.locator('label:has(input[name="deposit"][value="0"])').click({ force: true });
    await page.waitForTimeout(2000); // 최종 대기

    text = await page.evaluate(() => {
      return document.body.innerText;
    });
    console.log('--- 클릭 후 본문 가격 부분 ---');
    printPriceSection(text);
  } catch (e) {
    console.log('클릭 실패:', e.message);
  }

  await browser.close();
}

function printPriceSection(text) {
  const lines = text.split('\n');
  const matchedLines = lines.filter(line => 
    line.includes('혜택') || 
    line.includes('리스') || 
    line.includes('렌트') || 
    line.includes('대여료') || 
    line.includes('원') && line.length < 100
  );
  console.log(matchedLines.slice(0, 15).join('\n'));
}

main().catch(console.error);
