const fs = require('fs');
const code = fs.readFileSync('scratch/nTreeCar.js', 'utf8');

// find API endpoints like fetch('/app/...') or url: '/app/...'
const lines = code.split('\n');
const urls = [];
lines.forEach((line, i) => {
  if (line.includes('/app/')) {
    console.log(`Line ${i}: ${line.trim()}`);
  }
});
