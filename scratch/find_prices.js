const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scratch/estimate_full.json', 'utf8'));

function findKey(obj, targetKey, path = '') {
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => findKey(item, targetKey, `${path}[${i}]`));
  } else if (obj !== null && typeof obj === 'object') {
    Object.keys(obj).forEach(k => {
      if (k === targetKey) {
        console.log(`Found ${targetKey} at ${path}.${k} :`, obj[k]);
      }
      findKey(obj[k], targetKey, `${path}.${k}`);
    });
  }
}

findKey(data, 'price');
findKey(data, 'trimPrice');
findKey(data, 'optionPrice');
findKey(data, 'idxPrice');
