const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://chasalddae.com/leaserent/leaserent_detail?trim_id=5065');
  await page.waitForLoadState('networkidle');
  
  // 모든 input 요소를 검사하여 정보를 추출
  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input')).map(el => {
      // 부모 label의 텍스트가 있을 수 있음
      const label = el.closest('label');
      const labelText = label ? label.innerText.trim() : '';
      
      // 부모 div의 텍스트 중 제목으로 쓰이는 것 탐색
      let sectionText = '';
      let parent = el.parentElement;
      for (let i = 0; i < 4; i++) {
        if (!parent) break;
        // 섹션 제목일 법한 p나 h3, div의 첫 텍스트
        const p = parent.querySelector('p, h3, h4');
        if (p) {
          sectionText = p.innerText.trim();
          break;
        }
        parent = parent.parentElement;
      }

      return {
        tagName: el.tagName,
        type: el.type,
        name: el.name,
        value: el.value,
        labelText,
        sectionText
      };
    });
  });
  
  console.log('총 input 개수:', inputs.length);
  console.log(JSON.stringify(inputs, null, 2));
  
  fs.writeFileSync('scratch/inputs_structure.json', JSON.stringify(inputs, null, 2));
  await browser.close();
}

main().catch(console.error);
