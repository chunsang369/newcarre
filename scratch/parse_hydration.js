const fs = require('fs');

const content = fs.readFileSync('scratch/combined_next_f.txt', 'utf8');
const lines = content.split('\n');
const line66 = lines[65]; // 66번째 라인 (0-indexed 65)

console.log('Line 66 length:', line66.length);

// JSON 형태를 찾기 위해 "queries" 주변을 추출해 봅니다.
// react-query의 state data 전체를 JSON으로 파싱할 수 있는지 확인해봅시다.
// line66은 `6:[[ ... ]]` 같은 형식이므로, 그 안의 JSON 부분을 추출해 봅니다.

const jsonStartIdx = line66.indexOf('{"state":');
if (jsonStartIdx !== -1) {
  // 중괄호 쌍 매칭을 통해 올바른 JSON 문자열을 찾아봅니다.
  let openBrackets = 0;
  let jsonEndIdx = -1;
  for (let i = jsonStartIdx; i < line66.length; i++) {
    if (line66[i] === '{') openBrackets++;
    if (line66[i] === '}') {
      openBrackets--;
      if (openBrackets === 0) {
        jsonEndIdx = i;
        break;
      }
    }
  }
  
  if (jsonEndIdx !== -1) {
    const jsonStr = line66.substring(jsonStartIdx, jsonEndIdx + 1);
    try {
      const parsed = JSON.parse(jsonStr);
      fs.writeFileSync('scratch/react_query_data.json', JSON.stringify(parsed, null, 2));
      console.log('Successfully parsed react-query data and saved to scratch/react_query_data.json');
      
      // 간단히 어떤 쿼리들이 있는지 요약합니다.
      parsed.queries.forEach((q, idx) => {
        console.log(`Query ${idx + 1}: Key =`, JSON.stringify(q.queryKey));
        if (q.state && q.state.data) {
          console.log(`  Data Keys:`, Object.keys(q.state.data));
        }
      });
    } catch (e) {
      console.error('Failed to parse JSON:', e.message);
      // 일부 문자 제거 등으로 파싱을 다시 해봅니다.
      fs.writeFileSync('scratch/failed_json_chunk.txt', jsonStr);
    }
  } else {
    console.log('Could not find matching end bracket.');
  }
} else {
  console.log('Could not find {"state":');
}
