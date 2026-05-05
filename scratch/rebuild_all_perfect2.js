const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

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

// V1 slug logic used for the OLD filenames that are currently on disk
function makeOldSlug(brand, modelName) {
    const brandSlug = BRAND_SLUGS[brand] || brand.toLowerCase();
    let modelSlug = modelName.replace(/\(.*?\)/g, '').replace(/[^a-zA-Z0-9가-힣\s-]/g, '').trim().replace(/\s+/g, '-').toLowerCase();
    const koreanMap = { '디 올 뉴': 'the-all-new', '더 뉴': 'the-new', '팰리세이드': 'palisade', '그랑 콜레오스': 'grand-koleos' };
    for (const [kr, en] of Object.entries(koreanMap)) {
        modelSlug = modelSlug.replace(new RegExp(kr, 'g'), en); // This was broken for most because of hyphens
    }
    return `${brandSlug}-${modelSlug}`.replace(/--+/g, '-').replace(/^-|-$/g, '');
}

// V2 STRICT English slug logic
function makeStrictSlug(brand, modelName) {
    const brandSlug = BRAND_SLUGS[brand] || brand.toLowerCase();
    
    // First apply translations BEFORE replacing spaces with hyphens!
    let modelSlug = modelName.replace(/\(.*?\)/g, '').trim();
    const koreanMap = { 
        '디 올 뉴': 'the-all-new', '더 뉴': 'the-new', '신형': 'new', '올 뉴': 'all-new',
        '팰리세이드': 'palisade', '그랑 콜레오스': 'grand-koleos', '캐스퍼': 'casper', 
        '일렉트릭': 'electric', '아이오닉': 'ioniq', '스타리아': 'staria', '투싼': 'tucson', 
        '싼타페': 'santafe', '아반떼': 'avante', '쏘나타': 'sonata', '포터': 'porter', 
        '그랜저': 'grandeur', '스포티지': 'sportage', '쏘렌토': 'sorento', '카니발': 'carnival', 
        '니로': 'niro', '모닝': 'morning', '셀토스': 'seltos', '레이': 'ray', 
        '티볼리': 'tivoli', '토레스': 'torres', '렉스턴': 'rexton', '코란도': 'korando', 
        '액티언': 'actyon', '무쏘': 'musso', '봉고': 'bongo', '마그마': 'magma',
        '슈팅브레이크': 'shooting-brake', '디 엣지': 'the-edge', '아레나': 'arena',
        '알파': 'alpha', '롱 데크': 'long-deck', '특장차': 'special', '타스만': 'tasman',
        '베뉴': 'venue', '넥쏘': 'nexo', '쏠라티': 'solati'
    };
    
    for (const [kr, en] of Object.entries(koreanMap)) {
        modelSlug = modelSlug.replace(new RegExp(kr, 'g'), en);
    }
    
    // Now replace spaces with hyphens and remove any remaining Korean/special chars
    modelSlug = modelSlug.replace(/[^a-zA-Z0-9\s-]/g, '').trim().replace(/\s+/g, '-').toLowerCase();
    
    return `${brandSlug}-${modelSlug}`.replace(/--+/g, '-').replace(/^-|-$/g, '');
}

function detectCategory(name, summary) {
    const s = (name + ' ' + summary).toLowerCase();
    if (s.includes('suv') || s.includes('palisade') || s.includes('santafe') || s.includes('tucson')) return 'SUV';
    if (s.includes('세단') || s.includes('grandeur') || s.includes('avante') || s.includes('sonata')) return 'SEDAN';
    if (s.includes('mpv') || s.includes('carnival') || s.includes('staria')) return 'VAN';
    if (s.includes('해치백') || s.includes('hatch')) return 'HATCHBACK';
    if (s.includes('트럭') || s.includes('porter') || s.includes('bongo')) return 'TRUCK';
    return 'SEDAN'; // default
}

