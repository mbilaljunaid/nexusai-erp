
import { db } from "../db";
import {
    faAssets, faBooks, faCategories, faTransactions, faDepreciationHistory,
    faRetirements, faMassAdditions, faTransfers, faAssetBooks, faLeases,
    faPhysicalInventory, faInventoryScans,
    insertFaAssetSchema, insertFaTransactionSchema, insertFaAssetBookSchema
} from "@shared/schema";
import { eq, and, lte, gte, desc, sql } from "drizzle-orm";
import { slaService } from "./SlaService";

export class FaService {

    /**
     * List all Assets (Joined with Corporate Book details by default)
     */
    async listAssets() {
        return await db.select({
            id: faAssets.id,
            assetNumber: faAssets.assetNumber,
            tagNumber: faAssets.tagNumber,
            description: faAssets.description,
            categoryId: faAssets.categoryId,
            status: faAssets.status,
            createdAt: faAssets.createdAt,
            datePlacedInService: faAssetBooks.datePlacedInService,
            originalCost: faAssetBooks.originalCost,
            recoverableCost: faAssetBooks.recoverableCost,
            lifeYears: faAssetBooks.lifeYears,
            method: faAssetBooks.method,
            bookId: faAssetBooks.bookId
        })
            .from(faAssets)
            .leftJoin(faAssetBooks, and(
                eq(faAssets.id, faAssetBooks.assetId),
                eq(faAssetBooks.bookId, "CORP-BOOK-1") // Default for consolidated list view
            ));
    }

    /**
     * Create a new Asset manually (Phase 3: Multi-Book)
     */
    async createAsset(data: any) {
        // 1. Validate Input
        const assetData = insertFaAssetSchema.parse(data);

        // 2. Fetch Category Defaults
        const category = await db.query.faCategories.findFirst({
            where: eq(faCategories.id, assetData.categoryId)
        });
        if (!category) throw new Error("Invalid Asset Category");

        // 3. Insert Physical Asset
        const [asset] = await db.insert(faAssets).values({
            assetNumber: assetData.assetNumber,
            tagNumber: assetData.tagNumber,
            description: assetData.description,
            manufacturer: assetData.manufacturer,
            model: assetData.model,
            serialNumber: assetData.serialNumber,
            categoryId: assetData.categoryId,
            status: "ACTIVE"
        }).returning();

        // 4. Assign to Books (Corp Book is Mandatory in Phase 3)
        // In a real system, we'd loop through all associated books.
        // For Phase 3 MVP, we assume the provided bookId in data.
        const [assetBook] = await db.insert(faAssetBooks).values({
            assetId: asset.id,
            bookId: (data as any).bookId,
            datePlacedInService: (data as any).datePlacedInService,
            originalCost: (data as any).originalCost,
            salvageValue: (data as any).salvageValue || "0",
            recoverableCost: (data as any).recoverableCost,
            lifeYears: (data as any).lifeYears || category.defaultLifeYears,
            method: (data as any).method || category.defaultMethod,
            status: "ACTIVE"
        }).returning();

        // 5. Create "ADDITION" Transaction
        await db.insert(faTransactions).values({
            assetBookId: assetBook.id,
            transactionType: "ADDITION",
            transactionDate: assetBook.datePlacedInService,
            periodName: (data as any).periodName || null,
            amount: assetBook.originalCost,
            description: `Manual Addition: ${asset.description}`,
            status: "POSTED"
        });

        // 6. Trigger SLA (Accounting)
        try {
            const [book] = await db.select().from(faBooks).where(eq(faBooks.id, assetBook.bookId));
            await slaService.createAccounting({
                eventClass: "FA_ADDITION",
                entityId: assetBook.id,
                entityTable: "fa_asset_books",
                description: `Asset Addition ${asset.assetNumber}`,
                amount: Number(assetBook.originalCost),
                currency: "USD",
                date: assetBook.datePlacedInService,
                ledgerId: book?.ledgerId || "PRIMARY",
                sourceData: { categoryId: asset.categoryId }
            });
        } catch (e) {
            console.warn("[FA] SLA Creation failed:", e);
        }

        return asset;
    }

    /**
     * Run Depreciation Engine (Straight Line)
     */
    async runDepreciation(bookId: string, periodName: string, periodEndDate: Date) {
        console.log(`[FA] Initiation depreciation run for Book: ${bookId}, Period: ${periodName}`);

        // Trigger background work
        this.processDepreciationInBackground(bookId, periodName, periodEndDate);

        return {
            success: true,
            status: "Processing",
            message: `Depreciation run for ${bookId} - ${periodName} has been started in the background.`
        };
    }

