import { db } from "../server/db";
import { hrComplianceViolations } from "../shared/schema/hr_compliance";
import { ComplianceAnalyticsService } from "../server/modules/hr/services/ComplianceAnalyticsService";
import { sql } from "drizzle-orm";

async function verifyComplianceVelocity() {
    console.log("🔍 Verifying Compliance Velocity Analytics...");

    const tenantId = "test_tenant_" + Date.now();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();

    try {
        // 1. Seed Data: Create violations in different months
        console.log("🌱 Seeding test data...");

        // Helper to get date for X months ago
        const getDate = (monthsAgo: number) => {
            const d = new Date();
            d.setMonth(d.getMonth() - monthsAgo);
            return d;
        };

        const testData = [
            { createdAt: getDate(0), status: 'open', resolvedAt: null }, // Current Month: 1 Open
            { createdAt: getDate(0), status: 'resolved', resolvedAt: getDate(0) }, // Current Month: 1 Resolved
            { createdAt: getDate(1), status: 'open', resolvedAt: null }, // Last Month: 1 Open
            { createdAt: getDate(1), status: 'resolved', resolvedAt: getDate(1) }, // Last Month: 1 Resolved
            { createdAt: getDate(2), status: 'resolved', resolvedAt: getDate(2) }, // 2 Months Ago: 1 Resolved
            { createdAt: getDate(2), status: 'resolved', resolvedAt: getDate(2) }, // 2 Months Ago: Another Resolved
        ];

        for (const data of testData) {
            await db.insert(hrComplianceViolations).values({
                tenantId,
                ruleId: "ignore",
                eventId: "ignore",
                entityType: "PERSON",
                entityId: "test_entity",
                severity: "low",
                description: "Test Violation",
                status: data.status,
                createdAt: data.createdAt,
                resolvedAt: data.resolvedAt,
                remediationActions: []
            });
        }

        // 2. Execute Analytics Service
        console.log("📊 Fetching analytics...");
        const velocity = await ComplianceAnalyticsService.getComplianceVelocity(tenantId);

        console.log("📈 Velocity Result:", JSON.stringify(velocity, null, 2));

        // 3. Verify Results
        const currentMonthLabel = months[now.getMonth()];
        const lastMonthLabel = months[getDate(1).getMonth()];
        const twoMonthsAgoLabel = months[getDate(2).getMonth()];

        const current = velocity.find(v => v.month === currentMonthLabel);
        const last = velocity.find(v => v.month === lastMonthLabel);
        const twoAgo = velocity.find(v => v.month === twoMonthsAgoLabel);

        let valid = true;

        // Current Month: 2 created (1 open + 1 resolved), 1 resolved
        if (current?.opened !== 2) { console.error(`❌ Current Month Opened mismatch. Expected 2, got ${current?.opened}`); valid = false; }
        if (current?.resolved !== 1) { console.error(`❌ Current Month Resolved mismatch. Expected 1, got ${current?.resolved}`); valid = false; }

        // Last Month: 2 created, 1 resolved
        if (last?.opened !== 2) { console.error(`❌ Last Month Opened mismatch. Expected 2, got ${last?.opened}`); valid = false; }
        if (last?.resolved !== 1) { console.error(`❌ Last Month Resolved mismatch. Expected 1, got ${last?.resolved}`); valid = false; }

        // 2 Months Ago: 2 created, 2 resolved
        if (twoAgo?.opened !== 2) { console.error(`❌ 2 Months Ago Opened mismatch. Expected 2, got ${twoAgo?.opened}`); valid = false; }
        if (twoAgo?.resolved !== 2) { console.error(`❌ 2 Months Ago Resolved mismatch. Expected 2, got ${twoAgo?.resolved}`); valid = false; }

        if (valid) {
            console.log("✅ Verification Passed: Velocity metrics are correct.");
        } else {
            console.error("❌ Verification Failed: Metrics mismatch.");
            process.exit(1);
        }

    } catch (error) {
        console.error("❌ Test Failed:", error);
        process.exit(1);
    } finally {
        // Clean up
        await db.delete(hrComplianceViolations).where(sql`${hrComplianceViolations.tenantId} = ${tenantId}`);
        process.exit(0);
    }
}

verifyComplianceVelocity();
