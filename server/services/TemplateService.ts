import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import type {
    ConfigurationTemplate,
    TemplateData,
    ApplyTemplateRequest,
    ApplyTemplateResponse,
    TemplateApplication,
    TemplateCategory,
} from '../../shared/types/industry';

/**
 * Service for managing configuration templates
 * Handles template CRUD, application, and rollback
 */
export class TemplateService {
    /**
     * Get all templates
     */
    static async getAllTemplates(): Promise<ConfigurationTemplate[]> {
        try {
            const data = await db.query.configurationTemplates.findMany({
                where: eq(schema.configurationTemplates.isActive, true),
                orderBy: (templates, { asc }) => [asc(templates.sortOrder)],
            });
            return data as unknown as ConfigurationTemplate[];
        } catch (error) {
            console.error('Error fetching templates:', error);
            throw new Error('Failed to fetch templates');
        }
    }

    /**
     * Get templates for a specific industry
     */
    static async getTemplatesByIndustry(industryId: string): Promise<ConfigurationTemplate[]> {
        try {
            const data = await db.query.configurationTemplates.findMany({
                where: and(
                    eq(schema.configurationTemplates.industryId, industryId),
                    eq(schema.configurationTemplates.isActive, true)
                ),
                orderBy: (templates, { asc }) => [asc(templates.sortOrder)],
            });
            return data as unknown as ConfigurationTemplate[];
        } catch (error) {
            console.error('Error fetching industry templates:', error);
            throw new Error('Failed to fetch industry templates');
        }
    }

    /**
     * Get templates for a specific module
     */
    static async getTemplatesByModule(moduleId: string): Promise<ConfigurationTemplate[]> {
        try {
            const data = await db.query.configurationTemplates.findMany({
                where: and(
                    eq(schema.configurationTemplates.moduleId, moduleId),
                    eq(schema.configurationTemplates.isActive, true)
                ),
                orderBy: (templates, { asc }) => [asc(templates.sortOrder)],
            });
            return data as unknown as ConfigurationTemplate[];
        } catch (error) {
            console.error('Error fetching module templates:', error);
            throw new Error('Failed to fetch module templates');
        }
    }

    /**
     * Get templates by category
     */
    static async getTemplatesByCategory(category: TemplateCategory): Promise<ConfigurationTemplate[]> {
        try {
            const data = await db.query.configurationTemplates.findMany({
                where: and(
                    eq(schema.configurationTemplates.templateCategory, category),
                    eq(schema.configurationTemplates.isActive, true)
                ),
                orderBy: (templates, { asc }) => [asc(templates.sortOrder)],
            });
            return data as unknown as ConfigurationTemplate[];
        } catch (error) {
            console.error('Error fetching category templates:', error);
            throw new Error('Failed to fetch category templates');
        }
    }

    /**
     * Get default template for industry and module
     */
    static async getDefaultTemplate(
        industryId: string,
        moduleId: string
    ): Promise<ConfigurationTemplate | null> {
        try {
            const data = await db.query.configurationTemplates.findFirst({
                where: and(
                    eq(schema.configurationTemplates.industryId, industryId),
                    eq(schema.configurationTemplates.moduleId, moduleId),
                    eq(schema.configurationTemplates.isDefault, true),
                    eq(schema.configurationTemplates.isActive, true)
                )
            });
            return data ? (data as unknown as ConfigurationTemplate) : null;
        } catch (error) {
            console.error('Error fetching default template:', error);
            throw new Error('Failed to fetch default template');
        }
    }

    /**
     * Get template by ID
     */
    static async getTemplateById(templateId: string): Promise<ConfigurationTemplate | null> {
        try {
            const data = await db.query.configurationTemplates.findFirst({
                where: eq(schema.configurationTemplates.id, templateId)
            });
            return data ? (data as unknown as ConfigurationTemplate) : null;
        } catch (error) {
            console.error('Error fetching template:', error);
            throw new Error('Failed to fetch template');
        }
    }

