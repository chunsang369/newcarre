const fs = require('fs');
const path = 'prisma/car-data.ts';
let content = fs.readFileSync(path, 'utf-8');

const updates = {
    "36_PREPAY_30_10000": { rent: 218666, lease: 92798 },
    "36_PREPAY_30_20000": { rent: 234097, lease: 102985 },
    "48_PREPAY_30_10000": { rent: 215847, lease: 106270 },
    "48_PREPAY_30_20000": { rent: 229581, lease: 115438 },
    "60_PREPAY_30_10000": { rent: 240452, lease: 124134 },
    "60_PREPAY_30_20000": { rent: 254263, lease: 133098 }
};

const slug = "hyundai-casper-electric";
const carIndex = content.indexOf(`"slug": "${slug}"`);
const nextCarIndex = content.indexOf(`"slug":`, carIndex + 50);

let section = content.substring(carIndex, nextCarIndex);

Object.keys(updates).forEach(key => {
    // Escape dots and dashes if any (none here)
    const regex = new RegExp(`"${key}":\\s*{\\s*"rent":\\s*\\d+,\\s*"lease":\\s*\\d+\\s*}`, 'm');
    const match = section.match(regex);
    if (match) {
        const replacement = `"${key}": {
        "rent": ${updates[key].rent},
        "lease": ${updates[key].lease}
      }`;
        section = section.replace(match[0], replacement);
        console.log(`Updated ${key}`);
    } else {
        console.log(`Key ${key} not found`);
    }
});

const newContent = content.substring(0, carIndex) + section + content.substring(nextCarIndex);
fs.writeFileSync(path, newContent);
console.log("Done.");
