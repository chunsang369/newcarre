const https = require('https');
const fs = require('fs');

async function getPage(page) {
  return new Promise((resolve, reject) => {
    https.get(`https://chasalddae.com/leaserent/leaserent_search?page=${page}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  const allTrimIds = new Set();
  for (let page = 1; page <= 9; page++) {
    console.log(`Fetching page ${page}...`);
    const html = await getPage(page);
    
    // Exact matching for trim_id=NNNN in search results
    const trimRegex = /trim_id=(\d+)/gi;
    let match;
    while ((match = trimRegex.exec(html)) !== null) {
      allTrimIds.add(parseInt(match[1]));
    }
  }
  
  const trimIdList = Array.from(allTrimIds);
  fs.writeFileSync('scratch/all_trim_ids.json', JSON.stringify(trimIdList, null, 2), 'utf8');
  console.log(`Successfully extracted ${trimIdList.length} unique trim IDs from Chasalddae.`);
}

main().catch(console.error);
