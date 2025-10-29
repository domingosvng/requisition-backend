const axios = require('axios');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

async function main(){
  try{
    // read .env for secret
    let secret = 'yourSuperSecretKey';
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)){
      const env = fs.readFileSync(envPath,'utf8');
      const m = env.match(/JWT_SECRET=(.*)/);
      if (m) secret = m[1].trim();
    }

    // create token with ADMIN role
    const token = jwt.sign({ id: 1, username: 'autotest', role: 'ADMIN' }, secret, { expiresIn: '1h' });

    const payload = {
      nome: 'PWC',
      nif: '5000000',
      contactoPrincipal: '923*******',
      email: 'domingosvng@gmail.com',
      telefone: '947775045',
      endereco: 'Travessa 8/ B Street',
      servicosFornecidos: ['Materiais','Serviços']
    };

    const res = await axios.post('http://localhost:3001/api/suppliers', payload, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Created supplier, status:', res.status);
    console.log(res.data);
  } catch (err) {
    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Response data:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
    process.exit(1);
  }
}

main();
