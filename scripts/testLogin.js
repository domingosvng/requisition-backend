const axios = require('axios');

async function testLogin() {
    const testUsers = [
        { username: 'admin', password: 'admin' },
        { username: 'testuser', password: 'testuser' },
        { username: 'AdminTech', password: 'AdminTech' },
        { username: 'Domingos', password: 'Domingos' }
    ];

    console.log('🔍 Testing login endpoint...\n');

    for (const user of testUsers) {
        try {
            console.log(`Testing: ${user.username} / ${user.password}`);
            
            const response = await axios.post('http://localhost:3001/api/auth/login', {
                username: user.username,
                password: user.password
            });

            if (response.data && response.data.token) {
                console.log(`✅ SUCCESS: ${user.username} logged in successfully`);
                console.log(`   Role: ${response.data.user.role}`);
                console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
            } else {
                console.log(`❌ FAILED: ${user.username} - No token received`);
            }
        } catch (error) {
            console.log(`❌ FAILED: ${user.username} - ${error.response?.data?.message || error.message}`);
        }
        console.log('');
    }

    // Test with wrong credentials
    try {
        console.log('Testing with wrong credentials: admin / wrong');
        await axios.post('http://localhost:3001/api/auth/login', {
            username: 'admin',
            password: 'wrong'
        });
    } catch (error) {
        console.log(`✅ Expected failure with wrong password: ${error.response?.data?.message || error.message}`);
    }
}

testLogin().catch(console.error);