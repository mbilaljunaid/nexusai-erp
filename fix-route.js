const fs = require('fs');
const path = 'server/modules/intercompany/ic-netting.routes.ts';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/catch \(e: any\) { res.status\(500\)\.json\({ error: e\.message }\); }/g, "catch (e: any) { console.error('IC Route Error:', e); res.status(500).json({ error: e.message }); }");
fs.writeFileSync(path, content);
