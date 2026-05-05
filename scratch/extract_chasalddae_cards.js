const https = require('https');

https.get('https://chasalddae.com/leaserent/leaserent_search', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    // Regex matching all car cards
    const regex = /text-\[20px\] font-bold"[^>]*>([\s\S]*?)<\/p>[\s\S]*?<img src="([^"]+)"/gi;
    let match;
    const carsList = [];
    while ((match = regex.exec(data)) !== null) {
      const rawName = match[1].replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').trim();
      const imageUrl = match[2];
      carsList.push({ rawName, imageUrl });
    }
    console.log(JSON.stringify(carsList, null, 2));
  });
}).on('error', (err) => {
  console.error(err);
});
