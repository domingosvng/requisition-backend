const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
// read .env file to get JWT_SECRET if present
let secret = 'yourSuperSecretKey';
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)){
  const env = fs.readFileSync(envPath,'utf8');
  const m = env.match(/JWT_SECRET=(.*)/);
  if (m) secret = m[1].trim();
}
const payload = { id: 1, username: 'autotest', role: 'ADMIN' };
const token = jwt.sign(payload, secret, { expiresIn: '1h' });
console.log(token);
