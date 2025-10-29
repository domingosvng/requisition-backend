// Surgical removal of dev mode visual elements from LoginPage.vue
const fs = require('fs');
const path = require('path');

const loginPagePath = 'C:\\Users\\domin\\Documents\\requisition-frontend\\src\\components\\LoginPage.vue';

function removeDevModeVisuals() {
    if (!fs.existsSync(loginPagePath)) {
        console.log(`❌ File not found: ${loginPagePath}`);
        return false;
    }

    try {
        let content = fs.readFileSync(loginPagePath, 'utf8');
        let originalContent = content;
        
        // Remove the "Modo de Desenvolvimento" section and the dev button
        // Look for the pattern and remove it carefully
        content = content.replace(/\s*<div[^>]*>\s*🔧 Modo de Desenvolvimento\s*<\/div>[\s\S]*?<button[^>]*>\s*Acesso Direto \(Dev\)\s*<\/button>\s*<\/div>/g, '');
        
        // Alternative pattern if the above doesn't match exactly
        content = content.replace(/🔧 Modo de Desenvolvimento[\s\S]*?Acesso Direto \(Dev\)[\s\S]*?<\/button>/g, '');
        
        // Remove any remaining dev mode references
        content = content.replace(/.*Modo de Desenvolvimento.*\n/g, '');
        content = content.replace(/.*Acesso Direto \(Dev\).*\n/g, '');
        
        // Clean up any orphaned divs or empty sections
        content = content.replace(/<div[^>]*>\s*<\/div>/g, '');
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        if (content !== originalContent) {
            fs.writeFileSync(loginPagePath, content, 'utf8');
            console.log(`✅ Removed dev mode visuals from LoginPage.vue`);
            return true;
        } else {
            console.log(`ℹ️  No dev mode visuals found to remove`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Error removing dev mode visuals:`, error.message);
        return false;
    }
}

console.log('🎨 Removing dev mode visual elements...\n');
removeDevModeVisuals();
console.log('\n✅ Dev mode visual cleanup complete!');