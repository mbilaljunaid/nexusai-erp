import "dotenv/config";
import { db } from "../server/db";
import {
    tlCarriers, tlLanes, tlRateAgreements, tlShipments, tlMilestones, tlFreightCharges, tlLocations
} from "../shared/schema/transportation";
import { tlOptimizationService } from "../server/services/TLOptimizationService";
import { freightSettlementService } from "../server/services/FreightSettlementService";
import { eq } from "drizzle-orm";

async function verifyTransportationParity() {
    console.log("🚀 Starting Transportation & Logistics Parity Verification...");

    try {
        // 1. Setup Master Data
        console.log("--- Step 1: Setting up Master Data ---");
        const [pickup] = await db.insert(tlLocations).values({
            code: `SFO-WH-${Date.now().toString().slice(-4)}`,
            name: "San Francisco Warehouse",
            type: "WAREHOUSE",
            city: "San Francisco",
            state: "CA",
            country: "USA"
        }).returning();

        const [delivery] = await db.insert(tlLocations).values({
            code: `LAX-DC-${Date.now().toString().slice(-4)}`,
            name: "Los Angeles DC",
            type: "DC",
            city: "Los Angeles",
            state: "CA",
            country: "USA"
        }).returning();

        const [carrier] = await db.insert(tlCarriers).values({
            scacCode: `GLBL-${Date.now()}`,
            name: "Global Logistics",
            mode: "TRUCK",
            serviceLevel: "STANDARD"
        }).returning();

        const [lane] = await db.insert(tlLanes).values({
            laneCode: `LANE-${Date.now()}`,
            originLocationId: pickup.id,
            destinationLocationId: delivery.id,
            distanceKm: "380",
            transitTimeDays: 1
        }).returning();

        await db.insert(tlRateAgreements).values({
            carrierId: carrier.id,
            laneId: lane.id,
            agreementNumber: `AGR-${Date.now()}`,
            baseRate: "1200.00",
            effectiveDate: new Date("2024-01-01"),
            expiryDate: new Date("2024-12-31"),
        });

        console.log("✅ Master data setup complete.");

        // 2. Shipment Planning & Optimization
        console.log("--- Step 2: Shipment Planning & Optimization ---");
        const [shipment] = await db.insert(tlShipments).values({
            shipmentNumber: `SHP-VERIFY-${Date.now().toString().slice(-4)}`,
            status: "PLANNED",
            plannedDeparture: new Date(),
            plannedArrival: new Date(Date.now() + 86400000)
        }).returning();

        const optimized = await tlOptimizationService.optimizeRoute(shipment.id);
        console.log(`✅ Optimized Route: Carrier=${optimized.selectedCarrier.name}, Cost=$${optimized.estimatedCost}`);

        const risk = await tlOptimizationService.predictDelayRisk(shipment.id);
        console.log(`✅ AI Delay Risk: ${risk.riskScore}% (${risk.flags.join(", ")})`);

        // 3. Tracking & Milestones
        console.log("--- Step 3: Tracking & Milestones ---");
        const [milestone] = await db.insert(tlMilestones).values({
            shipmentId: shipment.id,
            eventName: "PICKUP_COMPLETE",
            eventCode: "PC",
            status: "COMPLETED",
            actualDate: new Date()
        }).returning();
        console.log(`✅ Recorded Milestone: ${milestone.eventName}`);

        // 4. Freight Settlement
        console.log("--- Step 4: Freight Settlement ---");
        const [charge] = await db.insert(tlFreightCharges).values({
            shipmentId: shipment.id,
            chargeType: "FREIGHT",
            plannedAmount: "1200.00",
            status: "ACCRUED"
        }).returning();

        const reconciled = await freightSettlementService.reconcileCharge(charge.id, 1250.00);
        console.log(`✅ Reconciled Charge: Status=${reconciled.status}, Variance=$${reconciled.varianceAmount}`);

        console.log("\n✨ Transportation & Logistics Verification SUCCESSFUL!");

    } catch (error) {
        console.error("❌ Verification FAILED:", error);
        process.exit(1);
    }
}

verifyTransportationParity();
