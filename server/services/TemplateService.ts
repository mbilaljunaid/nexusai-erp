import { supabase } from '../config/supabase';
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
        const { data, error } = await supabase
            .from('configuration_templates')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (error) {
            console.error('Error fetching templates:', error);
            throw new Error('Failed to fetch templates');
        }

        return data || [];
    }

    /**
     * Get templates for a specific industry
     */
    static async getTemplatesByIndustry(industryId: string): Promise<ConfigurationTemplate[]> {
        const { data, error } = await supabase
            .from('configuration_templates')
            .select('*')
            .eq('industry_id', industryId)
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (error) {
            console.error('Error fetching industry templates:', error);
            throw new Error('Failed to fetch industry templates');
        }

        return data || [];
    }

    /**
     * Get templates for a specific module
     */
    static async getTemplatesByModule(moduleId: string): Promise<ConfigurationTemplate[]> {
        const { data, error } = await supabase
            .from('configuration_templates')
            .select('*')
            .eq('module_id', moduleId)
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (error) {
            console.error('Error fetching module templates:', error);
            throw new Error('Failed to fetch module templates');
        }

        return data || [];
    }

    /**
     * Get templates by category
     */
    static async getTemplatesByCategory(category: TemplateCategory): Promise<ConfigurationTemplate[]> {
        const { data, error } = await supabase
            .from('configuration_templates')
            .select('*')
            .eq('template_category', category)
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (error) {
            console.error('Error fetching category templates:', error);
            throw new Error('Failed to fetch category templates');
        }

        return data || [];
    }

    /**
     * Get default template for industry and module
     */
    static async getDefaultTemplate(
        industryId: string,
        moduleId: string
    ): Promise<ConfigurationTemplate | null> {
        const { data, error } = await supabase
            .from('configuration_templates')
            .select('*')
            .eq('industry_id', industryId)
            .eq('module_id', moduleId)
            .eq('is_default', true)
            .eq('is_active', true)
            .single();

        if (error && error.code !== 'PGRST116') {
            // PGRST116 is "no rows returned"
            console.error('Error fetching default template:', error);
            throw new Error('Failed to fetch default template');
        }

        return data || null;
    }

    /**
     * Get template by ID
     */
    static async getTemplateById(templateId: string): Promise<ConfigurationTemplate | null> {
        const { data, error } = await supabase
            .from('configuration_templates')
            .select('*')
            .eq('id', templateId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching template:', error);
            throw new Error('Failed to fetch template');
        }

        return data || null;
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
            const { data: application, error: appError } = await supabase
                .from('template_applications')
                .insert({
                    tenant_id: tenantId,
                    template_id: templateId,
                    applied_by: userId,
                    status: 'applied',
                    applied_data: finalData,
                    metadata: {
                        templateName: template.name,
                        templateVersion: template.version,
                        appliedItems,
                    },
                })
                .select()
                .single();

            if (appError) {
                console.error('Error recording template application:', appError);
                throw new Error('Failed to record template application');
            }

            return {
                success: true,
                applicationId: application.id,
                appliedItems,
            };
        } catch (error) {
            console.error('Error applying template:', error);

            // Record failed application
            await supabase.from('template_applications').insert({
                tenant_id: tenantId,
                template_id: templateId,
                applied_by: userId,
                status: 'failed',
                error_message: error instanceof Error ? error.message : 'Unknown error',
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
        const { data, error } = await supabase
            .from('template_applications')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('applied_at', { ascending: false });

        if (error) {
            console.error('Error fetching template applications:', error);
            throw new Error('Failed to fetch template applications');
        }

        return data || [];
    }

    /**
     * Rollback a template application
     */
    static async rollbackTemplate(applicationId: string): Promise<void> {
        // TODO: Implement rollback logic
        // This would involve deleting the data that was inserted

        const { error } = await supabase
            .from('template_applications')
            .update({
                status: 'rolled_back',
                updated_at: new Date().toISOString(),
            })
            .eq('id', applicationId);

        if (error) {
            console.error('Error rolling back template:', error);
            throw new Error('Failed to rollback template');
        }
    }
}
