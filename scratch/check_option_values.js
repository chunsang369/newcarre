const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto('https://m.hicarzautoplan.com/cars/index/view/?pack=eJw1jbEOgzAMRP%2FFM0MAwcDaSp2vKj8EAmvrdDQEEDatV9XAmvbeS9fUu6P%2BkPEn6EToG6GvjP379m%2Bcl5iLp6X6Fv7Yp6Z4HhR70W8S9uNfGfyC6m%2FwO8vYCfY%3D');
    await page.waitForSelector('input[name*="idxOpt"]', { timeout: 5000 });
    const data = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[name*="idxOpt"]'));
      return inputs.map(i => {
        const label = i.closest('label')?.innerText || '';
        return { name: i.name, value: i.value, label: label.trim() };
      });
    });
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();
