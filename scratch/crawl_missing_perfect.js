const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const BRAND_SLUGS = {
  '기아': 'kia', '테슬라': 'tesla', '폭스바겐': 'volkswagen', '푸조': 'peugeot'
};

const MISSING_TRIMS = [
  { trimId: 2505, brand: '기아', modelName: '카니발 헤리티지', slug: 'kia-carnival-heritage', fallbackPrice: 73700000 },
  { trimId: 6341, brand: '테슬라', modelName: 'Model Y Juniper', slug: 'tesla-model-y-juniper', fallbackPrice: 49990000 },
  { trimId: 6154, brand: '폭스바겐', modelName: 'The New Touareg(3세대 F/L)', slug: 'vw-touareg-2026', fallbackPrice: 102790000, monthlyRent: 1408645 },
  { trimId: 7929, brand: '푸조', modelName: 'All New 5008(3세대)', slug: 'peugeot-5008-2026', fallbackPrice: 48900000, monthlyRent: 748381 }
];

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
        
        // Exact logic from rebuild_all_perfect2.js
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
        console.error(`Fetch failed for ${trimId}:`, e.message);
        return { outerColors: [], innerColors: [], options: [], trims: [] };
    }
}

async function run() {
    const prisma = new PrismaClient();
    
    for (const item of MISSING_TRIMS) {
        console.log(`Processing ${item.modelName} (${item.trimId})...`);
        const data = await fetchRobustData(item.trimId);
        
        let basePrice = data.trims.length > 0 && data.trims[0].price > 0 ? data.trims[0].price : item.fallbackPrice;
        
        // Build grades/trims structure - fetch specific data PER TRIM
        const trimsData = data.trims.length > 0 ? data.trims : [{ id: item.trimId, trim_name: item.modelName, price: basePrice }];
        const mappedTrims = [];
        
        for (let ti = 0; ti < trimsData.length; ti++) {
            const t = trimsData[ti];
            let tData = data;
            
            // If it's a different trim from the main one, fetch its specific colors and options
            if (t.id !== item.trimId) {
                tData = await fetchRobustData(t.id);
            }
            
            mappedTrims.push({
                idx: `1_${ti+1}`,
                name: t.trim_name || item.modelName,
                price: t.price || basePrice,
                colorsExt: tData.outerColors.map(c => ({
                    idx: String(c.id),
                    title: c.name,
                    price: c.price || 0,
                    detail: c.detail || [],
                    thumb: (c.detail && c.detail[0]) || null
                })),
                colorsInt: tData.innerColors.map(c => ({
                    idx: String(c.id),
                    title: c.name,
                    price: c.price || 0,
                    detail: c.detail || [],
                    thumb: (c.detail && c.detail[0]) || null
                })),
                options: tData.options.map((o, oi) => ({
                    idx: `opt_${oi+1}`,
                    title: o.name,
                    price: o.price || 0
                }))
            });
        }

        const grades = [{
            idx: "1",
            name: "기본 모델",
            trims: mappedTrims
        }];
        
        // Exact price logic from rebuild_all_perfect2.js
        let prepay36 = Math.round((basePrice * 0.3) / 36);
        let baseNoDepositRent36 = item.monthlyRent ? (item.monthlyRent + prepay36) : Math.round(basePrice * 0.0165);
        let baseNoDepositLease36 = Math.round(basePrice * 0.014); // Fallback lease

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
                priceMatrix[`${p}_DEPOSIT_30_${m}`] = { rent: Math.round(r_no_dep * 0.9), lease: Math.round(l_no_dep * 0.9) };
                priceMatrix[`${p}_PREPAY_30_${m}`] = { rent: Math.max(0, r_no_dep - prepayMonthly), lease: Math.max(0, l_no_dep - prepayMonthly) };
            }
        }
        
        const category = item.modelName.includes('카니발') ? 'VAN' : 'SUV';
        const fuelType = item.modelName.includes('전기') || item.modelName.includes('Model Y') ? 'EV' : 
                         item.modelName.includes('하이브리드') ? 'HYBRID' : 
                         item.modelName.includes('디젤') ? 'DIESEL' : 'GASOLINE';

        await prisma.car.update({
            where: { slug: item.slug },
            data: {
                options: { grades },
                priceMatrix,
                basePrice,
                category,
                fuelType
            }
        });
        
        console.log(`✅ Perfect Upserted ${item.modelName}`);
        console.log(`   - Trims processed: ${mappedTrims.length}`);
    }
    
    await prisma.$disconnect();
}

run().catch(console.error);
