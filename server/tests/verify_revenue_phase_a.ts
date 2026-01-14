import { revenueService } from "../services/RevenueService";
import { db } from "../db";
import { revenueSourceEvents, revenueContracts } from "../../shared/schema/revenue";
import { revenuePeriods } from "../../shared/schema/revenue_periods";
import { revenueGlAccounts } from "../../shared/schema/revenue_accounting";
import { slaEventClasses } from "../../shared/schema/sla";
import { eq, and, lte, gte } from "drizzle-orm";

async function verifyPhaseA() {
    console.log("🔍 Verifying Revenue Phase A: Foundation & Integration...");

    // 0. Ensure Open Periods for the whole year exist
    console.log("Step 0: Ensuring open revenue periods for the year exist...");
    for (let i = 0; i < 12; i++) {
        const d = new Date("2026-01-01");
        d.setMonth(d.getMonth() + i);
        const periodName = `${d.toLocaleString('default', { month: 'short' })}-26`;
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);

        const existing = await db.query.revenuePeriods.findFirst({
            where: and(
                eq(revenuePeriods.ledgerId, "L1"),
                eq(revenuePeriods.periodName, periodName)
            )
        });

        if (!existing) {
            await db.insert(revenuePeriods).values({
                periodName,
                startDate: start,
                endDate: end,
                status: "Open",
                ledgerId: "L1"
            });
        } else if (existing.status !== "Open") {
            await db.update(revenuePeriods).set({ status: "Open" }).where(eq(revenuePeriods.id, existing.id));
        }
    }

    // Ensure Accounting Setup exists (Always Refresh for Verification)
    console.log("Refreshing revenue accounting setup...");
    const validCCID = "296c70e5-b73b-48bf-a263-32d66701b7da";

    // Check if it exists
    const existingAcct = await db.query.revenueGlAccounts.findFirst({
        where: eq(revenueGlAccounts.ledgerId, "L1")
    });

    if (existingAcct) {
        await db.update(revenueGlAccounts)
            .set({
                revenueAccountCCID: validCCID,
                deferredRevenueAccountCCID: validCCID,
                contractAssetAccountCCID: validCCID,
                clearingAccountCCID: validCCID
            })
            .where(eq(revenueGlAccounts.id, existingAcct.id));
    } else {
        await db.insert(revenueGlAccounts).values({
            ledgerId: "L1",
            revenueAccountCCID: validCCID,
            deferredRevenueAccountCCID: validCCID,
            contractAssetAccountCCID: validCCID,
            clearingAccountCCID: validCCID
        });
    }

    // Ensure SLA Event Class exists
    const eventClass = await db.query.slaEventClasses.findFirst({
        where: eq(slaEventClasses.id, "REVENUE_RECOGNITION")
    });

    if (!eventClass) {
        console.log("Seeding REVENUE_RECOGNITION event class...");
        await db.insert(slaEventClasses).values({
            id: "REVENUE_RECOGNITION",
            applicationId: "REV",
            name: "Revenue Recognition",
            description: "Revenue recognition journal entries",
            enabledFlag: true
        });
    }

    const testEvent = {
        sourceSystem: "CRM_TEST",
        sourceId: `ORD-${Date.now()}`,
        eventType: "Booking",
        customerId: "CUST-TEST-001",
        ledgerId: "L1",
        amount: 5000,
        currency: "USD",
        eventDate: new Date(),
        referenceNumber: "SO-12345", // Phase A field
        legalEntityId: "LE-EUROPE",  // Phase A field
        orgId: "OU-LONDON"           // Phase A field
    };

    try {
        // 1. Process Event
        console.log("Step 1: Processing source event with Phase A metadata...");
        const result = await revenueService.processSourceEvent(testEvent);
        console.log(`✅ Event processed. Created Contract: ${result.contractId}`);

        // 2. Verify Event Metadata
        const [event] = await db.select().from(revenueSourceEvents).where(eq(revenueSourceEvents.sourceId, testEvent.sourceId));
        if (event.referenceNumber === "SO-12345" && event.legalEntityId === "LE-EUROPE") {
            console.log("✅ Event metadata (Reference, Entity) verified in database.");
        } else {
            throw new Error(`Event metadata mismatch: ${JSON.stringify(event)}`);
        }

        // 3. Verify Contract Metadata
        const contract = await db.query.revenueContracts.findFirst({
            where: eq(revenueContracts.id, result.contractId)
        });

        if (contract && contract.versionNumber === 1 && contract.legalEntityId === "LE-EUROPE" && contract.orgId === "OU-LONDON") {
            console.log("✅ Contract metadata (Entity, Org, Version) verified.");
        } else {
            throw new Error(`Contract metadata mismatch: ${JSON.stringify(contract)}`);
        }

        // 4. Verify Version Increment on Modification
        console.log("Step 2: Testing version increment on modification...");
        await revenueService.processContractModification(result.contractId, {
            newTotalValue: 6000,
            reason: "Price Adjustment"
        });

        const updatedContract = await db.query.revenueContracts.findFirst({
            where: eq(revenueContracts.id, result.contractId)
        });

        if (updatedContract && updatedContract.versionNumber === 2 && parseFloat(updatedContract.totalTransactionPrice) === 6000) {
            console.log("✅ Version increment verified (v1 -> v2).");
        } else {
            throw new Error(`Version increment failed: ${JSON.stringify(updatedContract)}`);
        }

        console.log("🎊 Phase A Verification SUCCESS!");
    } catch (e) {
        console.error("❌ Verification FAILED:", e);
        process.exit(1);
    }
}

verifyPhaseA().then(() => process.exit(0));
