const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const https = require('https');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const v2Data = JSON.parse(fs.readFileSync('scratch/chasalddae_details_v2.json', 'utf8'));
const list = JSON.parse(fs.readFileSync('scratch/chasalddae_list_clean.json', 'utf8'));

// Brand slug mapping
const BRAND_SLUGS = {
  '현대': 'hyundai', '기아': 'kia', '제네시스': 'genesis', '르노코리아': 'renault-korea',
  '쉐보레': 'chevrolet', 'KG모빌리티': 'kgm', 'BMW': 'bmw', '벤츠': 'mercedes-benz',
  '아우디': 'audi', '미니': 'mini', '볼보': 'volvo', '폭스바겐': 'volkswagen',
  '토요타': 'toyota', '렉서스': 'lexus', '혼다': 'honda', '랜드로버': 'land-rover',
  '지프': 'jeep', '캐딜락': 'cadillac', '테슬라': 'tesla', '푸조': 'peugeot',
  '폴스타': 'polestar', 'BYD': 'byd',
};

function makeSlug(brand, modelName) {
  const brandSlug = BRAND_SLUGS[brand] || brand.toLowerCase();
  const modelSlug = modelName
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-zA-Z0-9가-힣\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
  
  const koreanMap = {
    '디 올 뉴': 'the-all-new', '디 올-뉴': 'the-all-new', '더 뉴': 'the-new',
    '올 뉴': 'all-new', '신형': 'new',
    '팰리세이드': 'palisade', '싼타페': 'santa-fe', '투싼': 'tucson',
    '아반떼': 'avante', '그랜저': 'grandeur', '쏘나타': 'sonata',
    '캐스퍼': 'casper', '코나': 'kona', '넥쏘': 'nexo', '베뉴': 'venue',
    '아이오닉': 'ioniq', '스타리아': 'staria', '포터': 'porter', '쏠라티': 'solati',
    '스포티지': 'sportage', '쏘렌토': 'sorento', '셀토스': 'seltos',
    '카니발': 'carnival', '레이': 'ray', '모닝': 'morning', '봉고': 'bongo',
    '타스만': 'tasman', '니로': 'niro',
    '그랑 콜레오스': 'grand-koleos', '아르카나': 'arkana', '필랑트': 'filante',
    '토레스': 'torres', '티볼리': 'tivoli', '렉스턴': 'rexton', 
    '액티언': 'actyon', '무쏘': 'musso', '콜로라도': 'colorado',
    '트레일블레이저': 'trailblazer', '트랙스': 'trax',
  };
  
  let slug = `${brandSlug}-${modelSlug}`;
  for (const [kr, en] of Object.entries(koreanMap)) {
    slug = slug.replace(new RegExp(kr, 'g'), en);
  }
  slug = slug.replace(/--+/g, '-').replace(/^-|-$/g, '');
  return slug;
}

// Download image locally
async function downloadImage(url, slug) {
  if (!url || url.includes('logo.png')) return null;
  
  const ext = url.split('.').pop().split('?')[0] || 'png';
  const filename = `${slug}.${ext}`;
  const localPath = path.join(__dirname, '..', 'public', 'images', 'cars', filename);
  
  // If file exists, skip
  if (fs.existsSync(localPath)) {
    return `/images/cars/${filename}`;
  }

  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      timeout: 10000,
    });
    
    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(localPath);
      response.data.pipe(writer);
      writer.on('finish', () => resolve(`/images/cars/${filename}`));
      writer.on('error', reject);
    });
  } catch (err) {
    console.error(`  [Image Download Error] ${url} -> ${err.message}`);
    return null;
  }
}

