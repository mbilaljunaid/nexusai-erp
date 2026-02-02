import { pgTable, varchar, text, timestamp, numeric, boolean, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== TRANSPORTATION & LOGISTICS SCHEMA ==========

// 1. Locations (Nodes in the Logistics Network)
export const tlLocations = pgTable("tl_locations", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    code: varchar("code").notNull().unique(), // e.g., "WH-001", "SUP-ABC"
    name: varchar("name").notNull(),
    type: varchar("type").notNull(), // WAREHOUSE, SUPPLIER, CUSTOMER, HUB, DOCK
    address: text("address"),
    city: varchar("city"),
    state: varchar("state"),
    country: varchar("country"),
    postalCode: varchar("postal_code"),
    latitude: numeric("latitude", { precision: 10, scale: 7 }),
    longitude: numeric("longitude", { precision: 10, scale: 7 }),
    timezone: varchar("timezone").default("UTC"),
    status: varchar("status").default("ACTIVE"), // ACTIVE, INACTIVE
    createdAt: timestamp("created_at").default(sql`now()`),
});

// 2. Carriers (Transport Providers)
export const tlCarriers = pgTable("tl_carriers", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    scacCode: varchar("scac_code").notNull().unique(), // Standard Carrier Alpha Code
    name: varchar("name").notNull(),
    mode: varchar("mode").notNull(), // TRUCK, OCEAN, AIR, RAIL
    serviceLevel: varchar("service_level"), // LTL, FTL, PARCEL, EXPRESS
    contactName: varchar("contact_name"),
    contactEmail: varchar("contact_email"),
    contactPhone: varchar("contact_phone"),
    status: varchar("status").default("ACTIVE"),
    rating: numeric("rating", { precision: 3, scale: 2 }).default("5.00"), // Average rating
    createdAt: timestamp("created_at").default(sql`now()`),
});

// 3. Lanes (Standard Routes)
export const tlLanes = pgTable("tl_lanes", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    laneCode: varchar("lane_code").notNull().unique(),
    originLocationId: varchar("origin_location_id").notNull(),
    destinationLocationId: varchar("destination_location_id").notNull(),
    distanceKm: numeric("distance_km", { precision: 10, scale: 2 }),
    transitTimeDays: integer("transit_time_days"),
    status: varchar("status").default("ACTIVE"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

// 4. Rate Agreements (Carrier Contracts)
export const tlRateAgreements = pgTable("tl_rate_agreements", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    carrierId: varchar("carrier_id").notNull(),
    laneId: varchar("lane_id").notNull(),
    agreementNumber: varchar("agreement_number").notNull().unique(),
    effectiveDate: timestamp("effective_date").notNull(),
    expiryDate: timestamp("expiry_date").notNull(),
    baseRate: numeric("base_rate", { precision: 18, scale: 2 }).notNull(),
    currency: varchar("currency").default("USD"),
    fuelSurchargePercent: numeric("fuel_surcharge_percent", { precision: 5, scale: 2 }).default("0"),
    active: boolean("active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

// 5. Shipments (The core transactional object)
export const tlShipments = pgTable("tl_shipments", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    shipmentNumber: varchar("shipment_number").notNull().unique(),
    sourceModule: varchar("source_module"), // ORDER, PURCHASE, PROJECT
    sourceId: varchar("source_id"), // Linked ID from OM/Purchase/Project
    sourceLocationId: varchar("source_location_id"), // Linked location
    destinationLocationId: varchar("destination_location_id"), // Linked location
    status: varchar("status").default("PLANNED"), // PLANNED, DISPATCHED, IN_TRANSIT, DELIVERED, CANCELLED
    carrierId: varchar("carrier_id"),
    laneId: varchar("lane_id"),
    plannedDeparture: timestamp("planned_departure"),
    plannedArrival: timestamp("planned_arrival"),
    actualDeparture: timestamp("actual_departure"),
    actualArrival: timestamp("actual_arrival"),
    totalWeightKg: numeric("total_weight_kg", { precision: 18, scale: 4 }),
    totalVolumeCbm: numeric("total_volume_cbm", { precision: 18, scale: 4 }),
    totalCost: numeric("total_cost", { precision: 18, scale: 2 }),
    trackingNumber: varchar("tracking_number"),
    notes: text("notes"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

// 6. Shipment Milestones (Tracking Events)
export const tlMilestones = pgTable("tl_milestones", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    shipmentId: varchar("shipment_id").notNull(),
    eventCode: varchar("event_code").notNull(), // PickedUp, InTransit, OutForDelivery, Delivered, Exception
    eventName: varchar("event_name").notNull(),
    locationId: varchar("location_id"),
    plannedDate: timestamp("planned_date"),
    actualDate: timestamp("actual_date"),
    status: varchar("status").default("PENDING"), // PENDING, COMPLETED, SKIPPED, EXCEPTION
    description: text("description"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

// 7. Freight Charges (Granular costs for settlement)
export const tlFreightCharges = pgTable("tl_freight_charges", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    shipmentId: varchar("shipment_id").notNull(),
    chargeType: varchar("charge_type").notNull(), // BASE_FREIGHT, FUEL_SURCHARGE, ACCESSORIAL, TAX
    description: varchar("description"),
    plannedAmount: numeric("planned_amount", { precision: 18, scale: 2 }).notNull(),
    actualAmount: numeric("actual_amount", { precision: 18, scale: 2 }),
    varianceAmount: numeric("variance_amount", { precision: 18, scale: 2 }),
    currency: varchar("currency").default("USD"),
    status: varchar("status").default("ACCRUED"), // ACCRUED, MATCHED, DISPUTED, PAID
    isSettled: boolean("is_settled").default(false),
    glPosted: boolean("gl_posted").default(false),
    reconciledAt: timestamp("reconciled_at"),
    reconciledBy: varchar("reconciled_by"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

// 8. Shipment Stops (Multi-leg support)
export const tlStops = pgTable("tl_stops", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    shipmentId: varchar("shipment_id").notNull(),
    locationId: varchar("location_id").notNull(),
    stopSequence: integer("stop_sequence").notNull(), // 1, 2, 3...
    stopType: varchar("stop_type").notNull(), // PICKUP, DROPOFF
    plannedArrival: timestamp("planned_arrival"),
    actualArrival: timestamp("actual_arrival"),
    notes: text("notes"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

// ZOD SCHEMAS & TYPES
export const insertTlLocationSchema = createInsertSchema(tlLocations);
export const insertTlCarrierSchema = createInsertSchema(tlCarriers);
export const insertTlLaneSchema = createInsertSchema(tlLanes);
export const insertTlRateAgreementSchema = createInsertSchema(tlRateAgreements);
export const insertTlShipmentSchema = createInsertSchema(tlShipments);
export const insertTlMilestoneSchema = createInsertSchema(tlMilestones);
export const insertTlFreightChargeSchema = createInsertSchema(tlFreightCharges);

export type TlLocation = typeof tlLocations.$inferSelect;
export type TlCarrier = typeof tlCarriers.$inferSelect;
export type TlLane = typeof tlLanes.$inferSelect;
export type TlRateAgreement = typeof tlRateAgreements.$inferSelect;
export type TlShipment = typeof tlShipments.$inferSelect;
export type TlMilestone = typeof tlMilestones.$inferSelect;
export type TlFreightCharge = typeof tlFreightCharges.$inferSelect;
export type TlStop = typeof tlStops.$inferSelect;
export const insertTlStopSchema = createInsertSchema(tlStops);