    private async processDepreciationInBackground(bookId: string, periodName: string, periodEndDate: Date) {
        console.log(`[WORKER] Starting Depreciation Background Job: ${bookId} - ${periodName}`);
        try {
            // 1. Fetch Active Assets for this Book
            const assetBookRecs = await db.select({
                id: faAssetBooks.id,
                assetId: faAssets.id,
                assetNumber: faAssets.assetNumber,
                categoryId: faAssets.categoryId,
                originalCost: faAssetBooks.originalCost,
                recoverableCost: faAssetBooks.recoverableCost,
                lifeYears: faAssetBooks.lifeYears,
                lifeMonths: faAssetBooks.lifeMonths,
                method: faAssetBooks.method
            })
                .from(faAssetBooks)
                .innerJoin(faAssets, eq(faAssetBooks.assetId, faAssets.id))
                .where(and(
                    eq(faAssetBooks.bookId, bookId),
                    eq(faAssetBooks.status, "ACTIVE")
                ));

            let processedCount = 0;

            for (const ab of assetBookRecs) {
                let monthlyDepr = 0;

                if (ab.method === "STL") {
                    const cost = Number(ab.recoverableCost);
                    const totalMonths = (ab.lifeYears * 12) + (ab.lifeMonths || 0);
                    if (totalMonths > 0) {
                        monthlyDepr = cost / totalMonths;
                    }
                } else if (ab.method === "DB" && ab.dbRate) {
                    // Declining Balance: NBV * (Rate / Life)
                    const [last] = await db.select().from(faDepreciationHistory)
                        .where(eq(faDepreciationHistory.assetBookId, ab.id))
                        .orderBy(desc(faDepreciationHistory.periodName))
                        .limit(1);
                    const currentNbv = last ? Number(last.netBookValue) : Number(ab.originalCost);
                    const annualRate = Number(ab.dbRate) / ab.lifeYears;
                    monthlyDepr = (currentNbv * annualRate) / 12;
                } else if (ab.method === "UOP" && ab.totalUnits) {
                    // Units of Production: (Cost - Salvage) * (UnitsThisPeriod / TotalUnits)
                    // For the worker, we'd need to know how many units were consumed in this specific period.
                    // This often comes from a separate 'Meter Reading' table.
                    // For now, we'll assume a mock value or look up from a hypothetical table.
                    const costLessSalvage = Number(ab.recoverableCost);
                    const totalUnits = Number(ab.totalUnits);
                    const consumedUnits = 100; // Mock: In a real app, fetch from fa_meter_readings
                    monthlyDepr = costLessSalvage * (consumedUnits / totalUnits);
                }

                if (monthlyDepr <= 0) continue;

                // 3. Insert History Record
                const [history] = await db.insert(faDepreciationHistory).values({
                    assetBookId: ab.id,
                    periodName: periodName,
                    amount: monthlyDepr.toFixed(2),
                    ytdDepreciation: monthlyDepr.toFixed(2),
                    accumulatedDepreciation: monthlyDepr.toFixed(2),
                    netBookValue: (Number(ab.originalCost) - monthlyDepr).toFixed(2),
                    isPostedToGl: false
                }).returning();

                // 4. Create Transaction
                await db.insert(faTransactions).values({
                    assetBookId: ab.id,
                    transactionType: "DEPRECIATION",
                    transactionDate: periodEndDate,
                    amount: monthlyDepr.toFixed(2),
                    periodName: periodName,
                    description: `Depreciation for ${ab.assetNumber} - ${periodName}`
                });

                // 5. SLA Integration
                try {
                    const [book] = await db.select().from(faBooks).where(eq(faBooks.id, bookId));
                    await slaService.createAccounting({
                        eventClass: "FA_DEPRECIATION",
                        entityId: history.id,
                        entityTable: "fa_depreciation_history",
                        description: `Depreciation ${ab.assetNumber} - ${periodName}`,
                        amount: monthlyDepr,
                        currency: "USD",
                        date: periodEndDate,
                        ledgerId: book?.ledgerId || "PRIMARY",
                        sourceData: { categoryId: ab.categoryId }
                    });
                } catch (e) {
                    console.warn("[FA] SLA Creation failed:", e);
                }

                processedCount++;
            }

            console.log(`[WORKER] Finished Depreciation Background Job. Processed ${processedCount} assets.`);

        } catch (error) {
            console.error(`[WORKER] Depreciation Job Failed:`, error);
        }
    }
    /**
     * Retire an Asset in a specific Book
     */
    async retireAsset(assetId: string, data: { bookId: string, retirementDate: Date, proceeds: number, removalCost: number }) {
        // 1. Fetch Asset Financials for this Book
        const [ab] = await db.select({
            id: faAssetBooks.id,
            assetNumber: faAssets.assetNumber,
            originalCost: faAssetBooks.originalCost,
            categoryId: faAssets.categoryId,
            status: faAssetBooks.status
        })
            .from(faAssetBooks)
            .innerJoin(faAssets, eq(faAssetBooks.assetId, faAssets.id))
            .where(and(
                eq(faAssetBooks.assetId, assetId),
                eq(faAssetBooks.bookId, data.bookId)
            ));

        if (!ab) throw new Error("Asset financials not found for this book");
        if (ab.status !== "ACTIVE") throw new Error("Asset is not active in this book");

        // 2. Calculate Financials
        const [lastHistory] = await db.select().from(faDepreciationHistory)
            .where(eq(faDepreciationHistory.assetBookId, ab.id))
            .orderBy(desc(faDepreciationHistory.periodName))
            .limit(1);

        const accumulatedDepr = lastHistory ? Number(lastHistory.accumulatedDepreciation) : 0;
        const nbv = Number(ab.originalCost) - accumulatedDepr;
        const gainLoss = data.proceeds - data.removalCost - nbv;
        // 3. Create Retirement Record
        const [retirement] = await db.insert(faRetirements).values({
            assetBookId: ab.id,
            retirementDate: data.retirementDate,
            periodName: data.periodName || "CURRENT",
            proceedsOfSale: data.proceeds.toFixed(2),
            costOfRemoval: data.removalCost.toFixed(2),
            netBookValueRetired: nbv.toFixed(2),
            gainLossAmount: gainLoss.toFixed(2),
            approvalStatus: "PENDING" // L11: Approval Workflow
        }).returning();

        // 4. Update Book-Specific Asset Status
        await db.update(faAssetBooks)
            .set({ status: "RETIRED" })
            .where(eq(faAssetBooks.id, ab.id));

        // 5. Create Transaction
        await db.insert(faTransactions).values({
            assetBookId: ab.id,
            transactionType: "RETIREMENT",
            transactionDate: data.retirementDate,
            amount: (-(nbv)).toFixed(2), // Impact on NBV is negative
            periodName: data.periodName || "CURRENT",
            description: `Retirement of ${ab.assetNumber}`
        });

        // 6. SLA Integration (Moved to approveRetirement)

        return retirement;
    }

