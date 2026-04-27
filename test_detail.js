const fs = require('fs');

async function test() {
  const response = await fetch('https://m.hicarzautoplan.com/cars/index/view/idx/4836');
  const html = await response.text();
  
  // Find car name
  const nameMatch = html.match(/<h2 class="font-jamsil">(.*?)<\/h2>/);
  console.log('Name:', nameMatch ? nameMatch[1] : 'Not found');
  
  // Find price
  const priceMatch = html.match(/<strong class="price">(.*?)<\/strong>/);
  console.log('Price:', priceMatch ? priceMatch[1] : 'Not found');

  // Find info list
  const infoMatch = html.match(/<ul class="info">([\s\S]*?)<\/ul>/);
  if (infoMatch) {
    const items = infoMatch[1].match(/<li>(.*?)<\/li>/g);
    console.log('Info Items:', items);
  }
}

test();
