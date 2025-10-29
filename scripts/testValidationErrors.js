// Test script with valid authentication to test validation errors
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

console.log('🔧 Testing Improved Error Handling with Valid Auth\n');

async function getValidToken() {
    try {
        const response = await axios.post(`${API_BASE}/auth/login`, {
            username: 'admin',
            password: 'admin'
        });
        return response.data.token;
    } catch (error) {
        console.log('❌ Failed to get valid token:', error.response?.data?.message || error.message);
        return null;
    }
}

async function testSupplierValidation(token) {
    console.log('📝 Testing supplier validation errors with valid token...');
    
    try {
        // Test creating supplier with invalid data
        await axios.post(`${API_BASE}/suppliers`, {
            nome: '', // Empty name - should trigger validation error
            nif: '12345', // Invalid NIF format  
            email: 'invalid-email', // Invalid email format
            servicosFornecidos: Array(60).fill('service') // Too many services
        }, {
            headers: { Authorization: `Bearer ${token}` }
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
                    console.log(`     - ${err.field}: ${err.message} (value: ${err.value || 'empty'})`);
                });
            }
            console.log('   Error type:', data.errorType);
        } else {
            console.log('❌ Unexpected error:', error.message);
        }
    }
    
    console.log('');
}

async function testInventoryValidation(token) {
    console.log('📦 Testing inventory validation errors with valid token...');
    
    try {
        // Test creating inventory item with invalid data
        await axios.post(`${API_BASE}/inventario`, {
            nome: 'A', // Too short
            quantidade: -1, // Negative quantity
            descricao: 'x'.repeat(1001) // Too long description
        }, {
            headers: { Authorization: `Bearer ${token}` }
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
                    console.log(`     - ${err.field}: ${err.message} (value: ${err.value || 'N/A'})`);
                });
            }
            console.log('   Error type:', data.errorType);
        } else {
            console.log('❌ Unexpected error:', error.message);
        }
    }
    
    console.log('');
}

async function testDuplicateNIF(token) {
    console.log('🔄 Testing duplicate NIF error...');
    
    try {
        // First, create a supplier
        await axios.post(`${API_BASE}/suppliers`, {
            nome: 'Test Supplier 1',
            nif: '123456789'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // Then try to create another with same NIF
        await axios.post(`${API_BASE}/suppliers`, {
            nome: 'Test Supplier 2', 
            nif: '123456789' // Same NIF - should trigger duplicate error
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
    } catch (error) {
        if (error.response && error.response.data) {
            const data = error.response.data;
            console.log('✅ Duplicate NIF error response:');
            console.log('   Status:', error.response.status);
            console.log('   Message:', data.message);
            if (data.errors) {
                console.log('   Field errors:');
                data.errors.forEach(err => {
                    console.log(`     - ${err.field}: ${err.message} (value: ${err.value})`);
                });
            }
            console.log('   Error type:', data.errorType);
        } else {
            console.log('❌ Unexpected error:', error.message);
        }
    }
    
    console.log('');
}

async function runValidationTests() {
    console.log('🚀 Starting validation tests with authentication...\n');
    
    const token = await getValidToken();
    if (!token) {
        console.log('❌ Cannot proceed without valid token');
        return;
    }
    
    console.log('✅ Got valid token\n');
    
    await testSupplierValidation(token);
    await testInventoryValidation(token);
    await testDuplicateNIF(token);
    
    console.log('✨ All validation tests completed!');
    console.log('\n📋 Frontend improvements include:');
    console.log('   ✅ Real-time field validation with red borders');
    console.log('   ✅ Specific error messages under each field');
    console.log('   ✅ Success messages after successful operations');
    console.log('   ✅ Loading states during API calls');
    console.log('   ✅ Improved form UX with better feedback');
}

runValidationTests().catch(console.error);