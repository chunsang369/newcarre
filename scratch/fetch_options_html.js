const fs = require('fs');

async function test() {
  const trimParams = new URLSearchParams();
  trimParams.append('input[idxMaker]', '1');
  trimParams.append('input[idxName]', '91');
  trimParams.append('input[idxModel]', '1179');
  trimParams.append('input[idxGrade]', '2624');
  trimParams.append('input[idxTrim]', '10885');
  trimParams.append('input[pageCode]', 'estimateDetail');

  const res = await fetch('https://m.hicarzautoplan.com/cars/index/view/?layout=clear', {
    method: 'POST',
    body: trimParams,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  const html = await res.text();
  fs.writeFileSync('scratch/trim_10885_options.html', html);
  console.log('Saved to scratch/trim_10885_options.html');
}

test();
