const axios = require('axios');
const fs = require('fs');

async function extractProperly(trimId) {
    try {
        const res = await axios.get(`https://chasalddae.com/leaserent/leaserent_detail?trim_id=${trimId}`);
        const html = res.data;
        
        // 1. 모든 __next_f.push 문자열을 수집
        const lines = html.split('\n');
        let fullRscString = '';
        for (const line of lines) {
            if (line.includes('self.__next_f.push(')) {
                // 파싱
                const match = line.match(/self\.__next_f\.push\(\[1,"(.*)"\]\)</);
                if (match) {
                    fullRscString += match[1];
                }
            }
        }
        
        // 2. 이스케이프 해제
        let decoded = fullRscString.replace(/\\\\/g, '\\').replace(/\\"/g, '"');
        
        // 3. 이제 일반 JSON 문자열에 가까워졌으므로 "trim_outer_color_list" 검색
        const outerMatch = decoded.match(/"trim_outer_color_list":(\[.*?\]),"trim_inner/);
        const innerMatch = decoded.match(/"trim_inner_color_list":(\[.*?\]),"trim_option/);
        const optMatch = decoded.match(/"trim_option_list":(\[.*?\]),"car_brand/);
        
        let outerColors = [];
        let innerColors = [];
        let options = [];
        
        if (outerMatch) {
            try { outerColors = JSON.parse(outerMatch[1]); } catch(e) {}
        }
        if (innerMatch) {
            try { innerColors = JSON.parse(innerMatch[1]); } catch(e) {}
        }
        if (optMatch) {
            try { options = JSON.parse(optMatch[1]); } catch(e) {}
        }
        
        console.log(`[트림 ${trimId}]`);
        console.log(`외장 색상: ${outerColors.length}개`);
        if(outerColors.length > 0) console.log(`  - ${outerColors[0].name}`);
        console.log(`내장 색상: ${innerColors.length}개`);
        if(innerColors.length > 0) console.log(`  - ${innerColors[0].name}`);
        console.log(`옵션: ${options.length}개`);
        
    } catch(e) {
        console.error(e.message);
    }
}

extractProperly(4566);
