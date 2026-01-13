import { PpmService } from "../server/services/PpmService";

async function verifyPpmPerformance() {
    const ppm = new PpmService();
    console.log("📊 Verifying PPM Performance & EVM Analytics...");

    try {
        // 1. Setup Capital Project with Budget
        const project = await ppm.createProject({
            projectNumber: `EVM-PROJ-${Date.now()}`,
            name: "Data Center Construction (EVM)",
            projectType: "CAPITAL",
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),   // 30 days from now
            budget: "10000.00",
            percentComplete: "50.00", // 50% progress reported
            status: "ACTIVE"
        });
        console.log(`✅ Project Created: ${project.projectNumber} with $10k Budget`);

        // 2. Setup Task
        const task = await ppm.createTask({
            projectId: project.id,
            taskNumber: "T1",
            name: "Foundation Work",
            capitalizableFlag: true,
            startDate: new Date()
        });

        // 3. Setup Burden Schedule (25% Overhead)
        const expType = await ppm.createExpenditureType(`Materials-EVM-${Date.now()}`, "Currency");
        const schedule = await ppm.createBurdenSchedule({ name: `EVM-Schedule-${Date.now()}` });
        await ppm.addBurdenRule({
            scheduleId: schedule.id,
            expenditureTypeId: expType.id,
            multiplier: "0.25"
        });

        // Update task to use the schedule
        const { db } = await import("../server/db");
        const { ppmTasks } = await import("@shared/schema");
        const { eq } = await import("drizzle-orm");
        await db.update(ppmTasks).set({ burdenScheduleId: schedule.id }).where(eq(ppmTasks.id, task.id));

        // 4. Ingest Costs ($4,000 Raw)
        const [item] = await ppm.importExpenditureItems([{
            taskId: task.id,
            expenditureTypeId: expType.id,
            expenditureItemDate: new Date(),
            quantity: "1.00",
            rawCost: "4000.00",
            transactionSource: "MANUAL",
            status: "UNCOSTED"
        }]);

        // 5. Apply Burdening ($4,000 * 1.25 = $5,000 AC)
        const costedItem = await ppm.applyBurdening(item.id);
        console.log(`✅ Cost Ingested & Burdened: AC = ${costedItem.burdenedCost}`);

        // 6. Run Performance Engine
        console.log("🔄 Running EVA Calculation...");
        const performance = await ppm.getProjectPerformance(project.id);
        const { metrics } = performance;

        console.log("--- EVM Results ---");
        console.log(`Budget (BAC): ${metrics.budget}`);
        console.log(`Actual Cost (AC): ${metrics.actualCost}`);
        console.log(`Planned Value (PV): ${metrics.plannedValue}`);
        console.log(`Earned Value (EV): ${metrics.earnedValue}`);
        console.log(`CPI: ${metrics.cpi}`);
        console.log(`SPI: ${metrics.spi}`);
        console.log(`EAC: ${metrics.eac}`);
        console.log(`ETC: ${metrics.etc}`);

        // 7. Validation
        if (parseFloat(metrics.earnedValue.toString()) !== 5000) throw new Error("EV Calculation Mismatch");
        if (parseFloat(metrics.actualCost.toString()) !== 5000) throw new Error("AC Calculation Mismatch");
        if (parseFloat(metrics.cpi.toString()) !== 1.0) throw new Error("CPI Mismatch (Expected 1.0)");

        console.log("✅ PPM Performance Verification Successful!");
        process.exit(0);
    } catch (error: any) {
        console.error("❌ Verification Failed:", error.message || error);
        process.exit(1);
    }
}

verifyPpmPerformance();
