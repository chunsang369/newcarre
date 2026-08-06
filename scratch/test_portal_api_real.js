async function main() {
  const trimId = '8545';
  const url = `https://portal-api.chasalddae.com/rental/rental-calc-monthly?trimId=${trimId}&domain=chasalddae.com&adPayment=30&deposit=0&period=48&distance=2m&insuranceAge=26&oiColorSumPrice=0&trimOptSumPrice=0`;

  console.log('Fetching URL:', url);
  const res = await fetch(url);
  const json = await res.json();
  console.log('API Response:', JSON.stringify(json, null, 2));
}

main().catch(console.error);
