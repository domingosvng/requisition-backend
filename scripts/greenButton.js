// Simple script to change the submit button color to green
const fs = require('fs');

const loginPagePath = 'C:\\Users\\domin\\Documents\\requisition-frontend\\src\\components\\LoginPage.vue';

function changeButtonToGreen() {
    try {
        let content = fs.readFileSync(loginPagePath, 'utf8');
        
        // Find the .submit-button CSS and change its background color to green
        // Look for the existing submit-button class and replace its background color
        content = content.replace(
            /\.submit-button\s*\{[^}]*background-color:\s*[^;]+;([^}]*)\}/g,
            '.submit-button {$1  background-color: #28a745;'
        );
        
        // Also update the hover state if it exists
        content = content.replace(
            /\.submit-button:hover:not\(:disabled\)\s*\{[^}]*background-color:\s*[^;]+;([^}]*)\}/g,
            '.submit-button:hover:not(:disabled) {$1  background-color: #218838;'
        );
        
        // If no background-color exists, add it
        if (!content.includes('.submit-button') || !content.includes('background-color: #28a745')) {
            content = content.replace(
                /\.submit-button\s*\{([^}]*)\}/,
                '.submit-button {$1  background-color: #28a745;}'
            );
        }
        
        fs.writeFileSync(loginPagePath, content, 'utf8');
        console.log('✅ Successfully changed submit button to green');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

console.log('🟢 Changing submit button to green...');
changeButtonToGreen();