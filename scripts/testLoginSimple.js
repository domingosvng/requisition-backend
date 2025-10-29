const http = require('http');

function testLogin(username, password) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            username: username,
            password: password
        });

        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    data: data
                });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(postData);
        req.end();
    });
}

async function runTests() {
    console.log('🔍 Testing login with native HTTP...\n');
    
    const testUsers = [
        { username: 'admin', password: 'admin' },
        { username: 'testuser', password: 'testuser' }
    ];

    for (const user of testUsers) {
        try {
            console.log(`Testing: ${user.username} / ${user.password}`);
            const result = await testLogin(user.username, user.password);
            console.log(`Status: ${result.statusCode}`);
            console.log(`Response: ${result.data.substring(0, 200)}...`);
            console.log('');
        } catch (error) {
            console.log(`❌ Connection error: ${error.message}`);
            console.log('');
        }
    }
}

runTests();