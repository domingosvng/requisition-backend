const axios = require('axios');
const fs = require('fs');
(async ()=>{
  // Read token file robustly: PowerShell '>' may produce a UTF-16LE encoded file
  const raw = fs.readFileSync(__dirname + '/last_test_token.txt');
  let token = '';
  if (raw && raw.length >= 2 && raw[0] === 0xFF && raw[1] === 0xFE) {
    token = raw.toString('utf16le').replace(/\u0000/g, '').trim();
  } else {
    token = raw.toString('utf8').replace(/\u0000/g, '').trim();
  }
  console.log('Using token length:', token.length);
  console.log('Token preview:', token.slice(0,80));
  try{
    const res = await axios.post('http://localhost:3001/api/inventario', {
      nome: 'Test Item',
      quantidade: 5,
      descricao: 'Test',
      categoria: 'Hardware',
      unidadeMedida: 'pcs',
      localizacao: 'Warehouse',
      status: 'ATIVO'
    }, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Created', res.data);
  }catch(err){
      if (err.response) {
        console.error('ERR STATUS:', err.response.status);
        console.error('ERR DATA:', err.response.data);
        console.error('ERR HEADERS:', err.response.headers);
      } else {
        console.error('ERR', err.stack || err.message);
      }
    process.exit(1);
  }
})();
