
import "dotenv/config";
import { db } from "../server/db";
import { leaseHeaders, leasePayments, leaseSchedules } from "../shared/schema/lease";
import { leaseCalculationsService } from "../server/services/LeaseCalculationsService";
import { eq } from "drizzle-orm";

async function verifyLeaseLogic() {
    console.log("🔍 Starting Lease Logic Verification...");

    // 1. Setup Data
    const leaseNumber = `VERIFY-${Date.now()}`;
    const commencement = new Date("2025-01-01");
    const expiration = new Date("2029-12-31"); // 5 Years
    const discountRate = 0.05; // 5%

    // Create Header
    const [header] = await db.insert(leaseHeaders).values({
        leaseNumber,
        description: "Verification Test Lease",
        vendorId: "V-TEST",
        commencementDate: commencement,
        expirationDate: expiration,
        termMonths: 60,
        discountRate: discountRate.toString(),
        status: "ACTIVE"
    }).returning();

    console.log(`✅ Created Lease Header: ${header.id}`);

    // Create Payments (5 years * 12 months = 60 payments of $1000)
    const payments = [];
    // Insert one payment record representing the stream
    const [paymentStream] = await db.insert(leasePayments).values({
        leaseId: header.id,
        amount: "1000",
        startDate: commencement,
        endDate: expiration,
        frequency: "MONTHLY",
        paymentType: "FIXED"
    }).returning();
    payments.push(paymentStream);

    console.log(`✅ Created Payment Stream`);

    // 2. Test Calculation Service (NPV)
    // Formula: PV = PMT * [(1 - (1 + r)^-n) / r]
    // r = 0.05 / 12 = 0.0041666...
    // n = 60
    // PMT = 1000
    // Expected NPV approx: 1000 * 52.99 = 52,990.

    // We will trust the service logic but verify it matches the detailed schedule sum roughly or run independent calc.
    const npv = leaseCalculationsService.calculateNPV([paymentStream], discountRate, commencement);
    console.log(`ℹ️ Calculated NPV: ${npv}`);

    if (npv < 50000 || npv > 60000) {
        console.error("❌ NPV Calculation seems off. Expected ~53k");
        process.exit(1);
    }

    // 3. Test Schedule Generation
    const schedule = leaseCalculationsService.generateSchedule(header, [paymentStream], npv);

    console.log(`ℹ️ Generated ${schedule.length} periods.`);

    if (schedule.length !== 60) {
        console.error(`❌ Expected 60 periods, got ${schedule.length}`);
        process.exit(1);
    }

    const lastPeriod = schedule[59];
    console.log("Last Period:", lastPeriod);

    // Verify Liability Amortizes to Near Zero
    const finalLiability = Number(lastPeriod.closingLiability);
    if (Math.abs(finalLiability) > 1.0) {
        console.error(`❌ Liability did not amortize to zero. Remainder: ${finalLiability}`);
        process.exit(1);
    }

    // Verify ROU Amortizes to Near Zero
    const finalROU = Number(lastPeriod.rouClosingBalance);
    if (Math.abs(finalROU) > 1.0) {
        console.error(`❌ ROU Asset did not amortize to zero. Remainder: ${finalROU}`);
        process.exit(1);
    }

    console.log("✅ SUCCESS: Lease Logic Verified (NPV & Amortization correct).");

    // Cleanup
    await db.delete(leaseSchedules).where(eq(leaseSchedules.leaseId, header.id));
    await db.delete(leasePayments).where(eq(leasePayments.leaseId, header.id));
    await db.delete(leaseHeaders).where(eq(leaseHeaders.id, header.id));
    console.log("✅ Cleanup Complete");
}

verifyLeaseLogic().catch(console.error);
