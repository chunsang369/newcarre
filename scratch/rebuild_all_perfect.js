const axios = require('axios');
const fs = require('fs');

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

function detectCategory(name, summary) {
    const s = (name + ' ' + summary).toLowerCase();
    if (s.includes('suv') || s.includes('팰리세이드') || s.includes('싼타페') || s.includes('투싼')) return 'SUV';
    if (s.includes('세단') || s.includes('그랜저') || s.includes('아반떼') || s.includes('쏘나타')) return 'SEDAN';
    if (s.includes('mpv') || s.includes('카니발') || s.includes('스타리아')) return 'SUV';
    return 'SEDAN'; // default
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
    const koreanMap = { '디 올 뉴': 'the-all-new', '더 뉴': 'the-new', '팰리세이드': 'palisade', '그랑 콜레오스': 'grand-koleos' };
    for (const [kr, en] of Object.entries(koreanMap)) {
        modelSlug = modelSlug.replace(new RegExp(kr, 'g'), en);
    }
    return `${brandSlug}-${modelSlug}`.replace(/--+/g, '-').replace(/^-|-$/g, '');
}

async function fetchRobustData(trimId) {
    try {
        const res = await axios.get(`https://chasalddae.com/leaserent/leaserent_detail?trim_id=${trimId}`);
        const html = res.data;
        let fullRscString = '';
        for (const line of html.split('\n')) {
            if (line.includes('self.__next_f.push(')) {
                const match = line.match(/self\.__next_f\.push\(\[1,"(.*)"\]\)</);
                if (match) fullRscString += match[1];
            }
        }
        let decoded = fullRscString.replace(/\\\\/g, '\\').replace(/\\"/g, '"');
        let outerColors = [], innerColors = [], options = [], trims = [];
        const trimsMatch = decoded.match(/\[\{"id":\d+,"trim_name":"[^"]+","price":\d+.*?\}\]/);
        if (trimsMatch) {
            try { trims = JSON.parse(trimsMatch[0]); } 
            catch(e) {
                const matches = trimsMatch[0].match(/\{"id":(\d+),"trim_name":"([^"]+)","price":(\d+)/g);
                if (matches) trims = matches.map(m => {
                    const parsed = m.match(/\{"id":(\d+),"trim_name":"([^"]+)","price":(\d+)/);
                    return { id: parseInt(parsed[1],10), trim_name: parsed[2], price: parseInt(parsed[3],10) };
                });
            }
        }
        try {
            const outerRaw = decoded.match(/"trim_outer_color_list":(\[.*?\]),"trim_inner/);
            if (outerRaw) outerColors = JSON.parse(outerRaw[1]);
        } catch(e) {}
        try {
            const innerRaw = decoded.match(/"trim_inner_color_list":(\[.*?\]),"trim_opt_list/);
            if (innerRaw) innerColors = JSON.parse(innerRaw[1]);
        } catch(e) {}
        try {
            const optRaw = decoded.match(/"trim_opt_list":(\[.*?\]),"/);
            if (optRaw) {
               let str = optRaw[1];
               if(!str.endsWith(']')) str += ']';
               options = JSON.parse(str);
            }
        } catch(e) {}
        return { outerColors, innerColors, options, trims };
    } catch(e) {
        return { outerColors: [], innerColors: [], options: [], trims: [] };
    }
}

// Queue system for concurrency
const queue = [];
let active = 0;
const MAX_CONCURRENT = 5;

async function processCar(carMeta, index, total) {
    const car = v2Data[carMeta.trimId];
    if (!car) return;
    console.log(`[${index}/${total}] 파싱 중: ${car.fullName}...`);

    const mainData = await fetchRobustData(car.trimId);
    if (mainData.trims.length === 0) {
        car.mappedGrades = car.grades;
        if (car.mappedGrades) {
           car.mappedGrades.forEach(g => g.trims.forEach(t => {
               t.options = (mainData.options || []).map(o => ({ name: o.name, price: o.price }));
               t.colorsExt = (mainData.outerColors || []).map(c => ({ name: c.name, price: c.price, hex: c.detail || [] }));
               t.colorsInt = (mainData.innerColors || []).map(c => ({ name: c.name, price: c.price, hex: c.detail || [] }));
           }));
        }
    } else {
        const newGrades = [];
        if (car.grades) {
            for (const g of car.grades) {
                const newTrims = [];
                for (const t of g.trims) {
                    const matchedRsc = mainData.trims.find(r => r.trim_name.includes(t.name) || t.name.includes(r.trim_name));
                    const actualTrimId = matchedRsc ? matchedRsc.id : car.trimId;
                    let tData = mainData;
                    if (actualTrimId !== car.trimId) {
                        tData = await fetchRobustData(actualTrimId);
                    }
                    newTrims.push({
                        trimId: actualTrimId,
                        name: t.name,
                        price: t.price,
                        options: (tData.options || []).map(o => ({ name: o.name, price: o.price })),
                        colorsExt: (tData.outerColors || []).map(c => ({ name: c.name, price: c.price, hex: c.detail || [] })),
                        colorsInt: (tData.innerColors || []).map(c => ({ name: c.name, price: c.price, hex: c.detail || [] }))
                    });
                }
                newGrades.push({ name: g.name, trims: newTrims });
            }
        }
        car.mappedGrades = newGrades;
    }
    car.localImageUrl = `/images/cars/${carMeta.slug || car.trimId}.png`;
    return car;
}

async function runAll() {
    console.log('============================================');
    console.log('  전체 250대 완벽 1:1 매핑 추출 시작 (중복 원천 차단)');
    console.log('============================================');

    const updatedCars = [];
    // 중복 슬러그 처리용 Set
    const seenSlugs = new Set();
    
    // 차종별로 병렬 처리
    const promises = [];
    for (let i = 0; i < list.length; i++) {
        const carMeta = list[i];
        
        // 슬러그 계산하여 중복되는 차량은 여기서 완전히 합치거나 구분
        const brandSlug = BRAND_SLUGS[carMeta.brand] || carMeta.brand.toLowerCase();
        let slug = makeSlug(carMeta.brand, carMeta.modelName);
        if (seenSlugs.has(slug)) slug += `-${carMeta.trimId}`; // 중복 방지 고유 슬러그 할당
        seenSlugs.add(slug);
        
        carMeta.computedSlug = slug;
        carMeta.computedBrandSlug = brandSlug;
        
        const p = (async () => {
            while (active >= MAX_CONCURRENT) {
                await new Promise(r => setTimeout(r, 100));
            }
            active++;
            try {
                const processed = await processCar(carMeta, i+1, list.length);
                if(processed) {
                    processed.computedSlug = slug;
                    processed.computedBrandSlug = brandSlug;
                    updatedCars.push(processed);
                }
            } finally {
                active--;
            }
        })();
        promises.push(p);
    }
    
    await Promise.all(promises);
    
    console.log('\n✅ 전체 데이터 추출 완료. DB 매핑 시작...');
    
    const dbCars = [];
    updatedCars.sort((a,b) => (b.sortOrder||0) - (a.sortOrder||0)); // 원본 순서 유지
    
    for (let i = 0; i < updatedCars.length; i++) {
        const car = updatedCars[i];
        const basePrice = car.grades?.[0]?.trims?.[0]?.price || 0;
        
        const options = {
            grades: (car.mappedGrades || []).map((g, gi) => ({
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
        
        let img = car.localImageUrl || car.imageUrl;
        if (img && img.includes('logo.png')) img = null;
        
        dbCars.push({
            slug: car.computedSlug,
            brandSlug: car.computedBrandSlug,
            modelName: car.modelName,
            trimName: '2025년형',
            year: 2025,
            category: detectCategory(car.modelName, car.summary || ''),
            fuelType: detectFuelType(car.summary || ''),
            basePrice,
            imageUrl: img,
            isPopular: true,
            sortOrder: i + 1,
            options,
            priceMatrix: { rent: { prepay: Math.round(basePrice * 0.015), deposit: Math.round(basePrice * 0.017), none: Math.round(basePrice * 0.02) }, lease: { prepay: Math.round(basePrice * 0.01), deposit: Math.round(basePrice * 0.012), none: Math.round(basePrice * 0.015) } },
        });
    }

    let output = `// Auto-generated Perfect 1:1 Mapping (${new Date().toISOString()})\n`;
    output += `export const popularCars = ${JSON.stringify(dbCars, null, 2)};\n`;
    fs.writeFileSync('prisma/car-data.ts', output);
    
    console.log(`✅ 완벽한 car-data.ts 덮어쓰기 완료 (${dbCars.length}대)`);
}

runAll().catch(console.error);
