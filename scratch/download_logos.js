const fs = require('fs');
const path = require('path');
const axios = require('axios');

const brands = [
  { slug: 'hyundai', url: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Hyundai_Motor_Company_logo.svg' },
  { slug: 'kia', url: 'https://upload.wikimedia.org/wikipedia/commons/4/47/KIA_logo2.png' },
  { slug: 'genesis', url: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Genesis_logo.svg' },
  { slug: 'renault-korea', url: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Renault_2021_Logo.svg' },
  { slug: 'chevrolet', url: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Chevrolet-logo.png' },
  { slug: 'kgm', url: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/KGM_logo.svg' },
  { slug: 'bmw', url: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/BMW_logo_%28gray%29.svg' },
  { slug: 'mercedes-benz', url: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg' },
  { slug: 'audi', url: 'https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo_2016.svg' },
  { slug: 'mini', url: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/MINI_logo.svg' },
  { slug: 'volvo', url: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Volvo_logo.svg' },
  { slug: 'volkswagen', url: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Volkswagen_Logo_till_1995.svg' },
  { slug: 'toyota', url: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Toyota_carlogo.svg' },
  { slug: 'lexus', url: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Lexus_logo.svg' },
  { slug: 'honda', url: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Honda_Logo.svg' },
  { slug: 'land-rover', url: 'https://upload.wikimedia.org/wikipedia/en/3/30/Land_Rover_logo_2024.svg' },
  { slug: 'jeep', url: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Jeep_logo.svg' },
  { slug: 'cadillac', url: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Cadillac-Logo.svg' },
  { slug: 'tesla', url: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg' },
  { slug: 'peugeot', url: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Peugeot_Logo.svg' },
  { slug: 'polestar', url: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Polestar_logo.svg' },
  { slug: 'byd', url: 'https://upload.wikimedia.org/wikipedia/commons/f/f5/BYD_logo.svg' },
  { slug: 'porsche', url: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Porsche_logo.svg' },
  { slug: 'ford', url: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Ford_Motor_Company_Logo.svg' },
  { slug: 'lincoln', url: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Lincoln_Motor_Company_logo.svg' }
];

async function download() {
    const dir = path.join(__dirname, '../public/images/brands');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    for (const b of brands) {
        try {
            console.log(`Downloading ${b.slug}...`);
            const ext = b.url.endsWith('.svg') ? '.svg' : '.png';
            
            // Adding a small delay to avoid 429
            await new Promise(r => setTimeout(r, 1500));
            
            const res = await axios.get(b.url, { 
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                }
            });
            fs.writeFileSync(path.join(dir, `${b.slug}.png`), res.data);
            console.log(`[OK] ${b.slug}`);
        } catch (e) {
            console.log(`[FAIL] ${b.slug} - using fallback UI avatar...`);
            try {
               const fallback = await axios.get(`https://ui-avatars.com/api/?name=${b.slug}&background=random&color=fff&size=256`, { responseType: 'arraybuffer' });
               fs.writeFileSync(path.join(dir, `${b.slug}.png`), fallback.data);
               console.log(`[OK Fallback] ${b.slug}`);
            } catch(e2) {
               console.error(`[FATAL] ${b.slug} totally failed.`);
            }
        }
    }
}

download();
