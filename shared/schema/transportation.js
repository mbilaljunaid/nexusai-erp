"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertTlStopSchema = exports.insertTlFreightChargeSchema = exports.insertTlMilestoneSchema = exports.insertTlShipmentSchema = exports.insertTlRateAgreementSchema = exports.insertTlLaneSchema = exports.insertTlCarrierSchema = exports.insertTlLocationSchema = exports.tlStops = exports.tlFreightCharges = exports.tlMilestones = exports.tlShipments = exports.tlRateAgreements = exports.tlLanes = exports.tlCarriers = exports.tlLocations = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
// ========== TRANSPORTATION & LOGISTICS SCHEMA ==========
// 1. Locations (Nodes in the Logistics Network)
exports.tlLocations = (0, pg_core_1.pgTable)("tl_locations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    code: (0, pg_core_1.varchar)("code").notNull().unique(), // e.g., "WH-001", "SUP-ABC"
    name: (0, pg_core_1.varchar)("name").notNull(),
    type: (0, pg_core_1.varchar)("type").notNull(), // WAREHOUSE, SUPPLIER, CUSTOMER, HUB, DOCK
    address: (0, pg_core_1.text)("address"),
    city: (0, pg_core_1.varchar)("city"),
    state: (0, pg_core_1.varchar)("state"),
    country: (0, pg_core_1.varchar)("country"),
    postalCode: (0, pg_core_1.varchar)("postal_code"),
    latitude: (0, pg_core_1.numeric)("latitude", { precision: 10, scale: 7 }),
    longitude: (0, pg_core_1.numeric)("longitude", { precision: 10, scale: 7 }),
    timezone: (0, pg_core_1.varchar)("timezone").default("UTC"),
    status: (0, pg_core_1.varchar)("status").default("ACTIVE"), // ACTIVE, INACTIVE
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 2. Carriers (Transport Providers)
exports.tlCarriers = (0, pg_core_1.pgTable)("tl_carriers", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    scacCode: (0, pg_core_1.varchar)("scac_code").notNull().unique(), // Standard Carrier Alpha Code
    name: (0, pg_core_1.varchar)("name").notNull(),
    mode: (0, pg_core_1.varchar)("mode").notNull(), // TRUCK, OCEAN, AIR, RAIL
    serviceLevel: (0, pg_core_1.varchar)("service_level"), // LTL, FTL, PARCEL, EXPRESS
    contactName: (0, pg_core_1.varchar)("contact_name"),
    contactEmail: (0, pg_core_1.varchar)("contact_email"),
    contactPhone: (0, pg_core_1.varchar)("contact_phone"),
    status: (0, pg_core_1.varchar)("status").default("ACTIVE"),
    rating: (0, pg_core_1.numeric)("rating", { precision: 3, scale: 2 }).default("5.00"), // Average rating
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 3. Lanes (Standard Routes)
exports.tlLanes = (0, pg_core_1.pgTable)("tl_lanes", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    laneCode: (0, pg_core_1.varchar)("lane_code").notNull().unique(),
    originLocationId: (0, pg_core_1.varchar)("origin_location_id").notNull(),
    destinationLocationId: (0, pg_core_1.varchar)("destination_location_id").notNull(),
    distanceKm: (0, pg_core_1.numeric)("distance_km", { precision: 10, scale: 2 }),
    transitTimeDays: (0, pg_core_1.integer)("transit_time_days"),
    status: (0, pg_core_1.varchar)("status").default("ACTIVE"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 4. Rate Agreements (Carrier Contracts)
exports.tlRateAgreements = (0, pg_core_1.pgTable)("tl_rate_agreements", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    carrierId: (0, pg_core_1.varchar)("carrier_id").notNull(),
    laneId: (0, pg_core_1.varchar)("lane_id").notNull(),
    agreementNumber: (0, pg_core_1.varchar)("agreement_number").notNull().unique(),
    effectiveDate: (0, pg_core_1.timestamp)("effective_date").notNull(),
    expiryDate: (0, pg_core_1.timestamp)("expiry_date").notNull(),
    baseRate: (0, pg_core_1.numeric)("base_rate", { precision: 18, scale: 2 }).notNull(),
    currency: (0, pg_core_1.varchar)("currency").default("USD"),
    fuelSurchargePercent: (0, pg_core_1.numeric)("fuel_surcharge_percent", { precision: 5, scale: 2 }).default("0"),
    active: (0, pg_core_1.boolean)("active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 5. Shipments (The core transactional object)
exports.tlShipments = (0, pg_core_1.pgTable)("tl_shipments", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    shipmentNumber: (0, pg_core_1.varchar)("shipment_number").notNull().unique(),
    sourceModule: (0, pg_core_1.varchar)("source_module"), // ORDER, PURCHASE, PROJECT
    sourceId: (0, pg_core_1.varchar)("source_id"), // Linked ID from OM/Purchase/Project
    sourceLocationId: (0, pg_core_1.varchar)("source_location_id"), // Linked location
    destinationLocationId: (0, pg_core_1.varchar)("destination_location_id"), // Linked location
    status: (0, pg_core_1.varchar)("status").default("PLANNED"), // PLANNED, DISPATCHED, IN_TRANSIT, DELIVERED, CANCELLED
    carrierId: (0, pg_core_1.varchar)("carrier_id"),
    laneId: (0, pg_core_1.varchar)("lane_id"),
    plannedDeparture: (0, pg_core_1.timestamp)("planned_departure"),
    plannedArrival: (0, pg_core_1.timestamp)("planned_arrival"),
    actualDeparture: (0, pg_core_1.timestamp)("actual_departure"),
    actualArrival: (0, pg_core_1.timestamp)("actual_arrival"),
    totalWeightKg: (0, pg_core_1.numeric)("total_weight_kg", { precision: 18, scale: 4 }),
    totalVolumeCbm: (0, pg_core_1.numeric)("total_volume_cbm", { precision: 18, scale: 4 }),
    totalCost: (0, pg_core_1.numeric)("total_cost", { precision: 18, scale: 2 }),
    trackingNumber: (0, pg_core_1.varchar)("tracking_number"),
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 6. Shipment Milestones (Tracking Events)
exports.tlMilestones = (0, pg_core_1.pgTable)("tl_milestones", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    shipmentId: (0, pg_core_1.varchar)("shipment_id").notNull(),
    eventCode: (0, pg_core_1.varchar)("event_code").notNull(), // PickedUp, InTransit, OutForDelivery, Delivered, Exception
    eventName: (0, pg_core_1.varchar)("event_name").notNull(),
    locationId: (0, pg_core_1.varchar)("location_id"),
    plannedDate: (0, pg_core_1.timestamp)("planned_date"),
    actualDate: (0, pg_core_1.timestamp)("actual_date"),
    status: (0, pg_core_1.varchar)("status").default("PENDING"), // PENDING, COMPLETED, SKIPPED, EXCEPTION
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 7. Freight Charges (Granular costs for settlement)
exports.tlFreightCharges = (0, pg_core_1.pgTable)("tl_freight_charges", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    shipmentId: (0, pg_core_1.varchar)("shipment_id").notNull(),
    chargeType: (0, pg_core_1.varchar)("charge_type").notNull(), // BASE_FREIGHT, FUEL_SURCHARGE, ACCESSORIAL, TAX
    description: (0, pg_core_1.varchar)("description"),
    plannedAmount: (0, pg_core_1.numeric)("planned_amount", { precision: 18, scale: 2 }).notNull(),
    actualAmount: (0, pg_core_1.numeric)("actual_amount", { precision: 18, scale: 2 }),
    varianceAmount: (0, pg_core_1.numeric)("variance_amount", { precision: 18, scale: 2 }),
    currency: (0, pg_core_1.varchar)("currency").default("USD"),
    status: (0, pg_core_1.varchar)("status").default("ACCRUED"), // ACCRUED, MATCHED, DISPUTED, PAID
    isSettled: (0, pg_core_1.boolean)("is_settled").default(false),
    glPosted: (0, pg_core_1.boolean)("gl_posted").default(false),
    reconciledAt: (0, pg_core_1.timestamp)("reconciled_at"),
    reconciledBy: (0, pg_core_1.varchar)("reconciled_by"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 8. Shipment Stops (Multi-leg support)
exports.tlStops = (0, pg_core_1.pgTable)("tl_stops", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    shipmentId: (0, pg_core_1.varchar)("shipment_id").notNull(),
    locationId: (0, pg_core_1.varchar)("location_id").notNull(),
    stopSequence: (0, pg_core_1.integer)("stop_sequence").notNull(), // 1, 2, 3...
    stopType: (0, pg_core_1.varchar)("stop_type").notNull(), // PICKUP, DROPOFF
    plannedArrival: (0, pg_core_1.timestamp)("planned_arrival"),
    actualArrival: (0, pg_core_1.timestamp)("actual_arrival"),
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// ZOD SCHEMAS & TYPES
exports.insertTlLocationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.tlLocations);
exports.insertTlCarrierSchema = (0, drizzle_zod_1.createInsertSchema)(exports.tlCarriers);
exports.insertTlLaneSchema = (0, drizzle_zod_1.createInsertSchema)(exports.tlLanes);
exports.insertTlRateAgreementSchema = (0, drizzle_zod_1.createInsertSchema)(exports.tlRateAgreements);
exports.insertTlShipmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.tlShipments);
exports.insertTlMilestoneSchema = (0, drizzle_zod_1.createInsertSchema)(exports.tlMilestones);
exports.insertTlFreightChargeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.tlFreightCharges);
exports.insertTlStopSchema = (0, drizzle_zod_1.createInsertSchema)(exports.tlStops);
//# sourceMappingURL=transportation.js.map