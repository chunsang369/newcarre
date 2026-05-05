const axios = require('axios');
const cheerio = require('cheerio');

async function debugMissingData() {
    // 팰리세이드 트림 4566
    const res = await axios.get('https://chasalddae.com/leaserent/leaserent_detail?trim_id=4566');
    const html = res.data;
    
    // 1. 내장 색상 '블랙모노톤' 검색
    const idx = html.indexOf('블랙모노톤');
    if (idx !== -1) {
        console.log("=== 내장 색상 발견 ===");
        console.log(html.substring(Math.max(0, idx - 100), idx + 200));
    } else {
        console.log("내장 색상 키워드를 찾지 못했습니다.");
    }
    
    // 2. 옵션은 HTML cheerio 파싱이 가장 정확했음.
    const $ = cheerio.load(html);
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
    console.log(`옵션 개수(HTML 스크래핑): ${options.length}개`);
}

debugMissingData();
