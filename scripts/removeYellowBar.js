// Remove the yellow bar from LoginPage.vue
const fs = require('fs');

const loginPagePath = 'C:\\Users\\domin\\Documents\\requisition-frontend\\src\\components\\LoginPage.vue';

function removeYellowBar() {
    try {
        let content = fs.readFileSync(loginPagePath, 'utf8');
        
        // Look for yellow/warning colored elements - could be a div, button, or other element
        // Common patterns for yellow bars or warning elements
        const patterns = [
            // Yellow button or div
            /<button[^>]*class="[^"]*btn-warning[^"]*"[^>]*>[\s\S]*?<\/button>/g,
            /<div[^>]*class="[^"]*warning[^"]*"[^>]*>[\s\S]*?<\/div>/g,
            /<div[^>]*class="[^"]*yellow[^"]*"[^>]*>[\s\S]*?<\/div>/g,
            // Any element with yellow background
            /<[^>]*style="[^"]*background[^"]*yellow[^"]*"[^>]*>[\s\S]*?<\/[^>]*>/g,
            /<[^>]*style="[^"]*background-color[^"]*#[a-fA-F0-9]*[^"]*"[^>]*>[\s\S]*?<\/[^>]*>/g,
            // Empty div or button that might be styled with CSS
            /<div[^>]*>\s*<\/div>/g,
            /<button[^>]*>\s*<\/button>/g
        ];
        
        let newContent = content;
        let changed = false;
        
        patterns.forEach(pattern => {
            const beforeReplace = newContent;
            newContent = newContent.replace(pattern, '');
            if (beforeReplace !== newContent) {
                changed = true;
            }
        });
        
        // Also remove any CSS that might be creating a yellow bar
        newContent = newContent.replace(/\.btn-warning[^}]*}/g, '');
        newContent = newContent.replace(/background[^:]*:\s*[^;]*yellow[^;]*;/g, '');
        newContent = newContent.replace(/background-color[^:]*:\s*#[a-fA-F0-9]{6}[^;]*;/g, '');
        
        // Clean up extra whitespace
        newContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        if (newContent !== content) {
            fs.writeFileSync(loginPagePath, newContent, 'utf8');
            console.log('✅ Successfully removed yellow bar from LoginPage.vue');
        } else {
            console.log('ℹ️  No yellow bar elements found to remove');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

console.log('🟡 Removing yellow bar from login page...');
removeYellowBar();