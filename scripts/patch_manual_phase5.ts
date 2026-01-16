import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Applying Manual Patch for Phase 4 & 5 Implementation...");

    // ASN Headers
    await db.execute(sql`
    CREATE TABLE IF NOT EXISTS asn_headers (
      id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      asn_number varchar NOT NULL UNIQUE,
      supplier_id varchar NOT NULL,
      po_id varchar NOT NULL,
      shipment_number varchar,
      shipped_date timestamp,
      expected_arrival_date timestamp,
      carrier varchar,
      tracking_number varchar,
      status varchar DEFAULT 'SHIPPED',
      created_at timestamp DEFAULT now()
    );
  `);
    console.log("Verified asn_headers");

    // ASN Lines
    await db.execute(sql`
    CREATE TABLE IF NOT EXISTS asn_lines (
      id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      asn_id varchar NOT NULL,
      po_line_id varchar NOT NULL,
      item_id varchar,
      quantity_shipped numeric(18, 4) NOT NULL,
      created_at timestamp DEFAULT now()
    );
  `);
    console.log("Verified asn_lines");

    // Supplier Scorecards
    await db.execute(sql`
    CREATE TABLE IF NOT EXISTS supplier_scorecards (
      id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      supplier_id varchar NOT NULL,
      period varchar NOT NULL,
      overall_score integer DEFAULT 0,
      delivery_score integer DEFAULT 0,
      quality_score integer DEFAULT 0,
      responsiveness_score integer DEFAULT 0,
      generated_at timestamp DEFAULT now()
    );
  `);
    console.log("Verified supplier_scorecards");

    // Supplier Quality Events
    await db.execute(sql`
    CREATE TABLE IF NOT EXISTS supplier_quality_events (
      id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      supplier_id varchar NOT NULL,
      event_id varchar,
      type varchar NOT NULL,
      severity varchar DEFAULT 'MEDIUM',
      description text,
      event_date timestamp DEFAULT now(),
      resolved boolean DEFAULT false
    );
  `);
    console.log("Verified supplier_quality_events");

    console.log("✅ Patch Complete.");
    process.exit(0);
}

main().catch((err) => {
    console.error("Patch Failed:", err);
    process.exit(1);
});
