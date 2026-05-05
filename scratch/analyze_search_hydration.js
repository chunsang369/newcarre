const fs = require('fs');
const data = fs.readFileSync('scratch/search_hydration.txt', 'utf8');

// Find all JSON strings in self.__next_f.push
const regex = /self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/gi;
let match;
let fullF = '';
while ((match = regex.exec(data)) !== null) {
  fullF += match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
}

// Find all occurrences of "id" or "trim_id" or car objects
console.log('Full hydration payload length:', fullF.length);

const startIdx = fullF.indexOf('{"car_list":');
if (startIdx !== -1) {
  let openBraces = 0;
  let endIdx = startIdx;
  for (let i = startIdx; i < fullF.length; i++) {
    if (fullF[i] === '{') openBraces++;
    else if (fullF[i] === '}') {
      openBraces--;
      if (openBraces === 0) {
        endIdx = i;
        break;
      }
    }
  }

  const jsonStr = fullF.substring(startIdx, endIdx + 1);
  console.log('Valid JSON substring length:', jsonStr.length);
  try {
    const listData = JSON.parse(jsonStr);
    fs.writeFileSync('scratch/car_list.json', JSON.stringify(listData, null, 2), 'utf8');
    console.log(`Saved ${listData.car_list.data.length} cars in car_list.json`);
  } catch (err) {
    console.log('Error parsing JSON:', err.message);
  }
} else {
  console.log('No car_list found in search hydration payload.');
}
