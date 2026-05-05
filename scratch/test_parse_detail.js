const axios = require('axios');
const cheerio = require('cheerio');

async function main() {
  const res = await axios.get('https://chasalddae.com/leaserent/leaserent_detail?trim_id=4566');
  const $ = cheerio.load(res.data);
  
  // Find grade and trims
  const grades = [];
  $('ul.list.hidden.flex-col').each((i, ul) => {
     // The grade name is usually the sibling element above the ul, or parent's sibling.
     // Let's find the text right before this ul.
     const gradeName = $(ul).prev().text().trim();
     
     const trims = [];
     $(ul).find('li').each((j, li) => {
        const text = $(li).text().trim();
        // e.g. "익스클루시브 (자동)43,830,000원"
        const match = text.match(/(.+?)\s*([0-9,]+)원/);
        if (match) {
            trims.push({
                name: match[1].trim(),
                price: parseInt(match[2].replace(/,/g, ''), 10)
            });
        }
     });
     
     if (gradeName && trims.length > 0) {
         grades.push({ name: gradeName, trims });
     }
  });
  
  console.log('Grades:', JSON.stringify(grades, null, 2));

  // Find options
  const options = [];
  // Look for text "02 옵션" and find the list after it
  $('div, p, span, h1, h2, h3, h4').each((i, el) => {
     if ($(el).text().trim() === '02 옵션 (중복 선택 가능)') {
         // The options are likely following this element. Let's find the nearest list or repeated divs.
         // Let's just find the parent that contains all options
         let current = $(el).parent();
         while (current.length && current.find('input[type="checkbox"]').length === 0) {
             current = current.next();
             if (!current.length) {
                 // Try going up
                 current = $(el).parent().parent();
             }
         }
     }
  });
  
  // Let's just find all checkboxes inside labels for options
  $('input[type="checkbox"]').each((i, checkbox) => {
      // The option name and price are usually in the sibling spans or labels
      const parent = $(checkbox).closest('label');
      const text = parent.text().trim();
      const match = text.match(/(.+?)\s*([0-9,]+)원/);
      if (match) {
          options.push({
              name: match[1].trim(),
              price: parseInt(match[2].replace(/,/g, ''), 10)
          });
      } else {
         // Option text might be in next elements
         const nextText = parent.next().text().trim();
         if (nextText.includes('원')) {
            const m2 = nextText.match(/([0-9,]+)원/);
            if (m2) {
               options.push({
                   name: text,
                   price: parseInt(m2[1].replace(/,/g, ''), 10)
               });
            }
         }
      }
  });
  
  // Let's look for labels with flex-row or something that contains "원"
  if (options.length === 0) {
     $('label').each((i, label) => {
        const text = $(label).text().replace(/\s+/g, ' ').trim();
        const priceMatch = text.match(/([0-9,]+)원/);
        if (priceMatch) {
            let name = text.replace(priceMatch[0], '').trim();
            // remove trailing stuff
            name = name.replace(/\*상위 연계 옵션 선택 필요.*$/, '').trim();
            options.push({
                name,
                price: parseInt(priceMatch[1].replace(/,/g, ''), 10)
            });
        }
     });
  }

  console.log('Options:', JSON.stringify(options, null, 2));
}
main();
