
import { db } from "../server/db";
import { TimeLaborService } from "../server/services/TimeLaborService";
import { hrmLeaveBalances } from "../shared/schema/time_labor";
import { eq, and } from "drizzle-orm";

const MOCK_TENANT = "test-tenant-wfm-001";
const MOCK_PERSON = "3ebd9ddb-1566-418d-a0d6-9c773861acc4";

async function verifyAccruals() {
    console.log("Starting Accrual Verification...");

    // 1. CLEAR EXISTING BALANCES for clean state
    await db.delete(hrmLeaveBalances).where(and(
        eq(hrmLeaveBalances.tenantId, MOCK_TENANT),
        eq(hrmLeaveBalances.personId, MOCK_PERSON)
    ));
    console.log("Cleared existing balances.");

    // 2. CHECK INITIAL (Should be empty)
    let balances = await TimeLaborService.getLeaveBalances(MOCK_TENANT, MOCK_PERSON);
    console.log("Initial Balances:", balances.length === 0 ? "PASSED (Empty)" : "FAILED");

    // 3. ADD ACCRUAL
    console.log("Adding Accrual: 10 hrs Vacation...");
    await TimeLaborService.addAccrual(MOCK_TENANT, MOCK_PERSON, "VACATION", 10);

    balances = await TimeLaborService.getLeaveBalances(MOCK_TENANT, MOCK_PERSON);
    const vacation = balances.find(b => b.leaveType === "VACATION");
    console.log("Vacation Balance (Expect 10):", vacation?.balanceHours, Number(vacation?.balanceHours) === 10 ? "PASSED" : "FAILED");

    // 4. ADD MORE ACCRUAL
    console.log("Adding Accrual: 5 hrs Vacation...");
    await TimeLaborService.addAccrual(MOCK_TENANT, MOCK_PERSON, "VACATION", 5);

    balances = await TimeLaborService.getLeaveBalances(MOCK_TENANT, MOCK_PERSON);
    const vacation2 = balances.find(b => b.leaveType === "VACATION");
    console.log("Vacation Balance (Expect 15):", vacation2?.balanceHours, Number(vacation2?.balanceHours) === 15 ? "PASSED" : "FAILED");

    // 5. DEDUCT LEAVE
    console.log("Deducting Leave: 8 hrs Vacation...");
    await TimeLaborService.deductLeave(MOCK_TENANT, MOCK_PERSON, "VACATION", 8);

    balances = await TimeLaborService.getLeaveBalances(MOCK_TENANT, MOCK_PERSON);
    const vacation3 = balances.find(b => b.leaveType === "VACATION");
    console.log("Vacation Balance (Expect 7):", vacation3?.balanceHours, Number(vacation3?.balanceHours) === 7 ? "PASSED" : "FAILED");

    // 6. ADD SICK LEAVE
    console.log("Adding Accrual: 4 hrs Sick...");
    await TimeLaborService.addAccrual(MOCK_TENANT, MOCK_PERSON, "SICK", 4);

    balances = await TimeLaborService.getLeaveBalances(MOCK_TENANT, MOCK_PERSON);
    const sick = balances.find(b => b.leaveType === "SICK");
    console.log("Sick Balance (Expect 4):", sick?.balanceHours, Number(sick?.balanceHours) === 4 ? "PASSED" : "FAILED");

    console.log("Verification Complete.");
    process.exit(0);
}

verifyAccruals().catch(console.error);
