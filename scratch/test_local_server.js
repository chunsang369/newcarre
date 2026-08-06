const axios = require('axios');

async function testLocalEndpoints() {
  console.log('=== 로컬 엔드포인트 테스트 ===');

  const urls = [
    'http://localhost:3000/cars',
    'http://localhost:3000/cars/hyundai-avante', // 아반떼 상세
    'http://localhost:3000/cars/tesla-model-3', // 테슬라 상세
    'http://localhost:3000/api/health'
  ];

  for (const url of urls) {
    try {
      console.log(`GET ${url}...`);
      const res = await axios.get(url, { timeout: 5000 });
      console.log(`  -> 성공! Status: ${res.status}, Type: ${res.headers['content-type']}`);
    } catch (e) {
      console.log(`  -> 실패! status: ${e.response ? e.response.status : 'N/A'}, message: ${e.message}`);
      if (e.response && e.response.data) {
        console.log(`     Data (앞 200자): ${String(e.response.data).substring(0, 200)}`);
      }
    }
  }

  // POST api/analytics/visit 테스트
  console.log('\nPOST http://localhost:3000/api/analytics/visit...');
  try {
    const res = await axios.post('http://localhost:3000/api/analytics/visit', {
      sessionId: 'test-session',
      visitorId: 'test-visitor',
      path: '/cars'
    }, { timeout: 5000 });
    console.log(`  -> 성공! status: ${res.status}, data:`, res.data);
  } catch (e) {
    console.log(`  -> 실패! status: ${e.response ? e.response.status : 'N/A'}, message: ${e.message}`);
  }
}

testLocalEndpoints();
