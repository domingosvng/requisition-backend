const axios = require('axios');
(async ()=>{
  try{
    const res = await axios.get('http://localhost:3001/api/inventario');
    console.log('STATUS', res.status);
    console.log(res.data && res.data.length ? 'Items:' + res.data.length : 'No data');
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
