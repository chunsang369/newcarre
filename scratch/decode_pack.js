const zlib = require('zlib');

// Palisade pack from the list page (bigger, with more data)
const packs = [
  'eJw1jjEOgzAMRe/imSFAw8DaSlUHKgYuYBGrikrAMqkEQty9CYHR7/3/5Q0YP9RMhqCG2ToeCDKwI/881Nsh70n2KK/R0AJ7FrCgi96apcEvSfB57JnljS6mdVWmO04PUatCJfIUPAaLSutEOrEuRnKlzpVWbE8HKnN9C4wj6Fa+vhEa/YUfxNNs/WlYiHG9XEtiJxNwWcG+/wGQcUnd',
];

for (const pack of packs) {
  const buf = Buffer.from(pack, 'base64');
  
  // Try inflate
  try {
    const result = zlib.inflateSync(buf);
    console.log('inflate:', result.toString());
    continue;
  } catch(e) {}
  
  // Try inflateRaw
  try {
    const result = zlib.inflateRawSync(buf);
    console.log('inflateRaw:', result.toString());
    continue;
  } catch(e) {}
  
  // Try gunzip
  try {
    const result = zlib.gunzipSync(buf);
    console.log('gunzip:', result.toString());
    continue;
  } catch(e) {}
  
  // Try unzip
  try {
    const result = zlib.unzipSync(buf);
    console.log('unzip:', result.toString());
    continue;
  } catch(e) {}
  
  // Maybe it's just base64
  console.log('raw base64:', buf.toString('utf8'));
}
