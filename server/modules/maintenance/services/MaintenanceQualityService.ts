
import { db } from "../../../db";
import { eq, desc } from "drizzle-orm";
import { maintInspectionDefinitions, maintInspections, maintPermits } from "@shared/schema";

export class MaintenanceQualityService {

    /**
     * List Inspection Definitions (Templates)
     */
    async listInspectionTemplates() {
        return await db.query.maintInspectionDefinitions.findMany({
            where: eq(maintInspectionDefinitions.active, true),
            orderBy: desc(maintInspectionDefinitions.createdAt)
        });
    }

    /**
     * Create Inspection
     * Instantiate a checklist from a template linked to a WO/Asset
     */
    async createInspection(data: { templateId: string, workOrderId?: string, assetId?: string }) {
        // 1. Fetch Template to confirm existence
        const template = await db.query.maintInspectionDefinitions.findFirst({
            where: eq(maintInspectionDefinitions.id, data.templateId)
        });
        if (!template) throw new Error("Template not found");

        // 2. Create Instance
        return await db.insert(maintInspections).values({
            definitionId: data.templateId,
            workOrderId: data.workOrderId,
            assetId: data.assetId,
            status: "PENDING",
            results: [] // Empty results initially
        }).returning();
    }

    /**
     * Submit Inspection Results
     */
    async submitInspectionResults(inspectionId: string, results: any[], status: "PASS" | "FAIL" = "PASS") {
        // 1. Validate Results against Definition (skipped for brevity)

        // 2. Determine Pass/Fail based on results
        let derivedStatus = status;
        // Logic: if any result is "FAIL", the whole inspection is "FAIL"
        const hasFailures = results.some(r => r.answer === "FAIL" || (r.answer === "NO" && r.required));

        if (hasFailures) {
            derivedStatus = "FAIL";
        }

        // 3. Update Record
        const [updated] = await db.update(maintInspections)
            .set({
                results: results,
                status: derivedStatus,
                conductedAt: new Date(),
                updatedAt: new Date() // specific column might need adding if not in schema, schema shows updatedAt exists
            })
            .where(eq(maintInspections.id, inspectionId))
            .returning();

        // 4. Alert if Fail (Future scope)
        if (derivedStatus === "FAIL") {
            console.log("Inspection Failed! Triggering alert...");
        }

        return updated;
    }

    /**
     * List Inspections for Work Order
     */
    async getInspectionsForWorkOrder(workOrderId: string) {
        return await db.query.maintInspections.findMany({
            where: eq(maintInspections.workOrderId, workOrderId),
            with: {
                definition: true
            }
        });
    }

    // --- Permits ---

    async createPermit(data: any) {
        // Auto-gen Permit Number
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const rand = Math.floor(Math.random() * 1000);
        const permitNumber = `PTW-${dateStr}-${rand}`;

        return await db.insert(maintPermits).values({
            ...data,
            permitNumber
        }).returning();
    }

    async getPermitsForWorkOrder(workOrderId: string) {
        return await db.query.maintPermits.findMany({
            where: eq(maintPermits.workOrderId, workOrderId)
        });
    }
}

export const maintenanceQualityService = new MaintenanceQualityService();
