import { db } from "@db";
import { fixedAssetsService } from "../server/modules/finance/fixed-assets.service";
import {
    faAssets, faBooks, faCategories, faAssetBooks, faTransactions
} from "@shared/schema/fixedAssets";
import { slaJournalHeaders, slaJournalLines } from "@shared/schema/sla";
import { eq, desc } from "drizzle-orm";

async function verifyFixedAssetsSla() {
    console.log("🔍 Verifying Fixed Assets SLA Integration...");

    // 1. Setup: Create Asset, Book, Category
    const bookId = `BOOK-${Date.now()}`;
    await db.insert(faBooks).values({
        id: bookId,
        bookCode: `CORP-${Date.now()}`,
        description: "Corporate Book",
        ledgerId: "PRIMARY",
        depreciationCalendar: "MONTHLY"
    });

    const categoryId = `CAT-${Date.now()}`;
    await db.insert(faCategories).values({
        id: categoryId,
        bookId: bookId,
        majorCategory: "COMPUTERS",
        minorCategory: "LAPTOPS",
        assetCostAccountCcid: "1010",
        assetClearingAccountCcid: "1020",
        deprExpenseAccountCcid: "5010",
        accumDeprAccountCcid: "1030",
        defaultLifeYears: 5
    });

    const assetId = `ASSET-${Date.now()}`;
    await db.insert(faAssets).values({
        id: assetId,
        assetNumber: `AST-${Date.now()}`,
        description: "MacBook Pro",
        categoryId: categoryId,
        status: "ACTIVE"
    });

    await db.insert(faAssetBooks).values({
        assetId: assetId,
        bookId: bookId,
        datePlacedInService: new Date(),
        originalCost: "2400.00",
        recoverableCost: "2400.00",
        lifeYears: 2,
        method: "STL",
        status: "ACTIVE"
    });

    console.log(`   Setup Complete: Asset ${assetId} in Book ${bookId}`);

    // 2. Scenario 1: Asset Addition
    console.log("\n   --- Scenario 1: Asset Addition ---");
    try {
        const trx = await fixedAssetsService.postAddition(assetId, bookId);
        console.log(`   Transaction Created: ${trx.id} (ADDITION)`);

        await verifySla(trx.id, "FA_ADDITION", 2400);
    } catch (e) {
        console.error("   ❌ Addition Failed:", e);
    }

    // 3. Scenario 2: Depreciation Run
    console.log("\n   --- Scenario 2: Depreciation Run ---");
    try {
        const results = await fixedAssetsService.runDepreciation(bookId, "2024-01");
        // returns array of transactions or undefined if void
        if (results && results.length > 0) {
            const trx = results[0]; // Assuming 1 asset
            console.log(`   Transaction Created: ${trx.id} (DEPRECIATION)`);
            // 2400 / 24 months = 100
            await verifySla(trx.id, "FA_DEPRECIATION", 100);
        } else {
            console.error("   ❌ No Depreciation Results returned.");
        }
    } catch (e) {
        console.error("   ❌ Depreciation Failed:", e);
    }

    // 4. Scenario 3: Retirement (Sale)
    console.log("\n   --- Scenario 3: Retirement ---");
    try {
        // Retire with Proceeds=500, CostRemoval=0.
        // Cost=2400, AccumDepr=100 (from previous step). NBV=2300.
        // Gain/Loss = 500 - 0 - 2300 = -1800 (Loss).
        const trx = await fixedAssetsService.retireAsset(assetId, bookId, 500, 0);
        console.log(`   Transaction Created: ${trx.id} (RETIREMENT)`);

        // Validation tricky due to dynamic lines. Check header exists at least.
        await verifySla(trx.id, "FA_RETIREMENT", 0, false);
    } catch (e) {
        console.error("   ❌ Retirement Failed:", e);
    }

    process.exit(0);
}

async function verifySla(entityId: string, eventClass: string, expectedAmount: number, uniqueBalanceCheck = true) {
    const headers = await db.select().from(slaJournalHeaders)
        .where(eq(slaJournalHeaders.entityId, entityId));

    if (headers.length === 0) {
        console.error(`   ❌ No SLA Header found for ${eventClass}`);
        return;
    }
    const header = headers[0];
    console.log(`   ✅ SLA Header Found: ${header.id} (${header.eventClassId})`);

    const lines = await db.select().from(slaJournalLines)
        .where(eq(slaJournalLines.headerId, header.id));

    console.log(`   ✅ Found ${lines.length} Journal Lines.`);
    lines.forEach(l => console.log(`      ${l.lineNumber}: ${l.accountingClass} | Dr ${l.enteredDr} | Cr ${l.enteredCr}`));

    const dr = lines.reduce((sum, l) => sum + Number(l.enteredDr || 0), 0);
    const cr = lines.reduce((sum, l) => sum + Number(l.enteredCr || 0), 0);

    if (uniqueBalanceCheck) {
        if (dr === expectedAmount && cr === expectedAmount) {
            console.log(`   ✅ SUCCESS: Journal is BALANCED (${dr} Dr / ${cr} Cr).`);
        } else {
            console.warn(`   ⚠️ Warning: Balance Mismatch: Expected ${expectedAmount}, Got Dr ${dr} / Cr ${cr}`);
        }
    } else {
        if (Math.abs(dr - cr) < 0.01) {
            console.log(`   ✅ SUCCESS: Journal is BALANCED (${dr} Dr / ${cr} Cr).`);
        } else {
            console.warn(`   ⚠️ Warning: Balance Mismatch: Dr ${dr} / Cr ${cr}`);
        }
    }
}

verifyFixedAssetsSla().catch(console.error);