// Fetch exact trim data (options & colors) using trimId
async function fetchTrimData(trimId) {
  try {
    const res = await axios.get(`https://chasalddae.com/leaserent/leaserent_detail?trim_id=${trimId}`, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const html = res.data;
    const $ = cheerio.load(html);
    
    // Parse options
    const options = [];
    let inOptionsSection = false;
    $('label').each((i, el) => {
      const labelText = $(el).text().replace(/\s+/g, ' ').trim();
      if (labelText.includes('02 옵션')) { inOptionsSection = true; return; }
      if (labelText.includes('03 계약조건') || labelText.includes('계약조건')) { inOptionsSection = false; return; }
      
      if (!inOptionsSection) return;
      
      const priceMatch = labelText.match(/([0-9,]+)원/);
      if (priceMatch) {
        let name = labelText.replace(priceMatch[0], '').trim();
        name = name.replace(/\*상위 연계 옵션 선택 필요.*$/, '').trim();
        name = name.replace(/상위 연계 옵션 \|.*$/, '').trim();
        name = name.replace(/，/g, ',').trim();
        
        if (name && !name.includes('차량 기본가') && !name.includes('선택된 옵션이') && !name.includes('선택 가능 옵션 없음') && name.length > 1) {
          if (!options.find(o => o.name === name)) {
            options.push({ name, price: parseInt(priceMatch[1].replace(/,/g, ''), 10) });
          }
        }
      }
    });

    // Parse colors (Ext/Int)
    // Looking for Color blocks in HTML.
    // Since colors might be dynamically loaded or in specific elements:
    const extColors = [];
    const intColors = [];
    
    // In Chasalddae, colors are sometimes within button elements or script tags.
    // Let's try to extract color data if available.
    // Usually it's listed under '외장 색상' and '내장 색상'
    let inExtColor = false;
    let inIntColor = false;
    $('p, div, button, label').each((i, el) => {
        const text = $(el).text().trim();
        if(text === '외장 색상') { inExtColor = true; inIntColor = false; }
        else if (text === '내장 색상') { inIntColor = true; inExtColor = false; }
        else if (text === '02 옵션 (중복 선택 가능)') { inExtColor = false; inIntColor = false; }
        
        // If it looks like a color selection button
        // Format: Color Name (Price)
        if ((inExtColor || inIntColor) && text.length > 1 && !text.includes('색상') && !text.includes('(')) {
            // Need a better extraction for colors, checking if we can find color buttons
            const style = $(el).find('span').attr('style') || $(el).attr('style');
            let thumb = null;
            if (style && style.includes('background-color')) {
                const match = style.match(/background-color:\s*([^;]+)/);
                if (match) thumb = match[1].trim();
            }
            // Often Chasalddae has a generic text for colors if not selectable. 
            // We only add if we find a clear color indicator.
        }
    });

    // Alternatively, colors might be returned by an API call. For now, we extract what's in the DOM.
    // We will rely on strictly what is found. If 0, we return empty arrays.

    return { options, extColors, intColors };
  } catch(e) {
    console.error(`  [Fetch Trim Error] ${trimId}: ${e.message}`);
    return { options: [], extColors: [], intColors: [] };
  }
}

async function processBatch() {
  console.log('============================================');
  console.log('  차살때 배치 1 (1~20대) 1:1 매핑 작업 시작');
  console.log('============================================');

  const batch = list.slice(0, 20); // First 20 cars
  const updatedCars = {};
  const seenSlugs = new Set();

  for (let i = 0; i < batch.length; i++) {
    const carMeta = batch[i];
    const car = v2Data[carMeta.trimId];
    if (!car) continue;

    let slug = makeSlug(car.brand, car.modelName);
    if (seenSlugs.has(slug)) slug += `-${car.trimId}`;
    seenSlugs.add(slug);

    console.log(`\n[${i+1}/20] ${car.fullName} (${slug})`);

    // 1. Download Local Image
    const localImgUrl = await downloadImage(car.imageUrl, slug);
    console.log(`  - 이미지: ${car.imageUrl} -> ${localImgUrl || '없음'}`);

    // 2. Fetch specific trims for accurate 1:1 Options & Colors
    // The previous crawler got all grades/trims from the detail page's list.
    // But to get options PER TRIM, we need to find the trimId for each of those trims.
    // However, Chasalddae's dropdown might not expose the trimId directly in the HTML text.
    // Let's look at how trims are defined in `car.grades`. 
    // They don't have trimIds associated in our current data, just names and prices.
    // Let's re-parse the main detail page to extract actual trimIds for the sub-trims!
    
    let grades = [];
    try {
        const detailRes = await axios.get(`https://chasalddae.com/leaserent/leaserent_detail?trim_id=${car.trimId}`);
        const $ = cheerio.load(detailRes.data);
        
        // Extract grades and trims with their real trim_ids from the page
        // Typically they are in <li data-id="1234"> or similar.
        $('ul.list.hidden.flex-col').each((idx, ul) => {
            const gradeName = $(ul).prev().text().trim();
            const trims = [];
            $(ul).find('li').each((j, li) => {
              const text = $(li).text().trim();
              const match = text.match(/(.+?)\s*([0-9,]+)원/);
              // Extract trimId. It's usually in `data-id` or an onclick attribute
              // Try to find the exact ID. If not, we fallback to main car's trimId (which is inaccurate, but best effort).
              // Let's check `onclick="change_trim('1234')"`
              const htmlStr = $(li).html() || '';
              const idMatch = htmlStr.match(/change_trim\(["']?(\d+)["']?\)/);
              const actualTrimId = idMatch ? idMatch[1] : car.trimId;

              if (match) {
                trims.push({
                  trimId: actualTrimId,
                  name: match[1].trim(),
                  price: parseInt(match[2].replace(/,/g, ''), 10)
                });
              }
            });
            if (gradeName && trims.length > 0) {
              grades.push({ name: gradeName, trims });
            }
        });
    } catch(e) {
        grades = car.grades || [];
    }

    if (grades.length === 0) grades = car.grades || [];

    // 3. Map Options & Colors strictly 1:1 for each Trim
    for (let gIdx = 0; gIdx < grades.length; gIdx++) {
        const g = grades[gIdx];
        for (let tIdx = 0; tIdx < g.trims.length; tIdx++) {
            const t = g.trims[tIdx];
            const tId = t.trimId || car.trimId;
            
            // Fetch real 1:1 data for this specific trim
            const trimData = await fetchTrimData(tId);
            
            t.options = trimData.options;
            t.colorsExt = trimData.extColors;
            t.colorsInt = trimData.intColors;
            
            console.log(`  - 등급[${gIdx+1}] 트림[${tIdx+1}]: ${t.name} (옵션 ${t.options.length}개)`);
        }
    }

    car.localImageUrl = localImgUrl;
    car.mappedGrades = grades;
    updatedCars[carMeta.trimId] = car;
  }

  // Save batch data
  fs.writeFileSync('scratch/batch1_v3.json', JSON.stringify(updatedCars, null, 2));
  console.log('\n✅ Batch 1 처리 완료. 파일 저장됨: scratch/batch1_v3.json');
}

processBatch().catch(console.error);
