import { db } from "../db";
import {
    tlCarrierRates,
    tlRateQuotes,
    tlContractRates,
    tlCarriers,
    tlLanes,
    InsertTlCarrierRate,
    InsertTlRateQuote,
    InsertTlContractRate
} from "../../shared/schema/transportation";
import { eq, and, lte, gte, sql, desc } from "drizzle-orm";

export class CarrierRateService {

    // ========== RATE CARD CRUD ==========

    static async getRateCards(filters?: { carrierId?: string; status?: string }) {
        let query = db.select().from(tlCarrierRates);

        if (filters?.carrierId) {
            query = query.where(eq(tlCarrierRates.carrierId, filters.carrierId)) as any;
        }
        if (filters?.status) {
            query = query.where(eq(tlCarrierRates.status, filters.status)) as any;
        }

        return await query.orderBy(desc(tlCarrierRates.createdAt));
    }

    static async createRateCard(data: Omit<InsertTlCarrierRate, 'id'>) {
        const [rateCard] = await db.insert(tlCarrierRates).values(data).returning();
        return rateCard;
    }

    static async updateRateCard(id: string, data: Partial<InsertTlCarrierRate>) {
        const [updated] = await db
            .update(tlCarrierRates)
            .set({ ...data, updatedAt: sql`now()` })
            .where(eq(tlCarrierRates.id, id))
            .returning();
        return updated;
    }

    static async bulkUpsertRateCards(lines: Partial<InsertTlCarrierRate>[]) {
        const results = [];
        for (const line of lines) {
            if (line.id && !line.id.startsWith("temp-")) {
                const updated = await this.updateRateCard(line.id, line);
                results.push(updated);
            } else {
                const { id, ...createData } = line;
                const created = await this.createRateCard(createData as any);
                results.push(created);
            }
        }
        return results;
    }

    static async deleteRateCard(id: string) {
        // Soft delete - set status to INACTIVE
        const [deleted] = await db
            .update(tlCarrierRates)
            .set({ status: "INACTIVE", updatedAt: sql`now()` })
            .where(eq(tlCarrierRates.id, id))
            .returning();
        return deleted;
    }

    // ========== QUOTE GENERATION ==========

    static async generateQuote(shipmentDetails: {
        carrierId: string;
        originId: string;
        destinationId: string;
        weightKg: number;
        volumeCbm?: number;
        serviceLevel?: string;
    }) {
        const { carrierId, originId, destinationId, weightKg, volumeCbm, serviceLevel } = shipmentDetails;

        // Get carrier details
        const [carrier] = await db.select().from(tlCarriers).where(eq(tlCarriers.id, carrierId));
        if (!carrier) {
            throw new Error("Carrier not found");
        }

        // Find active rate card for this carrier and service level
        const now = new Date();
        const [rateCard] = await db
            .select()
            .from(tlCarrierRates)
            .where(
                and(
                    eq(tlCarrierRates.carrierId, carrierId),
                    eq(tlCarrierRates.status, "ACTIVE"),
                    lte(tlCarrierRates.effectiveDate, now),
                    gte(tlCarrierRates.expiryDate, now),
                    serviceLevel ? eq(tlCarrierRates.serviceLevel, serviceLevel) : sql`true`
                )
            )
            .orderBy(desc(tlCarrierRates.effectiveDate))
            .limit(1);

        if (!rateCard) {
            throw new Error("No active rate card found for this carrier");
        }

        // Check max weight constraint
        if (rateCard.maxWeightKg && weightKg > parseFloat(rateCard.maxWeightKg)) {
            throw new Error(`Weight exceeds maximum allowed (${rateCard.maxWeightKg} kg)`);
        }

        // Calculate distance (lookup lane or estimate)
        let distanceMiles = 0;
        const [lane] = await db
            .select()
            .from(tlLanes)
            .where(
                and(
                    eq(tlLanes.originLocationId, originId),
                    eq(tlLanes.destinationLocationId, destinationId)
                )
            )
            .limit(1);

        if (lane && lane.distanceKm) {
            distanceMiles = parseFloat(lane.distanceKm) * 0.621371; // km to miles
        }

        // Quote calculation
        const baseRate = parseFloat(rateCard.baseRate);
        const perKgRate = parseFloat(rateCard.perKgRate || "0");
        const perMileRate = parseFloat(rateCard.perMileRate || "0");
        const minimumCharge = parseFloat(rateCard.minimumCharge || "0");

        let totalCost = baseRate + (weightKg * perKgRate) + (distanceMiles * perMileRate);

        // Apply fuel surcharge (from carrier settings)
        const fuelSurchargePercent = carrier.serviceLevel === "EXPRESS" ? 15 : 10; // Mock logic
        const fuelSurcharge = totalCost * (fuelSurchargePercent / 100);
        totalCost += fuelSurcharge;

        // Enforce minimum charge
        if (totalCost < minimumCharge) {
            totalCost = minimumCharge;
        }

        // Estimate transit days
        const transitDays = distanceMiles > 0 ? Math.ceil(distanceMiles / 500) : 2; // 500 miles/day avg

        // Quote details breakdown
        const quoteDetails = {
            baseRate,
            weightCharge: weightKg * perKgRate,
            distanceCharge: distanceMiles * perMileRate,
            fuelSurcharge,
            fuelSurchargePercent,
            minimumCharge,
            totalBeforeFuel: baseRate + (weightKg * perKgRate) + (distanceMiles * perMileRate),
            distanceMiles,
            rateCardId: rateCard.id,
            rateCardName: rateCard.rateCardName
        };

        // Create quote record
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + 7); // Quote valid for 7 days

