const axios = require('axios');

async function findColorExact() {
    const url = 'https://chasalddae.com/leaserent/leaserent_detail?trim_id=4566';
    const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }});
    const html = res.data;
    
    // 사용자가 준 정확한 단어로 검색
    const idx = html.indexOf('캐스트아이언');
    if (idx !== -1) {
        console.log(`'캐스트아이언' 단어 발견됨! 인덱스: ${idx}`);
        // 단어 주변 500글자 출력해서 구조 확인
        console.log("=== 주변 데이터 ===");
        console.log(html.substring(Math.max(0, idx - 200), idx + 300));
    } else {
        console.log("'캐스트아이언' 단어를 HTML에서 직접 찾을 수 없습니다.");
        console.log("-> 1. 클라이언트 렌더링 후 별도 API(/api/...)로 색상을 불러오는 구조입니다.");
        console.log("-> 2. 혹은 인코딩(유니코드 등)되어 숨겨져 있습니다.");
        
        // 유니코드 변환해서 찾아보기 (\uCE90\uC2A4\uD2B8) -> 캐스트
        const uIdx = html.indexOf('\\ucce0\\uc2a4\\ud2b8'); // 대소문자 주의
        if (uIdx !== -1) {
             console.log("유니코드 형태로 발견!");
        }
    }
}

findColorExact();
