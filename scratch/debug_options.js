// Debug: check why options aren't being parsed
const axios = require('axios');
const cheerio = require('cheerio');

async function debug() {
  const res = await axios.get('https://chasalddae.com/leaserent/leaserent_detail?trim_id=4566', {
    timeout: 15000,
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  
  const html = res.data;
  const $ = cheerio.load(html);
  
  // Check if "02 옵션" exists in HTML
  const optIdx = html.indexOf('02 옵션');
  const contractIdx = html.indexOf('03 계약조건');
  console.log('02 옵션 found at index:', optIdx);
  console.log('03 계약조건 found at index:', contractIdx);
  
  if (optIdx !== -1 && contractIdx !== -1) {
    const optSection = html.substring(optIdx, contractIdx);
    console.log('\n=== RAW OPTIONS SECTION (first 2000 chars) ===');
    console.log(optSection.substring(0, 2000));
    
    // Count labels in this section
    const $opt = cheerio.load(optSection);
    console.log('\nLabels found:', $opt('label').length);
    console.log('Divs found:', $opt('div').length);
    console.log('Spans found:', $opt('span').length);
    
    // Check for price patterns
    const priceMatches = optSection.match(/[0-9,]+원/g);
    console.log('\nPrice patterns found:', priceMatches ? priceMatches.length : 0);
    if (priceMatches) console.log('Prices:', priceMatches);
    
    // Try to find option names near prices
    const namePattern = optSection.match(/>[^<]{2,50}<\/[^>]+>\s*<[^>]+>[0-9,]+원/g);
    console.log('\nName+Price patterns:', namePattern ? namePattern.length : 0);
    if (namePattern) namePattern.forEach(p => console.log('  ', p));
  }
  
  // Also check all labels on the entire page
  console.log('\n=== ALL LABELS ON PAGE ===');
  $('label').each((i, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (text.length > 3 && text.length < 200) {
      console.log(`  label[${i}]: "${text}"`);
    }
  });
}

debug().catch(console.error);
