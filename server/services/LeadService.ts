import { db } from "../db";
import { eq } from "drizzle-orm";
import {
    leads, accounts, contacts, opportunities,
    type Account, type Contact, type Opportunity, type Lead
} from "@shared/schema";

export class LeadService {

    /**
     * Converts a qualified Lead into an Account, Contact, and Opportunity in a single transaction.
     * This is an irreversible operation (mostly).
     */
    async convertLead(leadId: string, ownerId?: string): Promise<{ account: Account; contact: Contact; opportunity: Opportunity }> {
        return await db.transaction(async (tx) => {
            // 1. Fetch Lead
            const [lead] = await tx.select().from(leads).where(eq(leads.id, leadId));

            if (!lead) {
                throw new Error("Lead not found");
            }
            if (lead.isConverted) {
                throw new Error("Lead is already converted");
            }

            const assignedOwner = ownerId || lead.ownerId;
            const accountName = lead.company || `${lead.firstName} ${lead.lastName}`;

            // 2. Create Account
            const [account] = await tx.insert(accounts).values({
                name: accountName,
                industry: lead.industry,
                phone: lead.phone,
                billingCity: lead.city,
                billingState: lead.state,
                billingCountry: lead.country,
                ownerId: assignedOwner,
                status: "Active",
                type: "Prospect"
            }).returning();

            // 3. Create Contact
            const [contact] = await tx.insert(contacts).values({
                accountId: account.id,
                firstName: lead.firstName || "Unknown", // Schema requires first name
                lastName: lead.lastName,
                email: lead.email,
                phone: lead.phone,
                mobilePhone: lead.mobilePhone,
                mailingCity: lead.city,
                mailingState: lead.state,
                mailingCountry: lead.country,
                ownerId: assignedOwner,
                leadSource: lead.leadSource
            }).returning();

            // 4. Create Opportunity
            const [opportunity] = await tx.insert(opportunities).values({
                accountId: account.id,
                contactId: contact.id, // Primary contact
                name: `${accountName} - Initial Opportunity`,
                stage: "Prospecting", // Initial stage
                amount: "0",
                closeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default +30 days
                leadSource: lead.leadSource,
                ownerId: assignedOwner,
                probability: 10,
                forecastCategory: "Pipeline"
            }).returning();

            // 5. Update Lead Status
            await tx.update(leads).set({
                isConverted: 1,
                convertedDate: new Date(),
                convertedAccountId: account.id,
                convertedContactId: contact.id,
                convertedOpportunityId: opportunity.id,
                status: "Converted"
            }).where(eq(leads.id, leadId));

            return { account, contact, opportunity };
        });
    }

    /**
     * Validates if a lead expects to be converted (e.g. has required fields).
     */
    async validateConversionReadiness(leadId: string): Promise<{ ready: boolean; remainingFields: string[] }> {
        const [lead] = await db.select().from(leads).where(eq(leads.id, leadId));
        if (!lead) return { ready: false, remainingFields: ["Lead Not Found"] };

        const missing: string[] = [];
        if (!lead.company && (!lead.firstName || !lead.lastName)) missing.push("Company or Full Name");
        if (!lead.email && !lead.phone) missing.push("Email or Phone");

        return {
            ready: missing.length === 0,
            remainingFields: missing
        };
    }

    /**
     * Calculates a lead score (0-100) based on firmographic and behavioral data.
     */
    calculateLeadScore(data: Partial<Lead>): number {
        let score = 0;

        // 1. Title High Value (+20)
        const title = (data.title || "").toLowerCase();
        if (title.includes("director") || title.includes("vp") || title.includes("head") || title.includes("chief") || title.includes("manager")) {
            score += 20;
        }

        // 2. High Revenue (+30)
        const revenue = Number(data.annualRevenue || 0);
        if (revenue > 1000000) {
            score += 30;
        } else if (revenue > 100000) {
            score += 10;
        }

        // 3. Corporate Email (+10)
        const email = (data.email || "").toLowerCase();
        if (email && !email.includes("gmail.com") && !email.includes("yahoo.com") && !email.includes("outlook.com") && !email.includes("hotmail.com")) {
            score += 10;
        }

        // 4. Competitor Technology (Mock: +10 if description mentions generic keywords like 'Oracle', 'SAP')
        const desc = (data.description || "").toLowerCase();
        if (desc.includes("oracle") || desc.includes("sap") || desc.includes("salesforce")) {
            score += 10;
        }

        // 5. Completeness (+5 per field)
        if (data.mobilePhone) score += 5;
        if (data.linkedinUrl) score += 5;
        if (data.website) score += 5;

        return Math.min(score, 100);
    }
}

export const leadService = new LeadService();
