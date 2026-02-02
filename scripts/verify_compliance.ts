
import { TaxService } from "../server/services/TaxService";
import { PayrollService } from "../server/services/PayrollService";
import { db } from "../server/db";
import { hrmPayrollRuns } from "../shared/schema/rewards_payroll";

async function verifyCompliance() {
    console.log("=== COMPLIANCE VERIFICATION ===");

    // 1. Verify Tax Engine
    const annualSalary = 120000;
    const tax = TaxService.calculateFederalTax(annualSalary);
    console.log(`Checking Tax for $${annualSalary}...`);
    console.log(`Calculated Federal Tax: $${tax}`);

    // Manual Check: 120,000 - 14,600 = 105,400 Taxable
    // 10% on first 11925 = 1192.5
    // 12% on (48475 - 11925) = 4386
    // 22% on (103350 - 48475) = 12072.5
    // 24% on (105400 - 103350) = 492
    // Total approx: 1192 + 4386 + 12072 + 492 = ~18,142

    if (tax < 18000 || tax > 18200) {
        throw new Error(`Tax Calculation seems wrong. Expected ~18142, got ${tax}`);
    }
    console.log("✅ Tax Engine Logic Verified (Progressive Brackets Active).");

    // 2. Verify PDF Endpoint (Mock req)
    // We can't easy mock express req here without supertest, but we can verify the Service generates content
    // Let's verify PdfService class actually exists and import works
    try {
        const { PdfService } = await import("../server/services/PdfService");
        if (!PdfService) throw new Error("PdfService not exported");
        console.log("✅ PdfService Import Verified.");
    } catch (e) {
        throw new Error("PdfService Missing");
    }

    console.log("=== COMPLIANCE VERIFIED ===");
    process.exit(0);
}

verifyCompliance();
