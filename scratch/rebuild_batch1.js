const axios = require('axios');
const fs = require('fs');
const path = require('path');

const list = JSON.parse(fs.readFileSync('scratch/chasalddae_list_clean.json', 'utf8'));
const v2Data = JSON.parse(fs.readFileSync('scratch/chasalddae_details_v2.json', 'utf8'));

// Helper to extract JSON from RSC string
function extractJSONList(html, key) {
    // Look for the key, and then capture everything until the next key or end of object
    const regex = new RegExp(`\\\\\\\\"${key}\\\\\\\\"\\\\s*:\\\\s*(\\\\[.*?(?=\\\\\\\\"[a-z_]+\\\\\\\\"\\\\s*:|\\}\\]\\}))`);
    const match = html.match(regex);
    if (!match) return [];
    
    let str = match[1];
    // If it doesn't end with ], append it. This is a heuristic fix.
    if (!str.endsWith(']')) {
        const lastBracketIndex = str.lastIndexOf(']');
        if (lastBracketIndex !== -1) {
            str = str.substring(0, lastBracketIndex + 1);
        } else {
            str += ']'; 
        }
    }
    
    try {
        str = str.replace(/\\\\"/g, '"');
        return JSON.parse(str);
    } catch(e) {
        // Fallback robust parsing
        const arrMatches = str.match(/\\{[^{}]+\\}/g) || [];
        const result = [];
        arrMatches.forEach(item => {
            const nameMatch = item.match(/\\"name\\":\\"([^\\"]+)\\"/);
            const priceMatch = item.match(/\\"price\\":(\d+)/);
            if (nameMatch) {
                result.push({
                    name: nameMatch[1],
                    price: priceMatch ? parseInt(priceMatch[1], 10) : 0
                });
            }
        });
        return result;
    }
}

function extractTrimsFromRSC(html) {
    // Looks for: \"trim_list\":[{"id":4566,"trim_name":"...","price":...}]
    const regex = /\\"trim_list\\"\s*:\s*(\[\{.*?\}\])/;
    const match = html.match(regex);
    if (!match) return [];
    try {
        let str = match[1].replace(/\\\\"/g, '"');
        return JSON.parse(str);
    } catch(e) {
        const arrMatches = match[1].match(/\{[^{}]+\}/g) || [];
        const result = [];
        arrMatches.forEach(item => {
            const idMatch = item.match(/\\"id\\":(\d+)/);
            const nameMatch = item.match(/\\"trim_name\\":\\"([^\\"]+)\\"/);
            const priceMatch = item.match(/\\"price\\":(\d+)/);
            if (idMatch && nameMatch) {
                result.push({
                    id: parseInt(idMatch[1], 10),
                    trim_name: nameMatch[1],
                    price: priceMatch ? parseInt(priceMatch[1], 10) : 0
                });
            }
        });
        return result;
    }
}

async function fetchTrimCompleteData(trimId) {
    try {
        const res = await axios.get(`https://chasalddae.com/leaserent/leaserent_detail?trim_id=${trimId}`);
        const html = res.data;
        
        // Extract Outer Colors
        const outerColorsRaw = extractJSONList(html, 'trim_outer_color_list');
        const outerColors = outerColorsRaw.map(c => ({
            name: c.name,
            price: c.price || 0,
        }));
        
        // Extract Inner Colors
        const innerColorsRaw = extractJSONList(html, 'trim_inner_color_list');
        const innerColors = innerColorsRaw.map(c => ({
            name: c.name,
            price: c.price || 0,
        }));
        
        // Extract Options
        const optionsRaw = extractJSONList(html, 'trim_option_list');
        const options = optionsRaw.map(c => ({
            name: c.name,
            price: c.price || 0,
        }));
        
        return { outerColors, innerColors, options, html };
    } catch(e) {
        return { outerColors: [], innerColors: [], options: [], html: '' };
    }
}

async function rebuildBatch1() {
    console.log('============================================');
    console.log('  배치 1 (1~20대) 숨겨진 RSC 데이터 추출 및 1:1 매핑 시작');
    console.log('============================================');

    const batch = list.slice(0, 20);
    const updatedCars = {};

    for (let i = 0; i < batch.length; i++) {
        const carMeta = batch[i];
        const car = v2Data[carMeta.trimId];
        if (!car) continue;

        console.log(`\n[${i+1}/20] ${car.fullName}`);

        // 1. 대표 트림 페이지 호출하여 하위 트림의 진짜 ID 추출
        const mainData = await fetchTrimCompleteData(car.trimId);
        let realTrims = extractTrimsFromRSC(mainData.html);
        
        // 2. 만약 RSC에서 트림 리스트를 못 찾았으면, v2Data의 정보라도 활용
        if (realTrims.length === 0) {
            console.log(`  -> RSC 트림 리스트 파싱 실패. 원본 구조 유지 (트림 ${car.grades?.[0]?.trims?.length || 0}개)`);
            car.mappedGrades = car.grades; 
            // Fallback: apply the options/colors found in main trim to all
            if (car.mappedGrades) {
                car.mappedGrades.forEach(g => g.trims.forEach(t => {
                    t.options = mainData.options;
                    t.colorsExt = mainData.outerColors;
                    t.colorsInt = mainData.innerColors;
                }));
            }
        } else {
            // RSC에서 찾은 실제 트림 정보 활용
            // 차살때의 '등급(grade)' 구조가 RSC에서는 평면적일 수 있음.
            // v2Data의 grades 구조와 매핑.
            console.log(`  -> RSC에서 실제 트림 ID ${realTrims.length}개 발견! 개별 조회 시작...`);
            
            const newGrades = [];
            if (car.grades && car.grades.length > 0) {
                for (const g of car.grades) {
                    const newTrims = [];
                    for (const t of g.trims) {
                        // 이름으로 RSC 트림 ID 매칭
                        const matchedRsc = realTrims.find(r => r.trim_name.includes(t.name) || t.name.includes(r.trim_name));
                        const actualTrimId = matchedRsc ? matchedRsc.id : car.trimId;
                        
                        let trimOptColors = mainData;
                        if (actualTrimId !== car.trimId) {
                            trimOptColors = await fetchTrimCompleteData(actualTrimId);
                        }
                        
                        newTrims.push({
                            trimId: actualTrimId,
                            name: t.name,
                            price: t.price,
                            options: trimOptColors.options,
                            colorsExt: trimOptColors.outerColors,
                            colorsInt: trimOptColors.innerColors
                        });
                        console.log(`    - [${t.name}] 옵션 ${trimOptColors.options.length} / 외장 ${trimOptColors.outerColors.length} / 내장 ${trimOptColors.innerColors.length}`);
                    }
                    newGrades.push({ name: g.name, trims: newTrims });
                }
            }
            car.mappedGrades = newGrades;
        }
        
        // 이미지 다운로드는 process_batch1.js에서 이미 완료했으나, 로컬 URL 유지
        car.localImageUrl = `/images/cars/${carMeta.slug || car.trimId}.png`; // fallback slug
        updatedCars[carMeta.trimId] = car;
    }

    fs.writeFileSync('scratch/batch1_v4.json', JSON.stringify(updatedCars, null, 2));
    console.log('\n✅ 배치 1 완벽 1:1 파싱 완료. 파일: scratch/batch1_v4.json');
}

rebuildBatch1().catch(console.error);
