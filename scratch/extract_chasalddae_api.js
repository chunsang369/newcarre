const https = require('https');

https.get('https://chasalddae.com/leaserent/leaserent_search', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    // Look for all parts of hydration script
    const regex = /self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/gi;
    let match;
    let fullF = '';
    while ((match = regex.exec(data)) !== null) {
      fullF += match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
    }
    
    // Scan for query keys or list or car_image1
    console.log(`Concatenated __next_f script length: ${fullF.length}`);
    
    // Let's parse all car_image1 URLs and matching model_name
    const cars = [];
    const carRegex = /"model_name":"([^"]+)","segment":"[^"]*","year_type":"[^"]*","lineup_name":"[^"]*","fuel_type":"[^"]*","trim_name":"[^"]*","car_image1":"([^"]+)"/g;
    let cm;
    while ((cm = carRegex.exec(fullF)) !== null) {
      cars.push({ model_name: cm[1], car_image1: cm[2] });
    }
    
    console.log(`Found ${cars.length} cars in match.`);
    console.log(JSON.stringify(cars, null, 2));
  });
}).on('error', (err) => {
  console.error(err);
});
