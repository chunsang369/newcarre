const fs = require('fs');

async function checkBackups() {
  const files = [
    'cars_final_database.json',
    'cars_detailed_final.json',
    'scratch/car_image_map.json',
    'scratch/chasalddae_scraped_images.json',
    'scratch/batch1_final.json',
    'scratch/batch1_perfect.json'
  ];

  files.forEach(f => {
    if (fs.existsSync(f)) {
      console.log(`[FOUND] ${f} - size: ${fs.statSync(f).size} bytes`);
    } else {
      console.log(`[MISSING] ${f}`);
    }
  });
}

checkBackups();
