const axios = require('axios');
const fs = require('fs');

async function test() {
  const params = new URLSearchParams();
  params.append('input[idxMaker]', '1');
  params.append('input[idxName]', '91');
  params.append('input[idxModel]', '1179');
  params.append('input[idxGrade]', '3170');
  params.append('input[idxTrim]', '15214');
  params.append('pageMode', 'detailWrap');

  const resp = await axios.post('https://m.hicarzautoplan.com/app/nTreeCar/estimateCheck/', params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  fs.writeFileSync('scratch/test_trim_15214.json', JSON.stringify(resp.data, null, 2));
  console.log('Saved to scratch/test_trim_15214.json');
}

test();
