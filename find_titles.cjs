const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'pages');

const results = [];

function walk(p) {
    if (fs.statSync(p).isDirectory()) {
        fs.readdirSync(p).forEach(f => walk(path.join(p, f)));
    } else if (p.endsWith('.tsx')) {
        const code = fs.readFileSync(p, 'utf8');
        const lines = code.split('\n');
        lines.forEach((line, i) => {
            if (line.includes('title=')) {
                // Check if it's a native tag or Input/Button that has title=
                const regex = /<(input|select|button|span|div|Button|Input)\s+[^>]*title=(["'][^"']*["']|\{[^}]*\})/i;
                if (regex.test(line)) {
                    results.push({
                        file: p,
                        line: i + 1,
                        content: line.trim()
                    });
                }
            }
        });
    }
}

walk(dir);
fs.writeFileSync('title_matches.json', JSON.stringify(results, null, 2));
console.log(`Found ${results.length} lines with title attributes to process.`);
