const axios = require('axios');
(async () => {
  try {
    const loginRes = await axios.post('http://localhost:3001/api/auth/login', { username: 'admin', password: 'admin' });
    console.log('LOGIN OK');
    const res = await axios.get('http://localhost:3001/api/inventario', { headers: { Authorization: `Bearer ${loginRes.data.token}` } });
    console.log('ITEMS', Array.isArray(res.data) ? res.data.length : typeof res.data);
    console.dir((res.data || []).slice(0,3), { depth: 2 });
  } catch (e) {
    console.error('ERR', e.response ? e.response.status : e.message, e.response ? e.response.data || '' : '');
    process.exit(1);
  }
})();