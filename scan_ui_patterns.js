const fs = require('fs');
const { execSync } = require('child_process');

try {
  const files = execSync('find src/pages src/components -type f -name "*.tsx"').toString().trim().split('\n');
  
  const stats = {
    divOnClick: 0,
    inlineSvg: 0,
    hexColors: 0,
    nativeCheckboxRadio: 0,
    nativeDateFormatting: 0,
    manualButtonLoading: 0
  };

  files.forEach(file => {
    if (!file) return;
    const content = fs.readFileSync(file, 'utf8');

    // 1. Div or Span onClick without role="button" (Basic heuristic)
    const divOnClickMatches = content.match(/<(div|span|p|a)[^>]*onClick=\{[^}]*\}[^>]*>/g);
    if (divOnClickMatches) {
        divOnClickMatches.forEach(match => {
           if (!match.includes('role=') && !match.includes('tabIndex=')) {
               stats.divOnClick++;
           }
        });
    }

    // 2. Inline SVGs
    if (content.match(/<svg[^>]*>/g)) {
        stats.inlineSvg += content.match(/<svg[^>]*>/g).length;
    }

    // 3. Hex colors in className (e.g. text-[#123] or bg-[#BADA55])
    if (content.match(/text-\[#[0-9a-fA-F]{3,6}\]/g)) stats.hexColors += content.match(/text-\[#[0-9a-fA-F]{3,6}\]/g).length;
    if (content.match(/bg-\[#[0-9a-fA-F]{3,6}\]/g)) stats.hexColors += content.match(/bg-\[#[0-9a-fA-F]{3,6}\]/g).length;
    if (content.match(/border-\[#[0-9a-fA-F]{3,6}\]/g)) stats.hexColors += content.match(/border-\[#[0-9a-fA-F]{3,6}\]/g).length;

    // 4. Native checkbox / radio
    if (content.match(/<input[^>]*type="checkbox"/g)) stats.nativeCheckboxRadio += content.match(/<input[^>]*type="checkbox"/g).length;
    if (content.match(/<input[^>]*type="radio"/g)) stats.nativeCheckboxRadio += content.match(/<input[^>]*type="radio"/g).length;

    // 5. Native Date Formatting
    if (content.match(/\.toLocaleDateString\(/g)) stats.nativeDateFormatting += content.match(/\.toLocaleDateString\(/g).length;
    if (content.match(/\.toLocaleTimeString\(/g)) stats.nativeDateFormatting += content.match(/\.toLocaleTimeString\(/g).length;

    // 6. Manual Button Loading (Button wrapping Loader2 or Spinner)
    if (content.match(/<Button[^>]*>.*<(Loader2|Spinner).*<\/Button>/gs)) {
       stats.manualButtonLoading++;
    }
  });

  console.log(JSON.stringify(stats, null, 2));

} catch(e) {
  console.error(e);
}
