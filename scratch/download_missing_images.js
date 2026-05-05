const axios = require('axios');
const fs = require('fs');
const path = require('path');

const list = JSON.parse(fs.readFileSync('scratch/chasalddae_list_clean.json', 'utf8'));
const v2Data = JSON.parse(fs.readFileSync('scratch/chasalddae_details_v2.json', 'utf8'));

const BRAND_SLUGS = {
  '현대': 'hyundai', '기아': 'kia', '제네시스': 'genesis', '르노코리아': 'renault-korea',
  '쉐보레': 'chevrolet', 'KG모빌리티': 'kgm', 'BMW': 'bmw', '벤츠': 'mercedes-benz',
  '아우디': 'audi', '미니': 'mini', '볼보': 'volvo', '폭스바겐': 'volkswagen',
  '토요타': 'toyota', '렉서스': 'lexus', '혼다': 'honda', '랜드로버': 'land-rover',
  '지프': 'jeep', '캐딜락': 'cadillac', '테슬라': 'tesla', '푸조': 'peugeot',
  '폴스타': 'polestar', 'BYD': 'byd',
};

function makeSlug(brand, modelName) {
    const brandSlug = BRAND_SLUGS[brand] || brand.toLowerCase();
    let modelSlug = modelName.replace(/\(.*?\)/g, '').replace(/[^a-zA-Z0-9가-힣\s-]/g, '').trim().replace(/\s+/g, '-').toLowerCase();
    const koreanMap = { '디 올 뉴': 'the-all-new', '더 뉴': 'the-new', '팰리세이드': 'palisade', '그랑 콜레오스': 'grand-koleos' };
    for (const [kr, en] of Object.entries(koreanMap)) {
        modelSlug = modelSlug.replace(new RegExp(kr, 'g'), en);
    }
    return `${brandSlug}-${modelSlug}`.replace(/--+/g, '-').replace(/^-|-$/g, '');
}

async function downloadImages() {
    console.log('=== 누락된 로컬 썸네일 이미지 다운로드 시작 ===');
    const imageDir = path.join(__dirname, '../public/images/cars');
    if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

    const seenSlugs = new Set();
    let downloaded = 0;
    let skipped = 0;

    for (let i = 0; i < list.length; i++) {
        const carMeta = list[i];
        const car = v2Data[carMeta.trimId];
        if (!car || !car.imageUrl || car.imageUrl.includes('logo.png')) continue;

        let slug = makeSlug(carMeta.brand, carMeta.modelName);
        if (seenSlugs.has(slug)) slug += `-${carMeta.trimId}`;
        seenSlugs.add(slug);

        const localPath = path.join(imageDir, `${slug}.png`);
        
        if (fs.existsSync(localPath)) {
            skipped++;
            continue;
        }

        try {
            console.log(`다운로드 중 [${i+1}/250]: ${slug}.png`);
            const response = await axios.get(car.imageUrl, { responseType: 'stream' });
            const writer = fs.createWriteStream(localPath);
            response.data.pipe(writer);
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
            downloaded++;
        } catch (error) {
            console.error(`다운로드 실패 (${slug}):`, error.message);
        }
        
        // Anti-rate-limit delay
        await new Promise(r => setTimeout(r, 200));
    }
    
    console.log(`\n✅ 작업 완료! 새로 다운로드: ${downloaded}개 | 기존 파일 건너뜀: ${skipped}개`);
}

downloadImages().catch(console.error);
