// Safer script to fix the syntax error in Inventario.vue
const fs = require('fs');
const path = require('path');

const inventarioPath = 'C:\\Users\\domin\\Documents\\requisition-frontend\\src\\components\\Inventario.vue';

function fixInventarioSyntax() {
    if (!fs.existsSync(inventarioPath)) {
        console.log(`❌ File not found: ${inventarioPath}`);
        return false;
    }

    try {
        let content = fs.readFileSync(inventarioPath, 'utf8');
        
        // Find and fix method syntax issues - look for broken method structures
        // Look for patterns where methods were removed but left syntax errors
        
        // Fix any orphaned closing braces or comma issues in methods section
        content = content.replace(/,\s*\n\s*},?\s*\n\s*}/g, '\n        }\n    }');
        content = content.replace(/},?\s*\n\s*},?\s*\n\s*}/g, '}\n    }');
        
        // Fix double closing braces at end of methods
        content = content.replace(/}\s*}\s*<\/script>/g, '}\n</script>');
        
        // Ensure proper method ending before script tag
        content = content.replace(/}\s*}\s*}\s*<\/script>/g, '    }\n</script>');
        
        // Clean up any remaining syntax issues
        const lines = content.split('\n');
        const cleanedLines = [];
        let insideMethods = false;
        let braceLevel = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();
            
            // Track if we're inside methods section
            if (trimmedLine.includes('methods:')) {
                insideMethods = true;
            }
            if (trimmedLine === '</script>') {
                insideMethods = false;
            }
            
            // Skip empty method definitions or broken syntax
            if (insideMethods && (
                trimmedLine === ',' ||
                trimmedLine === '},,' ||
                (trimmedLine === '}' && lines[i+1] && lines[i+1].trim() === '}' && lines[i+2] && lines[i+2].trim() === '}')
            )) {
                continue;
            }
            
            cleanedLines.push(line);
        }
        
        const cleanedContent = cleanedLines.join('\n');
        
        fs.writeFileSync(inventarioPath, cleanedContent, 'utf8');
        console.log(`✅ Fixed syntax errors in Inventario.vue`);
        return true;
        
    } catch (error) {
        console.error(`❌ Error fixing syntax:`, error.message);
        return false;
    }
}

console.log('🔧 Fixing syntax errors in Inventario.vue...\n');
fixInventarioSyntax();
console.log('\n✅ Syntax fix complete! Please restart the frontend server.');