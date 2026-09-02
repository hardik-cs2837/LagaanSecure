const fs = require('fs');
const path = require('path');

const emojiMap = {
  '🚜': 'Tractor',
  '🛒': 'ShoppingCart',
  '🧅': 'Circle', // approximation
  '🌾': 'Wheat',
  '👨‍🌾': 'User',
  '📈': 'LineChart',
  '💬': 'MessageSquare',
  '🤖': 'Bot',
  '🚚': 'Truck',
  '🌱': 'Sprout',
  '🤝': 'Handshake',
  '✅': 'CheckCircle',
  '⭐': 'Star',
  '💰': 'IndianRupee',
  '🎉': 'PartyPopper',
  '🌟': 'Star',
  '🔒': 'Lock',
  '💸': 'Banknote',
  '✨': 'Sparkles',
  '❌': 'XCircle',
  '🏢': 'Building',
  '🏬': 'Store',
  '🍅': 'Apple', // close enough
  '🥔': 'Circle',
  '🧶': 'Scroll',
  '🌽': 'Vegan',
  '🎋': 'Trees',
  '🍚': 'Bowl',
  '👥': 'Users',
  '🫘': 'Bean'
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let iconsToImport = new Set();
  
  // Replace JSX emojis
  for (const [emoji, icon] of Object.entries(emojiMap)) {
    const iconTag = `<${icon} className="inline w-5 h-5 mr-1" />`;
    const iconTagNoStyle = `<${icon} className="inline w-5 h-5" />`;
    
    // Attempt to replace simple text emojis wrapped in spans or tags or just raw in JSX
    // This is hard to do perfectly with regex without a full AST parser for JSX.
    // Instead, we can just replace the literal emojis if they are outside strings.
    // But since some are inside strings like `icon: '📈'`, it's tricky.
    // We can just use string replace.
  }

  // Instead of doing regex on all, I'll print out files that have these emojis
  // so we can see which ones to edit manually or with a more robust regex.
  const foundEmojis = [];
  for (const emoji of Object.keys(emojiMap)) {
    if (content.includes(emoji)) {
      foundEmojis.push(emoji);
    }
  }
  
  if (foundEmojis.length > 0) {
    console.log(`File: ${filePath} contains: ${foundEmojis.join(', ')}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      processFile(fullPath);
    }
  }
}

walk(path.join(__dirname, 'src'));
