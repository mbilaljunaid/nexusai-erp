import { db } from "../server/db";
import { sql } from "drizzle-orm";
import fs from "fs";

async function main() {
    console.log("Reading migrations/p1_ap_parity.sql...");
    const rawSql = fs.readFileSync("migrations/p1_ap_parity.sql", "utf-8");

    console.log("Executing SQL...");
    try {
        await db.execute(sql.raw(rawSql));
        console.log("Migration executed successfully!");
    } catch (e) {
        console.error("Migration failed:", e);
    }
    process.exit(0);
}

main();
