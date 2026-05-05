const axios = require('axios');
const fs = require('fs');
async function test() {
  const res = await axios.get('https://chasalddae.com/leaserent/leaserent_detail?trim_id=5703&purchase_type=2&period=60&distance=2m&ad_payment=30&deposit=0&insurance_age=26');
  const html = res.data;
  let fullRscString = '';
  for (const line of html.split('\n')) {
      if (line.includes('self.__next_f.push(')) {
          const match = line.match(/self\.__next_f\.push\(\[1,"(.*)"\]\)</);
          if (match) fullRscString += match[1];
      }
  }
  let decoded = fullRscString.replace(/\\\\/g, '\\').replace(/\\"/g, '"');
  
  // just save the decoded string to a file to inspect it
  fs.writeFileSync('scratch/chasalddae_dump.json', decoded);
}
test();