function detectFuelType(summary) {
    const s = (summary||'').toLowerCase();
    if (s.includes('전기')) return 'EV';
    if (s.includes('하이브리드') || s.includes('hev') || s.includes('phev')) return 'HYBRID';
    if (s.includes('디젤')) return 'DIESEL';
    if (s.includes('lpi') || s.includes('lpg')) return 'LPG';
    return 'GASOLINE';
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
        return { outerColors: [], innerColors: [], options: [], trims: [], fetchError: true };
    }
}

const queue = [];
let active = 0;
const MAX_CONCURRENT = 5;

async function processCar(carMeta, index, total) {
    const car = v2Data[carMeta.trimId];
    if (!car) return;
    
    // Rename image file if it exists under the old slug
    let oldSlug = makeOldSlug(carMeta.brand, carMeta.modelName);
    const newSlug = carMeta.computedSlug;
    
    const imgDir = path.join(__dirname, '../public/images/cars');
    const oldPath = path.join(imgDir, `${oldSlug}.png`);
    const newPath = path.join(imgDir, `${newSlug}.png`);
    
    // Also try the slug with ID if there were duplicates in old logic
    const oldPathWithId = path.join(imgDir, `${oldSlug}-${carMeta.trimId}.png`);
    
    if (fs.existsSync(oldPath) && oldPath !== newPath) {
        fs.renameSync(oldPath, newPath);
    } else if (fs.existsSync(oldPathWithId) && oldPathWithId !== newPath) {
        fs.renameSync(oldPathWithId, newPath);
    }
    
    car.localImageUrl = `/images/cars/${newSlug}.png`;

    const mainData = await fetchRobustData(car.trimId);
    if (mainData.trims.length === 0) {
        car.mappedGrades = car.grades;
        if (car.mappedGrades) {
           car.mappedGrades.forEach(g => g.trims.forEach(t => {
               t.options = (mainData.options || []).map(o => ({ name: o.name, price: o.price }));
               t.colorsExt = (mainData.outerColors || []).map(c => ({ 
                   idx: String(c.id), 
                   title: c.name, 
                   price: c.price, 
                   detail: c.detail || [], 
                   thumb: (c.detail && c.detail[0]) || null 
               }));
               t.colorsInt = (mainData.innerColors || []).map(c => ({ 
                   idx: String(c.id), 
                   title: c.name, 
                   price: c.price, 
                   detail: c.detail || [], 
                   thumb: (c.detail && c.detail[0]) || null 
               }));
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
                        colorsExt: (tData.outerColors || []).map(c => ({ 
                            idx: String(c.id), 
                            title: c.name, 
                            price: c.price, 
                            detail: c.detail || [], 
                            thumb: (c.detail && c.detail[0]) || null 
                        })),
                        colorsInt: (tData.innerColors || []).map(c => ({ 
                            idx: String(c.id), 
                            title: c.name, 
                            price: c.price, 
                            detail: c.detail || [], 
                            thumb: (c.detail && c.detail[0]) || null 
                        }))
                    });
                }
                newGrades.push({ name: g.name, trims: newTrims });
            }
        }
        car.mappedGrades = newGrades;
    }
    return car;
}

