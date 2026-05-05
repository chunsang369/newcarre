const https = require('https');

https.get('https://chasalddae.com/leaserent/leaserent_search?page=1', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const fs = require('fs');
    fs.writeFileSync('scratch/search_hydration.txt', data, 'utf8');
    console.log('Saved search hydration payload to scratch/search_hydration.txt');
  });
}).on('error', console.error);
