const { chromium } = require('playwright');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('Launching browser for LEASE test...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 1000 });

  const trimId = '6342';
  const url = `https://chasalddae.com/leaserent/leaserent_detail?trim_id=${trimId}`;
  await page.goto(url, { waitUntil: 'networkidle' });

  const getPrice = async () => {
    return await page.evaluate(() => {
      const target = document.querySelector('span.text-2xl.font-bold.text-c-primary');
      if (target) return target.innerText.trim();
      
      const target2 = document.querySelector('span.text-base.font-semibold.text-c-primary');
      if (target2) return target2.innerText.trim();

      return null;
    });
  };

  console.log('Initial Price (Expected 642,540):', await getPrice());

  // 1. 리스 클릭
  console.log('Clicking Lease label...');
  await page.locator('label:has(input[name="purchaseType"][value="1"])').click();
  await sleep(1500);
  console.log('Price after Lease click:', await getPrice());

  // 2. 36개월 클릭
  console.log('Clicking 36 months label...');
  await page.locator('label:has(input[name="period"][value="36"])').click();
  await sleep(1000);
  console.log('Price after 36 months Lease click:', await getPrice());

  // 3. 2만km 클릭
  console.log('Clicking 20k km label...');
  await page.locator('label:has(input[name="distance"][value="2m"])').click();
  await sleep(1000);
  console.log('Price after 20k km Lease click:', await getPrice());

  // 4. 무보증 클릭 (선수금 0%, 보증금 0%)
  console.log('Clicking No Deposit label (adPayment=0, deposit=0)...');
  await page.locator('label:has(input[name="adPayment"][value="0"])').click();
  await sleep(500);
  await page.locator('label:has(input[name="deposit"][value="0"])').click();
  await sleep(1000);
  console.log('Price after No Deposit Lease click:', await getPrice());

  await browser.close();
}

main().catch(console.error);
