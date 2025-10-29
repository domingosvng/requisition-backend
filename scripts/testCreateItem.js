// Simple test to add inventory item
const axios = require('axios');

async function testCreateItem() {
    try {
        // Login to get proper authentication token
        let token;
        try {
            const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
                username: 'admin',
                password: 'admin'
            });
            token = loginResponse.data.token;
            console.log('Logged in successfully');
        } catch (err) {
            console.log('Login failed:', err.message);
        }
        
        const headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        
        const testItem = {
            nome: 'Caneta Azul',
            descricao: 'Caneta esferográfica azul para escritório',
            categoria: ['Materiais de Escritório'],
            quantidade: 50,
            unidadeMedida: 'un (unidade)',
            localizacao: 'Armazém A, Prateleira 1',
            status: 'ACTIVO',
            valorUnitario: 2.50,
            dataEntrada: '2025-10-25'
        };
        
        const response = await axios.post('http://localhost:3001/inventario', testItem, { headers });
        console.log('Test item created successfully:', response.data);
        
        // Now try to fetch all items
        const itemsResponse = await axios.get('http://localhost:3001/inventario', { headers });
        console.log(`Total items in inventory: ${itemsResponse.data.length}`);
        
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testCreateItem();