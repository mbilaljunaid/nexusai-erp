import { db } from "../db";
import {
    constructionContracts,
    constructionContractLines,
    constructionVariations,
    constructionPayApps,
    constructionPayAppLines,
    InsertConstructionContract,
    InsertConstructionContractLine,
    InsertConstructionVariation,
    InsertConstructionPayApp,
    InsertConstructionPayAppLine,
    constructionSetup,
    InsertConstructionSetup,
    ppmProjects,
    glCodeCombinations,
    glPeriods,
    glAccounts,
    constructionDailyLogs,
    constructionDailyLabor,
    constructionRFIs,
    constructionSubmittals,
    constructionCompliance
} from "@shared/schema";
import { eq, desc, sum, sql, and } from "drizzle-orm";
import { FinanceService } from "./finance";

const financeService = new FinanceService();

export class ConstructionService {

    // -- Setup & Config --

    async getSetup() {
        return await db.select().from(constructionSetup);
    }

    async updateSetup(key: string, value: string, category: string = "GENERAL", description?: string) {
        return await db.insert(constructionSetup)
            .values({
                configKey: key,
                configValue: value,
                category,
                description
            })
            .onConflictDoUpdate({
                target: constructionSetup.configKey,
                set: {
                    configValue: value,
                    category,
                    description,
                    updatedAt: new Date()
                }
            })
            .returning();
    }

    // -- Contracts --

    async createContract(data: InsertConstructionContract) {
        const [contract] = await db.insert(constructionContracts)
            .values(data)
            .returning();
        return contract;
    }

    async getContracts(projectId: string) {
        return await db.select()
            .from(constructionContracts)
            .where(eq(constructionContracts.projectId, projectId))
            .orderBy(desc(constructionContracts.createdAt));
    }

    async getContract(id: string) {
        const [contract] = await db.select()
            .from(constructionContracts)
            .where(eq(constructionContracts.id, id));

        if (!contract) return null;

        const lines = await this.getContractLines(id);
        const variations = await this.getVariations(id);

        return { ...contract, lines, variations };
    }

    async updateContractAmount(id: string, amount: string) {
        const [contract] = await db.update(constructionContracts)
            .set({ revisedAmount: amount, updatedAt: new Date() })
            .where(eq(constructionContracts.id, id))
            .returning();
        return contract;
    }

    // -- SoV Lines --

    async addContractLine(data: InsertConstructionContractLine) {
        const [line] = await db.insert(constructionContractLines)
            .values(data)
            .returning();

        // Recalculate Contract Total
        await this.recalculateContractTotal(data.contractId);

        return line;
    }

    async getContractLines(contractId: string) {
        return await db.select()
            .from(constructionContractLines)
            .where(eq(constructionContractLines.contractId, contractId))
            .orderBy(constructionContractLines.lineNumber);
    }

    async bulkImportLines(contractId: string, lines: any[]) {
        const inserts = lines.map((l, idx) => ({
            contractId,
            lineNumber: l.lineNumber || (idx + 1),
            description: l.description,
            scheduledValue: l.scheduledValue?.toString() || "0",
            unitOfMeasure: l.unitOfMeasure || "LS",
            quantity: l.quantity?.toString() || "1",
            unitPrice: l.unitPrice?.toString() || l.scheduledValue?.toString(),
            category: l.category || "GENERAL"
        }));

        if (inserts.length > 0) {
            await db.insert(constructionContractLines).values(inserts);
            await this.recalculateContractTotal(contractId);
        }
        return { count: inserts.length };
    }

    private async recalculateContractTotal(contractId: string) {
        const result = await db.select({
            total: sum(constructionContractLines.scheduledValue)
        })
            .from(constructionContractLines)
            .where(eq(constructionContractLines.contractId, contractId));

        const total = result[0]?.total || "0";

        // Update Original Amount (assuming lines = original scope)
        // For variations, we will have a separate logic
        await db.update(constructionContracts)
            .set({
                originalAmount: total,
                revisedAmount: total // Initial sync, needs variaiton logic later
            })
            .where(eq(constructionContracts.id, contractId));
    }

    // -- Variations (Change Orders) --

