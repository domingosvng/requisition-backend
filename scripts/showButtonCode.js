// Show the current CSS for the submit button
const fs = require('fs');

const loginPagePath = 'C:\\Users\\domin\\Documents\\requisition-frontend\\src\\components\\LoginPage.vue';

try {
    const content = fs.readFileSync(loginPagePath, 'utf8');
    const lines = content.split('\n');
    
    console.log('=== CURRENT CSS FOR SUBMIT BUTTON ===\n');
    
    // Find lines around .submit-button
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('.submit-button {')) {
            // Show 5 lines before and 15 lines after to get the full CSS block
            const start = Math.max(0, i - 2);
            const end = Math.min(lines.length, i + 15);
            
            for (let j = start; j < end; j++) {
                const lineNum = j + 1;
                const line = lines[j];
                console.log(`${lineNum.toString().padStart(3)}: ${line}`);
            }
            break;
        }
    }
    
    console.log('\n=== TO MAKE BUTTON GREEN ===');
    console.log('Find the line that says something like:');
    console.log('  background-color: [current-color];');
    console.log('');
    console.log('Change it to:');
    console.log('  background-color: #28a745;');
    console.log('');
    console.log('And for the hover state, change to:');
    console.log('  background-color: #218838;');
    
} catch (error) {
    console.error('Error reading file:', error.message);
}