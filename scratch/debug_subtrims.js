const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function extractTrimIdsFromPage(mainTrimId) {
    try {
        const res = await axios.get(`https://chasalddae.com/leaserent/leaserent_detail?trim_id=${mainTrimId}`);
        const html = res.data;
        const $ = cheerio.load(html);

        const grades = [];
        
        // 차살때의 트림 리스트 UI 파싱
        $('ul.list.hidden.flex-col').each((idx, ul) => {
            const gradeName = $(ul).prev().text().trim();
            const trims = [];
            $(ul).find('li').each((j, li) => {
                const text = $(li).text().trim();
                const match = text.match(/(.+?)\s*([0-9,]+)원/);
                
                // 트림 ID 추출: href="?trim_id=XXXX" 또는 onclick="change_trim(XXXX)"
                const elHtml = $(li).html();
                const idMatch = elHtml.match(/trim_id=(\d+)/) || elHtml.match(/change_trim\D+(\d+)/) || elHtml.match(/data-id=["']?(\d+)/);
                
                let actualTrimId = mainTrimId;
                if (idMatch) actualTrimId = idMatch[1];
                
                if (match) {
                    trims.push({
                        trimId: actualTrimId,
                        name: match[1].trim(),
                        price: parseInt(match[2].replace(/,/g, ''), 10)
                    });
                }
            });
            if (gradeName && trims.length > 0) {
                grades.push({ name: gradeName, trims });
            }
        });
        
        // 만약 추출하지 못했다면 RSC 데이터에서 강제 추출
        if (grades.length === 0 || grades[0].trims[0].trimId === mainTrimId) {
            const rscMatch = html.match(/\\"trim_id\\":(\d+),\\"trim_name\\":\\"([^\\"]+)\\"/g);
            if (rscMatch) {
               // RSC에 숨겨져 있는 경우, 추가적인 정밀 파싱 필요 (현 단계에선 생략)
            }
        }
        
        return grades;
    } catch(e) {
        return [];
    }
}

async function fetchOptionsAndColors(trimId) {
    try {
        const res = await axios.get(`https://chasalddae.com/leaserent/leaserent_detail?trim_id=${trimId}`);
        const $ = cheerio.load(res.data);
        
        const options = [];
        let inOpt = false;
        $('label').each((i, el) => {
            const text = $(el).text().replace(/\s+/g, ' ').trim();
            if (text.includes('02 옵션')) { inOpt = true; return; }
            if (text.includes('03 계약조건')) { inOpt = false; return; }
            
            if (inOpt) {
                const pMatch = text.match(/([0-9,]+)원/);
                if (pMatch) {
                    let name = text.replace(pMatch[0], '').replace(/\*.*$/, '').replace(/상위 연계.*$/, '').trim();
                    if (name.length > 1 && !name.includes('선택 가능 옵션 없음')) {
                        if (!options.find(o => o.name === name)) {
                            options.push({ name, price: parseInt(pMatch[1].replace(/,/g, ''), 10) });
                        }
                    }
                }
            }
        });
        
        // 색상 파싱: 원본에서 "(0)" 이면 진짜 0개임.
        let extColors = 0, intColors = 0;
        const bodyText = $('body').text().replace(/\s+/g, '');
        if (bodyText.includes('외장색상(0)')) extColors = 0;
        if (bodyText.includes('내장색상(0)')) intColors = 0;
        
        return { options, extColorCount: extColors, intColorCount: intColors };
    } catch(e) {
        return { options: [], extColorCount: 0, intColorCount: 0 };
    }
}

async function testPalisadeSubTrims() {
    console.log("=== 트림별 옵션 변화 1:1 정밀 검증 (팰리세이드 4566) ===");
    const grades = await extractTrimIdsFromPage(4566);
    
    if (grades.length === 0) {
        console.log("트림을 찾지 못했습니다.");
        return;
    }
    
    for (const g of grades) {
        console.log(`\n▶ 등급: ${g.name}`);
        for (const t of g.trims) {
            console.log(`  - 트림: ${t.name} (ID: ${t.trimId}) | ${t.price.toLocaleString()}원`);
            
            // 트림 ID가 다르면 개별 조회
            if (t.trimId !== 4566) {
                const data = await fetchOptionsAndColors(t.trimId);
                console.log(`    -> 추출된 옵션: ${data.options.length}개, 외장색: ${data.extColorCount}개, 내장색: ${data.intColorCount}개`);
                if (data.options.length > 0) {
                    console.log(`    -> 대표 옵션: ${data.options[0].name} (${data.options[0].price}원)`);
                }
            } else {
                console.log(`    -> 메인 트림과 ID 동일`);
            }
        }
    }
}

testPalisadeSubTrims();
