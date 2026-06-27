const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('src');
let changedFiles = 0;

files.forEach(f => {
    const original = fs.readFileSync(f, 'utf8');
    const regex = /[\u00C2\u00C3][\u0080-\u00BF]/g;
    
    if (regex.test(original)) {
        const fixed = original.replace(regex, match => Buffer.from(match, 'latin1').toString('utf8'));
        fs.writeFileSync(f, fixed, 'utf8');
        changedFiles++;
        console.log("Fixed encoding in: " + f);
    }
});

console.log("\nTotal files fixed: " + changedFiles);
