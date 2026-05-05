const d = JSON.parse(require('fs').readFileSync('scratch/chasalddae_details_v2.json','utf8'));
Object.values(d).forEach(c => {
  if (!c.imageUrl || c.imageUrl.includes('logo.png')) {
    console.log(c.trimId, c.fullName, c.imageUrl);
  }
});