    /**
     * Apply template to tenant
     */
    static async applyTemplate(
        request: ApplyTemplateRequest,
        userId?: string
    ): Promise<ApplyTemplateResponse> {
        const { tenantId, templateId, customizations } = request;

        try {
            // 1. Get template
            const template = await this.getTemplateById(templateId);
            if (!template) {
                throw new Error('Template not found');
            }

            // 2. Merge template data with customizations
            const finalData: TemplateData = {
                ...template.templateData,
                ...customizations,
            };

            // 3. Validate dependencies (check if required modules are enabled)
            if (template.dependencies && template.dependencies.length > 0) {
                // TODO: Check if modules are enabled for tenant
                // For now, we'll skip this check
            }

            // 4. Apply template data
            // This would involve inserting data into the appropriate tables
            // based on the template category
            const appliedItems = await this.applyTemplateData(
                tenantId,
                template.templateCategory || 'other',
                finalData
            );

            // 5. Record template application
            try {
                const [application] = await db.insert(schema.templateApplications).values({
                    tenantId: tenantId,
                    templateId: templateId,
                    appliedBy: userId,
                    status: 'applied',
                    appliedData: finalData,
                    metadata: {
                        templateName: template.name,
                        templateVersion: template.version,
                        appliedItems,
                    },
                }).returning({ id: schema.templateApplications.id });

                return {
                    success: true,
                    applicationId: application.id,
                    appliedItems,
                };
            } catch (appError) {
                console.error('Error recording template application:', appError);
                throw new Error('Failed to record template application');
            }

        } catch (error) {
            console.error('Error applying template:', error);

            // Record failed application
            await db.insert(schema.templateApplications).values({
                tenantId: tenantId,
                templateId: templateId,
                appliedBy: userId,
                status: 'failed',
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                metadata: {
                    error: error instanceof Error ? error.stack : String(error),
                },
            });

            throw error;
        }
    }

    /**
     * Apply template data to appropriate tables based on category
     */
    private static async applyTemplateData(
        tenantId: string,
        category: TemplateCategory | 'other',
        data: TemplateData
    ): Promise<number> {
        // This is a placeholder - actual implementation would involve
        // inserting data into the appropriate tables based on category

        switch (category) {
            case 'finance':
                return this.applyFinanceTemplate(tenantId, data);
            case 'healthcare':
                return this.applyHealthcareTemplate(tenantId, data);
            case 'inventory':
                return this.applyInventoryTemplate(tenantId, data);
            case 'saas':
                return this.applySaaSTemplate(tenantId, data);
            // Add more cases as needed
            default:
                console.warn(`Template application not implemented for category: ${category}`);
                return 0;
        }
    }

    /**
     * Apply finance template (Chart of Accounts)
     */
    private static async applyFinanceTemplate(
        tenantId: string,
        data: TemplateData
    ): Promise<number> {
        // TODO: Implement COA insertion
        // This would insert accounts into a chart_of_accounts table
        console.log('Applying finance template for tenant:', tenantId, data);
        return data.accounts?.length || 0;
    }

    /**
     * Apply healthcare template (Appointment Types)
     */
    private static async applyHealthcareTemplate(
        tenantId: string,
        data: TemplateData
    ): Promise<number> {
        // TODO: Implement appointment types insertion
        console.log('Applying healthcare template for tenant:', tenantId, data);
        return data.appointmentTypes?.length || 0;
    }

    /**
     * Apply inventory template (Product Categories)
     */
    private static async applyInventoryTemplate(
        tenantId: string,
        data: TemplateData
    ): Promise<number> {
        // TODO: Implement product categories insertion
        console.log('Applying inventory template for tenant:', tenantId, data);
        return data.productCategories?.length || 0;
    }

    /**
     * Apply SaaS template (Subscription Plans)
     */
    private static async applySaaSTemplate(
        tenantId: string,
        data: TemplateData
    ): Promise<number> {
        // TODO: Implement subscription plans insertion
        console.log('Applying SaaS template for tenant:', tenantId, data);
        return data.subscriptionPlans?.length || 0;
    }

    /**
     * Get template applications for a tenant
     */
    static async getTemplateApplications(
        tenantId: string
    ): Promise<TemplateApplication[]> {
        try {
            const data = await db.query.templateApplications.findMany({
                where: eq(schema.templateApplications.tenantId, tenantId),
                orderBy: (applications, { desc }) => [desc(applications.appliedAt)],
            });
            return data as unknown as TemplateApplication[];
        } catch (error) {
            console.error('Error fetching template applications:', error);
            throw new Error('Failed to fetch template applications');
        }
    }

    /**
     * Rollback a template application
     */
    static async rollbackTemplate(applicationId: string): Promise<void> {
        // TODO: Implement rollback logic
        // This would involve deleting the data that was inserted

        try {
            await db.update(schema.templateApplications)
                .set({
                    status: 'rolled_back',
                    updatedAt: new Date(),
                })
                .where(eq(schema.templateApplications.id, applicationId));
        } catch (error) {
            console.error('Error rolling back template:', error);
            throw new Error('Failed to rollback template');
        }
    }
}
