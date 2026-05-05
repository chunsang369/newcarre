const https = require('https');
const fs = require('fs');

async function getPage(searchType, page) {
  return new Promise((resolve, reject) => {
    https.get(`https://chasalddae.com/leaserent/leaserent_search?search_type=${searchType}&page=${page}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  const allTrimIds = new Set();

  for (const type of ['domestic', 'import']) {
    for (let page = 1; page <= 12; page++) {
      console.log(`Fetching ${type} page ${page}...`);
      try {
        const html = await getPage(type, page);
        
        const trimRegex = /trim_id=(\d+)/gi;
        let match;
        let foundOnPage = 0;
        while ((match = trimRegex.exec(html)) !== null) {
          allTrimIds.add(parseInt(match[1]));
          foundOnPage++;
        }
        
        console.log(`  Found ${foundOnPage} trim IDs on ${type} page ${page}`);
        if (foundOnPage === 0) {
          // If no trim IDs found on this page, it's the end of results for this type
          break;
        }
      } catch (err) {
        console.error(`Error fetching ${type} page ${page}:`, err.message);
      }
    }
  }
  
  const trimIdList = Array.from(allTrimIds);
  fs.writeFileSync('scratch/all_trim_ids.json', JSON.stringify(trimIdList, null, 2), 'utf8');
  console.log(`Successfully extracted ${trimIdList.length} unique trim IDs from both domestic and imported tabs of Chasalddae.`);
}

main().catch(console.error);
