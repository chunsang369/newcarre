const fs = require('fs');

async function test() {
  const trimParams = new URLSearchParams();
  trimParams.append('input[idxMaker]', '1');
  trimParams.append('input[idxName]', '91');
  trimParams.append('input[idxModel]', '1179');
  trimParams.append('input[idxGrade]', '2624');
  trimParams.append('input[idxTrim]', '10885');
  trimParams.append('pageMode', 'detail'); // Changed from detailWrap

  const res = await fetch('https://m.hicarzautoplan.com/app/nTreeCar/estimateCheck/', {
    method: 'POST',
    body: trimParams,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  const data = await res.json();
  fs.writeFileSync('scratch/full_trim_10885_detail.json', JSON.stringify(data, null, 2));
  console.log('Saved to scratch/full_trim_10885_detail.json');
}

test();
