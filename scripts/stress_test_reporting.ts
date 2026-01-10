
import 'dotenv/config';
import { ReportingService } from "../server/services/reporting"; // Check if it's a class or instance export
import { db } from "../server/db";
import { glReportDefinitions, glLedgers } from "@shared/schema";
import { eq } from "drizzle-orm";

const CONCURRENT_REPORTS = 10;
const TOTAL_REPORTS = 50;

async function runReportingStressTest() {
    console.log(`Starting REPORTING Stress Test: ${TOTAL_REPORTS} reports, ${CONCURRENT_REPORTS} concurrency.`);

    // Initialize Service (if it's a class and not an exported instance)
    const reportingService = new ReportingService();

    // 1. Get Valid Report Definition & Ledger
    const [report] = await db.select().from(glReportDefinitions).limit(1);
    const [ledger] = await db.select().from(glLedgers).limit(1);

    if (!report || !ledger) {
        console.error("Missing Report Definition or Ledger. Seed data first.");
        process.exit(1);
    }
    console.log(`Test Report: ${report.reportName}`);

    const startTime = Date.now();
    let successCount = 0;
    let errorCount = 0;

    const generateWorker = async (i: number) => {
        try {
            // generateFsgReport(reportId, ledgerId, periodName, format)
            await reportingService.generateFsgReport(report.id, ledger.id, "Jan-26", "JSON");
            successCount++;
            process.stdout.write('.');
        } catch (err) {
            errorCount++;
        }
    };

    const queue = Array.from({ length: TOTAL_REPORTS }, (_, i) => i);
    async function worker() {
        while (queue.length > 0) {
            const id = queue.pop();
            if (id !== undefined) await generateWorker(id);
        }
    }

    const workers = [];
    for (let i = 0; i < CONCURRENT_REPORTS; i++) {
        workers.push(worker());
    }

    await Promise.all(workers);

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log("\n\n--- Reporting Stress Results ---");
    console.log(`Duration: ${duration.toFixed(2)}s`);
    console.log(`Throughput: ${(successCount / duration).toFixed(2)} reports/sec`);
    console.log(`Errors: ${errorCount}`);

    process.exit(errorCount > 0 ? 1 : 0);
}

runReportingStressTest().catch(console.error);
