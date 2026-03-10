import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const spacingScale = [
    { px: 0, tw: '0' },
    { px: 1, tw: 'px' },
    { px: 2, tw: '0.5' },
    { px: 4, tw: '1' },
    { px: 6, tw: '1.5' },
    { px: 8, tw: '2' },
    { px: 10, tw: '2.5' },
    { px: 12, tw: '3' },
    { px: 14, tw: '3.5' },
    { px: 16, tw: '4' },
    { px: 20, tw: '5' },
    { px: 24, tw: '6' },
    { px: 28, tw: '7' },
    { px: 32, tw: '8' },
    { px: 36, tw: '9' },
    { px: 40, tw: '10' },
    { px: 44, tw: '11' },
    { px: 48, tw: '12' },
    { px: 56, tw: '14' },
    { px: 64, tw: '16' },
    { px: 80, tw: '20' },
    { px: 96, tw: '24' },
    { px: 112, tw: '28' },
    { px: 128, tw: '32' },
    { px: 144, tw: '36' },
    { px: 160, tw: '40' },
    { px: 176, tw: '44' },
    { px: 192, tw: '48' },
    { px: 208, tw: '52' },
    { px: 224, tw: '56' },
    { px: 240, tw: '60' },
    { px: 256, tw: '64' },
    { px: 288, tw: '72' },
    { px: 320, tw: '80' },
    { px: 384, tw: '96' }
];

function getNearestSpacing(pxStr: string) {
    const px = parseFloat(pxStr);
    if (isNaN(px)) return null;

    if (px > 384) {
        return null;
    }

    let closest = spacingScale[0];
    let minDiff = Math.abs(px - closest.px);
    for (const scale of spacingScale) {
        const diff = Math.abs(px - scale.px);
        if (diff < minDiff) {
            minDiff = diff;
            closest = scale;
        }
    }
    return closest.tw;
}

const REGEX = /(-?(?:w|h|m|mt|mr|mb|ml|mx|my|p|pt|pr|pb|pl|px|py|gap|gap-x|gap-y|top|bottom|left|right))-\[([0-9.]+)px\]/g;

function walkSync(dir: string, filelist: string[] = []) {
    if (!fs.existsSync(dir)) return filelist;
    const files = fs.readdirSync(dir);
    files.forEach(function (file) {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            if (filepath.includes('src/components/ui')) return;
            if (filepath.includes('node_modules')) return;
            filelist = walkSync(filepath, filelist);
        } else {
            if (filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
                filelist.push(filepath);
            }
        }
    });
    return filelist;
}

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDirs = [
    path.join(__dirname, '../src/pages'),
    path.join(__dirname, '../src/components'),
];

let totalReplacements = 0;
let filesModified = 0;

targetDirs.forEach(dir => {
    const files = walkSync(dir);
    files.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        let modifications = 0;

        const newContent = content.replace(REGEX, (match, prefix, pxValue) => {
            const nearest = getNearestSpacing(pxValue);
            if (nearest) {
                modifications++;
                return `${prefix}-${nearest}`;
            }
            return match; // return original if no mapping (>384px)
        });

        if (modifications > 0) {
            fs.writeFileSync(file, newContent, 'utf8');
            totalReplacements += modifications;
            filesModified++;
            console.log(`Updated ${file}: ${modifications} replacements`);
        }
    });
});

console.log(`\nCompleted Category AA Refactoring:`);
console.log(`Total Files Modified: ${filesModified}`);
console.log(`Total Replacements Made: ${totalReplacements}`);
