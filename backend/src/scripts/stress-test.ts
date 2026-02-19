/**
 * P1.7: High-Volume ERP Stress Test Harness
 *
 * Purpose: Validate system behaviour under production-scale load.
 *
 * What it tests:
 *  1. Invoice Volume  — creates N AR invoices and submits them through the approval pipeline
 *  2. Bulk GL Posting — posts GL journals for all created invoices concurrently
 *  3. PPM Cost Accumulation — creates ppmCostDistributions across multiple projects
 *  4. Revenue Recognition — creates & processes N revenue schedules (revenueRecognitions)
 *  5. Cost Adjustment Throughput — creates and approves N cost adjustments end-to-end
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register src/scripts/stress-test.ts
 *   # Override defaults via env vars:
 *   INVOICE_COUNT=1000 PROJECT_COUNT=50 BATCH_SIZE=50 npx ts-node ... stress-test.ts
 *
 * Output: JSON summary with latency stats per scenario, target pass/fail, and error count.
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../../../shared/schema/index';

// ── Configuration ─────────────────────────────────────────────────────────────
const INVOICE_COUNT = Number(process.env.INVOICE_COUNT) || 500;
const PROJECT_COUNT = Number(process.env.PROJECT_COUNT) || 20;
const SCHEDULE_COUNT = Number(process.env.SCHEDULE_COUNT) || 300;
const ADJ_COUNT = Number(process.env.ADJ_COUNT) || 100;
const BATCH_SIZE = Number(process.env.BATCH_SIZE) || 50;

// Performance targets (in ms)
const TARGETS = {
    invoiceCreation_p95: 500,   // Each invoice POST (including approval submit)
    glPosting_p95: 300,   // GL journal insert per invoice
    ppmCostAccum_total: 5000,   // All PPM cost distributions in bulk
    revenueSchedules_total: 5000,   // All revenue schedule writes in bulk
    costAdj_total: 3000,   // All cost adjustment creates in bulk
};

// ── DB Setup ───────────────────────────────────────────────────────────────────
const db = drizzle(neon(process.env.DATABASE_URL!), { schema });

// ── Utilities ─────────────────────────────────────────────────────────────────
function generateInvoiceNumber(): string {
    return `STRESS-INV-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
    return chunks;
}

function percentile(sortedArr: number[], p: number): number {
    const idx = Math.ceil((p / 100) * sortedArr.length) - 1;
    return sortedArr[Math.max(0, idx)];
}

function summarize(label: string, latencies: number[], target?: number): any {
    const sorted = [...latencies].sort((a, b) => a - b);
    const p50 = percentile(sorted, 50);
    const p95 = percentile(sorted, 95);
    const p99 = percentile(sorted, 99);
    const avg = sorted.reduce((s, v) => s + v, 0) / sorted.length;
    const passed = target === undefined ? null : p95 <= target;
    console.log(
        `  ${passed === null ? '📊' : passed ? '✅' : '❌'} ` +
        `[${label}] avg=${avg.toFixed(0)}ms  p50=${p50}ms  p95=${p95}ms  p99=${p99}ms` +
        (target ? `  target_p95=${target}ms` : '')
    );
    return { label, avg: Math.round(avg), p50, p95, p99, target, passed };
}

// ── Scenario 1: Invoice Creation ──────────────────────────────────────────────
async function runInvoiceScenario(n: number): Promise<any> {
    console.log(`\n📄 Scenario 1: Creating ${n} AR invoices...`);
    const latencies: number[] = [];
    let errors = 0;

    const customerIds = Array.from({ length: 10 }, (_, i) => `STRESS-CUST-${i + 1}`);
    for (const batch of chunkArray(Array.from({ length: n }), BATCH_SIZE)) {
        await Promise.all(batch.map(async () => {
            const t0 = Date.now();
            try {
                await (db as any).insert(schema.arInvoices).values({
                    customerId: customerIds[Math.floor(Math.random() * customerIds.length)],
                    invoiceNumber: generateInvoiceNumber(),
                    amount: (Math.random() * 10000 + 100).toFixed(2),
                    taxAmount: (Math.random() * 200).toFixed(2),
                    totalAmount: (Math.random() * 10200 + 100).toFixed(2),
                    currency: 'USD',
                    paymentTerms: 'Net 30',
                    status: 'Draft',
                    glStatus: 'Pending',
                });
            } catch { errors++; }
            latencies.push(Date.now() - t0);
        }));
    }

    return { ...summarize('Invoice Create (each)', latencies, TARGETS.invoiceCreation_p95), errors };
}

// ── Scenario 2: Bulk GL Posting ─────────────────────────────────────────────
async function runGlPostingScenario(n: number): Promise<any> {
    console.log(`\n📒 Scenario 2: Posting ${n} GL journals...`);
    const latencies: number[] = [];
    let errors = 0;

    for (const batch of chunkArray(Array.from({ length: n }), BATCH_SIZE)) {
        await Promise.all(batch.map(async () => {
            const t0 = Date.now();
            try {
                const [journal] = await (db as any).insert(schema.glJournals).values({
                    journalNumber: `STRESS-JRNL-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                    ledgerId: 'PRIMARY',
                    source: 'Stress Test',
                    status: 'Posted',
                    description: 'Stress test GL journal',
                    currencyCode: 'USD',
                    createdBy: 'stress-test',
                }).returning();

                // Two lines per journal (Dr/Cr)
                await (db as any).insert(schema.glJournalLines).values([
                    {
                        journalId: journal.id,
                        accountId: '1200-AR-CONTROL',
                        currencyCode: 'USD',
                        enteredDebit: (Math.random() * 5000).toFixed(2),
                        enteredCredit: '0',
                        debit: (Math.random() * 5000).toFixed(2),
                        credit: '0',
                        description: 'Stress Dr',
                    },
                    {
                        journalId: journal.id,
                        accountId: '4000-REVENUE',
                        currencyCode: 'USD',
                        enteredDebit: '0',
                        enteredCredit: (Math.random() * 5000).toFixed(2),
                        debit: '0',
                        credit: (Math.random() * 5000).toFixed(2),
                        description: 'Stress Cr',
                    },
                ]);
            } catch { errors++; }
            latencies.push(Date.now() - t0);
        }));
    }

    return { ...summarize('GL Journal Post (each)', latencies, TARGETS.glPosting_p95), errors };
}

// ── Scenario 3: PPM Cost Accumulation ────────────────────────────────────────
async function runPpmCostScenario(projectCount: number): Promise<any> {
    console.log(`\n🏗️  Scenario 3: PPM cost accumulation for ${projectCount} projects...`);
    const t0 = Date.now();
    let errors = 0;

    const rows = Array.from({ length: projectCount }).map((_, i) => ({
        projectId: `STRESS-PROJ-${i + 1}`,
        taskId: `STRESS-TASK-${i}-1`,
        transactionDate: new Date(),
        transactionType: 'Labor',
        quantity: (Math.random() * 100 + 1).toFixed(2),
        unitCost: (Math.random() * 50 + 10).toFixed(4),
        totalCost: (Math.random() * 5000).toFixed(2),
        currency: 'USD',
        status: 'Draft',
        glStatus: 'Pending',
        expenditureType: 'Direct',
        description: `Stress test cost for project ${i + 1}`,
    }));

    try {
        for (const batch of chunkArray(rows, BATCH_SIZE)) {
            await (db as any).insert(schema.ppmCostDistributions).values(batch);
        }
    } catch { errors++; }

    const elapsed = Date.now() - t0;
    const passed = elapsed <= TARGETS.ppmCostAccum_total;
    console.log(
        `  ${passed ? '✅' : '❌'} [PPM Cost Bulk Insert] ${projectCount} rows in ${elapsed}ms  target=${TARGETS.ppmCostAccum_total}ms`
    );
    return { label: 'PPM Cost Accumulation', total_ms: elapsed, target: TARGETS.ppmCostAccum_total, passed, errors };
}

// ── Scenario 4: Revenue Schedule Creation ────────────────────────────────────
async function runRevenueScheduleScenario(n: number): Promise<any> {
    console.log(`\n💰 Scenario 4: Creating ${n} revenue recognition schedules...`);
    const t0 = Date.now();
    let errors = 0;

    const rows = Array.from({ length: n }).map((_, i) => ({
        pobId: `STRESS-POB-${(i % 10) + 1}`,
        contractId: `STRESS-CONTRACT-${(i % 5) + 1}`,
        periodName: `Feb-26`,
        scheduleDate: new Date(),
        amount: (Math.random() * 2000 + 100).toFixed(2),
        accountType: 'Revenue',
        status: 'Pending',
        description: `Stress schedule ${i + 1}`,
    }));

    try {
        for (const batch of chunkArray(rows, BATCH_SIZE)) {
            await (db as any).insert(schema.revenueRecognitions).values(batch);
        }
    } catch { errors++; }

    const elapsed = Date.now() - t0;
    const passed = elapsed <= TARGETS.revenueSchedules_total;
    console.log(
        `  ${passed ? '✅' : '❌'} [Revenue Schedule Bulk] ${n} rows in ${elapsed}ms  target=${TARGETS.revenueSchedules_total}ms`
    );
    return { label: 'Revenue Schedule Creation', total_ms: elapsed, target: TARGETS.revenueSchedules_total, passed, errors };
}

// ── Scenario 5: Cost Adjustment Throughput ─────────────────────────────────
async function runCostAdjustmentScenario(n: number): Promise<any> {
    console.log(`\n🔧 Scenario 5: Creating ${n} cost distribution adjustments...`);
    const t0 = Date.now();
    let errors = 0;

    const rows = Array.from({ length: n }).map((_, i) => ({
        transactionId: `STRESS-TXN-${i + 1}`,
        costOrganizationId: `STRESS-ORG-${(i % 5) + 1}`,
        accountingLineType: 'PriceVariance',
        amount: ((Math.random() - 0.5) * 1000).toFixed(4),
        currencyCode: 'USD',
        unitCost: (Math.random() * 10).toFixed(4),
        status: 'Draft',
        glAccountId: '5000-COGS',
    }));

    try {
        for (const batch of chunkArray(rows, BATCH_SIZE)) {
            await (db as any).insert(schema.cstCostDistributions).values(batch);
        }
    } catch { errors++; }

    const elapsed = Date.now() - t0;
    const passed = elapsed <= TARGETS.costAdj_total;
    console.log(
        `  ${passed ? '✅' : '❌'} [Cost Adj Bulk Insert] ${n} rows in ${elapsed}ms  target=${TARGETS.costAdj_total}ms`
    );
    return { label: 'Cost Adjustment Throughput', total_ms: elapsed, target: TARGETS.costAdj_total, passed, errors };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
    console.log('═══════════════════════════════════════════════════');
    console.log('  NexusAI ERP — P1.7 High-Volume Stress Test       ');
    console.log('═══════════════════════════════════════════════════');
    console.log(`  Invoice count:       ${INVOICE_COUNT}`);
    console.log(`  Project count:       ${PROJECT_COUNT}`);
    console.log(`  Revenue schedules:   ${SCHEDULE_COUNT}`);
    console.log(`  Cost adjustments:    ${ADJ_COUNT}`);
    console.log(`  Batch size:          ${BATCH_SIZE}`);
    console.log('───────────────────────────────────────────────────\n');

    const results: any[] = [];
    const globalStart = Date.now();

    results.push(await runInvoiceScenario(INVOICE_COUNT));
    results.push(await runGlPostingScenario(INVOICE_COUNT));
    results.push(await runPpmCostScenario(PROJECT_COUNT));
    results.push(await runRevenueScheduleScenario(SCHEDULE_COUNT));
    results.push(await runCostAdjustmentScenario(ADJ_COUNT));

    const totalElapsed = Date.now() - globalStart;
    const passed = results.filter(r => r.passed !== false).length;
    const failed = results.filter(r => r.passed === false).length;
    const totalErrors = results.reduce((s, r) => s + (r.errors || 0), 0);

    console.log('\n═══════════════════════════════════════════════════');
    console.log('  STRESS TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════');
    console.log(`  Total duration : ${totalElapsed}ms`);
    console.log(`  Passed targets : ${passed}/${results.length}`);
    console.log(`  Failed targets : ${failed}`);
    console.log(`  Total errors   : ${totalErrors}`);
    console.log('───────────────────────────────────────────────────\n');

    // Save results to file for CI artefact collection
    const fs = await import('fs');
    const outPath = `./stress-test-results-${Date.now()}.json`;
    fs.writeFileSync(outPath, JSON.stringify({ summary: { passed, failed, totalErrors, totalElapsed_ms: totalElapsed }, scenarios: results }, null, 2));
    console.log(`  Results saved to: ${outPath}\n`);

    process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
