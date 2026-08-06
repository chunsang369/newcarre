const fs = require('fs');

const log = fs.readFileSync('C:\\Users\\user\\.gemini\\antigravity\\brain\\be94b7ad-2e91-40ae-9942-619adea1027f\\.system_generated\\tasks\\task-199.log', 'utf8');

const regex = /https:\/\/portal-api\.chasalddae\.com\/[^\s]*/g;
const matches = log.match(regex) || [];

console.log('--- FOUND API URLS ---');
const uniqueUrls = [...new Set(matches)];
uniqueUrls.forEach(url => {
  console.log(url);
});
