
import { db } from "../db";
import {
    hrmRecPipelineTemplates, hrmRecPipelineStages, hrmRecEmailTemplates,
    RecPipelineTemplate, RecPipelineStage, RecEmailTemplate
} from "@shared/schema/talent_recruitment";
import { eq, asc } from "drizzle-orm";

export class RecruitmentConfigService {

    // PIPELINE TEMPLATES
    static async getPipelineTemplates(tenantId: string) {
        return await db.select().from(hrmRecPipelineTemplates)
            .where(eq(hrmRecPipelineTemplates.tenantId, tenantId));
    }

    static async createPipelineTemplate(data: any) {
        const [template] = await db.insert(hrmRecPipelineTemplates).values(data).returning();
        return template;
    }

    // PIPELINE STAGES
    static async getPipelineStages(templateId: string) {
        return await db.select().from(hrmRecPipelineStages)
            .where(eq(hrmRecPipelineStages.templateId, templateId))
            .orderBy(asc(hrmRecPipelineStages.order));
    }

    static async createPipelineStage(data: any) {
        const [stage] = await db.insert(hrmRecPipelineStages).values(data).returning();
        return stage;
    }

    static async updatePipelineStageOrder(id: string, newOrder: number) {
        const [stage] = await db.update(hrmRecPipelineStages)
            .set({ order: newOrder })
            .where(eq(hrmRecPipelineStages.id, id))
            .returning();
        return stage;
    }

    static async deletePipelineStage(id: string) {
        await db.delete(hrmRecPipelineStages).where(eq(hrmRecPipelineStages.id, id));
    }

    // EMAIL TEMPLATES
    static async getEmailTemplates(tenantId: string) {
        return await db.select().from(hrmRecEmailTemplates)
            .where(eq(hrmRecEmailTemplates.tenantId, tenantId));
    }

    static async createEmailTemplate(data: any) {
        const [template] = await db.insert(hrmRecEmailTemplates).values(data).returning();
        return template;
    }

    static async updateEmailTemplate(id: string, data: Partial<RecEmailTemplate>) {
        const [template] = await db.update(hrmRecEmailTemplates)
            .set(data)
            .where(eq(hrmRecEmailTemplates.id, id))
            .returning();
        return template;
    }
}
