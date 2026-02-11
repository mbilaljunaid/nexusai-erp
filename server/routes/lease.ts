import { Router } from "express";
import { db } from "../db";
import {
    leaseHeaders, leasePayments, leaseAssets, leaseSchedules, leaseAmendments,
    insertLeaseHeaderSchema, insertLeasePaymentSchema, insertLeaseAmendmentSchema
} from "../../shared/schema/lease";
import { glJournals, glJournalLines } from "../../shared/schema/finance";
import { faAssets, faAssetBooks, faBooks, faCategories } from "../../shared/schema/fixedAssets";
import { leaseCalculationsService } from "../services/LeaseCalculationsService";
import { eq, and, sql, desc } from "drizzle-orm";
import { enforceRBAC } from "../middleware/auth";
import { leaseAiService } from "../services/LeaseAiService";

const router = Router();

// 1. List Leases (Paginated)
router.get("/leases", enforceRBAC("finance_read"), async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const allLeases = await db.select().from(leaseHeaders).limit(limit).offset(offset);

        // Get Total Count
        const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(leaseHeaders);
        const total = Number(countResult.count);

        res.json({
            data: allLeases,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// 2. Create Lease Header
router.post("/leases", enforceRBAC("finance_write"), async (req, res) => {
    try {
        const data = insertLeaseHeaderSchema.parse(req.body);
        const [lease] = await db.insert(leaseHeaders).values({
            ...data,
            commencementDate: new Date(data.commencementDate),
            expirationDate: new Date(data.expirationDate),
            // Numeric fields need to be strings for Drizzle if defined as numeric
            discountRate: data.discountRate.toString(),
            initialDirectCosts: (data.initialDirectCosts || 0).toString(),
            status: data.status || "DRAFT"
        }).returning();
        res.json(lease);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

// 2. Add Payment Schedule
router.post("/leases/:id/payments", enforceRBAC("finance_write"), async (req, res) => {
    try {
        const data = insertLeasePaymentSchema.parse({ ...req.body, leaseId: req.params.id });
        const [payment] = await db.insert(leasePayments).values({
            ...data,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            amount: data.amount.toString()
        }).returning();
        res.json(payment);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

// 3. Generate Schedules (Trigger Calculation Engine)
router.post("/leases/:id/generate-schedule", enforceRBAC("finance_write"), async (req, res) => {
    try {
        const leaseId = req.params.id;

        // Fetch Data
        const [header] = await db.select().from(leaseHeaders).where(eq(leaseHeaders.id, leaseId));
        if (!header) return res.status(404).json({ error: "Lease not found" });

        const payments = await db.select().from(leasePayments).where(eq(leasePayments.leaseId, leaseId));
        if (payments.length === 0) return res.status(400).json({ error: "No payments defined" });

        // Calcs
        const npv = leaseCalculationsService.calculateNPV(
            payments,
            Number(header.discountRate),
            header.commencementDate
        );

        // Save ROU/Liability initial value
        // Simplified: Liability = NPV. ROU = NPV + Direct Costs.
        await db.update(leaseHeaders).set({
            initialDirectCosts: npv.toString() // Using this field to store Liability for now, or add specific Liability field
        }).where(eq(leaseHeaders.id, leaseId));

        // Generate Schedule
        const schedule = leaseCalculationsService.generateSchedule(header, payments, npv);

        // Persist
        await db.delete(leaseSchedules).where(eq(leaseSchedules.leaseId, leaseId)); // Clear old

        // Batch insert
        const toInsert = schedule.map(s => ({
            ...s,
            leaseId,
            openingLiability: s.openingLiability!.toString(),
            interestExpense: s.interestExpense!.toString(),
            paymentAmount: s.paymentAmount!.toString(),
            closingLiability: s.closingLiability!.toString(),
            rouOpeningBalance: s.rouOpeningBalance!.toString(),
            amortizationExpense: s.amortizationExpense!.toString(),
            rouClosingBalance: s.rouClosingBalance!.toString(),
            date: s.date!,
            period: s.period!
        }));

        await db.insert(leaseSchedules).values(toInsert);

        res.json({ message: "Schedule Generated", npv, schedule });

    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// 5. Remeasure Lease (Modification)
router.post("/leases/:id/remeasure", enforceRBAC("finance_write"), async (req, res) => {
    try {
        const leaseId = req.params.id;
        const { newRate, newEndDate, reason } = req.body;

        // 1. Get Current State
        const [header] = await db.select().from(leaseHeaders).where(eq(leaseHeaders.id, leaseId));
        if (!header) return res.status(404).json({ error: "Lease not found" });

        // 2. Snapshot Previous Liability (using initialDirectCosts as proxy for now, ideally current Liability)
        // In real app, we'd get current liability from the latest schedule.
        const [lastSchedule] = await db.select().from(leaseSchedules)
            .where(eq(leaseSchedules.leaseId, leaseId))
            .orderBy(desc(leaseSchedules.period))
            .limit(1);

        const currentLiability = lastSchedule ? lastSchedule.closingLiability : header.initialDirectCosts;

        // 3. Update Header with New Terms
        await db.update(leaseHeaders).set({
            isModified: true,
            modificationDate: new Date(),
            modificationReason: reason || "Market Rate Adjustment",
            previousLiability: currentLiability?.toString(),
            discountRate: newRate ? newRate.toString() : header.discountRate,
            expirationDate: newEndDate ? new Date(newEndDate) : header.expirationDate,
            updatedAt: new Date()
        }).where(eq(leaseHeaders.id, leaseId));

        // 4. Trigger Recalculation (Re-run Generate Schedule logic)
        // Ideally this would be a shared function, but calling the logic conceptually here:
        // Client should call /generate-schedule next, or we redirect. 
        // For atomic operation, we'd invoke the service directly.

        res.json({ message: "Lease Terms Updated. Please Regenerate Schedule to see impact." });

    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// 5b. Modification with Audit Trail (Newv2)
router.post("/leases/:id/modify", enforceRBAC("finance_write"), async (req, res) => {
    try {
        const leaseId = req.params.id;
        const { modificationType, effectiveDate, changeReason, newTerms } = req.body;

        // 1. Fetch Current Lease
        const [currentLease] = await db.select().from(leaseHeaders).where(eq(leaseHeaders.id, leaseId));
        if (!currentLease) return res.status(404).json({ error: "Lease not found" });

        // 2. Create Amendment Record (Audit Snapshot)
        await db.insert(leaseAmendments).values({
            leaseId,
            modificationType,
            effectiveDate: new Date(effectiveDate),
            changeReason,
            previousTerms: {
                discountRate: currentLease.discountRate,
                termMonths: currentLease.termMonths,
                initialDirectCosts: currentLease.initialDirectCosts
            },
            newTerms: newTerms, // JSON payload from frontend
            modifiedBy: "SYSTEM", // Should be req.user.id if available
            amendmentDate: new Date()
        });

        // 3. Update Lease Header
        await db.update(leaseHeaders).set({
            isModified: true,
            modificationDate: new Date(),
            modificationReason: changeReason,
            discountRate: newTerms.discountRate.toString(),
            termMonths: newTerms.termMonths,
            updatedAt: new Date()
        }).where(eq(leaseHeaders.id, leaseId));

        // 4. Update Payments? (Simplified: assuming payment amount changes on all streams)
        if (newTerms.paymentAmount) {
            await db.update(leasePayments)
                .set({ amount: newTerms.paymentAmount.toString() })
                .where(eq(leasePayments.leaseId, leaseId));
        }

        // 5. Regenerate Schedules
        const payments = await db.select().from(leasePayments).where(eq(leasePayments.leaseId, leaseId));
        const [updatedHeader] = await db.select().from(leaseHeaders).where(eq(leaseHeaders.id, leaseId));

        const npv = leaseCalculationsService.calculateNPV(
            payments,
            Number(updatedHeader.discountRate),
            updatedHeader.commencementDate
        );

        // Update Liability
        await db.update(leaseHeaders).set({
            initialDirectCosts: npv.toString()
        }).where(eq(leaseHeaders.id, leaseId));

        const schedule = leaseCalculationsService.generateSchedule(updatedHeader, payments, npv);

        // Persist Schedule (Full Replace)
        await db.delete(leaseSchedules).where(eq(leaseSchedules.leaseId, leaseId));

        const toInsert = schedule.map(s => ({
            ...s,
            leaseId,
            openingLiability: s.openingLiability!.toString(),
            interestExpense: s.interestExpense!.toString(),
            paymentAmount: s.paymentAmount!.toString(),
            closingLiability: s.closingLiability!.toString(),
            rouOpeningBalance: s.rouOpeningBalance!.toString(),
            amortizationExpense: s.amortizationExpense!.toString(),
            rouClosingBalance: s.rouClosingBalance!.toString(),
            date: s.date!,
            period: s.period!
        }));

        await db.insert(leaseSchedules).values(toInsert);

        res.json({ message: "Lease Modified & Remeasured", amendmentId: "new" });

    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// 12. Post to GL (Amortization Entry)
router.post("/leases/:id/post-gl", enforceRBAC("finance_write"), async (req, res) => {
    try {
        const leaseId = req.params.id;
        const { period } = req.body;

        // 1. Fetch Schedule Line
        const [line] = await db.select().from(leaseSchedules).where(and(
            eq(leaseSchedules.leaseId, leaseId),
            eq(leaseSchedules.period, period)
        ));

        if (!line) return res.status(404).json({ error: "Schedule line not found" });
        if (line.isPosted) return res.status(400).json({ error: "Period already posted to GL" });

        const [lease] = await db.select().from(leaseHeaders).where(eq(leaseHeaders.id, leaseId));

        return await db.transaction(async (tx) => {
            // 2. Create Journal Header
            const [journal] = await tx.insert(glJournals).values({
                journalNumber: `LSE-${lease.leaseNumber}-P${period}-${Date.now()}`,
                ledgerId: "PRIMARY",
                description: `Lease Amortization - ${lease.leaseNumber} - Period ${period}`,
                currencyCode: lease.currency || "USD",
                source: "LEASE",
                category: "Amortization",
                status: "Unposted"
            }).returning();

            // 3. Create Journal Lines
            // Entry (Simplified):
            // Dr Interest Expense (P&L)   [Interest]
            // Dr Amortization Expense (P&L) [Amortization]
            // Cr Lease Liability (B/S)     [Interest + Amortization - Payment -> Wait, simple version:]
            // Let's use standard Lease Entry:
            // Dr Interest Expense 
            // Dr Amortization Expense
            // Cr Lease Liability (Interest portion)
            // Cr ROU Accumulated Amortization

            await tx.insert(glJournalLines).values([
                {
                    journalId: journal.id,
                    accountId: "62100", // Interest Expense
                    description: "Lease Interest Expense",
                    enteredDebit: line.interestExpense,
                    accountedDebit: line.interestExpense,
                    currencyCode: lease.currency || "USD"
                },
                {
                    journalId: journal.id,
                    accountId: "62200", // Lease Amortization Expense
                    description: "ROU Asset Amortization",
                    enteredDebit: line.amortizationExpense,
                    accountedDebit: line.amortizationExpense,
                    currencyCode: lease.currency || "USD"
                },
                {
                    journalId: journal.id,
                    accountId: "22000", // Lease Liability
                    description: "Lease Liability Adjustment (Interest)",
                    enteredCredit: line.interestExpense,
                    accountedCredit: line.interestExpense,
                    currencyCode: lease.currency || "USD"
                },
                {
                    journalId: journal.id,
                    accountId: "16500", // Accum Amortization
                    description: "ROU Accumulated Amortization",
                    enteredCredit: line.amortizationExpense,
                    accountedCredit: line.amortizationExpense,
                    currencyCode: lease.currency || "USD"
                }
            ]);

            // 4. Update Schedule Line
            await tx.update(leaseSchedules).set({
                isPosted: true,
                journalEntryId: journal.id
            }).where(eq(leaseSchedules.id, line.id));

            res.json({ message: "Posted to GL", journalNumber: journal.journalNumber });
        });

    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// 11. Create Fixed Asset (Integration)
router.post("/leases/:id/create-asset", enforceRBAC("finance_write"), async (req, res) => {
    try {
        const leaseId = req.params.id;

        // Check existence
        const existing = await db.select().from(faAssets).where(eq(faAssets.leaseId, leaseId));
        if (existing.length > 0) return res.status(400).json({ error: "Asset already created for this lease" });

        const [lease] = await db.select().from(leaseHeaders).where(eq(leaseHeaders.id, leaseId));

        // Get Defaults
        let [book] = await db.select().from(faBooks).limit(1);
        if (!book) {
            [book] = await db.insert(faBooks).values({
                bookCode: "CORP_USD", description: "Corporate Book USD", ledgerId: "PRIMARY", depreciationCalendar: "MONTHLY"
            }).returning();
        }

        let [category] = await db.select().from(faCategories).limit(1);
        if (!category) {
            [category] = await db.insert(faCategories).values({
                majorCategory: "LEASED_PROP", minorCategory: "ROU",
                assetCostAccountCcid: "15000", assetClearingAccountCcid: "15999",
                deprExpenseAccountCcid: "61000", accumDeprAccountCcid: "16000",
                defaultLifeYears: 5
            }).returning();
        }

        const [asset] = await db.insert(faAssets).values({
            assetNumber: `AST-${lease.leaseNumber}`,
            description: `ROU Asset - ${lease.description}`,
            categoryId: category.id,
            status: "ACTIVE",
            leaseId: leaseId
        }).returning();

        await db.insert(faAssetBooks).values({
            assetId: asset.id,
            bookId: book.id,
            datePlacedInService: lease.commencementDate,
            originalCost: lease.initialDirectCosts || "0",
            recoverableCost: lease.initialDirectCosts || "0",
            lifeYears: Math.floor(lease.termMonths / 12),
            lifeMonths: lease.termMonths % 12,
            method: "STL",
            status: "ACTIVE"
        });

        res.json({ message: "ROU Asset Created Successfully", assetNumber: asset.assetNumber });

    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// 6. Workflow Actions (Submit)
router.post("/leases/:id/submit", enforceRBAC("finance_write"), async (req, res) => {
    try {
        const leaseId = req.params.id;
        await db.update(leaseHeaders).set({
            status: "PENDING_APPROVAL",
            updatedAt: new Date()
        }).where(eq(leaseHeaders.id, leaseId));

        res.json({ message: "Lease Submitted for Approval" });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// 7. Workflow Actions (Approve)
router.post("/leases/:id/approve", enforceRBAC("finance_manager"), async (req, res) => {
    try {
        const leaseId = req.params.id;
        await db.update(leaseHeaders).set({
            status: "ACTIVE",
            updatedAt: new Date()
        }).where(eq(leaseHeaders.id, leaseId));

        res.json({ message: "Lease Approved and Active" });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// 8. Workflow Actions (Reject)
router.post("/leases/:id/reject", enforceRBAC("finance_manager"), async (req, res) => {
    try {
        const leaseId = req.params.id;
        await db.update(leaseHeaders).set({
            status: "REJECTED",
            updatedAt: new Date()
        }).where(eq(leaseHeaders.id, leaseId));

        res.json({ message: "Lease Rejected" });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// 9. AI Extraction
router.post("/leases/extract", enforceRBAC("finance_write"), async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "No text provided" });

        const data = await leaseAiService.extractLeaseData(text);
        res.json(data);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// 4. Get Lease Details
router.get("/leases/:id", enforceRBAC("finance_read"), async (req, res) => {
    try {
        const [lease] = await db.select().from(leaseHeaders).where(eq(leaseHeaders.id, req.params.id));
        if (!lease) return res.status(404).json({ error: "Lease not found" });

        const payments = await db.select().from(leasePayments).where(eq(leasePayments.leaseId, req.params.id));
        const schedules = await db.select().from(leaseSchedules).where(eq(leaseSchedules.leaseId, req.params.id));
        const assets = await db.select().from(leaseAssets).where(eq(leaseAssets.leaseId, req.params.id));

        res.json({ ...lease, payments, schedules, assets });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// 10. Get Lease Amendments (Audit Trail)
router.get("/leases/:id/amendments", enforceRBAC("finance_read"), async (req, res) => {
    try {
        const amendments = await db.select()
            .from(leaseAmendments)
            .where(eq(leaseAmendments.leaseId, req.params.id))
            .orderBy(desc(leaseAmendments.amendmentDate));

        res.json(amendments);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
