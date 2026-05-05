async function test() {
  const url = 'https://m.hicarzautoplan.com/app/nTreeCar/treeCheck/';
  
  const params = new URLSearchParams();
  // Using the same Palisade IDs
  params.append('input[idxMaker]', '1');
  params.append('input[idxName]', '563');
  params.append('input[idxModel]', '1020');
  params.append('input[idxGrade]', '2655');
  params.append('input[idxTrim]', '11001');
  params.append('pageMode', 'detailWrap');

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://m.hicarzautoplan.com/cars/index/view/'
      }
    });

    const data = await response.json();

    console.log('treeCheck response idxOpt:');
    if (data.tree?.idxOpt) {
      Object.entries(data.tree.idxOpt).forEach(([id, opt]) => {
        console.log(`${opt.title} (${id}): ${opt.price || 'NO PRICE'}`);
      });
    } else {
      console.log('No idxOpt found in tree object.');
      console.log('Tree structure:', Object.keys(data.tree || {}));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
