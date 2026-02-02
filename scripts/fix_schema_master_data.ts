
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function fixSchemaMasterData() {
    console.log("🛠️ Starting Master Data Schema Fix...");

    try {
        // 1. Value Sets
        console.log("🔧 Creating gl_value_sets...");
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS gl_value_sets (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR NOT NULL UNIQUE,
                description TEXT,
                validation_type VARCHAR DEFAULT 'Independent',
                format_type VARCHAR DEFAULT 'Char',
                max_length INTEGER,
                uppercase_only BOOLEAN DEFAULT true,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT now()
            );
        `);

        // 2. CoA Structures
        console.log("🔧 Creating gl_coa_structures...");
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS gl_coa_structures (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR NOT NULL UNIQUE,
                description TEXT,
                delimiter VARCHAR DEFAULT '-',
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT now()
            );
        `);

        // 3. Segments (Drop and Recreate to be safe as schema changed significantly)
        console.log("🔧 Recreating gl_segments_v2 (Dropping old if exists)...");
        await db.execute(sql`DROP TABLE IF EXISTS gl_segments_v2;`);
        await db.execute(sql`
            CREATE TABLE gl_segments_v2 (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                coa_structure_id VARCHAR NOT NULL,
                segment_name VARCHAR NOT NULL,
                segment_number INTEGER NOT NULL,
                column_name VARCHAR NOT NULL,
                value_set_id VARCHAR NOT NULL,
                prompt VARCHAR NOT NULL,
                display_width INTEGER DEFAULT 20,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT now()
            );
        `);

        // 4. Segment Values (Drop and Recreate)
        console.log("🔧 Recreating gl_segment_values_v2 (Dropping old if exists)...");
        await db.execute(sql`DROP TABLE IF EXISTS gl_segment_values_v2;`);
        await db.execute(sql`
            CREATE TABLE gl_segment_values_v2 (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                value_set_id VARCHAR NOT NULL,
                value VARCHAR NOT NULL,
                description TEXT,
                parent_value_id VARCHAR,
                is_summary BOOLEAN DEFAULT false,
                enabled_flag BOOLEAN DEFAULT true,
                start_date_active TIMESTAMP,
                end_date_active TIMESTAMP,
                account_type VARCHAR,
                created_at TIMESTAMP DEFAULT now()
            );
        `);

        // 5. Segment Hierarchies
        console.log("🔧 Creating gl_segment_hierarchies...");
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS gl_segment_hierarchies (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                value_set_id VARCHAR NOT NULL,
                parent_value VARCHAR NOT NULL,
                child_value VARCHAR NOT NULL,
                tree_name VARCHAR DEFAULT 'DEFAULT',
                created_at TIMESTAMP DEFAULT now()
            );
        `);

        console.log("✅ Master Data Schema Applied Successfully!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Schema Fix Failed:", error);
        process.exit(1);
    }
}

fixSchemaMasterData();
