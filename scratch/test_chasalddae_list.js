const axios = require('axios');
const cheerio = require('cheerio');

async function main() {
  try {
    const res = await axios.get('https://chasalddae.com/leaserent/leaserent_search');
    const $ = cheerio.load(res.data);
    const links = $('a[href*="trim_id="]');
    console.log(`Found ${links.length} elements with trim_id in the HTML.`);
    
    // Let's also check if they load cars via API
    // Look for script tags containing car data
    let foundData = false;
    $('script').each((i, el) => {
      const html = $(el).html();
      if (html && html.includes('carList')) {
        console.log('Found script containing carList!');
        foundData = true;
      }
    });
  } catch (error) {
    console.error('Error fetching list:', error);
  }
}
main();