    async createVariation(data: InsertConstructionVariation) {
        const [variation] = await db.insert(constructionVariations)
            .values(data)
            .returning();
        return variation;
    }

    async getVariations(contractId: string) {
        return await db.select()
            .from(constructionVariations)
            .where(eq(constructionVariations.contractId, contractId))
            .orderBy(desc(constructionVariations.createdAt));
    }

    async approveVariation(id: string) {
        const [variation] = await db.update(constructionVariations)
            .set({
                status: "APPROVED",
                approvedDate: new Date()
            })
            .where(eq(constructionVariations.id, id))
            .returning();

        // Update Contract Revised Amount
        // Logic: Revised = Original + Approved Variations
        await this.updateContractWithVariations(variation.contractId);

        return variation;
    }

    private async updateContractWithVariations(contractId: string) {
        const [contract] = await db.select().from(constructionContracts).where(eq(constructionContracts.id, contractId));
        if (!contract) return;

        const variationResult = await db.select({
            total: sum(constructionVariations.amount)
        })
            .from(constructionVariations)
            .where(eq(constructionVariations.contractId, contractId))
            .where(eq(constructionVariations.status, "APPROVED"));

        const variationTotal = Number(variationResult[0]?.total || 0);
        const original = Number(contract.originalAmount || 0);

        await db.update(constructionContracts)
            .set({ revisedAmount: (original + variationTotal).toString(), updatedAt: new Date() })
            .where(eq(constructionContracts.id, contractId));
    }

    // -- Progress Billing / Pay Apps --

    async createPayApp(data: InsertConstructionPayApp) {
        // 1. Create Header
        const [payApp] = await db.insert(constructionPayApps)
            .values(data)
            .returning();

        // 2. Initialize Lines based on Contract Lines (SOV)
        const contractLines = await this.getContractLines(data.contractId);

        // Fetch previous pay app lines to calculate previous progress (if any)
        // For simplicity in this first pass, assuming generic initialization

        const lineInserts = contractLines.map(line => ({
            payAppId: payApp.id,
            contractLineId: line.id,
            workCompletedThisPeriod: "0",
            materialsStored: "0",
            totalCompletedToDate: "0",
            percentageComplete: "0"
        }));

        if (lineInserts.length > 0) {
            await db.insert(constructionPayAppLines).values(lineInserts);
        }

        return payApp;
    }

    async getPayApps(contractId: string) {
        return await db.select()
            .from(constructionPayApps)
            .where(eq(constructionPayApps.contractId, contractId))
            .orderBy(desc(constructionPayApps.applicationNumber));
    }

    async getPayApp(id: string) {
        const [app] = await db.select()
            .from(constructionPayApps)
            .where(eq(constructionPayApps.id, id));

        if (!app) return null;

        const lines = await db.select({
            id: constructionPayAppLines.id,
            contractLineId: constructionPayAppLines.contractLineId,
            description: constructionContractLines.description,
            scheduledValue: constructionContractLines.scheduledValue,
            totalCompletedToDate: constructionPayAppLines.totalCompletedToDate,
            percentageComplete: constructionPayAppLines.percentageComplete,
            workCompletedThisPeriod: constructionPayAppLines.workCompletedThisPeriod,
            materialsStored: constructionPayAppLines.materialsStored
        })
            .from(constructionPayAppLines)
            .leftJoin(constructionContractLines, eq(constructionPayAppLines.contractLineId, constructionContractLines.id))
            .where(eq(constructionPayAppLines.payAppId, id));

        return { ...app, lines };
    }

    async updatePayAppLine(lineId: string, data: Partial<InsertConstructionPayAppLine>) {
        // Find pay app id first to check lock status
        const [lineInfo] = await db.select({ payAppId: constructionPayAppLines.payAppId })
            .from(constructionPayAppLines)
            .where(eq(constructionPayAppLines.id, lineId));

        if (lineInfo) {
            const [app] = await db.select().from(constructionPayApps).where(eq(constructionPayApps.id, lineInfo.payAppId));
            if (app?.isLocked) throw new Error("Application is locked and cannot be modified.");
        }

        const [line] = await db.update(constructionPayAppLines)
            .set(data)
            .where(eq(constructionPayAppLines.id, lineId))
            .returning();

        // Trigger recalc of Pay App Header
        await this.calculatePayApp(line.payAppId);

        return line;
    }

