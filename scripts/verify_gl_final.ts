
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("=== GL ENTERPRISE FINAL VALIDATION ===");
    let pass = true;

    // 1. Check Table Existence (Schema Fix Validation)
    const tablesToCheck = [
        "gl_journals_v2",
        "gl_journal_lines_v2",
        "gl_audit_logs",
        "gl_data_access_sets",
        "gl_balances_v2"
    ];

    console.log("\n[1] Checking Schema Integrity...");
    for (const table of tablesToCheck) {
        try {
            const res = await db.execute(sql`SELECT count(*) FROM ${sql.identifier(table)}`);
            console.log(` ✅ Table '${table}' exists. Count: ${res.rows[0].count}`);
        } catch (e: any) {
            console.error(` ❌ Table '${table}' MISSING or invalid. Error: ${e.message}`);
            pass = false;
        }
    }

    // 2. Check Audit Logs (Feature Validation)
    console.log("\n[2] Checking Audit Log Activity...");
    try {
        const auditRes = await db.execute(sql`SELECT count(*) FROM gl_audit_logs`);
        const count = parseInt(auditRes.rows[0].count as string);
        if (count > 0) {
            console.log(` ✅ Audit Logs found. System is tracking actions.`);
            const latest = await db.execute(sql`SELECT * FROM gl_audit_logs ORDER BY timestamp DESC LIMIT 1`);
            console.log(`    Latest Action: ${latest.rows[0].action} by ${latest.rows[0].user_id}`);
        } else {
            console.log(` ⚠️ No Audit Logs found yet. (Acceptable if no actions taken since rebuild)`);
        }
    } catch (e) {
        console.error(" ❌ Failed to query Audit Logs");
        pass = false;
    }

    // 3. Check Security Configuration
    console.log("\n[3] Checking Security Config...");
    try {
        const secRes = await db.execute(sql`SELECT count(*) FROM gl_data_access_sets`);
        console.log(`    Data Access Sets defined: ${secRes.rows[0].count}`);
    } catch (e) {
        console.error(" ❌ Failed to query Data Access Sets");
        pass = false;
    }

    // 4. Balances Cube
    console.log("\n[4] Checking Balances Cube...");
    try {
        const balRes = await db.execute(sql`SELECT count(*) FROM gl_balances_v2`);
        console.log(`    Balances calculated: ${balRes.rows[0].count}`);
    } catch (e) {
        console.error(" ❌ Failed to query Balances Cube");
        pass = false;
    }

    console.log("\n==================================");
    if (pass) {
        console.log("FINAL VERDICT: PASS ✅");
        console.log("System is ready for production staging.");
    } else {
        console.log("FINAL VERDICT: FAIL ❌");
        console.log("Please address the errors above.");
        process.exit(1);
    }
    process.exit(0);
}

main();
