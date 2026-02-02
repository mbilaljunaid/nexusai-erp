import { db } from "../../db";
import {
    leads, opportunities, contacts, campaigns, products,
    type Lead, type Opportunity
} from "@shared/schema";
import { eq, and, or, like, desc, sql, inArray } from "drizzle-orm";
import { dbStorage } from "../../storage-db"; // Legacy storage wrapper, we will migrate away or wrap it here
import { CrmAiService } from "../../services/CrmAiService"; // AI Service
import { leadService } from "../../services/LeadService"; // Legacy lead service

export class CrmService {

    // ========== DASHBOARD METRICS ==========
    // Logic extracted from /api/crm/metrics
    async getDashboardMetrics(userId: number, scope: string = 'all') {
        // 1. Total Leads
        let leadWhere = undefined;
        if (scope === 'mine') {
            leadWhere = eq(leads.ownerId, String(userId));
        }
        const [leadCount] = await db.select({ count: sql<number>`count(*)` })
            .from(leads)
            .where(leadWhere);

        // 2. Pipeline Value (Sum of Open Opportunities)
        const openStages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation'];
        let pipelineConditions = [inArray(opportunities.stage, openStages)];

        if (scope === 'mine') {
            pipelineConditions.push(eq(opportunities.ownerId, String(userId)));
        }

        const openOps = await db.select().from(opportunities)
            .where(and(...pipelineConditions));

        const pipelineValue = openOps.reduce((sum, op) => sum + Number(op.amount || 0), 0);

        // Weighted Pipeline Calculation
        const probabilityMap: Record<string, number> = {
            'Prospecting': 0.1,
            'Qualification': 0.2,
            'Proposal': 0.5,
            'Negotiation': 0.8,
            'Closed Won': 1.0,
            'Closed Lost': 0.0
        };

        const weightedValue = openOps.reduce((sum, op) => {
            const prob = probabilityMap[op.stage || 'Prospecting'] || 0;
            return sum + (Number(op.amount || 0) * prob);
        }, 0);

        // 3. Win Rate
        const winConditions = [eq(opportunities.stage, 'Closed Won')];
        const lostConditions = [eq(opportunities.stage, 'Closed Lost')];

        if (scope === 'mine') {
            winConditions.push(eq(opportunities.ownerId, String(userId)));
            lostConditions.push(eq(opportunities.ownerId, String(userId)));
        }

        const [won] = await db.select({ count: sql<number>`count(*)` }).from(opportunities).where(and(...winConditions));
        const [lost] = await db.select({ count: sql<number>`count(*)` }).from(opportunities).where(and(...lostConditions));

        const wonCount = Number(won?.count || 0);
        const lostCount = Number(lost?.count || 0);
        const totalClosed = wonCount + lostCount;
        const winRate = totalClosed > 0 ? Math.round((wonCount / totalClosed) * 100) : 0;

        return {
            totalLeads: Number(leadCount?.count || 0),
            pipelineValue: `$${(pipelineValue / 1000000).toFixed(1)}M`,
            weightedPipelineValue: `$${(weightedValue / 1000000).toFixed(1)}M`,
            winRate: `${winRate}%`,
            avgSalesCycle: "18 days", // Placeholder
            // Add Trend Data (Mock for now, could be real query)
            revenueTrend: [
                { month: 'Jan', value: 4000 },
                { month: 'Feb', value: 3000 },
                { month: 'Mar', value: 2000 },
                { month: 'Apr', value: 2780 },
                { month: 'May', value: 1890 },
                { month: 'Jun', value: 2390 },
            ],
            leadsBySource: [
                { name: 'Web', value: 400 },
                { name: 'Referral', value: 300 },
                { name: 'Events', value: 300 },
                { name: 'Other', value: 240 },
            ]
        };
    }

    // ========== OPPORTUNITIES ==========

