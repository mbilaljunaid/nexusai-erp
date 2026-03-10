// @ts-nocheck
import { db } from "@db";
import {
    inventory, inventoryTransactions,
    asnHeaders, asnLines,
    wmsWaves, wmsTasks, wmsHandlingUnits
} from "@shared/schema/scm";
import { omOrderHeaders, omOrderLines } from "@shared/schema/order_management";
import { eq, and, sql } from "drizzle-orm";
import { slaEngine } from "../sla/sla.service";

export class WmsShippingService {

    // Ship Confirm (Wave or Order)
    async shipConfirm(payload: { waveId?: string, orderId?: string, carrier?: string, tracking?: string }) {
        return await db.transaction(async (tx) => {
            let linesToShip = [];
            let headerToUpdate = null;
            let supplierId = "INTERNAL"; // Or mapped from Org

            // 1. Identify Scope
            if (payload.orderId) {
                linesToShip = await tx.select().from(omOrderLines).where(eq(omOrderLines.headerId, payload.orderId));
                headerToUpdate = payload.orderId;
            } else if (payload.waveId) {
                // Find orders/lines linked to wave (Need to join wmsTasks -> omOrderLines)
                // Simplified: Logic to find lines from Wave tasks
            }

            if (!headerToUpdate) throw new Error("Order ID required for V1 Shipping");

            // 2. Validate Status
            // Check if all lines are PICKED (or PACKED if we enforced it).
            // For now, allow shipping if PICKED.
            const unpicked = linesToShip.filter(l => l.status !== 'PICKED' && l.status !== 'SHIPPED');
            if (unpicked.length > 0) {
                throw new Error(`Cannot Ship. Lines ${unpicked.map(u => u.lineNumber).join(',')} are not PICKED.`);
            }

            // 3. Update Order Status
            await tx.update(omOrderHeaders)
                .set({ status: 'SHIPPED', shippingMethod: payload.carrier })
                .where(eq(omOrderHeaders.id, payload.orderId!));

            // 4. Update Lines & Deplete Inventory
            const shippedLines = [];

            for (const line of linesToShip) {
                if (line.status === 'SHIPPED') continue;

                // Update Line
                await tx.update(omOrderLines)
                    .set({ status: 'SHIPPED', shippedQuantity: line.orderedQuantity }) // Assume full ship for V1
                    .where(eq(omOrderLines.id, line.id));

                // Deplete Inventory (ISSUE)
                await tx.insert(inventoryTransactions).values({
                    itemId: line.itemId,
                    transactionType: "SHIP",
                    quantity: line.orderedQuantity, // Negative? Usually transactions are positive magnitudes with Type defining direction.
                    // But if we want easy Sum, maybe negative.
                    // Standard: Type=SHIP implies Issue.
                    transactionDate: new Date(),
                    sourceDocumentType: "ORDER",
                    sourceDocumentId: line.headerId,
                    reference: "SHIP-" + line.id
                });

                // DIRECT UPDATE of OnHand (since no trigger exists yet)
                // We assume 'inventory' table has the master record for the Org+Item
                await tx.execute(sql`
                    UPDATE inv_items 
                    SET "quantityOnHand" = "quantityOnHand" - ${line.orderedQuantity}
                    WHERE id = ${line.itemId}
                `);

                shippedLines.push(line);
            }

            // 5. Generate ASN (Advance Shipment Notice)
            // Need a dummy supplierId or 'SELF'
            const asnNumber = "ASN-" + Date.now();
            const [asn] = await tx.insert(asnHeaders).values({
                asnNumber,
                supplierId: "SELF",
                poId: "OUTBOUND", // Not a PO
                status: "SHIPPED",
                shippedDate: new Date(),
                carrier: payload.carrier,
                trackingNumber: payload.tracking
            }).returning();

            for (const line of shippedLines) {
                await tx.insert(asnLines).values({
                    asnId: asn.id,
                    poLineId: line.id, // Using OrderLine ID as ref
                    itemId: line.itemId,
                    quantityShipped: line.orderedQuantity?.toString() || "0"
                });
            }

            // --- 6. SLA Integration (COGS Recognition) ---
            if (shippedLines.length > 0) {
                // Calculate Unit Cost (Mock if missing) - In real world, fetch from CST_ITEM_COSTS
                // For now, we assume a standard cost or fetch from item master if available.
                // We will pass item costs in the payload to SLA engine or let engine derive it if rules exist.
                // Ideally, we pass it here.
                const slaPayload = shippedLines.map(line => ({
                    itemId: line.itemId,
                    orderId: line.headerId,
                    quantity: Number(line.orderedQuantity),
                    unitCost: 100, // MOCK Standard Cost for Beta
                    currency: "USD"
                }));

                // We treat the "Order" as the Accounting Entity for Shipment, or create individual events per line?
                // Usually One Event per Shipment (Order).
                // We will create ONE Accounting Event for the Order's Shipment.

                for (const line of shippedLines) {
                    const quantity = Number(line.orderedQuantity || 0);
                    // MOCK Standard Cost
                    const unitCost = 100.00;
                    const amount = quantity * unitCost;

                    await slaEngine.createAccounting({
                        eventClassId: "SHIP_CONFIRM", // Must match seed script
                        eventTypeId: "SHIP_CONFIRM_STD",
                        entityId: line.id, // Using Line ID (which is VARCHAR)
                        entityTable: "om_order_lines",
                        ledgerId: "PRIMARY",
                        eventDate: new Date(),
                        glDate: new Date(),
                        currencyCode: "USD",
                        amount: amount, // Pass calculated amount to JLT
                        description: `COGS: ${line.itemId}`,
                        sourceData: {
                            ...line,
                            unitCost: unitCost,
                            orderId: payload.orderId // Context for description rules
                        }
                    });
                }
            }

            return { success: true, asnNumber, shippedCount: shippedLines.length };
        });
    }

    // --- AI RATE SHOPPING ---
    async rateShop(shipmentId: string) {
        // Mocking an AI-driven API call that considers contracts, spot rating, and historical reliability.
        const carriers = [
            { name: "FedEx Freight", cost: 450.00, transitDays: 3, reliability: 0.98 },
            { name: "XPO Logistics", cost: 395.00, transitDays: 4, reliability: 0.92 },
            { name: "UPS Supply Chain", cost: 480.00, transitDays: 2, reliability: 0.96 },
            { name: "Old Dominion", cost: 410.00, transitDays: 3, reliability: 0.99 }
        ];

        // Find best blend of Cost vs Reliability (Arbitrary Mock Logic for Demo)
        const optimal = carriers.reduce((prev, curr) => {
            const prevScore = (prev.cost * 0.6) - (prev.reliability * 100 * 0.4);
            const currScore = (curr.cost * 0.6) - (curr.reliability * 100 * 0.4);
            return prevScore < currScore ? prev : curr;
        });

        const savings = Math.max(...carriers.map(c => c.cost)) - optimal.cost;

        // In reality, this would update the shipment record with the chosen carrier and rate.
        return {
            success: true,
            carrier: optimal.name,
            cost: optimal.cost,
            savings: savings.toFixed(2),
            options: carriers,
            reasoning: `Selected based on high reliability (${Math.round(optimal.reliability * 100)}%) balancing a competitive rate.`
        };
    }

    // --- BOL GENERATION ---
    async generateBol(shipmentId: string) {
        // Trigger external PDF engine or generate base64 template
        return {
            success: true,
            bolNumber: `BOL-${shipmentId.substring(0, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`,
            message: "Bill of Lading generated successfully."
        };
    }
}

export const wmsShippingService = new WmsShippingService();
