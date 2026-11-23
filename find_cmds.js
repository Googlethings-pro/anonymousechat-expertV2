const fs = require('fs');
const lines = fs.readFileSync('index.js', 'utf8').split('\n');
for(let i=0; i<lines.length; i++) {
  const l = lines[i];
  if (l.includes('=== \'/') || l.includes('== \'/') || l.includes('startsWith(\'/') || l.includes('bot.onText(') || l.includes('case \'/')) {
    console.log(i + ': ' + l.trim());
  }
}