    /**
     * Approve a Retirement (L11)
     */
    async approveRetirement(retirementId: string, userId: string) {
        const [retirement] = await db.select().from(faRetirements).where(eq(faRetirements.id, retirementId));
        if (!retirement) throw new Error("Retirement not found");
        if (retirement.approvalStatus !== "PENDING") throw new Error("Retirement not in PENDING state");

        // 1. Update Retirement Status
        const [updated] = await db.update(faRetirements)
            .set({
                approvalStatus: "APPROVED",
                approvedBy: userId,
                approvedAt: new Date()
            })
            .where(eq(faRetirements.id, retirementId))
            .returning();

        // 2. Trigger SLA Accounting
        try {
            const [ab] = await db.select({
                id: faAssetBooks.id,
                assetNumber: faAssets.assetNumber,
                bookId: faAssetBooks.bookId,
                categoryId: faAssets.categoryId
            })
                .from(faAssetBooks)
                .innerJoin(faAssets, eq(faAssetBooks.assetId, faAssets.id))
                .where(eq(faAssetBooks.id, retirement.assetBookId));

            const [book] = await db.select().from(faBooks).where(eq(faBooks.id, ab.bookId));

            await slaService.createAccounting({
                eventClass: "FA_RETIREMENT",
                entityId: retirement.id,
                entityTable: "fa_retirements",
                description: `Retirement of ${ab.assetNumber}`,
                amount: Math.abs(Number(retirement.gainLossAmount)),
                currency: "USD",
                date: retirement.retirementDate,
                ledgerId: book?.ledgerId || "PRIMARY",
                sourceData: { gainLoss: Number(retirement.gainLossAmount) }
            });
        } catch (e) {
            console.warn("[FA] SLA Creation failed for retirement approval:", e);
        }

        return updated;
    }

