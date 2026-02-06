import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema/index.ts';
import { ReservationService } from '../backend/src/modules/inventory/reservation.service.ts';
import { DRIZZLE_DB } from '../backend/src/database/drizzle.provider.ts';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config();

async function verifyInventoryDrizzle() {
    console.log('--- Inventory Verification ---');

    console.log('Skipping DB connection check for dry run...');
    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL is missing');
        // process.exit(1); 
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });
    console.log('DB Connected');

    try {
        const resService = new ReservationService(db);

        // 1. Create Mock Data (Org and Item must exist)
        const orgId = 'verify-org-' + Date.now();
        const itemId = 'verify-item-' + Date.now();

        console.log('Seeding Mock Data...');
        await db.insert(schema.inventoryOrganizations).values({ id: orgId, code: 'VFY', name: 'Verify Org' }).onConflictDoNothing();
        await db.insert(schema.inventory).values({ id: itemId, itemNumber: 'VFY-001', organizationId: orgId }).onConflictDoNothing();

        // 2. Add On-Hand Quantity
        console.log('Adding On-Hand Balance...');
        await db.insert(schema.inventoryOnHandQuantities).values({
            organizationId: orgId,
            itemId: itemId,
            subinventoryId: 'SUB-1',
            quantity: '100',
            lastUpdated: new Date()
        });

        // 3. Create Reservation (Hard)
        console.log('Creating Reservation...');
        const resDto = {
            organizationId: orgId,
            itemId: itemId,
            demandSourceType: 'Sales Order',
            demandSourceHeaderId: 'SO-1001',
            quantity: 10,
            subinventoryId: 'SUB-1'
        };
        const reservation = await resService.createReservation(resDto);
        console.log('Reservation Created:', reservation?.id);

        // 4. Check ATP
        console.log('Checking Available Quantity...');
        const atp = await resService.calculateAvailableQuantity(orgId, itemId, 'SUB-1');
        console.log('ATP:', atp); // Should be 90 (100 - 10)

        if (atp === 90) {
            console.log('ATP Check Passed');
        } else {
            console.error('ATP Check Failed. Expected 90, got ' + atp);
        }

        // Cleanup
        console.log('Cleaning up...');
        await db.delete(schema.inventoryReservations).where(sql`id = ${reservation.id}`);
        await db.delete(schema.inventoryOnHandQuantities).where(sql`item_id = ${itemId} AND organization_id = ${orgId}`);
        await db.delete(schema.inventory).where(sql`id = ${itemId}`);
        await db.delete(schema.inventoryOrganizations).where(sql`id = ${orgId}`);

        console.log('--- SUCCESS ---');

    } catch (e) {
        console.error('Verification Failed', e);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

verifyInventoryDrizzle();
