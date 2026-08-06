const fs = require('fs');

async function main() {
  const cleanList = JSON.parse(fs.readFileSync('scratch/chasalddae_list_clean.json', 'utf8'));
  console.log(`cleanList length: ${cleanList.length}`);
  console.log('Sample item:', cleanList[0]);
}

main().catch(console.error);
