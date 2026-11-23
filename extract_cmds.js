const fs = require('fs');
const content = fs.readFileSync('index.js', 'utf8');
const lines = content.split('\n');

const commands = new Map();

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  const regex = /['"`]\/([a-z0-9_]+)['"`]/g;
  let match;
  while ((match = regex.exec(line)) !== null) {
    if (!commands.has(match[1])) commands.set(match[1], i);
  }

  const onTextMatch = line.match(/bot\.onText\(\/\^\\?\/([a-z0-9_]+)/i);
  if (onTextMatch) {
    if (!commands.has(onTextMatch[1])) commands.set(onTextMatch[1], i);
  }
}

const sortedCmds = Array.from(commands.keys()).sort();
for (const cmd of sortedCmds) {
  if (cmd.length < 2 || cmd.length > 20 || ['png', 'jpg', 'jpeg', 'mp4', 'pdf', 'mp3', 'ogg'].includes(cmd)) continue;

  const lineNum = commands.get(cmd);
  const context = lines.slice(Math.max(0, lineNum - 5), lineNum + 15).join('\n');
  const isAdmin = context.includes('admin') || context.includes('ADMIN') || context.includes('isAdmin');
  console.log(`/${cmd} ${isAdmin ? '[ADMIN]' : ''}`);
}
