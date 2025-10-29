// Simple token generator for manual testing
const crypto = require('crypto');

// Manually create a JWT token with the same structure as the backend
const header = {
    "alg": "HS256",
    "typ": "JWT"
};

const payload = {
    "id": 1,
    "username": "dev-autotoken", 
    "role": "ADMIN",
    "iat": Math.floor(Date.now() / 1000),
    "exp": Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
};

const secret = '1da17b7ff1b458755bf5e1a7fc91e5529b6c63eb5cd95f8c7993fed1e4d571f1c4c773bc25c6d8d9a892cd4a904b3b8a3514f0eb8dc762019902d06bb86f2a76';

// Base64 URL encode function
function base64UrlEncode(str) {
    return Buffer.from(str)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// Create JWT manually
const encodedHeader = base64UrlEncode(JSON.stringify(header));
const encodedPayload = base64UrlEncode(JSON.stringify(payload));
const data = encodedHeader + '.' + encodedPayload;

// Create signature
const signature = crypto.createHmac('sha256', secret).update(data).digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

const token = data + '.' + signature;

console.log('Generated JWT Token:');
console.log(token);
console.log('\nToken details:');
console.log('- User ID: 1');
console.log('- Username: dev-autotoken');
console.log('- Role: ADMIN');
console.log('- Expires in 1 hour');
console.log('\nCopy this token and paste it into the manual token input field in your frontend.');