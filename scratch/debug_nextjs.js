const axios = require('axios');
const fs = require('fs');

async function extractNextData() {
    const url = 'https://chasalddae.com/leaserent/leaserent_detail?trim_id=4566';
    const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }});
    const html = res.data;

    console.log("=== Next.js 데이터 추출 시도 ===");
    
    // JSON 구조체 탐색 (색상 키워드 "내장", "외장", "색상" 활용)
    // Next.js RSC payload는 문자열 형태로 직렬화되어 있음.
    
    // 정규식으로 JSON스러운 데이터 블록을 모두 찾습니다.
    const blocks = html.match(/\{[^{}]*색상[^{}]*\}/g) || [];
    console.log(`'색상' 키워드가 포함된 데이터 블록: ${blocks.length}개`);
    
    // 좀 더 넓은 범위의 JSON 블록 찾기
    const payloadMatch = html.match(/\["\\\$","\$L[a-f0-9]+",null,\{(.*?)\}\]/);
    if (payloadMatch) {
        console.log("RSC 페이로드 일부 발견!");
    }

    // 간단하게 정규식으로 색상 이름과 해시태그를 바로 찾아버리는 방법
    console.log("\n--- 정규식을 통한 색상/옵션 직접 추출 ---");
    const colorMatches = html.match(/[가-힣a-zA-Z0-9\s]+(?=\\?["']?\s*[:,]\s*\\?["']?#[a-fA-F0-9]{3,6}\\?["']?)/g);
    const hexMatches = html.match(/#[a-fA-F0-9]{6}/g);
    
    console.log("발견된 HEX 색상:", [...new Set(hexMatches)]);
    
    // 차라리 API 요청을 가로채거나 페이지를 띄웠을 때 브라우저가 호출하는 데이터를 보는 것이 정확합니다.
    // 하지만 현재는 HTML 소스에 있는 데이터를 추출해야 합니다.
    
    // 모든 "colors" 배열이나 "options" 배열 찾기
    const objMatches = html.match(/"colors"\s*:\s*\[(.*?)\]/g) || [];
    console.log(`\n"colors" 속성 발견: ${objMatches.length}개`);
    if (objMatches.length > 0) {
        console.log(objMatches[0].substring(0, 200));
    }

    const optMatches = html.match(/"options"\s*:\s*\[(.*?)\]/g) || [];
    console.log(`\n"options" 속성 발견: ${optMatches.length}개`);
    if (optMatches.length > 0) {
        console.log(optMatches[0].substring(0, 200));
    }
}

extractNextData().catch(console.error);
