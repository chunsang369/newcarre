const fs = require('fs');
const cheerio = require('cheerio');

const content = fs.readFileSync('C:\\Users\\user\\.gemini\\antigravity\\brain\\be94b7ad-2e91-40ae-9942-619adea1027f\\.system_generated\\steps\\419\\content.md', 'utf8');
const $ = cheerio.load(content);

// 1. __next_f.push scripts check
const nextF = [];
$('script').each((i, el) => {
  const text = $(el).html() || '';
  if (text.includes('self.__next_f.push')) {
    nextF.push(text);
  }
});

console.log(`Found ${nextF.length} self.__next_f.push scripts.`);

const regex = /self\.__next_f\.push\(\[\d+,\s*"([\s\S]*?)"\]\)/g;
let combinedText = '';

nextF.forEach(script => {
  let match;
  while ((match = regex.exec(script)) !== null) {
    let part = match[1]
      .replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\\\/g, '\\');
    combinedText += part + '\n';
  }
});

// JSON data block
const startIdx = combinedText.indexOf('{"state":');
if (startIdx !== -1) {
  let openBrackets = 0;
  let jsonEndIdx = -1;
  for (let i = startIdx; i < combinedText.length; i++) {
    if (combinedText[i] === '{') openBrackets++;
    if (combinedText[i] === '}') {
      openBrackets--;
      if (openBrackets === 0) {
        jsonEndIdx = i;
        break;
      }
    }
  }
  
  if (jsonEndIdx !== -1) {
    const jsonStr = combinedText.substring(startIdx, jsonEndIdx + 1);
    try {
      const parsed = JSON.parse(jsonStr);
      fs.writeFileSync('scratch/react_query_data_m3.json', JSON.stringify(parsed, null, 2));
      console.log('Successfully saved react-query data to scratch/react_query_data_m3.json');
      
      const queryDetail = parsed.queries[0].state.data;
      console.log('--- Model 3 Basic Details ---');
      console.log('Brand:', queryDetail.car_info.brand_name);
      console.log('Model:', queryDetail.car_info.model_name);
      console.log('Default Trim:', queryDetail.car_info.trim_name, '(', queryDetail.car_info.car_price, '원)');
      
      console.log('\n--- Trims list ---');
      queryDetail.lineup_trim_list.forEach(lineup => {
        console.log(`Lineup: ${lineup.lineup_name}`);
        lineup.trim_list.forEach(trim => {
          console.log(`  Trim ID: ${trim.id} | Name: ${trim.trim_name} | Price: ${trim.price.toLocaleString()}원`);
        });
      });
    } catch (e) {
      console.error('JSON parsing failed:', e.message);
    }
  } else {
    console.log('Matching bracket not found');
  }
} else {
  console.log('{"state": not found');
}
