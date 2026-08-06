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

  // 1. Premium Long Range 트림이 선택되었는지 확실히 하기 위해 6342 라벨 클릭
  try {
    console.log('Selecting Premium Long Range (6342)...');
    await page.locator('label:has(input[value="6342"])').click();
    await sleep(1000);
  } catch (e) {
    console.log('Failed to select trim:', e.message);
  }

  // 수집 옵션 정의
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
    // 구입방법 라벨 클릭
    await page.locator(`label:has(input[name="purchaseType"][value="${pt.value}"])`).click();
    await sleep(1500); // 탭 전환 및 렌더링을 위해 대기

    for (const period of periods) {
      // 기간 라벨 클릭
      console.log(`  Selecting Period: ${period}개월...`);
      await page.locator(`label:has(input[name="period"][value="${period}"])`).click();
      await sleep(300);

      for (const dist of distances) {
        // 주행거리 라벨 클릭
        await page.locator(`label:has(input[name="distance"][value="${dist.value}"])`).click();
        await sleep(300);

        for (const cond of conditions) {
          // 선수금 라벨 클릭
          await page.locator(`label:has(input[name="adPayment"][value="${cond.adPayment}"])`).click();
          await sleep(200);
          
          // 보증금 라벨 클릭
          await page.locator(`label:has(input[name="deposit"][value="${cond.deposit}"])`).click();
          await sleep(800); // 최종 가격 렌더링 완료 대기

          // 패턴 기반으로 정확하게 가격 추출
          const priceText = await page.evaluate(() => {
            // 모든 span 태그 중 콤마를 포함한 5~7자리 숫자 매칭
            const spans = Array.from(document.querySelectorAll('span'));
            for (const span of spans) {
              const text = span.innerText.trim();
              if (/^\d{1,3}(,\d{3})+$/.test(text)) {
                const num = parseInt(text.replace(/,/g, ''), 10);
                // 일반적으로 렌트/리스 가격은 월 20만원 ~ 250만원 사이입니다.
                if (num >= 100000 && num <= 3000000) {
                  return text;
                }
              }
            }
            
            // 두 번째 시도: 콤마 제거 후 숫자 범위 확인
            for (const span of spans) {
              const text = span.innerText.trim().replace(/,/g, '');
              if (/^\d+$/.test(text)) {
                const num = parseInt(text, 10);
                if (num >= 100000 && num <= 3000000) {
                  return span.innerText.trim();
                }
              }
            }

            return null;
          });

          const key = `${period}_${cond.label}_${dist.label}`;
          if (!results[key]) results[key] = {};
          
          const numericPrice = priceText ? parseInt(priceText.replace(/,/g, ''), 10) : null;
          results[key][pt.name] = numericPrice;
          
          console.log(`    Key: ${key} | Price = ${priceText || 'NULL'}원`);
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
