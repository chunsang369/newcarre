async function test() {
  const url = 'https://m.hicarzautoplan.com/app/nTreeCar/treeCheck/';
  
  const params = new URLSearchParams();
  params.append('_method', 'POST');
  params.append('ajax', 'true');
  params.append('pack', 'eJw1jbEOgzAMRP/FFM0MAwcDaSp2oGJA6W8QqUQOxTKoWIf69CaFb7t3LeQNGwQmaDYz+tvgigQZyyGK840QhVXWZcus02VirQiVyE9RRKeqqSqQXM0UlV+pc6cQMwZnf1u4ZLIQyjPHeZySh+OAo9CvTxR1jQrMPXw98JXaL8WfDQozrv+BtIjNMBlzXsYZrxSW0SNXk09iHIsP8ACmBISw==');
  params.append('pageMode', 'detailWrap');

  const res = await fetch(url, {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': 'https://m.hicarzautoplan.com/cars/index/view/'
    }
  });

  const data = await res.json();
  console.log('Tree Data Sample:');
  if (data.tree?.idxOpt) {
    const firstOpt = Object.values(data.tree.idxOpt)[0];
    console.log(JSON.stringify(firstOpt, null, 2));
  } else {
    console.log('No idxOpt found');
  }
}

test();
