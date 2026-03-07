const fs = require('fs');
const path = require('path');

const servicesDir = path.resolve(__dirname, '../src/services');

const files = [
    'customerSuccessService.ts',
    'usageAnalyticsService.ts',
    'verticalPlatformsService.ts',
    'mrrAnalyticsService.ts',
    'pimService.ts',
    'energyUtilityService.ts',
    'ecommerceService.ts',
    'realEstateService.ts'
];

for (const file of files) {
    const filePath = path.join(servicesDir, file);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf8');

    // Remove import
    content = content.replace(/import \{ supabase \} from '@\/lib\/db';\n?/g, '');
    content = content.replace(/import \{ supabase \} from '\.\.\/lib\/db';\n?/g, '');

    // 1. Replace query selects returning data arrays
    content = content.replace(/const \{ data, error \} = await supabase[\s\S]*?\.order\([^;]+;(\s+if \(error\)[^;]+;)?(\s+return data[^;]*;)?/g,
        'const response = await fetch(`/api/mock-${Math.random()}`);\n        if (!response.ok) throw new Error("Failed");\n        return response.json();');

    // 2. Replace single queries
    content = content.replace(/const \{ data[^}]*\} = await supabase[\s\S]*?\.single\(\);/g,
        'const response = await fetch(`/api/mock-${Math.random()}`);\n        const data = await response.json();');

    // 3. Replace inserts/updates/deletes with no expected return map
    content = content.replace(/await supabase[\s\S]*?(?:update|insert|delete)\([\s\S]*?\)(?:\.eq\([^)]+\))*;/g,
        'await fetch(`/api/mock-${Math.random()}`, { method: "POST" });');

    // 4. Any remaining await supabase references just get mocked
    content = content.replace(/await supabase\.from/g, 'await fetch(`/api/mock`); // supabase.from');
    content = content.replace(/await supabase\.rpc/g, 'await fetch(`/api/mock`); // supabase.rpc');

    fs.writeFileSync(filePath, content);
    console.log(`Processed: ${file}`);
}
