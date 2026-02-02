
import 'dotenv/config';
import { db } from '../server/db';
import {
    glIntercompanyRules, glCodeCombinations, glAccounts
} from '../shared/schema';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

async function seedIntercompanyRules() {
    console.log("Seeding Intercompany Rules...");

    const ledgerId = "primary-ledger-001";
    const co101 = "101"; // Operations
    const co102 = "102"; // Distribution

    // 1. Ensure Accounts Exist (IC Rec / IC Pay)
    const icRecCode = "1800";
    const icPayCode = "2800";

    // 2. Ensure Code Combinations Exist
    // Co 101 needs 101-000-2800 (Payable)
    // Co 102 needs 102-000-1800 (Receivable)

    // Helper to get/create CCID
    async function getCCID(co: string, naturalAccount: string) {
        const code = `${co}-000-${naturalAccount}-000-000`;
        let [cc] = await db.select().from(glCodeCombinations)
            .where(and(eq(glCodeCombinations.ledgerId, ledgerId), eq(glCodeCombinations.code, code)));

        if (!cc) {
            console.log(`Creating CCID: ${code}`);
            [cc] = await db.insert(glCodeCombinations).values({
                ledgerId,
                code,
                segment1: co,
                segment2: "000",
                segment3: naturalAccount,
                segment4: "000",
                segment5: "000",
                enabledFlag: true,
                startDateActive: new Date(),
                accountType: naturalAccount.startsWith("1") ? "Asset" : "Liability"
            }).returning();
        }
        return cc.id;
    }

    const ccidRec102 = await getCCID(co102, icRecCode); // Co 102 - IC Receivable
    const ccidPay101 = await getCCID(co101, icPayCode); // Co 101 - IC Payable

    // 3. Create Rule: If 101 owes 102
    // From: 101 (Debtor/Payer), To: 102 (Creditor/Payee)
    const [existing] = await db.select().from(glIntercompanyRules).where(
        and(
            eq(glIntercompanyRules.fromCompany, co101),
            eq(glIntercompanyRules.toCompany, co102)
        )
    );

    if (existing) {
        console.log("Rule 101 -> 102 already exists.");
    } else {
        await db.insert(glIntercompanyRules).values({
            fromCompany: co101,
            toCompany: co102,
            payableAccountId: ccidPay101, // 101 uses this to record liability
            receivableAccountId: ccidRec102, // 102 uses this to record asset
            enabled: true
        });
        console.log("Created Intercompany Rule: 101 -> 102");
    }

    // Also Inverse: If 102 owes 101
    const ccidRec101 = await getCCID(co101, icRecCode);
    const ccidPay102 = await getCCID(co102, icPayCode);

    const [existingInv] = await db.select().from(glIntercompanyRules).where(
        and(
            eq(glIntercompanyRules.fromCompany, co102),
            eq(glIntercompanyRules.toCompany, co101)
        )
    );

    if (existingInv) {
        console.log("Rule 102 -> 101 already exists.");
    } else {
        await db.insert(glIntercompanyRules).values({
            fromCompany: co102,
            toCompany: co101,
            payableAccountId: ccidPay102,
            receivableAccountId: ccidRec101,
            enabled: true
        });
        console.log("Created Intercompany Rule: 102 -> 101");
    }

    console.log("Done.");
    process.exit(0);
}

seedIntercompanyRules();
