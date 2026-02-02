
import { db } from "../server/db";
import { hrmTimeEntries, hrmTimeSheets, hrmTimePeriods } from "../shared/schema/time_labor";
import { hrPersons } from "../shared/schema/hr_worker";
import { hrOrganizations } from "../shared/schema/hr_structures";
import { TimeAIService } from "../server/services/TimeAIService";
import { addDays, subDays, format } from "date-fns";

async function verifyLaborIntelligence() {
    console.log("🤖 Verifying Phase 39: Labor Intelligence...");

    const tenantId = "test_tenant_ai_" + Date.now();

    // 1. Setup Master Data
    const [dept] = await db.insert(hrOrganizations).values({
        tenantId,
        name: "AI Ops",
        classificationCode: "DEPT", // Using generic organization table with classification
        activeStatus: "ACTIVE"
    }).returning();

    const [person] = await db.insert(hrPersons).values({
        tenantId,
        personNumber: "AI-" + Date.now(), // Required field
        firstName: "Robo",
        lastName: "Worker",
        email: `robo${Date.now()}@test.com`,
        // departmentId: dept.id // Removed as it's not in hrPersons
    }).returning();

    console.log(`Initialized Dept: ${dept.name}, Person: ${person.firstName}`);

    // 1b. Create Time Period & Timesheet (Required for Entries)
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);

    const [period] = await db.insert(hrmTimePeriods).values({
        tenantId,
        name: "Verification Period",
        startDate: format(thirtyDaysAgo, 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
        status: "OPEN"
    }).returning();

    const [timesheet] = await db.insert(hrmTimeSheets).values({
        tenantId,
        personId: person.id,
        periodId: period.id,
        status: "APPROVED"
    }).returning();

    // 2. Seed History for Forecasting (Last 30 days)
    console.log("Seeding 30 days of history...");

    for (let i = 30; i > 0; i--) {
        const historicalDate = subDays(today, i);
        const start = new Date(historicalDate);
        start.setHours(9, 0, 0, 0);
        const end = new Date(historicalDate);
        end.setHours(17, 0, 0, 0);

        // Log 8 hours every day
        await db.insert(hrmTimeEntries).values({
            tenantId,
            timesheetId: timesheet.id, // Linked to timesheet
            date: format(historicalDate, 'yyyy-MM-dd'),
            startTime: start, // Date object
            endTime: end,     // Date object
            durationMinutes: 480, // 8 hours * 60
            status: "APPROVED",
            timeType: "REGULAR"
        });
    }

    // 3. Test Forecasting
    const targetDate = format(today, 'yyyy-MM-dd');
    console.log(`Generating forecast for ${targetDate}...`);
    const forecast = await TimeAIService.generateScheduleForecast(tenantId, dept.id, targetDate);

    console.log("Forecast Result:", forecast);

    if (!forecast || Number(forecast.projectedHours) <= 0) {
        throw new Error("Forecast generation failed or returned zero hours.");
    }
    console.log("✅ Forecasting Engine Verified");

    // 4. Test Fatigue Risk (Anomaly)
    // We already seeded 30 consecutive days above, so streak should be > 7
    console.log("Scanning for Fatigue Risk...");
    const anomaly = await TimeAIService.predictFatigueRisk(tenantId, person.id);

    console.log("Anomaly Result:", anomaly);

    if (!anomaly || anomaly.type !== "FATIGUE_RISK") {
        throw new Error("Failed to detect Fatigue Risk despite 30 consecutive work days.");
    }

    console.log("✅ Fatigue Risk Detection Verified");

    console.log("🎉 Phase 39 Verification COMPLETE!");
    process.exit(0);
}

verifyLaborIntelligence().catch(err => {
    console.error(err);
    process.exit(1);
});
