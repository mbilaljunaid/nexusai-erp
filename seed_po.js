require('dotenv').config();
const { Pool } = require('pg');

async function seed() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        // Find a supplier
        const supRes = await pool.query('SELECT id FROM ap_suppliers LIMIT 1');
        if (supRes.rows.length === 0) throw new Error("No suppliers");
        const supplierId = supRes.rows[0].id;

        // Insert PO
        const poRes = await pool.query(`
            INSERT INTO scm_purchase_orders (supplier_id, total_amount, status, created_at, updated_at) 
            VALUES ($1, $2, $3, NOW(), NOW()) 
            RETURNING id
        `, [supplierId, 1000.00, 'APPROVED']);
        const poId = poRes.rows[0].id;

        // Insert PO Line
        await pool.query(`
            INSERT INTO scm_purchase_order_lines (po_header_id, line_number, unit_price, quantity, line_total, created_at, updated_at)
            VALUES ($1, 1, 100.00, 10, 1000.00, NOW(), NOW())
        `, [poId]);

        console.log("SEEDED_PO_ID=" + poId);
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
seed();