        const [quote] = await db.insert(tlRateQuotes).values({
            carrierId,
            quoteAmount: totalCost.toFixed(2),
            transitDays,
            validUntil,
            quoteDetails: JSON.stringify(quoteDetails),
            status: "PENDING"
        }).returning();

        return {
            ...quote,
            carrier: {
                id: carrier.id,
                name: carrier.name,
                scacCode: carrier.scacCode,
                rating: carrier.rating
            },
            breakdown: quoteDetails
        };
    }

    // ========== QUOTE COMPARISON ==========

    static async compareQuotes(shipmentId: string) {
        // Get all quotes for this shipment
        const quotes = await db
            .select()
            .from(tlRateQuotes)
            .where(eq(tlRateQuotes.shipmentId, shipmentId))
            .orderBy(tlRateQuotes.quoteAmount);

        // Enrich with carrier details
        const enrichedQuotes = await Promise.all(
            quotes.map(async (quote) => {
                const [carrier] = await db.select().from(tlCarriers).where(eq(tlCarriers.id, quote.carrierId));
                return {
                    ...quote,
                    carrier: carrier ? {
                        id: carrier.id,
                        name: carrier.name,
                        scacCode: carrier.scacCode,
                        rating: carrier.rating
                    } : null,
                    breakdown: quote.quoteDetails ? JSON.parse(quote.quoteDetails) : null
                };
            })
        );

        return enrichedQuotes;
    }

    // ========== CONTRACT UPLOAD ==========

    static async uploadContractRates(data: {
        contractNumber: string;
        carrierId: string;
        fileName: string;
        fileUrl?: string;
        uploadedBy: string;
        effectiveDate: Date;
        expiryDate: Date;
        ratesCount: number;
    }) {
        const [contract] = await db.insert(tlContractRates).values({
            ...data,
            status: "PENDING"
        }).returning();

        return contract;
    }

    static async processContractRates(contractId: string, parsedRates: any[]) {
        // This would parse CSV/Excel and create multiple rate cards
        // For now, return count
        const [updated] = await db
            .update(tlContractRates)
            .set({
                status: "PROCESSED",
                ratesCount: parsedRates.length
            })
            .where(eq(tlContractRates.id, contractId))
            .returning();

        return updated;
    }

    static async getContracts(carrierId?: string) {
        let query = db.select().from(tlContractRates);

        if (carrierId) {
            query = query.where(eq(tlContractRates.carrierId, carrierId)) as any;
        }

        return await query.orderBy(desc(tlContractRates.uploadedAt));
    }
}
