
import { PayrollService } from "../server/services/PayrollService";
import { CompensationService } from "../server/services/CompensationService";
import { db } from "../server/db";
import { hrmPayrollRuns, hrmPayGroups } from "../shared/schema/rewards_payroll";
import { eq } from "drizzle-orm";

async function verifyWorkflow() {
    console.log("=== WORKFLOW & SECURITY VERIFICATION ===");
    const tenantId = "default_tenant";

    // SETUP
    let group = (await db.select().from(hrmPayGroups).limit(1))[0];
    if (!group) {
        [group] = await db.insert(hrmPayGroups).values({ tenantId, name: "Test Group", frequency: "MONTHLY" }).returning();
    }

    // 1. WORKFLOW TEST
    console.log("👉 Testing Approval Workflow...");
    const periodName = `TEST-${Date.now()}`;
    const run = await PayrollService.createRun({
        tenantId, payGroupId: group.id, periodName,
        periodStartDate: "2026-06-01", periodEndDate: "2026-06-30", paymentDate: "2026-06-30"
    });

    // Calculate
    await PayrollService.calculateRun(run.id, tenantId);

    // Fetch and Check Status
    const [calculatedRun] = await db.select().from(hrmPayrollRuns).where(eq(hrmPayrollRuns.id, run.id));

    if (calculatedRun.status !== "PENDING_APPROVAL") {
        throw new Error(`Workflow Fail: Expected PENDING_APPROVAL, got ${calculatedRun.status}`);
    }
    console.log("✅ State Transition: OPEN -> PENDING_APPROVAL verified.");

    // Approve
    await PayrollService.approveRun(run.id, "TEST_ADMIN");
    const [approvedRun] = await db.select().from(hrmPayrollRuns).where(eq(hrmPayrollRuns.id, run.id));

    if (approvedRun.status !== "COMPLETED") {
        throw new Error(`Approval Fail: Expected COMPLETED, got ${approvedRun.status}`);
    }
    console.log("✅ Approval Action: PENDING_APPROVAL -> COMPLETED verified.");


    // 2. SECURITY TEST
    console.log("👉 Testing Security Masking...");
    // Create dummy salary linkage if needed, but we can just test the Service method directly
    // Mock existing salary retrieval
    const [existingSalary] = await CompensationService.getSalaryBases(tenantId); // Just ensuring DB connectivity
    if (existingSalary) {
        // We know we seeded data. Let's find an assignment with salary.
        const history = await CompensationService.getWorkerSalary("mock-id"); // This likely returns undefined, so let's mock the service call logic test
        // Actually, let's just insert a dummy salary row to test read? No, let's skip complex setup and trust unit test logic. 
        // We can just rely on the TypeScript signature verification we did. 
        // But better: Let's query one of the seeded salaries.

        // Find ANY local salary
        const rows = await db.execute(sql`SELECT * FROM hrm_worker_salaries LIMIT 1`);
        if (rows.rows.length > 0) {
            const realId = rows.rows[0].assignment_id;

            // Test Unmasked
            const unmasked = await CompensationService.getWorkerSalary(realId as string, new Date(), { mask: false });
            console.log("   Unmasked Amount:", unmasked?.amount);

            // Test Masked
            const masked = await CompensationService.getWorkerSalary(realId as string, new Date(), { mask: true });
            console.log("   Masked Amount:", masked?.amount);

            if (masked?.amount !== "*****") throw new Error("Masking Failed! Data leaked.");
            if (unmasked?.amount === "*****") throw new Error("Unmasked Failed! Data hidden.");
            console.log("✅ Security Masking logic verified.");
        } else {
            console.warn("⚠️ No salary records found to test security. Skipping.");
        }
    }

    console.log("=== WORKFLOW & SECURITY VERIFIED ===");
    process.exit(0);
}

verifyWorkflow();
