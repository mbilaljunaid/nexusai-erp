
import { db } from "../server/db";
import { hrmTimeRules, hrmAccrualPolicies } from "../shared/schema/time_rules"; // Verify path
import { TimeLaborService } from "../server/services/TimeLaborService";
import { TimeRuleEngine } from "../server/services/TimeRuleEngine";
import { hrPersons } from "../shared/schema/hr_worker";
import { hrmTimePeriods } from "../shared/schema/time_labor";

async function verifyTimeRules() {
    console.log("🕰️ Verifying Advanced Time Rules (Tier 1)...");
    const tenantId = "test_rules_" + Date.now();

    // 1. Setup Rule: Night Shift Differential (+$2.00/hr starting 18:00)
    console.log("\n[1] Creating Rule: Night Shift Premium...");
    const [rule] = await db.insert(hrmTimeRules).values({
        tenantId,
        name: "Night Shift Differential",
        code: "NIGHT_DIFF_" + Date.now(),
        ruleType: "DIFFERENTIAL",
        startTime: "18:00",
        endTime: "06:00",
        flatRateAdd: "2.00",
        status: "ACTIVE"
    }).returning();
    console.log(`✅ Rule Created: ${rule.name} (+$${rule.flatRateAdd}/hr after ${rule.startTime})`);

    // 2. Setup Context (Person, Period, Timesheet)
    console.log("\n[2] Setting up Worker & Timesheet...");
    const [person] = await db.insert(hrPersons).values({
        tenantId, personNumber: "EMP-RULE-" + Date.now(), firstName: "Night", lastName: "Worker"
    }).returning();

    const period = await TimeLaborService.createTimePeriod(tenantId, "Rule Test Period", "2026-03-01", "2026-03-07");
    const sheet = await TimeLaborService.getOrCreateTimesheet(tenantId, person.id, period.id);

    // 3. Log Time (19:00 - 23:00 = 4 Hours)
    // Should trigger premium because it starts after 18:00
    console.log("\n[3] Logging Night Shift (4 Hours)...");
    const date = "2026-03-02";
    const entry = await TimeLaborService.logTime({
        tenantId,
        timesheetId: sheet.id,
        date: date,
        startTime: `${date}T19:00:00Z`,
        endTime: `${date}T23:00:00Z`,
        durationMinutes: 240 // 4 hours
    });
    console.log(`✅ Entry Logged: ${entry.durationMinutes / 60} hours`);

    // 4. Verify Premium Calculation
    // We can call applyPremiums manually to see output if logTime didn't await (it does).
    // The service logs output, but to truly verify, we'd check a "Premium Result" table. 
    // In V1, TimeRuleEngine logs to console. We will rely on console output match.
    // Ideally we return the premium value.

    console.log("\n[4] Re-Evaluating Rules...");
    const premium = await TimeRuleEngine.applyPremiums(tenantId, entry.id);

    // 4 hours * $2.00 = $8.00
    if (premium === 8.00) {
        console.log(`✅ SUCCESS: Calculated Premium $${premium.toFixed(2)} (Matches expected $8.00)`);
    } else {
        console.error(`❌ FAILURE: Calculated $${premium}, expected $8.00`);
        process.exit(1);
    }

    console.log("\n🎉 TIME RULES VERIFIED");

    // 5. Verify Accrual Logic (Tenure Based)
    console.log("\n[5] Verifying Tenure-Based Accrual...");
    // Create Policy: >5 Years (60mo) = 20 days/yr
    await db.insert(hrmAccrualPolicies).values({
        tenantId,
        name: "Senior Vacation",
        leaveType: "VACATION",
        minTenureMonths: 60,
        accrualRatePerYear: 20,
        maxCapDays: 40,
        status: "ACTIVE"
    });

    // Simulate 61 months tenure
    const accrual = await TimeRuleEngine.calculateAccrual(tenantId, person.id, 61);

    if (accrual && accrual.dailyAccrual > 0.05) {
        console.log(`✅ SUCCESS: Accrual Match for 5+ Years: ${(accrual.dailyAccrual * 365).toFixed(0)} days/yr`);
    } else {
        console.error(`❌ FAILURE: Accrual Logic Failed`, accrual);
        process.exit(1);
    }

    process.exit(0);
}

verifyTimeRules().catch(console.error);
