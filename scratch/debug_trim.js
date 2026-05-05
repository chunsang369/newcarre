const axios = require('axios');
const cheerio = require('cheerio');

async function debugTrim() {
    // 팰리세이드(또는 캐스퍼 일렉트릭 등) 상세 페이지 호출
    const url = 'https://chasalddae.com/leaserent/leaserent_detail?trim_id=4566';
    const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }});
    const html = res.data;
    const $ = cheerio.load(html);

    console.log("=== 옵션/색상 동적 로드 데이터 분석 ===");
    
    // 1. 색상 정보가 스크립트 변수에 담겨 있는지 확인
    const scriptTags = [];
    $('script').each((i, el) => {
        const text = $(el).html();
        if (text && (text.includes('color') || text.includes('option') || text.includes('colors'))) {
            scriptTags.push(text);
        }
    });

    if (scriptTags.length > 0) {
        console.log(`스크립트 태그 중 color/option 키워드 포함: ${scriptTags.length}개 찾음`);
        // Extracting color arrays if they exist in JS vars
        scriptTags.forEach((script, idx) => {
            const lines = script.split('\n');
            lines.forEach(line => {
                if (line.includes('var') || line.includes('const') || line.includes('let')) {
                    if (line.includes('color') || line.includes('Color')) {
                        console.log(`[Script ${idx}] Color Var: ${line.trim().substring(0, 100)}...`);
                    }
                }
            });
        });
    } else {
        console.log("스크립트 태그에 color 데이터가 없습니다.");
    }

    // 2. 다른 트림 클릭(change_trim) 시 일어나는 동작 확인
    console.log("\n=== 트림 변경 시 트리거 구조 ===");
    const trims = [];
    $('li').each((i, el) => {
        const onclick = $(el).attr('onclick');
        if (onclick && onclick.includes('trim')) {
            trims.push({ name: $(el).text().trim().substring(0, 30).replace(/\s+/g, ' '), onclick });
        }
    });
    console.log(trims);
}

debugTrim().catch(console.error);
