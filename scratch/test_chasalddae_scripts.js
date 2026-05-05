const https = require('https');

https.get('https://chasalddae.com/leaserent/leaserent_search', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    // Check all script tags content for JSON or arrays
    const regex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    let count = 0;
    while ((match = regex.exec(data)) !== null) {
      const scriptText = match[1];
      if (scriptText.includes('carList') || scriptText.includes('trim_id') || scriptText.includes('car_images')) {
        console.log(`--- Script contains relevant keyword at match ${count} ---`);
        console.log(scriptText.substring(0, 1000));
        count++;
      }
    }
    if (count === 0) console.log('No relevant script found.');
  });
}).on('error', (err) => {
  console.error(err);
});
