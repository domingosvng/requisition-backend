// Check dev routes
const axios = require('axios');

async function checkDevRoutes() {
    try {
        console.log('Checking dev inventory route...');
        const response = await axios.get('http://localhost:3001/api/inventario/public');
        console.log('Dev inventory items:', response.data.length);
        console.log('Sample item:', response.data[0] || 'No items');
        
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

checkDevRoutes();