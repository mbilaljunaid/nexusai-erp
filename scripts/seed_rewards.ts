
import { db } from "../server/db";
import { PayrollService } from "../server/services/PayrollService";
import { CompensationService } from "../server/services/CompensationService";
import { hrPersons, hrAssignments } from "../shared/schema/hr_worker";
import { hrmPayrollRuns, hrmPayrollRunResults, hrmPayGroups, hrmPayElements } from "../shared/schema/rewards_payroll";
import { hrmSalaryBases, hrmWorkerSalaries } from "../shared/schema/rewards_compensation";
import { eq } from "drizzle-orm";

async function seedRewards() {
    console.log("=== STARTING REWARDS SEEDING ===");
    const tenantId = "default_tenant"; // Use default to be visible in UI

    try {
        // 1. Ensure Elements Exist
        let basic = (await db.select().from(hrmPayElements).where(eq(hrmPayElements.name, "Basic Salary")))[0];
        if (!basic) basic = await PayrollService.createElement({ tenantId, name: "Basic Salary", classification: "EARNINGS", taxable: true });

        let tax = (await db.select().from(hrmPayElements).where(eq(hrmPayElements.name, "Income Tax")))[0];
        if (!tax) tax = await PayrollService.createElement({ tenantId, name: "Income Tax", classification: "TAX" });

        let health = (await db.select().from(hrmPayElements).where(eq(hrmPayElements.name, "Health Insurance")))[0];
        if (!health) health = await PayrollService.createElement({ tenantId, name: "Health Insurance", classification: "DEDUCTION" });

        // 2. Ensure Pay Group
        let group = (await db.select().from(hrmPayGroups).where(eq(hrmPayGroups.name, "US Monthly")))[0];
        if (!group) {
            [group] = await db.insert(hrmPayGroups).values({ tenantId, name: "US Monthly", frequency: "MONTHLY" }).returning();
        }

        // 3. Find or Create Worker "John Payroll"
        let person = (await db.select().from(hrPersons).where(eq(hrPersons.email, "john.payroll@example.com")))[0];
        if (!person) {
            // If not found, rely on verify script's data or skip (assuming verification ran)
            // But for robustness, let's just pick the first person in the DB to seed data for
            const allPersons = await db.select().from(hrPersons).limit(1);
            if (allPersons.length === 0) {
                console.log("❌ No persons found to seed. Run basic seed first.");
                process.exit(1);
            }
            person = allPersons[0];
            console.log(`ℹ️ Worker not found specifically, seeding for ${person.firstName} ${person.lastName} (${person.id})`);
        }

        // 4. Get Assignment
        const [assignment] = await db.select().from(hrAssignments).where(eq(hrAssignments.personId, person.id));
        if (!assignment) {
            console.log("❌ No assignment found for person.");
            process.exit(1);
        }

        // 5. Ensure Salary
        const salary = await CompensationService.getWorkerSalary(assignment.id);
        if (!salary) {
            // Create a default salary if missing
            const [basis] = await db.select().from(hrmSalaryBases).limit(1);
            if (basis) {
                await CompensationService.assignSalary({
                    tenantId, assignmentId: assignment.id, salaryBasisId: basis.id, amount: "120000", currency: "USD", dateFrom: "2024-01-01"
                });
            }
        }

        // 6. Generate 2025 Runs (Jan - Dec)
        const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

        for (const m of months) {
            const periodName = `2025-${m}`;
            // Check if run exists
            const existing = await db.select().from(hrmPayrollRuns).where(eq(hrmPayrollRuns.periodName, periodName));
            if (existing.length > 0) continue;

            console.log(`   Creating run for ${periodName}...`);
            const run = await PayrollService.createRun({
                tenantId,
                payGroupId: group.id,
                periodName,
                periodStartDate: `2025-${m}-01`,
                periodEndDate: `2025-${m}-28`, // Simplified
                paymentDate: `2025-${m}-28`
            });

            // Calculate
            await PayrollService.calculateRun(run.id, tenantId);
        }

        console.log("✅ Seeding Complete: 2025 Payroll History Generated.");
        process.exit(0);

    } catch (err) {
        console.error("❌ Seeding Failed:", err);
        process.exit(1);
    }
}

seedRewards();
