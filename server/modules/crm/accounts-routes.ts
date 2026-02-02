import { Router } from "express";
import { db } from "../../db";
import { accounts, insertAccountSchema } from "../../../shared/schema";
import { eq, like, desc, sql, and } from "drizzle-orm";
import { z } from "zod";
import * as dbStorage from "../../storage"; // Assuming storage methods available or we use db directly

export const accountRoutes = Router();

// --- Accounts CRUD ---

// List accounts (paginated, search)
accountRoutes.get("/", async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search as string;

        let whereClause = undefined;
        if (search) {
            whereClause = like(accounts.name, `%${search}%`);
        }

        const data = await db.select().from(accounts)
            .where(whereClause)
            .limit(limit)
            .offset(offset)
            .orderBy(desc(accounts.createdAt));

        const [countResult] = await db.select({ count: sql<number>`count(*)` })
            .from(accounts)
            .where(whereClause);

        res.json({
            data,
            pagination: {
                total: Number(countResult?.count || 0),
                page,
                limit,
                totalPages: Math.ceil(Number(countResult?.count || 0) / limit)
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: "Failed to list accounts" });
    }
});

// Get single account
accountRoutes.get("/:id", async (req, res) => {
    try {
        const account = await db.select().from(accounts).where(eq(accounts.id, req.params.id));
        if (!account.length) return res.status(404).json({ error: "Account not found" });
        res.json(account[0]);
    } catch (error: any) {
        res.status(500).json({ error: "Failed to fetch account" });
    }
});

// Create account
accountRoutes.post("/", async (req, res) => {
    try {
        const parseResult = insertAccountSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error });
        }
        const [newAccount] = await db.insert(accounts).values(parseResult.data).returning();
        res.status(201).json(newAccount);
    } catch (error: any) {
        console.error("Create account error:", error);
        res.status(500).json({ error: "Failed to create account" });
    }
});

// --- Hierarchy Endpoint ---

// Get Hierarchy: Returns current node, parent (if exists), and all children
accountRoutes.get("/:id/hierarchy", async (req, res) => {
    try {
        const accountId = req.params.id;

        // 1. Get Current Account
        const [current] = await db.select().from(accounts).where(eq(accounts.id, accountId));
        if (!current) return res.status(404).json({ error: "Account not found" });

        // 2. Get Parent (if exists)
        let parent = null;
        if (current.parentAccountId) {
            const [p] = await db.select().from(accounts).where(eq(accounts.id, current.parentAccountId));
            parent = p || null;
        }

        // 3. Get Children
        const children = await db.select().from(accounts).where(eq(accounts.parentAccountId, accountId));

        res.json({
            current,
            parent,
            children
        });
    } catch (error: any) {
        console.error("Hierarchy fetch error:", error);
        res.status(500).json({ error: error.message });
    }
});
