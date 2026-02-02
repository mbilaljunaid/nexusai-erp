import { createRequire } from 'module';
const require = createRequire(import.meta.url);

try {
    const { CmrReceiptDistribution } = require('../backend/src/modules/cost-management/entities/cmr-receipt-distribution.entity.ts');
    console.log('Imported via Require:', CmrReceiptDistribution);
} catch (e) {
    console.error('Require failed:', e);
}
