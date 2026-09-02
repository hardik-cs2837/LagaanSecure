const fs = require('fs');
const path = require('path');

const file1 = path.join(__dirname, 'data', 'mockPrices.json');
const file2 = path.join(__dirname, 'services', 'priceService.js');

try {
  if (fs.existsSync(file1)) fs.unlinkSync(file1);
  if (fs.existsSync(file2)) fs.unlinkSync(file2);
  console.log('Files deleted successfully.');
} catch (e) {
  console.error(e);
}
