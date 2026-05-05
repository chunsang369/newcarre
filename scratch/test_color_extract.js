const axios = require('axios');
const fs = require('fs');

async function findColorAPI() {
    // 팰리세이드 트림 ID
    const trimId = 4566;
    console.log(`=== 차살때 트림 ID ${trimId} API/데이터 탐색 ===`);

    try {
        // 1. 혹시 Next.js 서버액션이나 API 엔드포인트가 있는지 확인
        // 차살때의 차량 색상은 보통 DB에서 가져옵니다.
        const res = await axios.get(`https://chasalddae.com/leaserent/leaserent_detail?trim_id=${trimId}`);
        const html = res.data;

        // RSC 데이터 블록 파싱 (Next.js App Router 페이로드)
        const scriptData = html.match(/self\.__next_f\.push\(\[1,"([0-9a-fA-F]+):(.*?)\]\)/g);
        
        let foundColors = false;
        if (scriptData) {
            scriptData.forEach(script => {
                // 이스케이프된 유니코드나 한글 '색상', '외장' 등을 검색
                if (script.includes('외장') || script.includes('내장') || script.includes('color') || script.includes('RGB')) {
                    // JSON 형태로 파싱 가능한 데이터가 있는지 확인
                    const match = script.match(/\\"[^\\"]*색상[^\\"]*\\"/);
                    if (match) {
                        foundColors = true;
                        console.log("RSC 데이터에서 색상 관련 텍스트 발견!");
                    }
                }
            });
        }
        
        if (!foundColors) {
            console.log("RSC 페이로드에서도 명시적인 색상 데이터를 찾지 못했습니다.");
            console.log("-> 차살때 사이트는 수입차뿐만 아니라 일부 국산차에서도 색상 선택을 텍스트가 아닌 '상담 시 선택'으로 넘기거나, 데이터베이스에 색상이 없을 수 있습니다.");
        }

    } catch(e) {
        console.error(e.message);
    }
}

findColorAPI();
