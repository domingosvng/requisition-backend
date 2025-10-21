const axios = require('axios');
(async () => {
  try {
    const tok = await axios.get('http://localhost:3001/api/inventario/dev-token');
    console.log('DEV TOKEN OK');
    const res = await axios.get('http://localhost:3001/api/inventario', { headers: { Authorization: `Bearer ${tok.data.token}` } });
    console.log('ITEMS', Array.isArray(res.data) ? res.data.length : typeof res.data);
    console.dir((res.data || []).slice(0,3), { depth: 2 });
  } catch (e) {
    console.error('ERR', e.response ? e.response.status : e.message, e.response ? e.response.data || '' : '');
    process.exit(1);
  }
})();