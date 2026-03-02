import { Router } from "express";
import { db } from "../db";
import {
    entLegalGroups, entBusinessUnits, entLegalGroupBuMapping, entBuLedgerMapping, entUserDataAccess,
    insertLegalGroupSchema, insertBusinessUnitSchema, insertLegalGrpBuMapSchema, insertBuLedgerMapSchema, insertUserDataAccessSchema
} from "@shared/schema/enterprise";
import { inventoryOrganizations } from "@shared/schema/scm";
import { and, eq } from "drizzle-orm";
import { enforceRBAC } from "../middleware/auth";
import { Pool } from "pg";

const router = Router();

// Middleware: all routes need auth
router.use(enforceRBAC());

// ========== LEGAL GROUPS ==========
router.get("/legal-groups", async (req, res) => {
    try {
        const tenantId = (req.user as any)?.tenantId || 'system';
        const groups = await db.select().from(entLegalGroups)
            .where(eq(entLegalGroups.tenantId, tenantId));
        res.json(groups);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/legal-groups", async (req, res) => {
    try {
        const tenantId = (req.user as any)?.tenantId || 'system';
        const data = insertLegalGroupSchema.parse({ ...req.body, tenantId });
        const [group] = await db.insert(entLegalGroups).values(data).returning();
        res.json(group);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// ========== BUSINESS UNITS ==========
router.get("/business-units", async (req, res) => {
    try {
        const tenantId = (req.user as any)?.tenantId || 'system';
        const bus = await db.select().from(entBusinessUnits)
            .where(eq(entBusinessUnits.tenantId, tenantId));
        res.json(bus);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/business-units", async (req, res) => {
    try {
        const tenantId = (req.user as any)?.tenantId || 'system';
        const data = insertBusinessUnitSchema.parse({ ...req.body, tenantId });
        const [bu] = await db.insert(entBusinessUnits).values(data).returning();
        res.json(bu);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// ========== MAPPINGS ==========
router.get("/mappings/legal-group-bu", async (req, res) => {
    try {
        const tenantId = (req.user as any)?.tenantId || 'system';
        const mappings = await db.select().from(entLegalGroupBuMapping)
            .where(eq(entLegalGroupBuMapping.tenantId, tenantId));
        res.json(mappings);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/mappings/legal-group-bu", async (req, res) => {
    try {
        const tenantId = (req.user as any)?.tenantId || 'system';
        const data = insertLegalGrpBuMapSchema.parse({ ...req.body, tenantId });
        const [mapping] = await db.insert(entLegalGroupBuMapping).values(data).returning();
        res.json(mapping);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.get("/mappings/bu-ledger", async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'system';
        const mappings = await db.select().from(entBuLedgerMapping)
            .where(eq(entBuLedgerMapping.tenantId, tenantId));
        res.json(mappings);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/mappings/bu-ledger", async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'system';
        const data = insertBuLedgerMapSchema.parse({ ...req.body, tenantId });
        const [mapping] = await db.insert(entBuLedgerMapping).values(data).returning();
        res.json(mapping);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// ========== USER DATA ACCESS ==========
router.get("/user-data-access", async (req, res) => {
    try {
        const tenantId = (req.user as any)?.tenantId || 'system';
        // Get access just for the currently authenticated user
        const userId = (req.user as any)?.id || '1';
        const access = await db.select().from(entUserDataAccess)
            .where(and(
                eq(entUserDataAccess.tenantId, tenantId),
                eq(entUserDataAccess.userId, userId)
            ));
        res.json(access);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/user-data-access", async (req, res) => {
    try {
        const tenantId = (req.user as any)?.tenantId || 'system';
        const data = insertUserDataAccessSchema.parse({ ...req.body, tenantId });
        const [access] = await db.insert(entUserDataAccess).values(data).returning();
        res.json(access);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// ========== INVENTORY ORGANIZATIONS (for WMS / TMS scoping) ==========
router.get("/inventory-orgs", async (req, res) => {
    try {
        const orgs = await db.select().from(inventoryOrganizations);
        res.json(orgs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ========== REFERENCE DATA SETS (for MDM SetID scoping) ==========
// Static seed — extend to a DB table when volumes grow
router.get("/reference-sets", async (req, res) => {
    const sets = [
        { id: "GLOBAL", code: "GLOBAL", name: "Global Set" },
        { id: "US", code: "US", name: "United States" },
        { id: "EU", code: "EU", name: "European Union" },
        { id: "APAC", code: "APAC", name: "Asia Pacific" },
        { id: "LATAM", code: "LATAM", name: "Latin America" },
    ];
    res.json(sets);
});

export { router as enterpriseRoutes };
