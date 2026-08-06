const { chromium } = require('playwright');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.setViewportSize({ width: 1280, height: 1000 });

  const trimId = '6342';
  const url = `https://chasalddae.com/leaserent/leaserent_detail?trim_id=${trimId}`;
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle' });

  // 1. "Premium Long Range" 트림이 올바르게 선택되어 있는지 확인/클릭
  // trim_id=6342 가 Long Range 트림이므로, 기본 선택되어 있을 것입니다.
  // 마크업에서 Premium Long Range (자동) 라벨에 해당하는 input[value="6342"]를 찾아 클릭해줍니다.
  try {
    console.log('Ensuring Premium Long Range (6342) is selected...');
    await page.locator('input[value="6342"]').evaluate(el => el.click());
    await sleep(500);
  } catch (e) {
    console.log('Could not click trim input:', e.message);
  }

  // 수집할 옵션 정의
  const purchaseTypes = [
    { name: 'rent', value: '2' },
    { name: 'lease', value: '1' }
  ];
  
  const periods = ['36', '48', '60'];
  const distances = [
    { label: '10000', value: '1m' },
    { label: '20000', value: '2m' },
    { label: '30000', value: '3m' }
  ];
  
  const conditions = [
    { label: 'PREPAY_30', adPayment: '30', deposit: '0' },
    { label: 'DEPOSIT_30', adPayment: '0', deposit: '30' },
    { label: 'NO_DEPOSIT', adPayment: '0', deposit: '0' }
  ];

  const results = {};

  for (const pt of purchaseTypes) {
    console.log(`\n=================== TYPE: ${pt.name.toUpperCase()} ===================`);
    // 구입방법 클릭
    await page.locator(`input[name="purchaseType"][value="${pt.value}"]`).evaluate(el => el.click());
    await sleep(1000);

    for (const period of periods) {
      // 기간 클릭
      await page.locator(`input[name="period"][value="${period}"]`).evaluate(el => el.click());
      await sleep(200);

      for (const dist of distances) {
        // 주행거리 클릭
        await page.locator(`input[name="distance"][value="${dist.value}"]`).evaluate(el => el.click());
        await sleep(200);

        for (const cond of conditions) {
          // 선수금 클릭
          await page.locator(`input[name="adPayment"][value="${cond.adPayment}"]`).evaluate(el => el.click());
          await sleep(100);
          
          // 보증금 클릭
          await page.locator(`input[name="deposit"][value="${cond.deposit}"]`).evaluate(el => el.click());
          await sleep(500); // 최종 가격 렌더링 대기

          // 가격 읽기
          // <span class="mr-1 text-2xl font-bold text-c-primary md:text-[22px]">642,540</span> 원
          // 또는 fixed bottom 바에 있는 가격
          const priceText = await page.evaluate(() => {
            // 메인 가격 영역 또는 하단 바 가격 영역 탐색
            const priceSpan = document.querySelector('span.text-2xl.font-bold.text-c-primary');
            if (priceSpan) return priceSpan.innerText.trim();
            
            // 다른 셀렉터 시도
            const optPrice = document.querySelector('.text-c-primary');
            if (optPrice) {
              const m = optPrice.innerText.match(/([\d,]+)/);
              if (m) return m[1];
            }
            
            return null;
          });

          const key = `${period}_${cond.label}_${dist.label}`;
          if (!results[key]) results[key] = {};
          
          const numericPrice = priceText ? parseInt(priceText.replace(/,/g, ''), 10) : null;
          results[key][pt.name] = numericPrice;
          
          console.log(`Key: ${key} | ${pt.name.toUpperCase()} = ${priceText || 'NULL'} (${numericPrice || 0}원)`);
        }
      }
    }
  }

  // 결과 저장
  fs.writeFileSync('scratch/chasalddae_6342_prices.json', JSON.stringify(results, null, 2));
  console.log('\nSaved pricing data to scratch/chasalddae_6342_prices.json');

  await browser.close();
}

main().catch(console.error);
