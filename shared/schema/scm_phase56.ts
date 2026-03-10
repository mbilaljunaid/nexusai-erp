import { pgTable, varchar, integer, timestamp, numeric, boolean, text, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ─────────────────────────────────────────────────────────────
// INVENTORY — ABC Classification Engine
// ─────────────────────────────────────────────────────────────

export const invAbcAssignments = pgTable("inv_abc_assignments", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    itemId: varchar("item_id").notNull(),
    abcClass: varchar("abc_class").notNull(),
    criteriaType: varchar("criteria_type").default("VALUE"),
    criteriaValue: numeric("criteria_value", { precision: 18, scale: 4 }),
    entInventoryOrgId: varchar("ent_inventory_org_id"),
    compiledBy: varchar("compiled_by"),
    status: varchar("status").default("ACTIVE"),
    compiledAt: timestamp("compiled_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// ─────────────────────────────────────────────────────────────
// INVENTORY — Catch Weight (Dual UOM)
// ─────────────────────────────────────────────────────────────

export const invOnhandBalances = pgTable("inv_onhand_balances", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    itemId: varchar("item_id").notNull(),
    subinventoryCode: varchar("subinventory_code"),
    locatorId: varchar("locator_id"),
    lotNumber: varchar("lot_number"),
    primaryUomCode: varchar("primary_uom_code"),
    primaryQty: numeric("primary_qty", { precision: 18, scale: 4 }),
    secondaryUomCode: varchar("secondary_uom_code"),
    secondaryUomQuantity: numeric("secondary_uom_quantity", { precision: 18, scale: 4 }),
    variableConversionFlag: boolean("variable_conversion_flag").default(false),
    actualConversionRate: numeric("actual_conversion_rate", { precision: 18, scale: 6 }),
    entInventoryOrgId: varchar("ent_inventory_org_id"),
    transactedBy: varchar("transacted_by"),
    transactionDate: timestamp("transaction_date").default(sql`now()`),
});

// ─────────────────────────────────────────────────────────────
// PROCUREMENT — Supplier Assessments
// ─────────────────────────────────────────────────────────────

export const poSupplierScores = pgTable("po_supplier_scores", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    supplierId: varchar("supplier_id").notNull(),
    questionnaireRef: varchar("questionnaire_ref"),
    qualityScore: numeric("quality_score", { precision: 5, scale: 2 }),
    deliveryScore: numeric("delivery_score", { precision: 5, scale: 2 }),
    financialScore: numeric("financial_score", { precision: 5, scale: 2 }),
    complianceScore: numeric("compliance_score", { precision: 5, scale: 2 }),
    totalScore: numeric("total_score", { precision: 5, scale: 2 }),
    riskLevel: varchar("risk_level").default("LOW"),
    status: varchar("status").default("SUBMITTED"),
    assessedBy: varchar("assessed_by"),
    assessmentDate: timestamp("assessment_date").default(sql`now()`),
    notes: text("notes"),
});

// ─────────────────────────────────────────────────────────────
// PROCUREMENT — Drop Ship / Back-to-Back Hub
// ─────────────────────────────────────────────────────────────

export const poDropShipLinks = pgTable("po_drop_ship_links", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    linkRef: varchar("link_ref"),
    salesOrderNumber: varchar("sales_order_number").notNull(),
    omSalesOrderLineId: varchar("om_sales_order_line_id"),
    customerId: varchar("customer_id"),
    itemId: varchar("item_id").notNull(),
    qty: numeric("qty", { precision: 18, scale: 4 }),
    supplierId: varchar("supplier_id").notNull(),
    supplierName: varchar("supplier_name"),
    shipToAddress: text("ship_to_address"),
    requestedDeliveryDate: timestamp("requested_delivery_date"),
    dropShipType: varchar("drop_ship_type").default("DROP_SHIP"),
    status: varchar("status").default("PENDING"),
    notes: text("notes"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

// ─────────────────────────────────────────────────────────────
// MANUFACTURING — Rework / Work Orders
// ─────────────────────────────────────────────────────────────

export const mfgWorkOrdersPhase56 = pgTable("mfg_work_orders", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    workOrderNumber: varchar("work_order_number"),
    woClass: varchar("wo_class"),
    description: varchar("description"),
    itemId: varchar("item_id"),
    qtyRequired: numeric("qty_required", { precision: 18, scale: 4 }),
    workCenterId: varchar("work_center_id"),
    requestedDate: timestamp("requested_date"),
    status: varchar("status").default("DRAFT"),
    entInventoryOrgId: varchar("ent_inventory_org_id"),
    createdBy: varchar("created_by"),
    defectCategory: varchar("defect_category"),
    reworkReason: varchar("rework_reason"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

// ─────────────────────────────────────────────────────────────
// MANUFACTURING — Kanban Cards
// ─────────────────────────────────────────────────────────────

export const invKanbanCards = pgTable("inv_kanban_cards", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    cardNumber: varchar("card_number"),
    itemId: varchar("item_id").notNull(),
    subinventoryCode: varchar("subinventory_code"),
    locatorId: varchar("locator_id"),
    kanbanQty: numeric("kanban_qty", { precision: 18, scale: 4 }).notNull(),
    minBinLevel: numeric("min_bin_level", { precision: 18, scale: 4 }),
    replenishmentSource: varchar("replenishment_source"),
    supplierId: varchar("supplier_id"),
    workOrderType: varchar("work_order_type"),
    leadTimeDays: integer("lead_time_days"),
    cardStatus: varchar("card_status").default("ACTIVE"),
    entInventoryOrgId: varchar("ent_inventory_org_id"),
    createdAt: timestamp("created_at").default(sql`now()`),
    lastTriggeredAt: timestamp("last_triggered_at"),
});

// ─────────────────────────────────────────────────────────────
// MANUFACTURING — Formulas
// ─────────────────────────────────────────────────────────────

export const mfgFormulaHeaders = pgTable("mfg_formula_headers", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    formulaCode: varchar("formula_code"),
    formulaName: varchar("formula_name"),
    status: varchar("status").default("ACTIVE"),
    itemId: varchar("item_id"),
    entInventoryOrgId: varchar("ent_inventory_org_id"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

// ─────────────────────────────────────────────────────────────
// COST MANAGEMENT — Overhead Rules
// ─────────────────────────────────────────────────────────────

export const cstOverheadRates = pgTable("cst_overhead_rates", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    ruleCode: varchar("rule_code"),
    name: varchar("name"),
    description: text("description"),
    absorptionBase: varchar("absorption_base").default("LABOR_HOURS"),
    rate: numeric("rate", { precision: 18, scale: 6 }),
    rateType: varchar("rate_type").default("FIXED"),
    glAccount: varchar("gl_account"),
    effectiveDate: timestamp("effective_date"),
    status: varchar("status").default("ACTIVE"),
    entInventoryOrgId: varchar("ent_inventory_org_id"),
    createdBy: varchar("created_by"),
});

// ─────────────────────────────────────────────────────────────
// COST MANAGEMENT — Period Close statuses
// ─────────────────────────────────────────────────────────────

export const cstPeriodStatuses = pgTable("cst_period_statuses", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    period: varchar("period").notNull(),
    entInventoryOrgId: varchar("ent_inventory_org_id"),
    status: varchar("status").default("OPEN"),
    lockedBy: varchar("locked_by"),
    lockedAt: timestamp("locked_at"),
});

// ─────────────────────────────────────────────────────────────
// MAINTENANCE — CBM Rules
// ─────────────────────────────────────────────────────────────

export const maintCbmRules = pgTable("maint_cbm_rules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name"),
    maintAssetId: varchar("maint_asset_id"),
    assetTag: varchar("asset_tag"),
    sensorId: varchar("sensor_id"),
    parameterName: varchar("parameter_name"),
    unit: varchar("unit"),
    thresholdValue: numeric("threshold_value", { precision: 18, scale: 4 }),
    thresholdOperator: varchar("threshold_operator").default("GT"),
    severity: varchar("severity").default("HIGH"),
    woTemplateId: varchar("wo_template_id"),
    triggerDelayMinutes: integer("trigger_delay_minutes").default(0),
    status: varchar("status").default("ACTIVE"),
    notes: text("notes"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

// ─────────────────────────────────────────────────────────────
// TRANSPORTATION — Freight Claims
// ─────────────────────────────────────────────────────────────

export const tmsFreightClaims = pgTable("tms_freight_claims", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    claimNumber: varchar("claim_number"),
    shipmentId: varchar("shipment_id"),
    bolNumber: varchar("bol_number"),
    carrierId: varchar("carrier_id"),
    carrierName: varchar("carrier_name"),
    incidentDate: timestamp("incident_date"),
    claimType: varchar("claim_type"),
    description: text("description"),
    qtyAffected: numeric("qty_affected", { precision: 18, scale: 4 }),
    claimValue: numeric("claim_value", { precision: 18, scale: 4 }),
    currency: varchar("currency").default("USD"),
    evidence: varchar("evidence"),
    status: varchar("status").default("OPEN"),
    submittedBy: varchar("submitted_by"),
    submittedAt: timestamp("submitted_at").default(sql`now()`),
});

// ─────────────────────────────────────────────────────────────
// FINANCE / AP — ERS Run Log
// ─────────────────────────────────────────────────────────────

export const apErsRunLog = pgTable("ap_ers_run_log", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    runId: varchar("run_id"),
    runDate: timestamp("run_date").default(sql`now()`),
    receiptsProcessed: integer("receipts_processed").default(0),
    invoicesGenerated: integer("invoices_generated").default(0),
    errorCount: integer("error_count").default(0),
    status: varchar("status").default("SUCCESS"),
    runBy: varchar("run_by"),
});
