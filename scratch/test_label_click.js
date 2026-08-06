const { chromium } = require('playwright');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 1000 });

  const trimId = '6342';
  const url = `https://chasalddae.com/leaserent/leaserent_detail?trim_id=${trimId}`;
  await page.goto(url, { waitUntil: 'networkidle' });

  const getPrice = async () => {
    return await page.evaluate(() => {
      // span.text-2xl.font-bold.text-c-primary 를 먼저 찾습니다.
      const target = document.querySelector('span.text-2xl.font-bold.text-c-primary');
      if (target) return target.innerText.trim();
      
      const target2 = document.querySelector('span.text-base.font-semibold.text-c-primary');
      if (target2) return target2.innerText.trim();

      return null;
    });
  };

  console.log('Initial Price (Expected 642,540):', await getPrice());

  // 1. 렌트 클릭
  console.log('Clicking Rent label...');
  await page.locator('label:has(input[name="purchaseType"][value="2"])').click();
  await sleep(1000);
  console.log('Price after Rent label click:', await getPrice());

  // 2. 36개월 클릭
  console.log('Clicking 36 months label...');
  await page.locator('label:has(input[name="period"][value="36"])').click();
  await sleep(1000);
  console.log('Price after 36 months label click (Expected != 642,540):', await getPrice());

  // 3. 2만km 클릭
  console.log('Clicking 20k km label...');
  await page.locator('label:has(input[name="distance"][value="2m"])').click();
  await sleep(1000);
  console.log('Price after 20k km label click:', await getPrice());

  // 4. 선수금 30% 클릭
  console.log('Clicking Prepay 30% label...');
  await page.locator('label:has(input[name="adPayment"][value="30"])').click();
  await sleep(1000);
  console.log('Price after Prepay 30% label click:', await getPrice());

  // 5. 무보증 클릭 (선수금 0%, 보증금 0%)
  console.log('Clicking No Deposit label (adPayment=0, deposit=0)...');
  await page.locator('label:has(input[name="adPayment"][value="0"])').click();
  await sleep(500);
  await page.locator('label:has(input[name="deposit"][value="0"])').click();
  await sleep(1000);
  console.log('Price after No Deposit label click (Expected > 700k):', await getPrice());

  await browser.close();
}

main().catch(console.error);
