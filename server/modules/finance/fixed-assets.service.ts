import { db } from "@db";
import {
    faAssets, faAssetBooks, faTransactions, faDepreciationHistory,
    faBooks, faCategories
} from "@shared/schema/fixedAssets";
import { slaEngine } from "../sla/sla.service";
import { eq, and, desc, sql } from "drizzle-orm";

export class FixedAssetsService {

    // 1. Asset Addition
    async postAddition(assetId: string, bookId: string) {
        return await db.transaction(async (tx) => {
            // Get Asset Details
            const [assetBook] = await tx.select().from(faAssetBooks)
                .where(and(eq(faAssetBooks.assetId, assetId), eq(faAssetBooks.bookId, bookId)));

            if (!assetBook) throw new Error("Asset Book record not found");

            const [asset] = await tx.select().from(faAssets).where(eq(faAssets.id, assetId));
            const [book] = await tx.select().from(faBooks).where(eq(faBooks.id, bookId));

            // Create Transaction
            const [trx] = await tx.insert(faTransactions).values({
                assetBookId: assetBook.id,
                transactionType: "ADDITION",
                transactionDate: new Date(),
                periodName: book.currentPeriodName || new Date().toISOString().slice(0, 7), // Mock period
                amount: assetBook.originalCost.toString(),
                description: `Asset Addition: ${asset.assetNumber}`,
                status: "POSTED"
            }).returning();

            // Trigger SLA
            await slaEngine.createAccounting({
                eventClassId: "FA_ADDITION",
                eventTypeId: "FA_ADDITION_STD",
                entityId: trx.id,
                entityTable: "fa_transactions",
                ledgerId: book.ledgerId,
                eventDate: new Date(),
                glDate: new Date(),
                currencyCode: "USD", // Should fetch from Ledger
                amount: Number(assetBook.originalCost),
                description: `Asset Addition: ${asset.assetNumber}`,
                sourceData: {
                    transactionId: trx.id,
                    assetId: asset.id,
                    assetNumber: asset.assetNumber,
                    bookId: book.id,
                    categoryId: asset.categoryId
                }
            });

            return trx;
        });
    }

    // 2. Run Depreciation
    async runDepreciation(bookId: string, periodName: string) {
        // Mock Implementation: Depreciate all active assets in book
        // Real impl would calculate based on method/life
        const assets = await db.select().from(faAssetBooks)
            .innerJoin(faAssets, eq(faAssetBooks.assetId, faAssets.id))
            .where(and(
                eq(faAssetBooks.bookId, bookId),
                eq(faAssetBooks.status, "ACTIVE")
            ));

        const results = [];

        for (const record of assets) {
            const { fa_asset_books: assetBook, fa_assets: asset } = record;

            // Simple STL Calculation: Cost / LifeMonths
            const lifeMonths = assetBook.lifeMonths || (assetBook.lifeYears * 12) || 60;
            const cost = Number(assetBook.recoverableCost);
            const monthlyDepr = cost / lifeMonths;

            // Create History Record
            const [history] = await db.insert(faDepreciationHistory).values({
                assetBookId: assetBook.id,
                periodName: periodName,
                amount: monthlyDepr.toFixed(2),
                ytdDepreciation: monthlyDepr.toFixed(2), // Simplified
                accumulatedDepreciation: monthlyDepr.toFixed(2), // Simplified
                netBookValue: (cost - monthlyDepr).toFixed(2),
                isPostedToGl: false
            }).returning();

            // Trigger SLA
            // Check if we need a Transaction record? Usually Depreciation is mass event or periodic.
            // Some systems link to a 'DEPRECIATION' transaction header.
            // Here we link to History ID or create a Transaction?
            // Let's create a Transaction for visibility.
            const [trx] = await db.insert(faTransactions).values({
                assetBookId: assetBook.id,
                transactionType: "DEPRECIATION",
                transactionDate: new Date(),
                periodName: periodName,
                amount: monthlyDepr.toFixed(2),
                description: `Depreciation ${periodName}`,
                status: "POSTED"
            }).returning();

            await slaEngine.createAccounting({
                eventClassId: "FA_DEPRECIATION",
                eventTypeId: "FA_DEPR_RUN",
                entityId: trx.id, // Link to Transaction
                entityTable: "fa_transactions",
                ledgerId: "PRIMARY", // Mock
                eventDate: new Date(),
                glDate: new Date(),
                currencyCode: "USD",
                amount: monthlyDepr,
                description: `Depr ${periodName}: ${asset.assetNumber}`,
                sourceData: {
                    transactionId: trx.id,
                    assetId: asset.id,
                    assetNumber: asset.assetNumber,
                    periodName: periodName
                }
            });

            results.push(trx);
        }

        return results;
    }

    // 3. Retirement (Gain/Loss)
    async retireAsset(assetId: string, bookId: string, proceeds: number, costOfRemoval: number) {
        return await db.transaction(async (tx) => {
            const [assetBook] = await tx.select().from(faAssetBooks)
                .where(and(eq(faAssetBooks.assetId, assetId), eq(faAssetBooks.bookId, bookId)));

            const [asset] = await tx.select().from(faAssets).where(eq(faAssets.id, assetId));

            // Calculate NBV (Mock: Original Cost - 0 Depr for now, or fetch history)
            // Ideally fetch sum of depr.
            const accumDeprRes = await tx.select({ sum: sql<string>`sum(amount)` })
                .from(faTransactions)
                .where(and(eq(faTransactions.assetBookId, assetBook.id), eq(faTransactions.transactionType, 'DEPRECIATION')));

            const accumDepr = Number(accumDeprRes[0]?.sum || 0);
            const cost = Number(assetBook.originalCost);
            const nbv = cost - accumDepr;

            const gainLoss = proceeds - costOfRemoval - nbv;

            // Create Retirement Transaction
            const [trx] = await tx.insert(faTransactions).values({
                assetBookId: assetBook.id,
                transactionType: "RETIREMENT",
                transactionDate: new Date(),
                periodName: "Current",
                amount: nbv.toString(), // Transaction amount usually NBV or Proceeds? Let's use NBV impact.
                description: `Retirement: ${asset.assetNumber}`,
                status: "POSTED"
            }).returning();

            // Trigger SLA
            await slaEngine.createAccounting({
                eventClassId: "FA_RETIREMENT",
                eventTypeId: "FA_RETIREMENT_SALE",
                entityId: trx.id,
                entityTable: "fa_transactions",
                ledgerId: "PRIMARY",
                eventDate: new Date(),
                glDate: new Date(),
                currencyCode: "USD",
                amount: Math.abs(gainLoss), // Verification will check detailed lines
                description: `Retirement: ${asset.assetNumber}`,
                sourceData: {
                    assetId: asset.id,
                    assetNumber: asset.assetNumber,
                    proceeds: proceeds,
                    costOfRemoval: costOfRemoval,
                    netBookValue: nbv,
                    gainLoss: gainLoss
                }
            });

            return trx;
        });
    }
}

export const fixedAssetsService = new FixedAssetsService();
