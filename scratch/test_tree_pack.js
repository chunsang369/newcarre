async function test() {
  const url = 'https://m.hicarzautoplan.com/app/nTreeCar/treeCheck/';
  
  const params = new URLSearchParams();
  // Palisade pack from URL
  params.append('pack', 'eJw1jbEOgzAMRP/FFM0MAwcDaSp2oGJA6W8QqUQOxTKoWIf69CaFb7t3LeQNGwQmaDYz+tvgigQZyyGK840QhVXWZcus02VirQiVyE9RRKeqqSqQXM0UlV+pc6cQMwZnf1u4ZLIQyjPHeZySh+OAo9CvTxR1jQrMPXw98JXaL8WfDQozrv+BtIjNMBlzXsYZrxSW0SNXk09iHIsP8ACmBISw==');
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
