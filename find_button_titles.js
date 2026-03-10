const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  const result = execSync('grep -rl "title=" src/pages').toString().trim().split('\n');
  const counts = {};
  
  result.forEach(file => {
    if (!file) return;
    const content = fs.readFileSync(file, 'utf8');
    // regex for Button with title
    const matches = content.match(/<Button[^>]*title=/g);
    if (matches) {
       counts[file] = matches.length;
    }
    // regex for Lucide Icon with title
    const iconMatches = content.match(/<[A-Z][a-zA-Z]*[^>]*title=/g);
    if (iconMatches) {
        // filter out known non-icons
        const real = iconMatches.filter(m => !m.includes('DashboardWidget') && !m.includes('StandardPage') && !m.includes('MetricCard') && !m.includes('Page') && !m.includes('CardTitle') && !m.includes('DashboardCard'));
        if (real.length > 0) {
            counts[file] = (counts[file] || 0) + real.length;
        }
    }
  });
  
  const entries = Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 30);
  console.log(entries.map(e => `${e[1]} ${e[0]}`).join('\n'));
} catch(e) {
  console.error(e);
}
