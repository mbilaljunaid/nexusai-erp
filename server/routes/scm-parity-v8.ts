/**
 * SCM/MFG Oracle Parity — Backend API Routes v8
 *
 * Covers the 14 missing endpoints identified in the v8 full-stack audit:
 * - Supplier ASN Portal (PO Acknowledgement + ASN submission)
 * - Consignment Stock (consumption billing)
 * - RMA Workbench (authorize, receive, QC, dispose)
 * - Production Adherence Report
 * - Transfer Pricing Setup
 * - Multi-Modal Shipment Optimizer
 * - Supplier Scorecard KPI analytics
 */
import { Router } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";

export const scmParityV8Router = Router();

// ─────────────────────────────────────────────────────────────
// SUPPLIER ASN PORTAL — PO Acknowledgements
// ─────────────────────────────────────────────────────────────

scmParityV8Router.get("/procurement/asn-acknowledgements", async (req, res) => {
    try {
        const { supplierId, poId, status } = req.query;
        let query = `
            SELECT a.*, po.order_number AS "poNumber", s.name AS "supplierName"
            FROM scm_asn_acknowledgements a
            LEFT JOIN purchase_orders po ON po.id = a.po_id
            LEFT JOIN scm_suppliers s ON s.id = a.supplier_id
            WHERE 1=1`;
        const params: any[] = [];
        if (supplierId) { query += ` AND a.supplier_id = $${params.length + 1}`; params.push(supplierId); }
        if (poId) { query += ` AND a.po_id = $${params.length + 1}`; params.push(poId); }
        if (status) { query += ` AND a.ack_status = $${params.length + 1}`; params.push(status); }
        query += ` ORDER BY a.created_at DESC`;
        const result = await db.execute(sql.raw(query, params as any));
        res.json(result.rows ?? result);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

scmParityV8Router.post("/procurement/asn-acknowledgements", async (req, res) => {
    try {
        const { poId, supplierId, asnId, ackStatus, confirmedDeliveryDate, rescheduleReason, acknowledgedBy, dockPreAdvised, notes } = req.body;
        if (!poId || !supplierId) return res.status(400).json({ error: "poId and supplierId are required" });
        const result = await db.execute(sql.raw(`
            INSERT INTO scm_asn_acknowledgements
              (po_id, supplier_id, asn_id, ack_status, confirmed_delivery_date, reschedule_reason, acknowledged_by, acknowledged_at, dock_pre_advised, notes)
            VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),$8,$9)
            RETURNING *`,
            [poId, supplierId, asnId, ackStatus || "CONFIRMED", confirmedDeliveryDate, rescheduleReason, acknowledgedBy, dockPreAdvised ?? false, notes]
        ));
        res.status(201).json((result.rows ?? result)[0]);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

scmParityV8Router.patch("/procurement/po/:poId/acknowledge", async (req, res) => {
    try {
        const { ackStatus, confirmedDeliveryDate, rescheduleReason, acknowledgedBy } = req.body;
        const result = await db.execute(sql.raw(`
            UPDATE scm_asn_acknowledgements
            SET ack_status=$1, confirmed_delivery_date=$2, reschedule_reason=$3, acknowledged_by=$4, acknowledged_at=NOW()
            WHERE po_id=$5
            RETURNING *`,
            [ackStatus, confirmedDeliveryDate, rescheduleReason, acknowledgedBy, req.params.poId]
        ));
        const rows = result.rows ?? (result as any);
        if (!rows.length) return res.status(404).json({ error: "No acknowledgement found for this PO" });
        res.json(rows[0]);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────
// CONSIGNMENT STOCK — Billing on Consumption
// ─────────────────────────────────────────────────────────────

scmParityV8Router.get("/inventory/consignment", async (req, res) => {
    try {
        const { supplierId, billingStatus, invOrgId } = req.query;
        let query = `
            SELECT c.*, s.name AS "supplierName", i.\"description\" AS "itemDescription"
            FROM scm_consignment_lines c
            LEFT JOIN scm_suppliers s ON s.id = c.supplier_id
            LEFT JOIN inv_items i ON i.id = c.item_id
            WHERE 1=1`;
        const params: any[] = [];
        if (supplierId) { query += ` AND c.supplier_id = $${params.length + 1}`; params.push(supplierId); }
        if (billingStatus) { query += ` AND c.billing_status = $${params.length + 1}`; params.push(billingStatus); }
        if (invOrgId) { query += ` AND c.ent_inventory_org_id = $${params.length + 1}`; params.push(invOrgId); }
        query += ` ORDER BY c.consumption_date DESC`;
        const result = await db.execute(sql.raw(query, params as any));
        res.json(result.rows ?? result);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

scmParityV8Router.post("/inventory/consignment", async (req, res) => {
    try {
        const { supplierId, itemId, subinventoryId, locatorId, lotNumber, quantityConsumed, uom, consumptionDate, unitCost, currencyCode, notes, entInventoryOrgId } = req.body;
        if (!supplierId || !itemId || !quantityConsumed) return res.status(400).json({ error: "supplierId, itemId, and quantityConsumed are required" });
        const billingAmount = unitCost ? (Number(unitCost) * Number(quantityConsumed)).toFixed(2) : null;
        const result = await db.execute(sql.raw(`
            INSERT INTO scm_consignment_lines
              (supplier_id, item_id, subinventory_id, locator_id, lot_number, quantity_consumed, uom, consumption_date, unit_cost, billing_amount, currency_code, billing_status, notes, ent_inventory_org_id)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'PENDING',$12,$13)
            RETURNING *`,
            [supplierId, itemId, subinventoryId, locatorId, lotNumber, quantityConsumed, uom, consumptionDate, unitCost, billingAmount, currencyCode || "USD", notes, entInventoryOrgId]
        ));
        res.status(201).json((result.rows ?? result)[0]);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

scmParityV8Router.post("/inventory/consignment/:id/bill", async (req, res) => {
    try {
        const { apInvoiceRef } = req.body;
        const result = await db.execute(sql.raw(`
            UPDATE scm_consignment_lines
            SET billing_status='BILLED', ap_invoice_id=$1, billed_at=NOW()
            WHERE id=$2
            RETURNING *`,
            [apInvoiceRef, req.params.id]
        ));
        const rows = result.rows ?? (result as any);
        if (!rows.length) return res.status(404).json({ error: "Consignment line not found" });
        res.json({ ...rows[0], message: `AP Invoice ${apInvoiceRef} linked. Consignment line billed.` });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────
// RMA WORKBENCH — Return Merchandise Authorization
// ─────────────────────────────────────────────────────────────

scmParityV8Router.get("/wms/rma", async (req, res) => {
    try {
        const { status, customerId } = req.query;
        let query = `SELECT r.* FROM scm_rma_headers r WHERE 1=1`;
        const params: any[] = [];
        if (status) { query += ` AND r.status = $${params.length + 1}`; params.push(status); }
        if (customerId) { query += ` AND r.customer_id = $${params.length + 1}`; params.push(customerId); }
        query += ` ORDER BY r.created_at DESC`;
        const headers = await db.execute(sql.raw(query, params as any));
        const headerRows: any[] = headers.rows ?? (headers as any);
        // Pull lines for returned headers
        if (headerRows.length) {
            const ids = headerRows.map((h: any) => `'${h.id}'`).join(",");
            const lines = await db.execute(sql.raw(`SELECT * FROM scm_rma_lines WHERE rma_id IN (${ids}) ORDER BY line_number`));
            const lineRows: any[] = lines.rows ?? (lines as any);
            const enriched = headerRows.map((h: any) => ({ ...h, lines: lineRows.filter((l: any) => l.rma_id === h.id) }));
            return res.json(enriched);
        }
        res.json([]);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

scmParityV8Router.post("/wms/rma", async (req, res) => {
    try {
        const { customerId, supplierId, originalOrderId, returnReason, authorizationDate, currencyCode, notes, lines } = req.body;
        const rmaNumber = `RMA-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
        const headerResult = await db.execute(sql.raw(`
            INSERT INTO scm_rma_headers
              (rma_number, original_order_id, customer_id, supplier_id, return_reason, authorization_date, currency_code, status, notes)
            VALUES ($1,$2,$3,$4,$5,$6,$7,'AUTHORIZED',$8)
            RETURNING *`,
            [rmaNumber, originalOrderId, customerId, supplierId, returnReason, authorizationDate, currencyCode || "USD", notes]
        ));
        const header: any = (headerResult.rows ?? headerResult)[0];
        if (lines?.length) {
            for (let i = 0; i < lines.length; i++) {
                const l = lines[i];
                await db.execute(sql.raw(`
                    INSERT INTO scm_rma_lines
                      (rma_id, line_number, item_id, item_description, qty_authorized, uom, unit_cost, qc_status)
                    VALUES ($1,$2,$3,$4,$5,$6,$7,'PENDING')`,
                    [header.id, i + 1, l.itemId, l.itemDescription, l.qtyAuthorized, l.uom, l.unitCost]
                ));
            }
        }
        res.status(201).json({ ...header, rmaNumber });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

scmParityV8Router.patch("/wms/rma/:id/disposition", async (req, res) => {
    try {
        const { lineId, disposition, qcStatus, qcNotes, qtyInspected, creditValue } = req.body;
        if (lineId) {
            // Update specific line disposition
            await db.execute(sql.raw(`
                UPDATE scm_rma_lines
                SET disposition=$1, qc_status=$2, qc_notes=$3, qty_inspected=$4, credit_value=$5
                WHERE id=$6`,
                [disposition, qcStatus || "PASS", qcNotes, qtyInspected, creditValue, lineId]
            ));
        }
        // Update header status
        const headerResult = await db.execute(sql.raw(`
            UPDATE scm_rma_headers SET status=$1 WHERE id=$2 RETURNING *`,
            [req.body.headerStatus || "INSPECTED", req.params.id]
        ));
        res.json((headerResult.rows ?? headerResult)[0]);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────
// PRODUCTION ADHERENCE REPORT
// ─────────────────────────────────────────────────────────────

scmParityV8Router.get("/manufacturing/production-adherence", async (req, res) => {
    try {
        const { period, workCenterId, invOrgId, isOverdue } = req.query;
        let query = `SELECT * FROM mfg_production_adherence WHERE 1=1`;
        const params: any[] = [];
        if (period) { query += ` AND period = $${params.length + 1}`; params.push(period); }
        if (workCenterId) { query += ` AND work_center_id = $${params.length + 1}`; params.push(workCenterId); }
        if (invOrgId) { query += ` AND ent_inventory_org_id = $${params.length + 1}`; params.push(invOrgId); }
        if (isOverdue === "true") { query += ` AND is_overdue = TRUE`; }
        query += ` ORDER BY reporting_date DESC LIMIT 200`;
        const result = await db.execute(sql.raw(query, params as any));
        res.json(result.rows ?? result);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

scmParityV8Router.post("/manufacturing/production-adherence", async (req, res) => {
    try {
        const {
            workOrderId, workOrderNumber, itemId, itemDescription, workCenterId, workCenterName,
            scheduledQty, actualQty, scrapQty, scheduledStartDate, scheduledEndDate,
            actualStartDate, actualEndDate, period, entInventoryOrgId
        } = req.body;
        if (!workOrderId || !scheduledQty) return res.status(400).json({ error: "workOrderId and scheduledQty are required" });
        const adherencePct = actualQty ? ((Number(actualQty) / Number(scheduledQty)) * 100).toFixed(2) : null;
        const isOverdue = actualEndDate && scheduledEndDate ? new Date(actualEndDate) > new Date(scheduledEndDate) : false;
        const dayVariance = actualEndDate && scheduledEndDate
            ? Math.round((new Date(actualEndDate).getTime() - new Date(scheduledEndDate).getTime()) / 86400000) : null;
        const result = await db.execute(sql.raw(`
            INSERT INTO mfg_production_adherence
              (work_order_id, work_order_number, item_id, item_description, work_center_id, work_center_name,
               scheduled_qty, actual_qty, scrap_qty, scheduled_start_date, scheduled_end_date,
               actual_start_date, actual_end_date, adherence_pct, is_overdue, day_variance, period, ent_inventory_org_id)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
            RETURNING *`,
            [workOrderId, workOrderNumber, itemId, itemDescription, workCenterId, workCenterName,
                scheduledQty, actualQty, scrapQty, scheduledStartDate, scheduledEndDate,
                actualStartDate, actualEndDate, adherencePct, isOverdue, dayVariance, period, entInventoryOrgId]
        ));
        res.status(201).json((result.rows ?? result)[0]);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────
// INTERCOMPANY TRANSFER PRICING SETUP
// ─────────────────────────────────────────────────────────────

scmParityV8Router.get("/costing/transfer-pricing", async (req, res) => {
    try {
        const { status, entityFrom } = req.query;
        let query = `SELECT * FROM cst_transfer_pricing_policies WHERE 1=1`;
        const params: any[] = [];
        if (status) { query += ` AND status = $${params.length + 1}`; params.push(status); }
        if (entityFrom) { query += ` AND "entityFrom" = $${params.length + 1}`; params.push(entityFrom); }
        query += ` ORDER BY "policyCode"`;
        const policies = await db.execute(sql.raw(query, params as any));
        res.json(policies.rows ?? policies);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

scmParityV8Router.post("/costing/transfer-pricing", async (req, res) => {
    try {
        const { policyCode, description, entityFrom, entityTo, method, markupPercent, baseCostType, currencyCode, effectiveFrom, effectiveTo, glAccount, taxImpactTracked, notes } = req.body;
        if (!policyCode || !entityFrom || !entityTo || !method || !effectiveFrom) {
            return res.status(400).json({ error: "policyCode, entityFrom, entityTo, method, and effectiveFrom are required" });
        }
        const result = await db.execute(sql.raw(`
            INSERT INTO cst_transfer_pricing_policies
              ("policyCode", description, "entityFrom", "entityTo", method, "markupPercent", "baseCostType", "currencyCode", "effectiveFrom", "effectiveTo", status, "glAccount", "taxImpactTracked", notes)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'Active',$11,$12,$13)
            RETURNING *`,
            [policyCode, description, entityFrom, entityTo, method, markupPercent || 0, baseCostType || "Standard", currencyCode || "USD", effectiveFrom, effectiveTo, glAccount, taxImpactTracked !== false, notes]
        ));
        res.status(201).json((result.rows ?? result)[0]);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

scmParityV8Router.get("/costing/transfer-pricing/:id/adjustments", async (req, res) => {
    try {
        const result = await db.execute(sql.raw(`
            SELECT * FROM cst_transfer_pricing_adjustments WHERE "policyId" = $1 ORDER BY period DESC`,
            [req.params.id]
        ));
        res.json(result.rows ?? result);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

scmParityV8Router.post("/costing/transfer-pricing/:id/adjustments", async (req, res) => {
    try {
        const { period, baseAmount, markupAmount, taxImpactAmount, currencyCode, notes } = req.body;
        const transferPrice = (Number(baseAmount) + Number(markupAmount)).toFixed(2);
        const result = await db.execute(sql.raw(`
            INSERT INTO cst_transfer_pricing_adjustments
              ("policyId", period, "baseAmount", "markupAmount", "transferPrice", "taxImpactAmount", "currencyCode", status, notes)
            VALUES ($1,$2,$3,$4,$5,$6,$7,'Draft',$8)
            RETURNING *`,
            [req.params.id, period, baseAmount, markupAmount, transferPrice, taxImpactAmount, currencyCode || "USD", notes]
        ));
        res.status(201).json((result.rows ?? result)[0]);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────
// MULTI-MODAL SHIPMENT OPTIMIZER
// ─────────────────────────────────────────────────────────────

scmParityV8Router.get("/tms/multimodal-quotes", async (req, res) => {
    try {
        const { shipmentId, status } = req.query;
        let query = `SELECT * FROM tl_multimodal_quotes WHERE 1=1`;
        const params: any[] = [];
        if (shipmentId) { query += ` AND shipment_id = $${params.length + 1}`; params.push(shipmentId); }
        if (status) { query += ` AND status = $${params.length + 1}`; params.push(status); }
        query += ` ORDER BY total_landed_cost ASC`;
        const result = await db.execute(sql.raw(query, params as any));
        res.json(result.rows ?? result);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

scmParityV8Router.post("/tms/multimodal-quotes", async (req, res) => {
    try {
        const {
            shipmentId, originLocationId, destinationLocationId, totalWeightKg, totalVolumeCbm,
            mode, carrierId, carrierName, freightCost, customsDuty, insuranceCost, currency,
            transitDays, co2KgEmissions, validUntil, notes
        } = req.body;
        if (!mode) return res.status(400).json({ error: "mode is required" });
        const quoteRef = `MMQUOTE-${Date.now().toString().slice(-7)}`;
        const totalLandedCost = (Number(freightCost || 0) + Number(customsDuty || 0) + Number(insuranceCost || 0)).toFixed(2);
        const result = await db.execute(sql.raw(`
            INSERT INTO tl_multimodal_quotes
              (shipment_id, quote_reference, origin_location_id, destination_location_id, total_weight_kg, total_volume_cbm,
               mode, carrier_id, carrier_name, freight_cost, customs_duty, insurance_cost, total_landed_cost,
               currency, transit_days, co2_kg_emissions, status, valid_until, notes)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'QUOTED',$17,$18)
            RETURNING *`,
            [shipmentId, quoteRef, originLocationId, destinationLocationId, totalWeightKg, totalVolumeCbm,
                mode, carrierId, carrierName, freightCost, customsDuty || 0, insuranceCost || 0, totalLandedCost,
                currency || "USD", transitDays, co2KgEmissions, validUntil, notes]
        ));
        res.status(201).json((result.rows ?? result)[0]);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

scmParityV8Router.post("/tms/multimodal-quotes/:id/award", async (req, res) => {
    try {
        const { awardedBy } = req.body;
        const result = await db.execute(sql.raw(`
            UPDATE tl_multimodal_quotes
            SET status='AWARDED', awarded_at=NOW(), awarded_by=$1
            WHERE id=$2
            RETURNING *`,
            [awardedBy, req.params.id]
        ));
        const rows = result.rows ?? (result as any);
        if (!rows.length) return res.status(404).json({ error: "Quote not found" });
        res.json(rows[0]);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────
// SUPPLIER SCORECARD KPI ANALYTICS
// ─────────────────────────────────────────────────────────────

scmParityV8Router.get("/procurement/supplier-scorecard/:supplierId/kpis", async (req, res) => {
    try {
        const { period } = req.query;
        let query = `
            SELECT sc.*, s.name AS "supplierName"
            FROM supplier_scorecards sc
            LEFT JOIN scm_suppliers s ON s.id = sc.supplier_id
            WHERE sc.supplier_id = $1`;
        const params: any[] = [req.params.supplierId];
        if (period) { query += ` AND sc.period = $${params.length + 1}`; params.push(period); }
        query += ` ORDER BY sc.generated_at DESC`;
        const scorecards = await db.execute(sql.raw(query, params as any));
        const scorecardRows: any[] = scorecards.rows ?? (scorecards as any);

        // Pull quality events for context
        const events = await db.execute(sql.raw(`
            SELECT * FROM supplier_quality_events
            WHERE supplier_id = $1 ORDER BY event_date DESC LIMIT 20`,
            [req.params.supplierId]
        ));

        // Compute aggregated KPI block
        const kpiSummary = {
            supplierId: req.params.supplierId,
            period: period || "ALL",
            scorecards: scorecardRows,
            qualityEvents: events.rows ?? events,
            avgOverallScore: scorecardRows.length
                ? (scorecardRows.reduce((s: number, r: any) => s + (r.overall_score || 0), 0) / scorecardRows.length).toFixed(1)
                : null,
            avgDeliveryScore: scorecardRows.length
                ? (scorecardRows.reduce((s: number, r: any) => s + (r.delivery_score || 0), 0) / scorecardRows.length).toFixed(1)
                : null,
            avgQualityScore: scorecardRows.length
                ? (scorecardRows.reduce((s: number, r: any) => s + (r.quality_score || 0), 0) / scorecardRows.length).toFixed(1)
                : null,
        };

        res.json(kpiSummary);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});
