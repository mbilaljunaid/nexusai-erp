import 'dotenv/config';
import { db } from "../server/db";
import { hrKpiDefinitions, hrAnalyticsSnapshots } from "@shared/schema/hr_analytics";
import { HRAnalyticsService } from "../server/services/HRAnalyticsService";
import { eq } from "drizzle-orm";

async function seed() {
    console.log("Seeding HR Analytics...");

    const kpis = [
        {
            name: "Total Headcount",
            code: "HR_HEADCOUNT",
            category: "WORKFORCE",
            dataType: "NUMBER",
            periodicity: "DAILY",
            description: "Total number of active employees (assignments).",
            direction: "UP"
        },
        {
            name: "Voluntary Attrition (30d)",
            code: "HR_ATTRITION_VOL",
            category: "WORKFORCE",
            dataType: "PERCENT",
            periodicity: "DAILY",
            description: "Voluntary terminations in the last 30 days as a % of headcount.",
            direction: "DOWN"
        },
        {
            name: "Gender Ratio (Female %)",
            code: "HR_GENDER_RATIO",
            category: "DIVERSITY",
            dataType: "PERCENT",
            periodicity: "MONTHLY",
            description: "Percentage of workforce identified as Female.",
            direction: "UP"
        }
    ];

    for (const kpi of kpis) {
        const existing = await db.select().from(hrKpiDefinitions).where(eq(hrKpiDefinitions.code, kpi.code));

        if (existing.length === 0) {
            await db.insert(hrKpiDefinitions).values({
                name: kpi.name,
                code: kpi.code,
                category: kpi.category,
                periodicity: kpi.periodicity,
                description: kpi.description,
                direction: kpi.direction,
                isActive: true
            });
            console.log(`Created KPI: ${kpi.name}`);
        } else {
            console.log(`KPI exists: ${kpi.name}`);
        }
    }

    // Generate Snapshot
    console.log("Generating Snapshots...");
    // Passing "default" as tenantId for demo purposes
    const results = await HRAnalyticsService.generateDailySnapshot("default");
    console.log(`Generated ${results.length} snapshots.`);

    process.exit(0);
}

seed().catch(err => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
