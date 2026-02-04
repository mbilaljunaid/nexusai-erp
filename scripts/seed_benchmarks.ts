
import { db } from "../server/db";
import { hrMarketBenchmarks } from "@shared/schema/hr_analytics";

import { sql } from "drizzle-orm";

async function main() {
    console.log("Seeding Market Benchmarks...");

    // Manual Table Creation (Bypass interactive migration prompt for Demo)
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS hr_market_benchmarks (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            job_family varchar NOT NULL,
            industry varchar DEFAULT 'TECH',
            p50_salary numeric,
            p90_salary numeric,
            avg_turnover_rate numeric,
            year integer NOT NULL,
            source varchar DEFAULT 'Internal Survey'
        );
    `);

    // Clear existing
    // await db.delete(hrMarketBenchmarks); 

    const benchmarks = [
        {
            jobFamily: "ENGINEERING",
            industry: "TECH",
            p50Salary: "120000",
            p90Salary: "180000",
            avgTurnoverRate: "12.5",
            year: 2025
        },
        {
            jobFamily: "SALES",
            industry: "TECH",
            p50Salary: "90000",
            p90Salary: "150000",
            avgTurnoverRate: "18.0",
            year: 2025
        },
        {
            jobFamily: "HR",
            industry: "TECH",
            p50Salary: "85000",
            p90Salary: "130000",
            avgTurnoverRate: "10.0",
            year: 2025
        }
    ];

    await db.insert(hrMarketBenchmarks).values(benchmarks);

    console.log(`Seeded ${benchmarks.length} benchmark records.`);
}

main().catch(console.error);
