// Quick check for database data
const axios = require('axios');

async function checkData() {
    try {
        // Check inventory
        console.log('Checking inventory...');
        const invResponse = await axios.get('http://localhost:3001/api/inventario');
        console.log('Inventory items:', invResponse.data.length);
        
        // Check suppliers
        console.log('Checking suppliers...');
        const suppResponse = await axios.get('http://localhost:3001/api/fornecedores');
        console.log('Supplier items:', suppResponse.data.length);
        
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

checkData();