const fs = require('fs');
const path = require('path');
const glob = require('glob');

const SRC_DIR = path.join(__dirname, '../src');
const files = glob.sync('**/*.tsx', { cwd: SRC_DIR, absolute: true, ignore: ['**/node_modules/**'] });

let modifiedCount = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // We want to replace <div or <span or <p with onClick, adding role="button" tabIndex={0} onKeyDown={...}
    // E.g. <div onClick={() => ...} className="...">
    // Need to strictly match tags that have onClick but no role="button" or tabIndex.

    // Regex strategy:
    // Match opening tags: <(div|span|p|li)\b([^>]*?onClick=[^>]*?)>
    // We use a replacer function to check if it already has role= or tabIndex=

    const regex = /<(div|span|p|li)\b([^>]*?onClick=(?:\{[^}]*\}|"[^"]*")[^>]*?)>/gi;

    content = content.replace(regex, (match, tag, rest) => {
        if (match.includes('role=') || match.includes('tabIndex=') || match.includes('disabled')) {
            return match; // skip if already accessible or disabled overlay
        }

        // Add the a11y attributes
        // A generic click trigger on enter/space: onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
        const a11yStr = ` role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}`;

        // Inject right after the tag name
        return `<${tag}${a11yStr}${rest}>`;
    });

    // Special case handling for 'onClick' that spans multiple lines where regex might have missed
    // The above regex `[^>]*?` actually matches across newlines in JS if we don't use `.` or if we just use `[^>]`.
    // Let's verify if `[^>]*?` matched multi-line cases. `[^>]` matches \n too.

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        modifiedCount++;
        console.log(`Updated ${path.relative(SRC_DIR, file)}`);
    }
}

console.log(`Total files modified: ${modifiedCount}`);
