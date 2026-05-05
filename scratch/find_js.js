// Find all script sources and inline scripts with price-related data
const url = 'https://m.hicarzautoplan.com/cars/index/view/?pack=eJw1jjEOgzAMRe%2FimSFAw8DaSlUHKgYuYBGrikrAMqkEQty9CYHR7%2F3%2F5Q0YP9RMhqCG2ToeCDKwI%2F881Nsh70n2KK%2FR0AJ7FrCgi96apcEvSfB57JnljS6mdVWmO04PUatCJfIUPAaLSutEOrEuRnKlzpVWbE8HKnN9C4wj6Fa%2BvhEa%2FYUfxNNs%2FWlYiHG9XEtiJxNwWcG%2B%2FwGQcUnd';

fetch(url).then(r => r.text()).then(html => {
  // Find all script srcs
  const srcRe = /<script[^>]*src="([^"]*)"/gi;
  let m;
  console.log('=== EXTERNAL SCRIPTS ===');
  while ((m = srcRe.exec(html)) !== null) {
    console.log(m[1]);
  }
  
  // Find inline scripts containing price/pack/calc related keywords
  const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g) || [];
  console.log('\n=== INLINE SCRIPTS WITH PRICE DATA ===');
  console.log('Total scripts:', scripts.length);
  
  for (let i = 0; i < scripts.length; i++) {
    const s = scripts[i];
    if (s.includes('pack') && s.length > 500) {
      console.log(`\n--- Script #${i} (${s.length} chars, contains 'pack') ---`);
      console.log(s.substring(0, 5000));
    }
    if (s.includes('calcPrice') || s.includes('calc_price') || s.includes('priceCalc')) {
      console.log(`\n--- Script #${i} (${s.length} chars, contains calc) ---`);
      console.log(s.substring(0, 5000));
    }
  }
  
  // Check the full HTML near 'conLeft-deposit' form
  const depositIdx = html.indexOf('conLeft-deposit');
  if (depositIdx > -1) {
    console.log('\n=== AROUND DEPOSIT FORM ===');
    console.log(html.substring(depositIdx - 500, depositIdx + 1500));
  }
  
  // Find the pack JS variable
  const packIdx = html.indexOf("var pack");
  if (packIdx > -1) {
    console.log('\n=== VAR PACK ===');
    console.log(html.substring(packIdx, packIdx + 2000));
  }
  
  // Find the pack decoding
  const lzIdx = html.indexOf("LZString");
  if (lzIdx > -1) {
    console.log('\n=== LZString found at', lzIdx, '===');
    console.log(html.substring(Math.max(0, lzIdx-200), lzIdx+500));
  }
  
  // Check for Base64 decode related
  const b64idx = html.indexOf('atob');
  if (b64idx > -1) {
    console.log('\n=== atob found ===');
    console.log(html.substring(Math.max(0, b64idx-500), b64idx+500));
  }
});
