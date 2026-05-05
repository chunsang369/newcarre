const axios = require('axios');
const fs = require('fs');
const path = require('path');

const list = JSON.parse(fs.readFileSync('scratch/chasalddae_list_clean.json', 'utf8'));
const v2Data = JSON.parse(fs.readFileSync('scratch/chasalddae_details_v2.json', 'utf8'));

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
        
        // Extract Trims list
        const trimsMatch = decoded.match(/\[\{"id":\d+,"trim_name":"[^"]+","price":\d+.*?\}\]/);
        if (trimsMatch) {
            try { 
                trims = JSON.parse(trimsMatch[0]); 
            } catch(e) {
                const matches = trimsMatch[0].match(/\{"id":(\d+),"trim_name":"([^"]+)","price":(\d+)/g);
                if (matches) {
                    trims = matches.map(m => {
                        const parsed = m.match(/\{"id":(\d+),"trim_name":"([^"]+)","price":(\d+)/);
                        return { id: parseInt(parsed[1],10), trim_name: parsed[2], price: parseInt(parsed[3],10) };
                    });
                }
            }
        }
        
        // Extract Colors and Options using correct keys
        try {
            const outerRaw = decoded.match(/"trim_outer_color_list":(\[.*?\]),"trim_inner/);
            if (outerRaw) outerColors = JSON.parse(outerRaw[1]);
        } catch(e) {}
        
        try {
            const innerRaw = decoded.match(/"trim_inner_color_list":(\[.*?\]),"trim_opt_list/);
            if (innerRaw) innerColors = JSON.parse(innerRaw[1]);
        } catch(e) {}
        
        try {
            // Options might end with "trim_basic_option_list" or similar
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

async function runBatch1() {
    console.log('============================================');
    console.log('  배치 1 (1~20대) 완벽 1:1 데이터 매핑 (색상/옵션 수정완료)');
    console.log('============================================');

    const batch = list.slice(0, 20);
    const updatedCars = {};

    for (let i = 0; i < batch.length; i++) {
        const carMeta = batch[i];
        const car = v2Data[carMeta.trimId];
        if (!car) continue;

        console.log(`\n[${i+1}/20] ${car.fullName}`);

        const mainData = await fetchRobustData(car.trimId);
        
        if (mainData.trims.length === 0) {
            console.log(`  -> 트림 데이터 없음. 대표 데이터로 일괄 복사`);
            car.mappedGrades = car.grades; 
            if (car.mappedGrades) {
               car.mappedGrades.forEach(g => g.trims.forEach(t => {
                   t.options = (mainData.options || []).map(o => ({ name: o.name, price: o.price }));
                   t.colorsExt = (mainData.outerColors || []).map(c => ({ name: c.name, price: c.price, hex: c.detail || [] }));
                   t.colorsInt = (mainData.innerColors || []).map(c => ({ name: c.name, price: c.price, hex: c.detail || [] }));
               }));
            }
        } else {
            console.log(`  -> 실제 트림 ID ${mainData.trims.length}개 발견! 1:1 개별 매핑`);
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
                        console.log(`    - [${t.name}] 옵션 ${(tData.options||[]).length} / 외장 ${(tData.outerColors||[]).length} / 내장 ${(tData.innerColors||[]).length}`);
                    }
                    newGrades.push({ name: g.name, trims: newTrims });
                }
            }
            car.mappedGrades = newGrades;
        }
        
        car.localImageUrl = `/images/cars/${carMeta.slug || car.trimId}.png`;
        updatedCars[carMeta.trimId] = car;
    }

    fs.writeFileSync('scratch/batch1_perfect.json', JSON.stringify(updatedCars, null, 2));
    console.log('\n✅ 배치 1 JSON 생성 완료: scratch/batch1_perfect.json');
}

runBatch1().catch(console.error);