    async calculatePayApp(payAppId: string) {
        // 1. Get Header and Contract
        const [app] = await db.select().from(constructionPayApps).where(eq(constructionPayApps.id, payAppId));
        if (!app) return;
        if (app.isLocked) return;

        const [contract] = await db.select().from(constructionContracts).where(eq(constructionContracts.id, app.contractId));

        // 2. Sum up Total Completed from lines
        const result = await db.select({
            totalCompleted: sum(constructionPayAppLines.totalCompletedToDate)
        })
            .from(constructionPayAppLines)
            .where(eq(constructionPayAppLines.payAppId, payAppId));

        const totalCompleted = Number(result[0]?.totalCompleted || 0);
        const retentionRate = Number(contract.retentionPercentage || 10) / 100;
        const retentionAmount = totalCompleted * retentionRate;
        const previousPayments = Number(app.previousPayments || 0);

        const currentPaymentDue = totalCompleted - retentionAmount - previousPayments;

        // 3. Update Header
        await db.update(constructionPayApps)
            .set({
                totalCompleted: totalCompleted.toString(),
                retentionAmount: retentionAmount.toString(),
                currentPaymentDue: currentPaymentDue.toString(),
            })
            .where(eq(constructionPayApps.id, payAppId));
    }

    // -- Certification Workflow (L11) --

    async submitPayApp(payAppId: string) {
        return await db.update(constructionPayApps)
            .set({ status: "SUBMITTED" })
            .where(eq(constructionPayApps.id, payAppId))
            .returning();
    }

    async approveByArchitect(payAppId: string, user: string) {
        return await db.update(constructionPayApps)
            .set({
                status: "ARCHITECT_APPROVED",
                architectApprovedBy: user,
                architectApprovedDate: new Date()
            })
            .where(eq(constructionPayApps.id, payAppId))
            .returning();
    }

    async approveByEngineer(payAppId: string, user: string) {
        return await db.update(constructionPayApps)
            .set({
                status: "ENGINEER_APPROVED",
                engineerApprovedBy: user,
                engineerApprovedDate: new Date()
            })
            .where(eq(constructionPayApps.id, payAppId))
            .returning();
    }

    async certifyPayApp(payAppId: string, user: string) {
        // 0. Compliance Check (Phase 6)
        const appInfo = await db.select().from(constructionPayApps).where(eq(constructionPayApps.id, payAppId)).limit(1);
        if (appInfo.length > 0) {
            const contractId = appInfo[0].contractId;
            const nonCompliant = await db.select().from(constructionCompliance)
                .where(and(
                    eq(constructionCompliance.contractId, contractId),
                    eq(constructionCompliance.isMandatoryForPayment, true),
                    sql`${constructionCompliance.expiryDate} < CURRENT_DATE`
                ));

            if (nonCompliant.length > 0) {
                const docs = nonCompliant.map(d => d.documentType).join(", ");
                throw new Error(`Certification Blocked: Mandatory compliance documents have expired (${docs}). Please update insurance/bonds.`);
            }
        }

        const [app] = await db.update(constructionPayApps)
            .set({
                status: "CERTIFIED",
                certifiedBy: user,
                certifiedDate: new Date(),
                isLocked: true
            })
            .where(eq(constructionPayApps.id, payAppId))
            .returning();

        // L12: Accounting / WIP Generation
        try {
            await this.postPayAppToGL(app.id, user);
        } catch (error) {
            console.error("[L12 Accounting] Failed to post journal:", error);
            // We don't block certification if accounting fails in this MVP, 
            // but in a real system we might.
        }

        return app;
    }

    // -- Compliance Methods --

    async createComplianceRecord(data: any) {
        const [res] = await db.insert(constructionCompliance).values(data).returning();
        return res;
    }

    async getComplianceRecords(contractId: string) {
        return await db.select().from(constructionCompliance)
            .where(eq(constructionCompliance.contractId, contractId))
            .orderBy(desc(constructionCompliance.expiryDate));
    }

