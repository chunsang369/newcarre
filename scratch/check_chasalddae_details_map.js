const fs = require('fs');

async function main() {
  const details = JSON.parse(fs.readFileSync('scratch/chasalddae_details.json', 'utf8'));
  const keys = Object.keys(details);
  console.log(`Chasalddae details keys count: ${keys.length}`);
  console.log(`Sample 5 keys:`, keys.slice(0, 5));
  console.log(`Sample detail value:`, JSON.stringify(details[keys[0]], null, 2).slice(0, 500));
}

main().catch(console.error);