async function runAll() {
    console.log('============================================');
    console.log('  완벽 1:1 파싱 + 슬러그 영어 강제 변환 + 실제 렌트/리스 가격 복원');
    console.log('============================================');

    const updatedCars = [];
    const seenSlugs = new Set();
    const promises = [];
    
    // Empty the DB completely first to prevent weird duplicates from upsert
    const prismaCli = new PrismaClient();
    // await prismaCli.car.deleteMany({}); // MOVED DOWN
    
    let totalProcessed = 0;
    let emptyColorsCount = 0;
    let fetchFailCount = 0;

    for (let i = 0; i < list.length; i++) {
        const carMeta = list[i];
        
        const brandSlug = BRAND_SLUGS[carMeta.brand] || carMeta.brand.toLowerCase();
        let slug = makeStrictSlug(carMeta.brand, carMeta.modelName);
        if (seenSlugs.has(slug)) slug += `-${carMeta.trimId}`; 
        seenSlugs.add(slug);
        
        carMeta.computedSlug = slug;
        carMeta.computedBrandSlug = brandSlug;
        
        const p = (async () => {
            while (active >= MAX_CONCURRENT) {
                await new Promise(r => setTimeout(r, 100));
            }
            active++;
            try {
                const tData = await fetchRobustData(carMeta.trimId);
                if (!tData.outerColors || tData.outerColors.length === 0) {
                    if (tData.fetchError) fetchFailCount++;
                    else emptyColorsCount++;
                }

                const processed = await processCar(carMeta, i+1, list.length);
                if(processed) {
                    processed.computedSlug = slug;
                    processed.computedBrandSlug = brandSlug;
                    updatedCars.push(processed);
                    totalProcessed++;
                }
            } finally {
                active--;
            }
        })();
        promises.push(p);
    }
    
    await Promise.all(promises);
    
    console.log('\n============================================');
    console.log('  작업 완료 통계');
    console.log('============================================');
    console.log(`1. 총 처리 차량 수: ${totalProcessed}대`);
    console.log(`2. 색상 데이터 없는 차량 수: ${emptyColorsCount}대`);
    console.log(`3. fetchRobustData 실패 카운트: ${fetchFailCount}건`);
    console.log('============================================\n');
    
    // DB 업데이트 직전에 삭제 실행
    console.log('Cleaning up existing car data...');
    await prismaCli.car.deleteMany({});
    
    const dbCars = [];
    updatedCars.sort((a,b) => (b.sortOrder||0) - (a.sortOrder||0));
    
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
        
        // RECOVER ACTUAL PRICES FROM v2Data!
        // v2Data contains `monthlyRent` and `monthlyLease` which are PREPAY_30, 36m, 20000km prices.
        // Step 1: Calculate NO_DEPOSIT base for 36 months.
        let prepay36 = Math.round((basePrice * 0.3) / 36);
        let baseNoDepositRent36 = car.monthlyRent ? (car.monthlyRent + prepay36) : Math.round(basePrice * 0.0165);
        let baseNoDepositLease36 = car.monthlyLease ? (car.monthlyLease + prepay36) : Math.round(basePrice * 0.014);

        const periods = [36, 48, 60];
        const mileages = [10000, 20000];

        const rentPeriodFactor = { 36: 1.0, 48: 0.89, 60: 0.895 };
        const leasePeriodFactor = { 36: 1.0, 48: 0.90, 60: 0.88 };
        const mileageFactors = { 10000: 0.96, 20000: 1.0 };

        const priceMatrix = {};
        for (const p of periods) {
            for (const m of mileages) {
                let r_no_dep = Math.round(baseNoDepositRent36 * rentPeriodFactor[p] * mileageFactors[m]);
                let l_no_dep = Math.round(baseNoDepositLease36 * leasePeriodFactor[p] * mileageFactors[m]);
                
                let prepayMonthly = Math.round((basePrice * 0.3) / p);
                
                priceMatrix[`${p}_NO_DEPOSIT_${m}`] = { rent: r_no_dep, lease: l_no_dep };
                priceMatrix[`${p}_DEPOSIT_30_${m}`] = { 
                    rent: Math.round(r_no_dep * 0.9), 
                    lease: Math.round(l_no_dep * 0.9) 
                };
                priceMatrix[`${p}_PREPAY_30_${m}`] = { 
                    rent: Math.max(0, r_no_dep - prepayMonthly), 
                    lease: Math.max(0, l_no_dep - prepayMonthly) 
                };
            }
        }
        
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
            priceMatrix,
        });
    }

    console.log(`✅ 완벽한 car-data.ts 생성 완료 (${dbCars.length}대)`);
    
    // DB에 실제 삽입 수행
    console.log(`Inserting ${dbCars.length} cars into database...`);
    for (const carData of dbCars) {
        await prismaCli.car.create({
            data: {
                ...carData,
                brand: {
                    connect: { slug: carData.brandSlug }
                },
                brandSlug: undefined // Already used in connect
            }
        });
    }
    console.log('✅ DB 데이터 삽입 완료');
    
    await prismaCli.$disconnect();
}

runAll().catch(console.error);
