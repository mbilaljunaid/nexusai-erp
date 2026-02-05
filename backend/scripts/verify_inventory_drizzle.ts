
import { DrizzleProvider } from '../src/database/drizzle.provider';
import { ItemService } from '../src/modules/inventory/item.service';
import { InventoryOrganizationService } from '../src/modules/inventory/inventory-organization.service';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env explicitly
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

async function verify() {
    console.log('🔌 Initializing Inventory Service Test Context (Manual)...');

    try {
        // 1. Initialize DB
        const factory = (DrizzleProvider as any).useFactory;
        const db = await factory();
        console.log('✅ DB Connected.');

        // 2. Instantiate Services
        const itemService = new ItemService(db);
        const orgService = new InventoryOrganizationService(db);
        console.log('✅ Services instantiated.');

        // 3. Create Organization
        console.log('🏭 Creating Test Organization...');
        const orgCode = `TEST_${Date.now().toString().substring(8)}`;
        const org = await orgService.create({
            code: orgCode,
            name: 'Test Drizzle Warehouse',
            active: true
        });
        console.log(`✅ Organization created: ${org.id} (${org.code})`);

        // 4. Create Item
        console.log('📦 Creating Test Item...');
        const itemNumber = `ITEM-${Date.now().toString().substring(8)}`;
        const item = await itemService.create({
            itemNumber,
            description: 'Drizzle Test Item',
            organizationId: org.id,
            primaryUomCode: 'EA',
            quantityOnHand: 100
        });
        console.log(`✅ Item created: ${item.id} (${item.itemNumber})`);

        // 5. Verify Fetch
        const fetchedItem = await itemService.findOne(item.id);
        if (fetchedItem.itemNumber === itemNumber) {
            console.log('✅ Item fetched successfully.');
        } else {
            throw new Error('Fetched item mismatch');
        }

        // 6. Cleanup
        await itemService.remove(item.id);
        await orgService.remove(org.id);
        console.log('🧹 Cleanup complete.');

        process.exit(0);

    } catch (e) {
        console.error('❌ Verification Failed:', e);
        process.exit(1);
    }
}

verify();