    /**
     * Reinstate a Retired Asset (L3)
     */
    async reinstateAsset(retirementId: string, userId: string) {
        const [retirement] = await db.select().from(faRetirements).where(eq(faRetirements.id, retirementId));
        if (!retirement) throw new Error("Retirement not found");

        // 1. Revert Asset Status
        await db.update(faAssetBooks)
            .set({ status: "ACTIVE" })
            .where(eq(faAssetBooks.id, retirement.assetBookId));

        // 2. Create REINSTATEMENT transaction
        await db.insert(faTransactions).values({
            assetBookId: retirement.assetBookId,
            transactionType: "REINSTATEMENT",
            transactionDate: new Date(),
            amount: retirement.netBookValueRetired,
            periodName: retirement.periodName,
            description: `Reinstatement of asset from retirement ${retirementId}`
        });

        // 3. Mark retirement as REINSTATED (Custom logic/field or just delete?)
        // In Fusion, it's marked as Reinstate. We'll add a status to faRetirements if we want.
        await db.update(faRetirements)
            .set({ approvalStatus: "REINSTATED" })
            .where(eq(faRetirements.id, retirementId));

        return { message: "Asset reinstated successfully" };
    }

    /**
     * Transfer an Asset (L3)
     */
    async transferAsset(assetBookId: string, data: { toLocationId?: string, toCcid?: string, description?: string, transactionDate?: Date, createdBy?: string }) {
        const [ab] = await db.select().from(faAssetBooks).where(eq(faAssetBooks.id, assetBookId));
        if (!ab) throw new Error("Asset Book rec not found");

        const fromLocationId = ab.locationId;
        const fromCcid = ab.ccid;

        // 1. Update Asset Book
        await db.update(faAssetBooks)
            .set({
                locationId: data.toLocationId || ab.locationId,
                ccid: data.toCcid || ab.ccid
            })
            .where(eq(faAssetBooks.id, assetBookId));

        // 2. Create Transfer Record
        const [transfer] = await db.insert(faTransfers).values({
            assetBookId,
            transactionDate: data.transactionDate || new Date(),
            fromLocationId,
            toLocationId: data.toLocationId || ab.locationId,
            fromCcid,
            toCcid: data.toCcid || ab.ccid,
            description: data.description || "Asset Transfer",
            createdBy: data.createdBy || "system"
        }).returning();

        // 3. Create Transaction record for history
        await db.insert(faTransactions).values({
            assetBookId,
            transactionType: "TRANSFER",
            transactionDate: data.transactionDate || new Date(),
            amount: "0", // Transfers usually have 0 financial impact at the asset level
            description: `Transfer: ${fromLocationId} -> ${data.toLocationId}`
        });

        return transfer;
    }

    /**
     * Interface: Prepare Mass Additions
     * Simulates scanning AP for eligible lines.
     */
    async prepareMassAdditions() {
        // Mock implementation: Scan for "Freight" or "Equipment" in AP Invoices (Not really implemented yet)
        // So we will just insert a dummy record for verification purpose if queue empty.

        const existing = await db.select().from(faMassAdditions).limit(1);
        if (existing.length === 0) {
            // Mock finding an AP Invoice Line
            await db.insert(faMassAdditions).values({
                invoiceNumber: "INV-999",
                invoiceLineNumber: 1,
                description: "Imported: Large Generator",
                amount: "50000.00",
                date: new Date(),
                vendorName: "Industrial Corp",
                status: "QUEUE"
            });
            return { count: 1, message: "scanned 1 mock invoice" };
        }
        return { count: 0, message: "no new lines found" };
    }

    /**
     * Post a Mass Addition to Asset
     */
    async postMassAddition(massAdditionId: string, assetDetails: { bookId: string, categoryId: string, assetNumber: string }) {
        const [massAdd] = await db.select().from(faMassAdditions).where(eq(faMassAdditions.id, massAdditionId));
        if (!massAdd) throw new Error("Rec not found");
        if (massAdd.status !== "QUEUE") throw new Error("Rec not in QUEUE");

        // Create Asset
        const newAsset = await this.createAsset({
            assetNumber: assetDetails.assetNumber,
            description: massAdd.description,
            originalCost: massAdd.amount,
            recoverableCost: massAdd.amount, // Added
            bookId: assetDetails.bookId,
            categoryId: assetDetails.categoryId,
            datePlacedInService: massAdd.date,
            method: "STL", // Default
            lifeYears: 5    // Default
        });

        // Update Interface
        await db.update(faMassAdditions)
            .set({ status: "POSTED", createdAssetId: newAsset.id })
            .where(eq(faMassAdditions.id, massAdditionId));

        return newAsset;
    }

