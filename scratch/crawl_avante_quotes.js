const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  const trimId = '5065'; // Avante Inspiration
  const purchaseTypes = [1, 2]; // 1: Lease, 2: Rent
  const periods = [36, 48, 60];
  const distances = ['1m', '2m']; // 1만, 2만
  const conditions = [
    { ad_payment: 0, deposit: 0, label: '무보증_선수0' },
    { ad_payment: 30, deposit: 0, label: '선수금30' },
    { ad_payment: 0, deposit: 30, label: '보증금30' }
  ];

  const results = [];

  console.log('Starting resilient crawl for Avante Inspiration (5065)...');

  const url = `https://chasalddae.com/leaserent/leaserent_detail?trim_id=${trimId}`;
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 트림 선택
  try {
    await page.locator('label:has(input[value="5065"])').click({ force: true, timeout: 3000 });
    await page.waitForTimeout(1000);
  } catch (e) {
    console.log('트림 선택 실패 (기본 선택 사용):', e.message);
  }

  for (const purchaseType of purchaseTypes) {
    const pLabel = purchaseType === 1 ? 'LEASE' : 'RENT';
    
    try {
      await page.locator(`label:has(input[name="purchaseType"][value="${purchaseType}"])`).click({ force: true, timeout: 3000 });
      await page.waitForTimeout(1000);
    } catch (e) {
      console.log(`구입방법 ${pLabel} 클릭 실패:`, e.message);
      continue;
    }

    for (const period of periods) {
      try {
        await page.locator(`label:has(input[name="period"][value="${period}"])`).click({ force: true, timeout: 3000 });
        await page.waitForTimeout(800);
      } catch (e) {
        console.log(`기간 ${period}개월 클릭 실패:`, e.message);
        continue;
      }

      for (const distance of distances) {
        try {
          await page.locator(`label:has(input[name="distance"][value="${distance}"])`).click({ force: true, timeout: 3000 });
          await page.waitForTimeout(800);
        } catch (e) {
          console.log(`주행거리 ${distance === '1m' ? '1만' : '2만'}km 클릭 실패:`, e.message);
          continue;
        }

        for (const cond of conditions) {
          try {
            // 선수금 클릭
            await page.locator(`label:has(input[name="adPayment"][value="${cond.ad_payment}"])`).click({ force: true, timeout: 2000 });
            await page.waitForTimeout(300);

            // 보증금 클릭
            await page.locator(`label:has(input[name="deposit"][value="${cond.deposit}"])`).click({ force: true, timeout: 2000 });
            await page.waitForTimeout(1200); // 업데이트 대기

            const priceInfo = await page.evaluate((pType) => {
              const bodyText = document.body.innerText;
              const regex = /(?:혜택 적용 월 리스|혜택 적용 월 렌트|혜택 적용 월 대여료|월 리스료|월 렌트료|월 대여료)\s*\n*\s*([\d,]+)\s*원/i;
              const match = bodyText.match(regex);
              
              let priceVal = null;
              if (match) {
                priceVal = parseInt(match[1].replace(/,/g, ''), 10);
              } else {
                const allWonMatches = [...bodyText.matchAll(/([\d,]+)\s*원/g)].map(m => parseInt(m[1].replace(/,/g, ''), 10));
                const candidates = allWonMatches.filter(v => v >= 100000 && v <= 1500000);
                if (candidates.length > 0) {
                  priceVal = candidates[candidates.length - 1];
                }
              }
              return { priceVal };
            }, pLabel);

            console.log(`[${pLabel}] ${period}m | ${distance === '1m' ? '1만' : '2만'} | ${cond.label.padEnd(8)} => 가격: ${priceInfo.priceVal ? priceInfo.priceVal.toLocaleString() + '원' : '실패'}`);
            
            results.push({
              purchaseType: pLabel,
              period,
              distance: distance === '1m' ? '10000' : '20000',
              condition: cond.label,
              ad_payment: cond.ad_payment,
              deposit: cond.deposit,
              price: priceInfo.priceVal
            });
          } catch (e) {
            console.log(`조건 클릭 실패 (ad=${cond.ad_payment}, dep=${cond.deposit}):`, e.message);
          }
        }
      }
    }
  }

  fs.writeFileSync('scratch/avante_quotes_parsed.json', JSON.stringify(results, null, 2));
  console.log('Resilient crawl and parse done! Saved to scratch/avante_quotes_parsed.json');
  await browser.close();
}

main().catch(console.error);
