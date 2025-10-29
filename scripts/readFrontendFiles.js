// Script to read frontend files and display their content for error handling improvements
const fs = require('fs');
const path = require('path');

const frontendPath = 'C:\\Users\\domin\\Documents\\requisition-frontend\\src\\components';
const components = ['Fornecedores.vue', 'Inventario.vue', 'LoginPage.vue'];

components.forEach(component => {
    const filePath = path.join(frontendPath, component);
    console.log(`\n=== ${component} ===`);
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        console.log(content);
    } catch (error) {
        console.error(`Error reading ${component}:`, error.message);
    }
    console.log('\n' + '='.repeat(50));
});