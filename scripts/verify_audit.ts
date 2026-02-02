
import { PayrollService } from "../server/services/PayrollService";
import { CompensationService } from "../server/services/CompensationService";
import { PayrollAnalyticsService } from "../server/services/PayrollAnalyticsService";
import { db } from "../server/db";
import { hrmPayGroups, hrmPayElements } from "../shared/schema/rewards_payroll";
import { hrmSalaryBases } from "../shared/schema/rewards_compensation";
import { hrAssignments } from "../shared/schema/hr_worker";
import { eq, sql, and } from "drizzle-orm";

async function verifyAudit() {
    console.log("=== AI AUDIT VERIFICATION ===");
    // const tenantId = "default_tenant"; // Removed

    // 1. SETUP
    // Find an ACTIVE assignment and its Tenant
    const rows = await db.execute(sql`
        SELECT s.assignment_id, a.tenant_id 
        FROM hrm_worker_salaries s
        JOIN hr_assignments a ON s.assignment_id = a.id
        WHERE a.assignment_status = 'ACTIVE'
        LIMIT 1
    `);

    if (rows.rows.length === 0) {
        // Fallback or Exit
        console.warn("Skipping Audit Test - No Active Assignments found.");
        process.exit(0);
    }
    const assignmentId = rows.rows[0].assignment_id as string;
    const tenantId = rows.rows[0].tenant_id as string;
    console.log(`Using Assignment ${assignmentId} and Tenant ${tenantId}`);

    // Ensure Group
    let group = (await db.select().from(hrmPayGroups).where(eq(hrmPayGroups.tenantId, tenantId)).limit(1))[0];
    if (!group) {
        [group] = await db.insert(hrmPayGroups).values({ tenantId, name: "Audit Group", frequency: "MONTHLY" }).returning();
    }

    // Ensure Basic Taxable Element
    let element = (await db.select().from(hrmPayElements).where(and(eq(hrmPayElements.tenantId, tenantId), eq(hrmPayElements.classification, "EARNINGS"))).limit(1))[0];
    if (!element) {
        [element] = await db.insert(hrmPayElements).values({ tenantId, name: "Basic Salary", classification: "EARNINGS", taxable: true }).returning();
    }

    // Ensure Salary Basis
    let basis = (await db.select().from(hrmSalaryBases).where(eq(hrmSalaryBases.tenantId, tenantId)).limit(1))[0];
    if (!basis) {
        [basis] = await db.insert(hrmSalaryBases).values({
            tenantId, name: "Monthly USD", code: `BASIS_audit_${Date.now()}`,
            frequency: "MONTHLY", annualizationFactor: "12", currency: "USD"
        }).returning();
    }

    // 2. RUN 1 (BASELINE)
    const run1Name = `AUDIT-BASE-${Date.now()}`;
    const run1 = await PayrollService.createRun({
        tenantId, payGroupId: group.id, periodName: run1Name,
        periodStartDate: "2026-03-01", periodEndDate: "2026-03-31", paymentDate: "2026-03-31"
    });
    // Ensure salary is stable (e.g. 5000)
    await CompensationService.assignSalary({
        tenantId, assignmentId,
        amount: 5000,
        salaryBasisId: basis.id,
        currency: "USD",
        frequency: "MONTHLY",
        dateFrom: "2026-01-01" // Backdate to be active
    });
    await PayrollService.calculateRun(run1.id, tenantId);
    await PayrollService.approveRun(run1.id, "AUDIT_BOT"); // Must be completed to be history
    console.log("✅ Baseline Run Created & Approved.");

    // 3. CHANGE SALARY (VARIANCE > 15%)
    console.log("👉 Increasing Salary to trigger variance...");
    await CompensationService.assignSalary({
        tenantId, assignmentId,
        amount: 8000, // 60% Increase
        salaryBasisId: basis.id,
        currency: "USD",
        frequency: "MONTHLY",
        dateFrom: "2026-04-01"
    });

    // 4. RUN 2 (CURRENT)
    const run2Name = `AUDIT-CURR-${Date.now()}`;
    const run2 = await PayrollService.createRun({
        tenantId, payGroupId: group.id, periodName: run2Name,
        periodStartDate: "2026-04-01", periodEndDate: "2026-04-30", paymentDate: "2026-04-30"
    });
    const calcResult = await PayrollService.calculateRun(run2.id, tenantId);
    console.log(`✅ Run 2 Calculated. Processed: ${calcResult.processedCount}`);

    // 5. AUDIT
    console.log("👉 Running AI Audit...");
    const anomalies = await PayrollAnalyticsService.detectAnomalies(run2.id);

    // 6. ASSERT
    console.log("   Detected Anomalies:", anomalies.length);
    anomalies.forEach(a => console.log(`   - [${a.type}] ${a.description}`));

    const varianceAnomaly = anomalies.find(a => a.type === "HIGH_VARIANCE" && a.assignmentId === assignmentId);

    if (!varianceAnomaly) {
        throw new Error("AI Audit Failed: Variance detection missed the salary increase.");
    }

    console.log("✅ AI Audit Verification Passed: High Variance Detected.");
    process.exit(0);
}

verifyAudit();
