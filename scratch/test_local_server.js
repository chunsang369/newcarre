const http = require('http');

http.get('http://localhost:3000/', (res) => {
  console.log('Status code:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Body length:', data.length);
    console.log(data.substring(0, 1000));
  });
}).on('error', console.error);
