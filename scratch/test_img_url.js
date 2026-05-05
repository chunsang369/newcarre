const https = require('https');

https.get('https://m.hicarzautoplan.com/data//car/a6/44/a6442921bb199e354baf4eff4cfcf7b782e1b6fe.png_resize/w400.png', (res) => {
  console.log('Status code:', res.statusCode);
  console.log('Headers:', res.headers);
}).on('error', console.error);
