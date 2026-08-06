const { chromium } = require('playwright');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('Starting Playwright browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Viewport size 설정 (모바일 혹은 PC 레이아웃 대응)
  await page.setViewportSize({ width: 1280, height: 1000 });

  const trimId = '6342';
  const url = `https://chasalddae.com/leaserent/leaserent_detail?trim_id=${trimId}`;
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle' });

  // 렌트(value="2") 버튼 클릭하기
  console.log('Clicking "렌트" button...');
  await page.locator('input[name="purchaseType"][value="2"]').evaluate(el => el.click());
  await sleep(1500); // 렌더링 및 API 대기

  // 렌트 옵션들이 노출되는지 확인
  const content = await page.content();
  fs.writeFileSync('scratch/detail_rent_rendered.html', content);
  console.log('Saved rendered HTML to scratch/detail_rent_rendered.html');

  // 어떤 버튼들이 렌더링되었는지 확인하기 위해 텍스트들을 출력해봅시다.
  const buttonTexts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('label, button, span, p'))
      .map(el => el.innerText.trim())
      .filter(txt => txt.length > 0 && txt.length < 50);
  });
  
  console.log('--- Rendered Texts (subset) ---');
  const uniqueTexts = [...new Set(buttonTexts)];
  console.log(uniqueTexts.filter(t => t.includes('개월') || t.includes('km') || t.includes('보증') || t.includes('선수금') || t.includes('원')).slice(0, 40));

  await browser.close();
}

main().catch(console.error);
