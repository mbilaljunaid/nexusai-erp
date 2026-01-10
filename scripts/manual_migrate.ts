
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

async function run() {
    console.log("Starting manual migration...");
    const migrationFile = path.join(process.cwd(), "migrations/0000_mean_shatterstar.sql");
    const content = fs.readFileSync(migrationFile, "utf-8");
    const statements = content.split("--> statement-breakpoint");

    console.log(`Found ${statements.length} statements.`);

    for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i].trim();
        if (!stmt) continue;

        try {
            await db.execute(sql.raw(stmt));
            // minimal log to avoid noise
            if (i % 50 === 0) console.log(`Executed statement ${i + 1}/${statements.length}`);
        } catch (e: any) {
            console.error(`Error executing statement ${i + 1}:`);
            console.error(stmt);
            console.error(e.message);
            // Don't exit, try to continue? Or exit?
            // If it's the FK error, we want to know exact statement.
            process.exit(1);
        }
    }
    console.log("Manual migration completed successfully.");
    process.exit(0);
}

run();
