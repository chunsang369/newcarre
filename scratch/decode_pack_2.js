const zlib = require('zlib');
const pack = decodeURIComponent('eJxdULtuwzAM%2FBfOGey%2BgmTta1IQoFkyshbrENULjIymDfzvFf0o0mjiHY9Hns6QUNDD%2BgxsTwY%2FSWANNSwUbtBTQasJmmjJabderkbmVdCq4rZeViOzE%2FYqub%2Bp76BfwJFQmoPafx1ISAuvNtvu3XGz3xTtvky2anTF5WJ1RV2ciM5NmufQcqCXjtxjHK4ZW8OaN%2F6hf2wSbmj3nWZWKOSZ3pJwtBrnYaaeKMUj50kcYqC5Y2LIQy7PQQNX%2BnQtngqsoC%2Fho1gSM85a%2BsDO6a7xS8zlVY49ZzWbiuKm8wlb%2BhvPyA76X7pCiH0%3D');
const buf = Buffer.from(pack, 'base64');
const inflated = zlib.inflateSync(buf).toString();
console.log(inflated);
