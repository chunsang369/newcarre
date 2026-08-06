const fs = require('fs');

async function testApi() {
  const trimId = '6342';
  
  // 1. 렌트 API 테스트
  const rentUrl = `https://portal-api.chasalddae.com/rental/rental-calc-monthly?trimId=${trimId}&domain=chasalddae.com&adPayment=30&deposit=0&period=48&distance=2m&insuranceAge=26&oiColorSumPrice=0&trimOptSumPrice=0`;
  console.log('Testing Rent API:', rentUrl);
  try {
    const res = await fetch(rentUrl);
    const json = await res.json();
    console.log('Rent API Success! Response Keys:', Object.keys(json));
    console.log('Sample Data:', JSON.stringify(json, null, 2));
  } catch (e) {
    console.error('Rent API Failed:', e.message);
  }

  // 2. 리스 API 경로 후보 테스트
  const leaseCandidates = [
    `https://portal-api.chasalddae.com/rental/lease-calc-monthly?trimId=${trimId}&domain=chasalddae.com&adPayment=30&deposit=0&period=48&distance=2m&insuranceAge=26&oiColorSumPrice=0&trimOptSumPrice=0`,
    `https://portal-api.chasalddae.com/lease/lease-calc-monthly?trimId=${trimId}&domain=chasalddae.com&adPayment=30&deposit=0&period=48&distance=2m&insuranceAge=26&oiColorSumPrice=0&trimOptSumPrice=0`
  ];

  for (const url of leaseCandidates) {
    console.log('\nTesting Lease API Candidate:', url);
    try {
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        console.log('SUCCESS! URL:', url);
        console.log('Lease API Response:', JSON.stringify(json, null, 2));
        break;
      } else {
        console.log(`Failed with status ${res.status}`);
      }
    } catch (e) {
      console.log('Error:', e.message);
    }
  }
}

testApi();
