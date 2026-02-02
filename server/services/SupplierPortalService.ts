import { db } from "../db";
import { supplierOnboardingRequests, supplierUserIdentities, suppliers, supplierSites } from "../../shared/schema/scm";
import { eq } from "drizzle-orm";

export class SupplierPortalService {
    /**
     * Captures a public registration request from a prospective supplier
     */
    async submitRegistration(data: any) {
        const [request] = await db.insert(supplierOnboardingRequests).values({
            companyName: data.companyName,
            taxId: data.taxId,
            contactEmail: data.contactEmail,
            phone: data.phone,
            businessClassification: data.businessClassification,
            bankAccountName: data.bankAccountName,
            bankAccountNumber: data.bankAccountNumber,
            bankRoutingNumber: data.bankRoutingNumber,
            notes: data.notes,
            status: 'PENDING'
        }).returning();
        return request;
    }

    /**
     * Approves a request, creating the Master Supplier and Site records
     */
    async approveRegistration(requestId: string, reviewerId: string) {
        const [request] = await db.select()
            .from(supplierOnboardingRequests)
            .where(eq(supplierOnboardingRequests.id, requestId));

        if (!request) throw new Error("Registration request not found");
        if (request.status !== 'PENDING') throw new Error("Request is already processed");

        // 1. Create the Supplier in Master Table
        const [newSupplier] = await db.insert(suppliers).values({
            name: request.companyName,
            email: request.contactEmail,
            phone: request.phone,
            status: 'active'
        }).returning();

        // 2. Create the Primary Headquarters Site
        await db.insert(supplierSites).values({
            supplierId: newSupplier.id,
            siteName: 'HEADQUARTERS',
            status: 'active'
        });

        // 3. Update the request status
        await db.update(supplierOnboardingRequests)
            .set({
                status: 'APPROVED',
                reviewedAt: new Date(),
                reviewerId: reviewerId
            })
            .where(eq(supplierOnboardingRequests.id, requestId));

        return newSupplier;
    }

    /**
     * Rejects a registration request
     */
    async rejectRegistration(requestId: string, reviewerId: string, notes: string) {
        await db.update(supplierOnboardingRequests)
            .set({
                status: 'REJECTED',
                reviewedAt: new Date(),
                reviewerId: reviewerId,
                notes: notes
            })
            .where(eq(supplierOnboardingRequests.id, requestId));
    }

    /**
     * Lists all work-in-progress requests for the internal dashboard
     */
    async listPendingRequests() {
        return await db.select()
            .from(supplierOnboardingRequests)
            .where(eq(supplierOnboardingRequests.status, 'PENDING'));
    }

    /**
     * Creates an external identity for a supplier user
     */
    async generatePortalToken(supplierId: string, userId: string) {
        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const [identity] = await db.insert(supplierUserIdentities).values({
            supplierId,
            userId,
            portalToken: token,
            role: 'ADMIN',
            status: 'ACTIVE'
        }).returning();
        return identity;
    }
}

export const supplierPortalService = new SupplierPortalService();
