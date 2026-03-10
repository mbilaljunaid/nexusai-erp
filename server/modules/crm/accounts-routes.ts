// @ts-nocheck
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

        // Use a Postgres Recursive CTE to fetch all ancestors and descendants up to N levels
        const query = sql`
            WITH RECURSIVE account_tree AS (
                -- Base case: the current account
                SELECT id, name, parent_account_id as "parentAccountId", type, industry, 0 AS level, 'current' AS origin
                FROM accounts WHERE id = ${accountId}
                
                UNION
                
                -- Recursive step 1: ancestors (parents)
                SELECT a.id, a.name, a.parent_account_id as "parentAccountId", a.type, a.industry, at.level - 1, 'ancestor'
                FROM accounts a
                INNER JOIN account_tree at ON a.id = at."parentAccountId" AND at.origin IN ('current', 'ancestor')
                
                UNION
                
                -- Recursive step 2: descendants (children)
                SELECT a.id, a.name, a.parent_account_id as "parentAccountId", a.type, a.industry, at.level + 1, 'descendant'
                FROM accounts a
                INNER JOIN account_tree at ON a.parent_account_id = at.id AND at.origin IN ('current', 'descendant')
            )
            SELECT * FROM account_tree ORDER BY level ASC;
        `;

        const result = await db.execute(query);
        const nodes = result.rows || result; // Handle Drizzle pg driver inconsistencies

        // Find the absolute root (the node with the lowest level / no parent in the tree)
        const rootNodes = nodes.filter((n: any) => !n.parentAccountId || !nodes.find((x: any) => x.id === n.parentAccountId));

        // Helper to build the nested tree
        const buildTree = (parentId: string | null): any[] => {
            return nodes
                .filter((n: any) => n.parentAccountId === parentId)
                .map((n: any) => ({
                    ...n,
                    children: buildTree(n.id)
                }));
        };

        const hierarchy = rootNodes.map((root: any) => ({
            ...root,
            children: buildTree(root.id)
        }));

        res.json({
            hierarchy,
            flatNodes: nodes
        });
    } catch (error: any) {
        console.error("Hierarchy fetch error:", error);
        res.status(500).json({ error: error.message });
    }
});
