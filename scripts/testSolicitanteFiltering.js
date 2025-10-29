// Test SOLICITANTE requisition filtering
const axios = require('axios');

(async () => {
    try {
        console.log('Testing SOLICITANTE filtering...');
        
        // Login as testuser (SOLICITANTE)
        const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
            username: 'testuser',
            password: 'testuser'
        });
        
        const token = loginRes.data.token;
        const user = loginRes.data.user;
        
        console.log(`Logged in as: ${user.username}, Role: ${user.role}, ID: ${user.id}`);
        
        // Get requisitions
        const reqRes = await axios.get('http://localhost:3001/api/requisicoes', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`Found ${reqRes.data.length} requisitions for user`);
        
        if (reqRes.data.length > 0) {
            reqRes.data.forEach(req => {
                console.log(`- Req ${req.id}: Status=${req.status}, Solicitante=${req.solicitante?.username || 'N/A'}`);
            });
        }
        
    } catch (error) {
        console.log('Error:', error.response?.data?.message || error.message);
    }
})();