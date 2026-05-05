const https = require('https');

https.get('https://chasalddae.com/leaserent/leaserent_detail?trim_id=5690', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    // Check Next.js server-side hydration script on this page!
    const regex = /self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/gi;
    let match;
    let fullF = '';
    while ((match = regex.exec(data)) !== null) {
      fullF += match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
    }

    console.log(`__next_f payload size: ${fullF.length}`);
    
    // Check if it contains keywords: trim_id, model_name, option, color, price
    const hasOptions = fullF.includes('option') || fullF.includes('color');
    console.log('Contains option/color keywords?', hasOptions);
    
    // Save to a temp file to analyze
    const fs = require('fs');
    fs.writeFileSync('scratch/detail_hydration.txt', fullF, 'utf8');
    console.log('Saved payload to scratch/detail_hydration.txt');
  });
}).on('error', console.error);
