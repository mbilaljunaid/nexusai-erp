
import { db } from "../server/db";
import { apInvoices, apSuppliers, glValueSets } from "@shared/schema";
import { sql, eq, inArray } from "drizzle-orm";

async function fixDuplicates() {
    console.log("Starting DB Cleanup to prepare for db:push...");

    // 1. Fix ap_invoices (invoice_id)
    console.log("Checking ap_invoices for duplicate invoice_id...");
    const invoiceDups = await db.execute(sql`
        SELECT invoice_id, COUNT(*) 
        FROM ap_invoices 
        GROUP BY invoice_id 
        HAVING COUNT(*) > 1
    `);

    if (invoiceDups.rows.length > 0) {
        console.log(`Found ${invoiceDups.rows.length} duplicate invoice IDs.`);
        for (const row of invoiceDups.rows) {
            const invoiceId = row.invoice_id as string;
            // Keep the latest one, delete others
            const records = await db.select().from(apInvoices).where(eq(apInvoices.invoiceId, invoiceId)).orderBy(apInvoices.id); // Oldest first
            const toDelete = records.slice(0, records.length - 1); // Keep last

            if (toDelete.length > 0) {
                const ids = toDelete.map(r => r.id);
                console.log(`Deleting ${ids.length} duplicates for invoice ${invoiceId}`);
                await db.delete(apInvoices).where(inArray(apInvoices.id, ids));
            }
        }
    } else {
        console.log("No invoice duplicates found.");
    }

    // 2. Fix ap_suppliers (supplier_number)
    console.log("Checking ap_suppliers for duplicate supplier_number...");
    const supplierDups = await db.execute(sql`
        SELECT supplier_number, COUNT(*) 
        FROM ap_suppliers
        WHERE supplier_number IS NOT NULL
        GROUP BY supplier_number 
        HAVING COUNT(*) > 1
    `);

    if (supplierDups.rows.length > 0) {
        console.log(`Found ${supplierDups.rows.length} duplicate supplier numbers.`);
        for (const row of supplierDups.rows) {
            const supplierNum = row.supplier_number as string;
            const records = await db.select().from(apSuppliers).where(eq(apSuppliers.supplierNumber, supplierNum)).orderBy(apSuppliers.id);
            const toDelete = records.slice(0, records.length - 1); // Keep last

            if (toDelete.length > 0) {
                const ids = toDelete.map(r => r.id);
                console.log(`Deleting ${ids.length} duplicates for supplier ${supplierNum}`);
                await db.delete(apSuppliers).where(inArray(apSuppliers.id, ids));
            }
        }
    } else {
        console.log("No supplier duplicates found.");
    }

    // 3. Fix gl_value_sets (name)
    console.log("Checking gl_value_sets for duplicate names...");
    const vsDups = await db.execute(sql`
        SELECT name, COUNT(*) 
        FROM gl_value_sets 
        GROUP BY name 
        HAVING COUNT(*) > 1
    `);

    if (vsDups.rows.length > 0) {
        console.log(`Found ${vsDups.rows.length} duplicate Value Set names.`);
        for (const row of vsDups.rows) {
            const name = row.name as string;
            const records = await db.select().from(glValueSets).where(eq(glValueSets.name, name)).orderBy(glValueSets.id);
            const toDelete = records.slice(0, records.length - 1);

            if (toDelete.length > 0) {
                const ids = toDelete.map(r => r.id);
                console.log(`Deleting ${ids.length} duplicates for Value Set ${name}`);
                await db.delete(glValueSets).where(inArray(glValueSets.id, ids));
            }
        }
    } else {
        console.log("No Value Set duplicates found.");
    }

    console.log("Cleanup Complete.");
    process.exit(0);
}

fixDuplicates().catch(e => {
    console.error(e);
    process.exit(1);
});
