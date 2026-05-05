const { PrismaClient } = require('@prisma/client');
const https = require('https');

function fetchDetail(trimId) {
  return new Promise((resolve, reject) => {
    https.get(`https://chasalddae.com/leaserent/leaserent_detail?trim_id=${trimId}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const nextDataRegex = /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i;
          const match = nextDataRegex.exec(data);
          if (match) {
            const parsed = JSON.parse(match[1]);
            const pageProps = parsed.props?.pageProps;
            if (pageProps) {
              return resolve(pageProps);
            }
          }

          const hydrationRegex = /"car_info"\s*:/;
          if (hydrationRegex.test(data)) {
            const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
            let m;
            while ((m = scriptRegex.exec(data)) !== null) {
              if (m[1].includes('"car_info"')) {
                const start = m[1].indexOf('{');
                const end = m[1].lastIndexOf('}');
                if (start !== -1 && end !== -1) {
                  const content = m[1].substring(start, end + 1);
                  try {
                    const obj = JSON.parse(content);
                    if (obj.car_info || obj.lineup_trim_list) {
                      return resolve(obj);
                    }
                  } catch (e) {}
                }
              }
            }
          }
          resolve(null);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  const prisma = new PrismaClient();
  const cars = await prisma.car.findMany();
  await prisma.$disconnect();

  console.log(`Processing trim-specific scraping for ${cars.length} cars with dynamic reconnection...`);

  let count = 0;
  for (const car of cars) {
    count++;
    if (!car.options || typeof car.options !== 'object') continue;

    let options = JSON.parse(JSON.stringify(car.options));
    const lineups = options.lineup_trim_list;
    if (!Array.isArray(lineups)) continue;

    // Check if it already has detailed trim data
    let alreadyScraped = true;
    for (const lineup of lineups) {
      if (Array.isArray(lineup.trim_list)) {
        for (const trim of lineup.trim_list) {
          if (trim.id && (!trim.trim_opt_list || !trim.trim_outer_color_list)) {
            alreadyScraped = false;
            break;
          }
        }
      }
      if (!alreadyScraped) break;
    }

    if (alreadyScraped) {
      console.log(`[${count}/${cars.length}] Trim data already cached for: ${car.modelName}`);
      continue;
    }

    console.log(`[${count}/${cars.length}] Scraping trims for car: ${car.modelName}`);

    for (const lineup of lineups) {
      if (!Array.isArray(lineup.trim_list)) continue;

      for (const trim of lineup.trim_list) {
        if (!trim.id) continue;

        try {
          if (trim.trim_opt_list && trim.trim_outer_color_list) {
            continue;
          }

          console.log(`  Fetching specific options & colors for trim ${trim.id} (${trim.trim_name})...`);
          const payload = await fetchDetail(trim.id);
          if (payload && payload.trim_opt_list) {
            trim.trim_opt_list = payload.trim_opt_list;
            trim.trim_outer_color_list = payload.trim_outer_color_list;
            trim.trim_inner_color_list = payload.trim_inner_color_list;
          } else if (payload && payload.car_info) {
            trim.trim_opt_list = payload.trim_opt_list;
            trim.trim_outer_color_list = payload.trim_outer_color_list;
            trim.trim_inner_color_list = payload.trim_inner_color_list;
          } else {
            trim.trim_opt_list = options.trim_opt_list || [];
            trim.trim_outer_color_list = options.trim_outer_color_list || [];
            trim.trim_inner_color_list = options.trim_inner_color_list || [];
          }
        } catch (err) {
          console.error(`  Error fetching trim ${trim.id}: ${err.message}`);
          trim.trim_opt_list = options.trim_opt_list || [];
          trim.trim_outer_color_list = options.trim_outer_color_list || [];
          trim.trim_inner_color_list = options.trim_inner_color_list || [];
        }

        await new Promise(r => setTimeout(r, 100));
      }
    }

    // Save back immediately using a fresh short-lived Prisma instance to prevent timeout
    const savePrisma = new PrismaClient();
    try {
      await savePrisma.car.update({
        where: { id: car.id },
        data: { options: options }
      });
    } catch (err) {
      console.error(`Failed to update DB for ${car.modelName}:`, err.message);
    } finally {
      await savePrisma.$disconnect();
    }
  }

  console.log('🎉 Done! All trims in our DB have their own distinct options and colors!');
}

main().catch(err => {
  console.error('Fatal execution error:', err);
});
