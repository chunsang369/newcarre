const axios = require('axios');
const fs = require('fs');

async function extractTrimMapping() {
    const mainTrimId = 4566; // Palisade
    console.log(`=== 차살때 Next.js 내부 데이터에서 하위 트림 ID 강제 추출 ===`);
    
    try {
        const res = await axios.get(`https://chasalddae.com/leaserent/leaserent_detail?trim_id=${mainTrimId}`);
        const html = res.data;
        
        // Next.js RSC 데이터에서 JSON 형태의 배열이나 객체 추출
        // 트림 데이터는 보통 "trim_id", "trim_name", "price" 등을 가짐
        const matches = html.match(/\\"trim_id\\":(\d+),\\"trim_name\\":\\"([^\\"]+)\\",\\"price\\":(\d+)/g);
        
        if (matches && matches.length > 0) {
            console.log(`총 ${matches.length}개의 트림 데이터를 내부에서 발견했습니다!`);
            const uniqueTrims = new Set();
            
            matches.forEach(match => {
                if (!uniqueTrims.has(match)) {
                    uniqueTrims.add(match);
                    const parsed = match.match(/\\"trim_id\\":(\d+),\\"trim_name\\":\\"([^\\"]+)\\",\\"price\\":(\d+)/);
                    if (parsed) {
                        console.log(`- 트림 ID: ${parsed[1]} | 트림명: ${parsed[2]} | 가격: ${parseInt(parsed[3]).toLocaleString()}원`);
                    }
                }
            });
        } else {
            // 다른 형태의 JSON인지 확인
            const alternativeMatches = html.match(/"trim_id":(\d+),"trim_name":"([^"]+)","price":(\d+)/g);
            if (alternativeMatches) {
                console.log(`총 ${alternativeMatches.length}개의 트림 데이터를 대안 패턴으로 발견했습니다!`);
            } else {
                console.log("내부 데이터에서도 개별 트림 ID를 찾을 수 없습니다.");
            }
        }
        
    } catch(e) {
        console.error(e.message);
    }
}

extractTrimMapping();
