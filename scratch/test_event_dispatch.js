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

  // 1. 기본 상태 가격 읽기
  const getPrice = async () => {
    return await page.evaluate(() => {
      const target = document.querySelector('span.text-2xl.font-bold.text-c-primary');
      if (target) return target.innerText.trim();
      
      const target2 = document.querySelector('span.text-base.font-semibold.text-c-primary');
      if (target2) return target2.innerText.trim();

      return null;
    });
  };

  console.log('Initial Price:', await getPrice());

  // 2. JS dispatchEvent로 값 변경 시도 (렌트, 36개월, 2만, 선수금 30%)
  await page.evaluate(() => {
    const setRadio = (name, val) => {
      const input = document.querySelector(`input[name="${name}"][value="${val}"]`);
      if (input) {
        console.log(`Setting ${name} to ${val}`);
        input.click();
        input.checked = true;
        input.dispatchEvent(new Event('click', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        console.log(`Input not found: ${name} = ${val}`);
      }
    };

    // 구입방법: 렌트(2)
    setRadio('purchaseType', '2');
  });
  await sleep(1000);
  console.log('Price after Rent selected:', await getPrice());

  // 기간: 36개월
  await page.evaluate(() => {
    const input = document.querySelector('input[name="period"][value="36"]');
    if (input) {
      input.click();
      input.checked = true;
      input.dispatchEvent(new Event('click', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await sleep(1000);
  console.log('Price after 36 months selected:', await getPrice());

  // 주행거리: 1만 (1m)
  await page.evaluate(() => {
    const input = document.querySelector('input[name="distance"][value="1m"]');
    if (input) {
      input.click();
      input.checked = true;
      input.dispatchEvent(new Event('click', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await sleep(1000);
  console.log('Price after 10k km selected:', await getPrice());

  // 무보증: adPayment 0, deposit 0
  await page.evaluate(() => {
    const setRadio = (name, val) => {
      const input = document.querySelector(`input[name="${name}"][value="${val}"]`);
      if (input) {
        input.click();
        input.checked = true;
        input.dispatchEvent(new Event('click', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };
    setRadio('adPayment', '0');
    setRadio('deposit', '0');
  });
  await sleep(1000);
  console.log('Price after No Deposit selected (Expected > 700k):', await getPrice());


  await browser.close();
}

main().catch(console.error);
