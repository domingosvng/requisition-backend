// Carefully restore the green login button without touching dev mode elements
const fs = require('fs');

const loginPagePath = 'C:\\Users\\domin\\Documents\\requisition-frontend\\src\\components\\LoginPage.vue';

function restoreLoginButton() {
    try {
        let content = fs.readFileSync(loginPagePath, 'utf8');
        
        // Look for the login form area and ensure there's a proper green login button
        // We need to be very specific and only target the login button, not any dev elements
        
        // Check if there's already a login button - if not, we need to add it back
        if (!content.includes('Entrar') && !content.includes('type="submit"')) {
            // Find the form section and add the login button back
            const formEndPattern = /<\/form>/;
            
            if (formEndPattern.test(content)) {
                content = content.replace(
                    /<\/form>/,
                    `                <button type="submit" class="btn btn-success w-100 mb-3">
                    Entrar
                </button>
            </form>`
                );
            }
        } else if (content.includes('Entrar')) {
            // If the button exists but might have wrong styling, fix it
            content = content.replace(
                /<button[^>]*>\s*Entrar\s*<\/button>/g,
                '<button type="submit" class="btn btn-success w-100 mb-3">Entrar</button>'
            );
        }
        
        // Make sure we have the CSS for the green button
        if (!content.includes('.btn-success')) {
            const styleSection = content.match(/<style[^>]*>([\s\S]*?)<\/style>/);
            if (styleSection) {
                const existingStyles = styleSection[1];
                const newStyles = existingStyles + `
.btn-success {
    background-color: #28a745;
    border-color: #28a745;
    color: white;
}

.btn-success:hover {
    background-color: #218838;
    border-color: #1e7e34;
}
`;
                content = content.replace(styleSection[1], newStyles);
            }
        }
        
        fs.writeFileSync(loginPagePath, content, 'utf8');
        console.log('✅ Successfully restored green login button');
        
    } catch (error) {
        console.error('❌ Error restoring login button:', error.message);
    }
}

console.log('🔧 Carefully restoring green login button...');
restoreLoginButton();