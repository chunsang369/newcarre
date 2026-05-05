const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto('https://m.hicarzautoplan.com/cars/index/index/?search[where][idxMaker]=1&limit=10');
    await page.waitForSelector('.f-kcm-list-item');
    const car = await page.evaluate(() => {
      const item = document.querySelector('.f-kcm-list-item');
      const link = item.querySelector('a').href;
      const pack = new URL(link).searchParams.get('pack');
      return { pack, text: item.innerText };
    });
    console.log(car);
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();
