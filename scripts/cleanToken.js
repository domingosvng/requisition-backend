const fs = require('fs');
const path = require('path');
const p = path.join(__dirname,'last_test_token.txt');
let raw = fs.readFileSync(p);
// Try detect UTF-16 LE BOM
let str;
if (raw[0] === 0xFF && raw[1] === 0xFE) {
  str = raw.toString('utf16le');
} else {
  // try both utf16le and utf8 heuristics
  try { str = raw.toString('utf8'); if (str.includes('\u0000')) throw new Error('utf8 had nulls'); } catch(e) { str = raw.toString('utf16le'); }
}
str = str.replace(/\u0000/g,'').trim();
fs.writeFileSync(p, str, { encoding: 'utf8' });
console.log('Cleaned token written, len:', str.length);
