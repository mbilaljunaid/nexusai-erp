
import "dotenv/config";
import { db } from "../server/db";
import { TimeLaborService } from "../server/services/TimeLaborService";
import { hrmLeaveBalances, hrmAccrualPolicies } from "../shared/schema/time_labor";
import { hrPersons } from "../shared/schema/hr_worker";
import { eq, and } from "drizzle-orm";

const TENANT = "test-tenant-verify-adv";

async function verifyAdvancedAccruals() {
    console.log("Starting Advanced Accrual Verification...");

    // 1. CLEANUP
    await db.delete(hrmLeaveBalances).where(eq(hrmLeaveBalances.tenantId, TENANT));
    await db.delete(hrmAccrualPolicies).where(eq(hrmAccrualPolicies.tenantId, TENANT));
    await db.delete(hrPersons).where(eq(hrPersons.tenantId, TENANT));
    console.log("Cleanup Complete.");

    // 2. SETUP POLICY
    await db.insert(hrmAccrualPolicies).values({
        tenantId: TENANT,
        name: "Standard Vacation",
        leaveType: "VACATION",
        accrualRate: "10.00",
        vestingMonths: 3,
        maxCap: "25.00", // Low cap for testing
        frequency: "MONTHLY"
    });
    console.log("Policy Created.");

    // 3. SETUP PERSONS
    const now = new Date();
    // Person A: Vesty (4 months ago)
    const dateVested = new Date();
    dateVested.setMonth(now.getMonth() - 4);

    // Person B: Newbie (1 month ago)
    const dateNewbie = new Date();
    dateNewbie.setMonth(now.getMonth() - 1);

    const [pA] = await db.insert(hrPersons).values({
        tenantId: TENANT,
        firstName: "Vesty", lastName: "McVest", personNumber: "V100",
        createdAt: dateVested
    }).returning();

    const [pB] = await db.insert(hrPersons).values({
        tenantId: TENANT,
        firstName: "Newbie", lastName: "NoVest", personNumber: "N100",
        createdAt: dateNewbie
    }).returning();
    console.log(`Persons Created: ${pA.id} (Vested), ${pB.id} (Not Vested)`);

    // 4. RUN CYCLE 1
    console.log("\n--- Running Cycle 1 ---");
    await TimeLaborService.runAccrualCycle(TENANT);

    // CHECK A
    let balA = await TimeLaborService.getLeaveBalances(TENANT, pA.id);
    let vacA = balA.find(b => b.leaveType === "VACATION");
    console.log(`Person A Balance: ${vacA?.balanceHours} (Expected 10.00) -> ${Number(vacA?.balanceHours) === 10 ? "PASSED" : "FAILED"}`);

    // CHECK B
    let balB = await TimeLaborService.getLeaveBalances(TENANT, pB.id);
    console.log(`Person B Balance Count: ${balB.length} (Expected 0) -> ${balB.length === 0 ? "PASSED" : "FAILED"}`);

    // 5. RUN CYCLE 2
    console.log("\n--- Running Cycle 2 ---");
    await TimeLaborService.runAccrualCycle(TENANT);

    balA = await TimeLaborService.getLeaveBalances(TENANT, pA.id);
    vacA = balA.find(b => b.leaveType === "VACATION");
    console.log(`Person A Balance: ${vacA?.balanceHours} (Expected 20.00) -> ${Number(vacA?.balanceHours) === 20 ? "PASSED" : "FAILED"}`);

    // 6. RUN CYCLE 3 (Hit Cap?)
    console.log("\n--- Running Cycle 3 (Cap Test) ---");
    // Should be 30, but cap is 25
    await TimeLaborService.runAccrualCycle(TENANT);

    balA = await TimeLaborService.getLeaveBalances(TENANT, pA.id);
    vacA = balA.find(b => b.leaveType === "VACATION");
    console.log(`Person A Balance: ${vacA?.balanceHours} (Expected 25.00 Cap) -> ${Number(vacA?.balanceHours) === 25 ? "PASSED" : "FAILED"}`);

    console.log("\nVerification Complete.");
    process.exit(0);
}

verifyAdvancedAccruals().catch(console.error);
