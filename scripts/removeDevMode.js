// Script to remove developer mode functionality from frontend components
const fs = require('fs');
const path = require('path');

const frontendPath = 'C:\\Users\\domin\\Documents\\requisition-frontend\\src\\components';

// Files that need dev mode removal
const filesToClean = [
    path.join(frontendPath, 'Inventario.vue'),
    path.join(frontendPath, 'LoginPage.vue')
];

function cleanDevModeFromFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${filePath}`);
        return false;
    }

    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        
        if (filePath.includes('Inventario.vue')) {
            // Remove dev token buttons
            content = content.replace(/<button[^>]*@click="getDevToken"[^>]*>.*?<\/button>/gs, '');
            content = content.replace(/v-if="!hasToken \|\| inventario\.length === 0"/g, 'v-if="false" style="display: none;"');
            
            // Remove getDevToken method
            content = content.replace(/async getDevToken\(\) \{[\s\S]*?\},?\s*(?=\w+\(|$)/g, '');
            
            // Remove dev token fallback in loadInventario
            content = content.replace(/\/\/ If no token, try to get dev token in development[\s\S]*?console\.log\('Dev token not available:', devError\.message\);\s*}/g, '// Authentication required - please login');
        }
        
        if (filePath.includes('LoginPage.vue')) {
            // Remove dev token hardcoded values
            content = content.replace(/const devToken = '[^']*';/g, '');
            content = content.replace(/localStorage\.setItem\('userToken', devToken\);/g, '');
            content = content.replace(/localStorage\.setItem\('userRole','ADMIN'\);/g, '');
            content = content.replace(/localStorage\.setItem\('username', 'dev-autotoken'\);/g, '');
        }
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Cleaned dev mode from: ${path.basename(filePath)}`);
            return true;
        } else {
            console.log(`ℹ️  No dev mode found in: ${path.basename(filePath)}`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Error cleaning ${filePath}:`, error.message);
        return false;
    }
}

function main() {
    console.log('🧹 Removing developer mode functionality...\n');
    
    let cleanedCount = 0;
    filesToClean.forEach(filePath => {
        if (cleanDevModeFromFile(filePath)) {
            cleanedCount++;
        }
    });
    
    console.log(`\n✅ Developer mode cleanup complete! Cleaned ${cleanedCount} files.`);
    console.log('🔒 Application now requires proper authentication for all features.');
}

main();