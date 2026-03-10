import { db } from "../server/db";
import { entUserDataAccess } from "../shared/schema/enterprise";
import { sql } from "drizzle-orm";

async function addBuAccess() {
    try {
        await db.execute(sql.raw(`
            INSERT INTO ent_user_data_access (tenant_id, user_id, role_id, context_type, context_value, is_default)
            VALUES 
            ('tenant1', 'user1', '1', 'BU', 'US Operations', true),
            ('tenant1', 'user1', '1', 'BU', 'EU Operations', false),
            ('tenant1', 'user1', '1', 'INV_ORG', 'Seattle Warehouse', true),
            ('tenant1', 'user1', '1', 'INV_ORG', 'Berlin Hub', false),
            ('default', 'user1', '1', 'BU', 'US Operations', true),
            ('default', 'user1', '1', 'BU', 'EU Operations', false),
            ('default', 'demo-admin-user', '1', 'BU', 'US Operations', true),
            ('tenant1', 'demo-admin-user', '1', 'BU', 'US Operations', true)
            ON CONFLICT DO NOTHING;
        `));
        console.log("BU and INV_ORG access granted to user 1.");
    } catch (e: any) {
        console.error("Error inserting data access:", e.message);
    }
    process.exit(0);
}

addBuAccess();
