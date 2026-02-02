
import { treasuryService } from "../server/services/TreasuryService";
import { db } from "../server/db";
import { treasuryDeals, treasuryCounterparties, treasuryInstallments } from "@shared/schema";
import { eq } from "drizzle-orm";

async function verifyTreasuryPhase1() {
    console.log("🔍 Starting Treasury Phase 1 Verification...");

    try {
        // 1. Setup - Create a Counterparty
        console.log("Step 1: Creating a Counterparty...");
        const cp = await treasuryService.createCounterparty({
            name: "Goldman Sachs ERP Test",
            type: "BANK",
            swiftCode: "GSUS33XX",
            shortName: "GS"
        });
        console.log(`✅ Counterparty created: ${cp.id}`);

        // 2. Create a DEBT Deal (Loan)
        console.log("Step 2: Creating a Debt Deal (Loan)...");
        const loan = await treasuryService.createDeal({
            dealNumber: "LOAN-2026-001",
            type: "DEBT",
            subType: "TERM_LOAN",
            counterpartyId: cp.id,
            principalAmount: "1200000.00",
            currency: "USD",
            interestRate: "6.0",
            interestType: "FIXED",
            startDate: new Date(),
            termMonths: 12,
            status: "DRAFT"
        });
        console.log(`✅ Loan Deal created: ${loan.id}`);

        // 3. Verify Installments
        console.log("Step 3: Verifying Installment Generation...");
        const { installments } = await treasuryService.getDeal(loan.id);

        if (installments.length !== 12) {
            throw new Error(`Expected 12 installments, but found ${installments.length}`);
        }

        const firstInstallment = installments[0];
        console.log(`✅ First Installment: Due=${firstInstallment.dueDate}, Total=${firstInstallment.totalAmount}, Interest=${firstInstallment.interestAmount}`);

        // Verify total principal matches (approximately due to rounding)
        const totalPrincipal = installments.reduce((sum: number, inst: any) => sum + Number(inst.principalAmount), 0);
        console.log(`📊 Sum of Principal: ${totalPrincipal.toFixed(2)} (Actual: 1200000.00)`);

        if (Math.abs(totalPrincipal - 1200000) > 1) {
            throw new Error(`Principal sum mismatch: ${totalPrincipal}`);
        }

        // 4. Update Status
        console.log("Step 4: Confirming Deal...");
        const confirmed = await treasuryService.updateDealStatus(loan.id, "CONFIRMED");
        if (confirmed.status !== "CONFIRMED") {
            throw new Error("Failed to update status to CONFIRMED");
        }
        console.log("✅ Deal confirmed successfully.");

        // 5. Create an INVESTMENT Deal
        console.log("Step 5: Creating an Investment Deal...");
        const investment = await treasuryService.createDeal({
            dealNumber: "INV-2026-001",
            type: "INVESTMENT",
            subType: "CD",
            counterpartyId: cp.id,
            principalAmount: "500000.00",
            currency: "USD",
            interestRate: "4.5",
            startDate: new Date(),
            maturityDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months later
            status: "ACTIVE"
        });
        console.log(`✅ Investment Deal created: ${investment.id}`);

        console.log("\n🎉 Treasury Phase 1 Verification Passed 100%!");

        // Cleanup (Optional - for this test we keep data for UI inspection)
        // await db.delete(treasuryInstallments).where(eq(treasuryInstallments.dealId, loan.id));
        // await db.delete(treasuryDeals).where(eq(treasuryDeals.id, loan.id));
        // await db.delete(treasuryDeals).where(eq(treasuryDeals.id, investment.id));
        // await db.delete(treasuryCounterparties).where(eq(treasuryCounterparties.id, cp.id));

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

verifyTreasuryPhase1();