    async getOpportunities(params: { page: number, limit: number, search?: string, accountId?: string }) {
        const { page = 1, limit = 10, search, accountId } = params;
        const offset = (page - 1) * limit;

        const conditions = [];
        if (search) {
            conditions.push(or(
                like(opportunities.name, `%${search}%`),
                like(opportunities.stage, `%${search}%`)
            ));
        }
        if (accountId) {
            conditions.push(eq(opportunities.accountId, accountId));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const data = await db.select().from(opportunities)
            .where(whereClause)
            .limit(limit)
            .offset(offset)
            .orderBy(desc(opportunities.createdAt));

        const [countResult] = await db.select({ count: sql<number>`count(*)` })
            .from(opportunities)
            .where(whereClause);

        return {
            data,
            pagination: {
                total: Number(countResult?.count || 0),
                page,
                limit,
                totalPages: Math.ceil(Number(countResult?.count || 0) / limit)
            }
        };
    }

    async createOpportunity(data: any) {
        // Ensure decimal fields are strings
        const formattedData = {
            ...data,
            amount: data.amount ? String(data.amount) : null,
            expectedRevenue: data.expectedRevenue ? String(data.expectedRevenue) : null,
            actualCost: data.actualCost ? String(data.actualCost) : null
        };
        // @ts-ignore
        return await dbStorage.createOpportunity(formattedData);
    }

    async updateOpportunity(id: string, data: any) {
        const formattedData = {
            ...data,
            amount: data.amount ? String(data.amount) : undefined,
            expectedRevenue: data.expectedRevenue ? String(data.expectedRevenue) : undefined,
            actualCost: data.actualCost ? String(data.actualCost) : undefined
        };
        // @ts-ignore
        return await dbStorage.updateOpportunity(id, formattedData);
    }

    async analyzeOpportunity(id: string) {
        return await CrmAiService.analyzeOpportunity(id);
    }

    // ========== LEADS ==========

    async getLeads(params: { page: number, limit: number, search?: string }) {
        const { page = 1, limit = 10, search } = params;
        const offset = (page - 1) * limit;

        let whereClause = undefined;
        if (search) {
            whereClause = or(
                like(leads.company, `%${search}%`),
                like(leads.lastName, `%${search}%`),
                like(leads.email, `%${search}%`)
            );
        }

        const data = await db.select().from(leads)
            .where(whereClause)
            .limit(limit)
            .offset(offset)
            .orderBy(desc(leads.createdAt));

        const [countResult] = await db.select({ count: sql<number>`count(*)` })
            .from(leads)
            .where(whereClause);

        return {
            data,
            pagination: {
                total: Number(countResult?.count || 0),
                page,
                limit,
                totalPages: Math.ceil(Number(countResult?.count || 0) / limit)
            }
        };
    }

    async getLeadById(id: string) {
        return await dbStorage.getLead(id);
    }

    async createLead(data: any) {
        // Validation/Scoring Logic
        const score = leadService.calculateLeadScore(data);
        const leadData = {
            ...data,
            score,
            annualRevenue: data.annualRevenue ? String(data.annualRevenue) : null
        };
        // @ts-ignore
        return await dbStorage.createLead(leadData);
    }

    async convertLead(id: string) {
        return await leadService.convertLead(id);
    }

    // ========== CAMPAIGNS ==========

    async getCampaigns(params: { page: number, limit: number }) {
        const { page = 1, limit = 10 } = params;
        const offset = (page - 1) * limit;

        const data = await db.select().from(campaigns)
            .limit(limit)
            .offset(offset)
            .orderBy(desc(campaigns.createdAt));

        const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(campaigns);

        return {
            data,
            pagination: {
                total: Number(countResult?.count || 0),
                page,
                limit,
                totalPages: Math.ceil(Number(countResult?.count || 0) / limit)
            }
        };
    }

    async createCampaign(data: any) {
        const formatted = {
            ...data,
            budget: data.budget ? String(data.budget) : null,
            actualCost: data.actualCost ? String(data.actualCost) : null,
            expectedRevenue: data.expectedRevenue ? String(data.expectedRevenue) : null
        };
        // @ts-ignore
        return await dbStorage.createCampaign(formatted);
    }

    async updateCampaign(id: string, data: any) {
        const formatted = {
            ...data,
            budget: data.budget ? String(data.budget) : undefined,
            actualCost: data.actualCost ? String(data.actualCost) : undefined,
            expectedRevenue: data.expectedRevenue ? String(data.expectedRevenue) : undefined
        };
        // @ts-ignore
        return await dbStorage.updateCampaign(id, formatted);
    }

    async deleteCampaign(id: string) {
        return await dbStorage.deleteCampaign(id);
    }

    // ========== PRODUCTS ==========

    async getProducts(params: { page: number, limit: number, search?: string }) {
        const { page = 1, limit = 10, search } = params;
        const offset = (page - 1) * limit;

        let whereClause = undefined;
        if (search) {
            whereClause = like(products.name, `%${search}%`);
        }

        const data = await db.select().from(products)
            .where(whereClause)
            .limit(limit)
            .offset(offset)
            .orderBy(desc(products.createdAt));

        const [countResult] = await db.select({ count: sql<number>`count(*)` })
            .from(products)
            .where(whereClause);

        return {
            data,
            pagination: {
                total: Number(countResult?.count || 0),
                page,
                limit,
                totalPages: Math.ceil(Number(countResult?.count || 0) / limit)
            }
        };
    }

    async createProduct(data: typeof products.$inferInsert) {
        return await dbStorage.createProduct(data);
    }

    // ========== INTERACTIONS ==========

    async getInteractions(entityType: string, entityId: string) {
        return await dbStorage.listInteractions(entityType, entityId);
    }

    async createInteraction(data: any) {
        return await dbStorage.createInteraction(data);
    }
    // ========== PRICE BOOKS ==========

    async createPriceBook(data: any) {
        return await dbStorage.createPriceBook(data);
    }

    // ========== OPPORTUNITY LINE ITEMS ==========

    async listOpportunityLineItems(opportunityId: string) {
        return await dbStorage.listOpportunityLineItems(opportunityId);
    }

    async createOpportunityLineItem(data: any) {
        return await dbStorage.createOpportunityLineItem(data);
    }

    async deleteOpportunityLineItem(itemId: string) {
        return await dbStorage.deleteOpportunityLineItem(itemId);
    }

    // ========== CONTACTS ==========

    async getContacts(params: { page: number, limit: number, search?: string }) {
        const { page = 1, limit = 10, search } = params;
        const offset = (page - 1) * limit;

        let whereClause = undefined;
        if (search) {
            whereClause = or(
                like(contacts.firstName, `%${search}%`),
                like(contacts.lastName, `%${search}%`),
                like(contacts.email, `%${search}%`)
            );
        }

        const data = await db.select().from(contacts)
            .where(whereClause)
            .limit(limit)
            .offset(offset)
            .orderBy(desc(contacts.createdAt));

        const [countResult] = await db.select({ count: sql<number>`count(*)` })
            .from(contacts)
            .where(whereClause);

        return {
            data,
            pagination: {
                total: Number(countResult?.count || 0),
                page,
                limit,
                totalPages: Math.ceil(Number(countResult?.count || 0) / limit)
            }
        };
    }

    async getContactById(id: string) {
        const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
        return contact;
    }

    async createContact(data: typeof contacts.$inferInsert) {
        const [contact] = await db.insert(contacts).values(data).returning();
        return contact;
    }

    async updateContact(id: string, data: Partial<typeof contacts.$inferInsert>) {
        const [contact] = await db.update(contacts)
            .set(data)
            .where(eq(contacts.id, id))
            .returning();
        return contact;
    }

    async deleteContact(id: string) {
        const [deleted] = await db.delete(contacts)
            .where(eq(contacts.id, id))
            .returning();
        return !!deleted;
    }
}

export const crmService = new CrmService();
