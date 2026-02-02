
import 'dotenv/config';
import { db } from "../server/db";
import {
    glLedgers, glSegments, glSegmentValues,
    InsertGlLedger, InsertGlSegment, InsertGlSegmentValue
} from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
    console.log("Seeding GL Configuration...");

    try {
        // 1. Create Primary Ledger
        console.log("1. Creating Primary Ledger...");
        let ledgerId = "primary-ledger-001";

        const existingLedger = await db.select().from(glLedgers).where(eq(glLedgers.id, ledgerId));
        if (existingLedger.length === 0) {
            const ledger: InsertGlLedger = {
                id: ledgerId,
                name: "US Primary Ledger",
                currencyCode: "USD",
                chartOfAccountsId: "coa-001", // flexible
                periodSetName: "Monthly",
                slaMethod: "Standard",
                ledgerCategory: "PRIMARY",
                description: "Main US Operating Ledger"
            };
            await db.insert(glLedgers).values(ledger);
            console.log("   -> Created Ledger: US Primary Ledger");
        } else {
            console.log("   -> Ledger already exists");
        }

        // 2. Create Segments
        console.log("2. Creating Segments...");
        const segments: InsertGlSegment[] = [
            {
                ledgerId: ledgerId,
                segmentName: "Company",
                segmentNumber: 1,
                columnName: "segment1",
                segmentQualifier: "BALANCING",
                isRequired: true,
                displaySize: 2
            },
            {
                ledgerId: ledgerId,
                segmentName: "Department",
                segmentNumber: 2,
                columnName: "segment2",
                segmentQualifier: "COST_CENTER",
                isRequired: true,
                displaySize: 3
            },
            {
                ledgerId: ledgerId,
                segmentName: "Account",
                segmentNumber: 3,
                columnName: "segment3",
                segmentQualifier: "NATURAL_ACCOUNT",
                isRequired: true,
                displaySize: 5
            },
            {
                ledgerId: ledgerId,
                segmentName: "Sub-Account",
                segmentNumber: 4,
                columnName: "segment4",
                segmentQualifier: "NONE",
                isRequired: false,
                displaySize: 3
            }
        ];

        const createdSegmentIds: Record<string, string> = {};

        for (const seg of segments) {
            // Check if exists by ledger and name
            // Simple check, in prod use combined key
            // For seeding we just insert if table empty or simplistic check
            // Let's just retrieve all segments for ledger
            const allSegs = await db.select().from(glSegments).where(eq(glSegments.ledgerId, ledgerId));
            const existing = allSegs.find(s => s.segmentName === seg.segmentName);

            if (!existing) {
                const res = await db.insert(glSegments).values(seg).returning();
                createdSegmentIds[seg.segmentName] = res[0].id;
                console.log(`   -> Created Segment: ${seg.segmentName}`);
            } else {
                createdSegmentIds[seg.segmentName] = existing.id;
                console.log(`   -> Segment ${seg.segmentName} exists`);
            }
        }

        // 3. Create Segment Values (Flexfield Values)
        console.log("3. Creating Segment Values...");

        const valuesObject: Record<string, { val: string, desc: string }[]> = {
            "Company": [
                { val: "01", desc: "US Operations" },
                { val: "02", desc: "EMEA Operations" },
                { val: "99", desc: "Corporate" }
            ],
            "Department": [
                { val: "000", desc: "Unspecified" },
                { val: "100", desc: "Finance" },
                { val: "200", desc: "Sales" },
                { val: "300", desc: "Engineering" },
                { val: "400", desc: "Marketing" }
            ],
            "Account": [
                { val: "11000", desc: "Cash in Bank" },
                { val: "12000", desc: "Accounts Receivable" },
                { val: "20000", desc: "Accounts Payable" },
                { val: "40000", desc: "Revenue - Sales" },
                { val: "50000", desc: "Salaries Expense" },
                { val: "60000", desc: "Rent Expense" }
            ],
            "Sub-Account": [
                { val: "000", desc: "None" },
                { val: "001", desc: "Product A" },
                { val: "002", desc: "Product B" }
            ]
        };

        for (const [segName, vals] of Object.entries(valuesObject)) {
            const segId = createdSegmentIds[segName];
            if (!segId) continue;

            const existingVals = await db.select().from(glSegmentValues).where(eq(glSegmentValues.segmentId, segId));

            for (const v of vals) {
                if (!existingVals.find(ev => ev.value === v.val)) {
                    await db.insert(glSegmentValues).values({
                        segmentId: segId,
                        value: v.val,
                        description: v.desc,
                        enabled: true
                    });
                    console.log(`      -> Added ${segName}: ${v.val}`);
                }
            }
        }

        console.log("Seeding Complete!");
        process.exit(0);

    } catch (e) {
        console.error("Seeding Failed:", e);
        process.exit(1);
    }
}

seed();
