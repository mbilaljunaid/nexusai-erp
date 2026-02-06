
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema/index.ts';
import * as scmSchema from '../shared/schema/scm.ts';
import * as dotenv from 'dotenv';
import { eq, and } from 'drizzle-orm';
dotenv.config();

/**
 * Verify Procurement Drizzle Migration (Debug Version)
 */
async function verifyProcurement() {
    console.log('Verifying Procurement Drizzle Migration...');

    // DEBUG: Check if tables exist in schema
    const schemaKeys = Object.keys(schema);
    const hasAp = schemaKeys.some(k => k.startsWith('apInvoices'));
    console.log(`Schema has apInvoices: ${hasAp}`);
    if (!hasAp) {
        console.log('SCM Schema has apInvoices:', !!scmSchema.apInvoices);
    }

    // Merge schemas if necessary
    const targetSchema = { ...schema, ...scmSchema };

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema: targetSchema });

    try {
        await db.transaction(async (tx) => {
            // 1. Supplier
            const supplierName = `VFY-SUP-${Date.now()}`;
            console.log(`1. Create Supplier: ${supplierName}`);
            const [supplier] = await tx.insert(targetSchema.suppliers).values({
                name: supplierName,
                status: 'active'
            }).returning();

            const [site] = await tx.insert(targetSchema.supplierSites).values({
                supplierId: supplier.id,
                siteName: 'MAIN',
                isPay: 'true',
                isPurchasing: 'true'
            }).returning();

            // 2. Requisition
            console.log('2. Create Requisition');
            const [req] = await tx.insert(targetSchema.purchaseRequisitions).values({
                requisitionNumber: `REQ-${Date.now()}`,
                requesterId: 'USER-1', // Ensure this ID works or change logic
                status: 'Approved',
                description: 'Verify Procurement'
            }).returning();

            const [reqLine] = await tx.insert(targetSchema.purchaseRequisitionLines).values({
                requisitionId: req.id,
                lineNumber: 1,
                itemDescription: 'Test Widget',
                quantity: '10',
                estimatedPrice: '100',
                unitOfMeasure: 'EA',
                status: 'Approved'
            }).returning();

            // 3. Purchase Order
            console.log('3. Create Purchase Order');
            const [po] = await tx.insert(targetSchema.purchaseOrders).values({
                orderNumber: `PO-${Date.now()}`,
                supplierId: supplier.id,
                totalAmount: '1000',
                status: 'Open'
            }).returning();

            const [poLine] = await tx.insert(targetSchema.purchaseOrderLines).values({
                poHeaderId: po.id,
                lineNumber: 1,
                itemDescription: reqLine.itemDescription,
                quantity: reqLine.quantity,
                unitPrice: reqLine.estimatedPrice,
                amount: '1000'
            }).returning();

            // 4. Receipt (RCV)
            console.log('4. Receive Items');
            const [receipt] = await tx.insert(targetSchema.rcvShipmentHeaders).values({
                receiptNumber: `REC-${Date.now()}`,
                vendorId: supplier.id,
                receiptDate: new Date()
            }).returning();

            await tx.insert(targetSchema.rcvShipmentLines).values({
                shipmentHeaderId: receipt.id,
                lineNum: 1,
                quantityReceived: '10',
                poHeaderId: po.id,
                poLineId: poLine.id,
                itemDescription: poLine.itemDescription
            });

            // 5. AP Invoice
            console.log('5. Create AP Invoice');
            const [invoice] = await tx.insert(targetSchema.apInvoices).values({
                invoiceNumber: `INV-${Date.now()}`,
                supplierId: supplier.id,
                siteId: site.id,
                purchaseOrderId: po.id,
                amount: '1000',
                invoiceDate: new Date(),
                status: 'Draft'
            }).returning();

            await tx.insert(targetSchema.apInvoiceLines).values({
                invoiceId: invoice.id,
                lineNumber: 1,
                amount: '1000',
                description: 'Matched to PO',
                poLineId: poLine.id
            });

            // 6. Validate Invoice
            console.log('6. Validate Invoice');
            await tx.update(targetSchema.apInvoices)
                .set({ status: 'Validated', accountingStatus: 'Unaccounted' })
                .where(eq(targetSchema.apInvoices.id, invoice.id));

            console.log('✅ Procurement Flow Verified Successfully');
            tx.rollback(); // Cleanup
        });
    } catch (e) {
        if (e.message === 'Rollback') {
            console.log('Verification Complete (Rollback).');
        } else {
            console.error('Verification Failed', e);
            process.exit(1);
        }
    } finally {
        await pool.end();
    }
}

verifyProcurement();
