const https = require('https');

https.get('https://chasalddae.com/leaserent/leaserent_search', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(`Fetched ${data.length} bytes`);
    const regex = /<img[^>]+src=["']([^"']+)["']/gi;
    let match;
    const urls = [];
    while ((match = regex.exec(data)) !== null) {
      urls.push(match[1]);
    }
    console.log(JSON.stringify(urls, null, 2));
  });
}).on('error', (err) => {
  console.error(err);
});
