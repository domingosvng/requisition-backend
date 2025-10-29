const axios = require('axios');
const fs = require('fs');
(async ()=>{
  try{
    let raw = fs.readFileSync(__dirname + '/last_test_token.txt');
    let token = '';
    if (raw && raw.length >= 2 && raw[0] === 0xFF && raw[1] === 0xFE) {
      token = raw.toString('utf16le').replace(/\u0000/g,'').trim();
    } else {
      token = raw.toString('utf8').replace(/\u0000/g,'').trim();
    }
    const res = await axios.get('http://localhost:3001/api/inventario', { headers: { Authorization: `Bearer ${token}` } });
    console.log('STATUS', res.status);
    console.log('DATA', JSON.stringify(res.data, null, 2));
  }catch(err){
    if (err.response) {
      console.error('ERR STATUS', err.response.status);
      console.error('ERR DATA', err.response.data);
    } else {
      console.error('ERR', err.message);
    }
    process.exit(1);
  }
})();
