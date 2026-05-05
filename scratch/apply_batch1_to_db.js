const fs = require('fs');

const v2Data = JSON.parse(fs.readFileSync('scratch/chasalddae_details_v2.json', 'utf8'));
const batch1Data = JSON.parse(fs.readFileSync('scratch/batch1_perfect.json', 'utf8'));

// Merge batch1 into v2
for (const trimId in batch1Data) {
    v2Data[trimId] = batch1Data[trimId];
}

const BRAND_SLUGS = {
  '현대': 'hyundai', '기아': 'kia', '제네시스': 'genesis', '르노코리아': 'renault-korea',
  '쉐보레': 'chevrolet', 'KG모빌리티': 'kgm', 'BMW': 'bmw', '벤츠': 'mercedes-benz',
  '아우디': 'audi', '미니': 'mini', '볼보': 'volvo', '폭스바겐': 'volkswagen',
  '토요타': 'toyota', '렉서스': 'lexus', '혼다': 'honda', '랜드로버': 'land-rover',
  '지프': 'jeep', '캐딜락': 'cadillac', '테슬라': 'tesla', '푸조': 'peugeot',
  '폴스타': 'polestar', 'BYD': 'byd',
};

function detectCategory(name, summary) {
    const s = (name + ' ' + summary).toLowerCase();
    if (s.includes('suv') || s.includes('팰리세이드') || s.includes('싼타페') || s.includes('투싼')) return 'SUV';
    if (s.includes('세단') || s.includes('그랜저') || s.includes('아반떼') || s.includes('쏘나타')) return 'SEDAN';
    if (s.includes('mpv') || s.includes('카니발') || s.includes('스타리아')) return 'SUV';
    return 'SEDAN';
}

function detectFuelType(summary) {
    const s = (summary||'').toLowerCase();
    if (s.includes('전기')) return 'ELECTRIC';
    if (s.includes('하이브리드') || s.includes('hev') || s.includes('phev')) return 'HYBRID';
    if (s.includes('디젤')) return 'DIESEL';
    if (s.includes('lpi') || s.includes('lpg')) return 'LPG';
    return 'GASOLINE';
}

function makeSlug(brand, modelName) {
    const brandSlug = BRAND_SLUGS[brand] || brand.toLowerCase();
    let modelSlug = modelName.replace(/\(.*?\)/g, '').replace(/[^a-zA-Z0-9가-힣\s-]/g, '').trim().replace(/\s+/g, '-').toLowerCase();
    const koreanMap = { '디 올 뉴': 'the-all-new', '더 뉴': 'the-new', '팰리세이드': 'palisade' };
    for (const [kr, en] of Object.entries(koreanMap)) {
        modelSlug = modelSlug.replace(new RegExp(kr, 'g'), en);
    }
    return `${brandSlug}-${modelSlug}`.replace(/--+/g, '-').replace(/^-|-$/g, '');
}

const seenSlugs = new Set();
const cars = [];
const keys = Object.keys(v2Data);

for (let i = 0; i < keys.length; i++) {
    const car = v2Data[keys[i]];
    if (!car.brand || !car.modelName) continue;
    
    const brandSlug = BRAND_SLUGS[car.brand] || car.brand.toLowerCase();
    let slug = makeSlug(car.brand, car.modelName);
    if (seenSlugs.has(slug)) slug += `-${car.trimId}`;
    seenSlugs.add(slug);
    
    const basePrice = car.grades?.[0]?.trims?.[0]?.price || 0;
    
    // Batch1 mappedGrades or fallback
    const finalGrades = car.mappedGrades || car.grades || [];
    
    const options = {
        grades: finalGrades.map((g, gi) => ({
            idx: String(gi + 1),
            name: g.name,
            trims: (g.trims || []).map((t, ti) => ({
                idx: `${gi + 1}_${ti + 1}`,
                name: t.name,
                price: t.price,
                colorsExt: t.colorsExt || [],
                colorsInt: t.colorsInt || [],
                options: (t.options || []).map((opt, oi) => ({
                    idx: `opt_${oi + 1}`,
                    title: opt.name,
                    price: opt.price,
                })),
            })),
        })),
    };
    
    cars.push({
        slug,
        brandSlug,
        modelName: car.modelName,
        trimName: '2025년형',
        year: 2025,
        category: detectCategory(car.modelName, car.summary || ''),
        fuelType: detectFuelType(car.summary || ''),
        basePrice,
        imageUrl: car.localImageUrl || (car.imageUrl && !car.imageUrl.includes('logo.png') ? car.imageUrl : null),
        isPopular: true,
        sortOrder: i + 1,
        options,
        priceMatrix: { rent: { prepay: Math.round(basePrice * 0.015), deposit: Math.round(basePrice * 0.017), none: Math.round(basePrice * 0.02) }, lease: { prepay: Math.round(basePrice * 0.01), deposit: Math.round(basePrice * 0.012), none: Math.round(basePrice * 0.015) } },
    });
}

let output = `// Auto-generated (${new Date().toISOString()})\n`;
output += `export const popularCars = ${JSON.stringify(cars, null, 2)};\n`;
fs.writeFileSync('prisma/car-data.ts', output);
console.log(`✅ Generated prisma/car-data.ts with ${cars.length} cars`);
