const https = require('https');

https.get('https://chasalddae.com/leaserent/leaserent_search', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    // Print lines around car cards to understand the layout
    const idx = data.indexOf('leaserent_detail?trim_id=');
    if (idx !== -1) {
      console.log(data.substring(idx - 1000, idx + 1000));
    } else {
      console.log('No trim_id link found');
    }
  });
}).on('error', (err) => {
  console.error(err);
});
