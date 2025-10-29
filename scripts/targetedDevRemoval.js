// More targeted removal of dev mode button
const fs = require('fs');

const loginPagePath = 'C:\\Users\\domin\\Documents\\requisition-frontend\\src\\components\\LoginPage.vue';

function removeDevButton() {
    try {
        let content = fs.readFileSync(loginPagePath, 'utf8');
        
        // Find and remove the dev mode section more precisely
        // Look for the entire dev mode block including the header and button
        const devModeRegex = /<div[^>]*>\s*🔧\s*Modo de Desenvolvimento\s*<\/div>\s*<button[^>]*class="[^"]*btn-warning[^"]*"[^>]*>\s*Acesso Direto \(Dev\)\s*<\/button>/gs;
        
        const newContent = content.replace(devModeRegex, '');
        
        // Also remove any standalone references
        const cleanedContent = newContent
            .replace(/\s*🔧\s*Modo de Desenvolvimento\s*/g, '')
            .replace(/\s*Acesso Direto \(Dev\)\s*/g, '');
        
        if (cleanedContent !== content) {
            fs.writeFileSync(loginPagePath, cleanedContent, 'utf8');
            console.log('✅ Successfully removed dev mode button from LoginPage.vue');
        } else {
            console.log('ℹ️  No dev mode button found to remove');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

console.log('🎯 Targeting dev mode button for removal...');
removeDevButton();