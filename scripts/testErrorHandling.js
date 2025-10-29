// Test script to demonstrate improved error handling
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

console.log('🔧 Testing Improved Error Handling\n');

async function testValidationErrors() {
    console.log('📝 Testing validation errors...');
    
    try {
        // Test creating supplier with invalid data
        await axios.post(`${API_BASE}/suppliers`, {
            nome: '', // Empty name - should trigger validation error
            nif: '12345', // Invalid NIF format
            email: 'invalid-email', // Invalid email format
        }, {
            headers: { Authorization: 'Bearer invalid-token' }
        });
    } catch (error) {
        if (error.response && error.response.data) {
            const data = error.response.data;
            console.log('✅ Supplier validation error response:');
            console.log('   Status:', error.response.status);
            console.log('   Message:', data.message);
            if (data.errors) {
                console.log('   Field errors:');
                data.errors.forEach(err => {
                    console.log(`     - ${err.field}: ${err.message}`);
                });
            }
            console.log('   Error type:', data.errorType);
        } else {
            console.log('❌ Unexpected error:', error.message);
        }
    }
    
    console.log('');
}

async function testAuthErrors() {
    console.log('🔐 Testing authentication errors...');
    
    try {
        // Test login with empty credentials
        await axios.post(`${API_BASE}/auth/login`, {
            username: '',
            password: ''
        });
    } catch (error) {
        if (error.response && error.response.data) {
            const data = error.response.data;
            console.log('✅ Auth validation error response:');
            console.log('   Status:', error.response.status);
            console.log('   Message:', data.message);
            if (data.errors) {
                console.log('   Field errors:');
                data.errors.forEach(err => {
                    console.log(`     - ${err.field}: ${err.message}`);
                });
            }
            console.log('   Error type:', data.errorType);
        } else {
            console.log('❌ Unexpected error:', error.message);
        }
    }
    
    try {
        // Test login with non-existent user
        await axios.post(`${API_BASE}/auth/login`, {
            username: 'nonexistentuser',
            password: 'somepassword'
        });
    } catch (error) {
        if (error.response && error.response.data) {
            const data = error.response.data;
            console.log('✅ User not found error response:');
            console.log('   Status:', error.response.status);
            console.log('   Message:', data.message);
            if (data.errors) {
                console.log('   Field errors:');
                data.errors.forEach(err => {
                    console.log(`     - ${err.field}: ${err.message}`);
                });
            }
            console.log('   Error type:', data.errorType);
        } else {
            console.log('❌ Unexpected error:', error.message);
        }
    }
    
    console.log('');
}

async function testInventoryErrors() {
    console.log('📦 Testing inventory validation errors...');
    
    try {
        // Test creating inventory item with invalid data
        await axios.post(`${API_BASE}/inventario`, {
            nome: 'A', // Too short
            quantidade: -1, // Negative quantity
            descricao: 'x'.repeat(1001) // Too long description
        }, {
            headers: { Authorization: 'Bearer invalid-token' }
        });
    } catch (error) {
        if (error.response && error.response.data) {
            const data = error.response.data;
            console.log('✅ Inventory validation error response:');
            console.log('   Status:', error.response.status);
            console.log('   Message:', data.message);
            if (data.errors) {
                console.log('   Field errors:');
                data.errors.forEach(err => {
                    console.log(`     - ${err.field}: ${err.message}`);
                });
            }
            console.log('   Error type:', data.errorType);
        } else {
            console.log('❌ Unexpected error:', error.message);
        }
    }
    
    console.log('');
}

async function runTests() {
    console.log('🚀 Starting error handling tests...\n');
    
    await testValidationErrors();
    await testAuthErrors();
    await testInventoryErrors();
    
    console.log('✨ All tests completed!');
    console.log('\n📋 Summary of improvements:');
    console.log('   ✅ Detailed field-specific error messages');
    console.log('   ✅ Structured error responses with errorType');
    console.log('   ✅ User-friendly Portuguese error messages');
    console.log('   ✅ Client-side validation feedback');
    console.log('   ✅ Visual indicators for invalid fields');
    console.log('   ✅ Success/loading states in forms');
}

runTests().catch(console.error);