    /**
     * Get Asset Roll Forward Report
     */
    async getRollForwardReport(bookId: string, periodName: string) {
        // This report aggregates transactions to show movements.
        // For Phase 3, we'll provide a summary by Category.

        const report = await db.execute(sql`
            SELECT 
                c.major_category,
                c.minor_category,
                COALESCE(SUM(CASE WHEN t.transaction_type = 'ADDITION' THEN t.amount ELSE 0 END), 0) as additions,
                COALESCE(SUM(CASE WHEN t.transaction_type = 'RETIREMENT' THEN t.amount ELSE 0 END), 0) as retirements,
                COALESCE(SUM(CASE WHEN t.transaction_type = 'DEPRECIATION' THEN t.amount ELSE 0 END), 0) as depr_expense,
                COALESCE(SUM(t.amount), 0) as net_movement
            FROM fa_asset_books ab
            JOIN fa_assets a ON ab.asset_id = a.id
            JOIN fa_categories c ON a.category_id = c.id
            LEFT JOIN fa_transactions t ON ab.id = t.asset_book_id AND t.period_name = ${periodName}
            WHERE ab.book_id = ${bookId}
            GROUP BY c.major_category, c.minor_category
        `);

        return report.rows;
    }

    /**
     * Create a Lease and calculate PV of Payments (L4 - IFRS 16)
     */
    async createLease(data: any) {
        // PV = Pmt * [(1 - (1 + r)^-n) / r]
        const pmt = Number(data.monthlyPayment);
        const r = (Number(data.interestRate) / 100) / 12; // Monthly rate
        const n = data.termMonths;

        let pv = 0;
        if (r === 0) {
            pv = pmt * n;
        } else {
            pv = pmt * ((1 - Math.pow(1 + r, -n)) / r);
        }

        const [lease] = await db.insert(faLeases).values({
            ...data,
            pvOfPayments: pv.toFixed(2)
        }).returning();

        return lease;
    }

    /**
     * Link an Asset to a Lease and set as ROU Asset (L4)
     */
    async linkAssetToLease(assetId: string, leaseId: string) {
        await db.update(faAssets)
            .set({ leaseId })
            .where(eq(faAssets.id, assetId));

        return { success: true };
    }

    /**
     * Start a new Physical Inventory Cycle (L3)
     */
    async createPhysicalInventory(data: any) {
        const [inventory] = await db.insert(faPhysicalInventory).values({
            ...data,
            startDate: data.startDate || new Date(),
            status: "OPEN"
        }).returning();
        return inventory;
    }

    /**
     * Record an Asset Scan and Reconcile Location (L3)
     */
    async recordAssetScan(inventoryId: string, assetId: string, scanData: any) {
        // 1. Fetch Current Location from Asset Book (Simplified: check across all books)
        const [ab] = await db.select()
            .from(faAssetBooks)
            .where(eq(faAssetBooks.assetId, assetId))
            .limit(1);

        let reconStatus = "MATCH";
        if (ab && scanData.scannedLocationId !== ab.locationId) {
            reconStatus = "MISMATCH";
        }

        // 2. Insert Scan Record
        const [scan] = await db.insert(faInventoryScans).values({
            inventoryId,
            assetId,
            scanDate: new Date(),
            scannedLocationId: scanData.scannedLocationId,
            scannedBy: scanData.scannedBy || "system",
            condition: scanData.condition || "GOOD",
            notes: scanData.notes,
            reconciliationStatus: reconStatus
        }).returning();

        // 3. Update Asset for Last Verification
        await db.update(faAssets)
            .set({ lastVerifiedAt: new Date() })
            .where(eq(faAssets.id, assetId));

        return scan;
    }

    /**
     * Close and Reconcile the Inventory Cycle (L3)
     */
    async reconcileInventory(inventoryId: string) {
        await db.update(faPhysicalInventory)
            .set({
                status: "RECONCILED",
                endDate: new Date()
            })
            .where(eq(faPhysicalInventory.id, inventoryId));

        return { success: true };
    }
}

export const faService = new FaService();
