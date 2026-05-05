const fs = require('fs');
const content = fs.readFileSync('scratch/detail_hydration.txt', 'utf8');

// Find where the JSON containing "car_info" starts and ends
const startIdx = content.indexOf('{"car_info":');
if (startIdx === -1) {
  console.log('No car_info found.');
  process.exit(0);
}

// Balance curly braces to find the exact JSON string
let openBraces = 0;
let endIdx = startIdx;
for (let i = startIdx; i < content.length; i++) {
  if (content[i] === '{') openBraces++;
  else if (content[i] === '}') {
    openBraces--;
    if (openBraces === 0) {
      endIdx = i;
      break;
    }
  }
}

const jsonStr = content.substring(startIdx, endIdx + 1);
console.log('Valid JSON substring length:', jsonStr.length);

try {
  const data = JSON.parse(jsonStr);
  console.log(JSON.stringify(data, null, 2));
} catch (err) {
  console.log('Error parsing JSON:', err.message);
  console.log(jsonStr.substring(0, 1000));
}
