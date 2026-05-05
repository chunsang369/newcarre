const https = require('https');

https.get('https://chasalddae.com/leaserent/leaserent_search', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    // Look for next-f chunks
    const regex = /self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/gi;
    let match;
    let fullF = '';
    while ((match = regex.exec(data)) !== null) {
      fullF += match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
    }

    // Let's print string sequences containing keywords like queryKey, url, or fetch
    const keywords = ['queryKey', 'url', 'fetch', 'api', 'http'];
    for (const kw of keywords) {
      const idx = fullF.indexOf(kw);
      if (idx !== -1) {
        console.log(`--- ${kw} ---`);
        console.log(fullF.substring(idx, idx + 500));
      }
    }
  });
}).on('error', (err) => {
  console.error(err);
});
