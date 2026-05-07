const http = require('http');

const bodyObj = {
  name: "구조화테스트",
  phone: "01099998888",
  consent: true,
  carOfInterest: "[현대 더 뉴 캐스퍼] \n트림: 스마트 (자동)\n외장: A2B - 어비스 블랙 펄\n내장: 블랙\n옵션: 없음\n조건: 렌트 (36개월 / 연 20,000km / 선수금 30%)",
  carConfig: {
    carName: "더 뉴 캐스퍼",
    brandName: "현대",
    thumbnailUrl: "/images/cars/hyundai-casper.png",
    trim: "스마트 (자동)",
    exteriorColor: {
      name: "어비스 블랙 펄",
      detail: ["#000000"]
    },
    interiorColor: {
      name: "블랙",
      detail: ["#222222"]
    },
    options: ["빌트인 캠 2"],
    contract: {
      type: "RENT",
      months: 36,
      mileage: 20000,
      deposit: 30,
      raw: "렌트 (36개월 / 연 20,000km / 선수금 30%)"
    }
  },
  source: "DETAIL_PAGE_CONFIGURATOR"
};

const data = JSON.stringify(bodyObj);
const byteLength = Buffer.byteLength(data, 'utf8');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/quotes',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': byteLength
  }
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