    private async postPayAppToGL(payAppId: string, userId: string) {
        const app = await this.getPayApp(payAppId);
        if (!app) return;

        // 1. Resolve Accounts from Setup
        const setup = await this.getSetup();
        const getVal = (key: string, fallback: string) => setup.find(s => s.configKey === key)?.configValue || fallback;

        const wipAccountCode = getVal("WIP_ACCOUNT_CODE", "1410"); // Construction in Progress
        const apAccrualAccountCode = getVal("AP_ACCRUAL_ACCOUNT_CODE", "2110"); // Accounts Payable
        const retainageAccountCode = getVal("RETAINAGE_ACCOUNT_CODE", "2120"); // Retainage Payable

        // 2. Find CCIDs
        const getCCID = async (code: string) => {
            const [cc] = await db.select().from(glCodeCombinations).where(eq(glCodeCombinations.code, code)).limit(1);
            if (cc) return cc.id;
            // Fallback: Use a generic account if direct match fails, or throw
            const [fallback] = await db.select().from(glAccounts).where(eq(glAccounts.accountCode, code)).limit(1);
            return fallback?.id || null;
        };

        const wipCCID = await getCCID(wipAccountCode);
        const apCCID = await getCCID(apAccrualAccountCode);
        const retCCID = await getCCID(retainageAccountCode);

        if (!wipCCID || !apCCID) {
            console.warn("[L12] Missing GL Accounts for construction posting. Skipping journal.");
            return;
        }

        // 3. Prepare Journal
        const amount = Number(app.totalCompleted || 0);
        const retention = Number(app.retentionAmount || 0);
        const netDue = Number(app.currentPaymentDue || 0);

        if (amount === 0) return;

        const lines = [
            {
                accountId: wipCCID,
                description: `Pay App #${app.applicationNumber} - Progress `,
                debit: amount.toString(),
                credit: "0"
            },
            {
                accountId: apCCID,
                description: `Pay App #${app.applicationNumber} - AP Accrual `,
                debit: "0",
                credit: netDue.toString()
            }
        ];

        if (retention > 0 && retCCID) {
            lines.push({
                accountId: retCCID,
                description: `Pay App #${app.applicationNumber} - Retainage `,
                debit: "0",
                credit: retention.toString()
            });
        }

        // 4. Create Journal
        await financeService.createJournal({
            journalNumber: `CONST - ${app.applicationNumber} -${Date.now()} `,
            description: `Construction Progress Billing: App #${app.applicationNumber} `,
            ledgerId: "PRIMARY",
            source: "CONSTRUCTION",
            status: "Posted" // Auto-post if possible
        }, lines, userId);

        console.log(`[L12] Posted WIP Journal for Pay App #${app.applicationNumber} `);
    }

    // -- Phase 6: Field Operations & Compliance --

    // Daily Logs
    async createDailyLog(data: any) {
        const [log] = await db.insert(constructionDailyLogs).values(data).returning();
        return log;
    }

    async getDailyLogs(projectId: string) {
        return await db.select().from(constructionDailyLogs)
            .where(eq(constructionDailyLogs.projectId, projectId))
            .orderBy(desc(constructionDailyLogs.logDate));
    }

    async addLaborLines(dailyLogId: string, lines: any[]) {
        const inserts = lines.map(l => ({ ...l, dailyLogId }));
        return await db.insert(constructionDailyLabor).values(inserts).returning();
    }

    // RFIs
    async createRFI(data: any) {
        const [rfi] = await db.insert(constructionRFIs).values(data).returning();
        return rfi;
    }

    async getRFIs(projectId: string) {
        return await db.select().from(constructionRFIs)
            .where(eq(constructionRFIs.projectId, projectId))
            .orderBy(desc(constructionRFIs.createdAt));
    }

    async updateRFIStatus(id: string, status: string) {
        return await db.update(constructionRFIs)
            .set({ status, closedAt: status === "CLOSED" ? new Date() : null })
            .where(eq(constructionRFIs.id, id))
            .returning();
    }

    // Submittals
    async createSubmittal(data: any) {
        const [sub] = await db.insert(constructionSubmittals).values(data).returning();
        return sub;
    }

    async getSubmittals(projectId: string) {
        return await db.select().from(constructionSubmittals)
            .where(eq(constructionSubmittals.projectId, projectId))
            .orderBy(desc(constructionSubmittals.createdAt));
    }
}
