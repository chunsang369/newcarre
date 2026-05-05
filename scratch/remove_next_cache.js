const fs = require('fs');

if (fs.existsSync('.next')) {
  fs.rmSync('.next', { recursive: true, force: true });
  console.log('Removed .next cache successfully.');
} else {
  console.log('.next folder does not exist.');
}
