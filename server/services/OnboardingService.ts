/**
 * Onboarding Service
 * Orchestrates the complete tenant onboarding flow
 * Phase 3: Onboarding Flow Backend
 */

import { db } from '../db';
import { IndustryService } from './IndustryService';
import { ModuleService } from './ModuleService';
import type {
    OnboardingRequest,
    OnboardingResponse,
    ModuleRecommendation,
} from '../../shared/types/industry';

export interface OnboardingStep {
    step: number;
    name: string;
    status: 'pending' | 'current' | 'completed';
}

export interface CompanyProfileData {
    name: string;
    size: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
    timezone: string;
    currency: string;
}

export class OnboardingService {
    /**
     * Start onboarding process for a new tenant
     */
    static async startOnboarding(tenantId: string): Promise<void> {
        const { error } = await db
            .from('tenants')
            .update({
                onboarding_step: 1,
                onboarding_completed: false,
            })
            .eq('id', tenantId);

        if (error) throw error;
    }

    /**
     * Update company profile during onboarding
     */
    static async updateCompanyProfile(
        tenantId: string,
        profileData: CompanyProfileData
    ): Promise<void> {
        const { error } = await db
            .from('tenants')
            .update({
                name: profileData.name,
                // Add custom fields for size, timezone, currency
                metadata: {
                    company_size: profileData.size,
                    timezone: profileData.timezone,
                    currency: profileData.currency,
                },
                onboarding_step: 2,
            })
            .eq('id', tenantId);

        if (error) throw error;
    }

    /**
     * Select industry for tenant (returns module recommendations)
     */
    static async selectIndustry(
        tenantId: string,
        industryId: string
    ): Promise<ModuleRecommendation[]> {
        // Update tenant with industry
        const { error: updateError } = await db
            .from('tenants')
            .update({
                industry_id: industryId,
                onboarding_step: 3,
            })
            .eq('id', tenantId);

        if (updateError) throw updateError;

        // Get module recommendations for this industry
        const recommendations = await IndustryService.getModuleRecommendations(industryId);

        return recommendations;
    }

    /**
     * Enable selected modules for tenant
     */
    static async selectModules(
        tenantId: string,
        moduleIds: string[],
        userId: string
    ): Promise<void> {
        // Enable all selected modules
        await ModuleService.enableModulesForTenant(tenantId, moduleIds, userId);

        // Update onboarding progress
        const { error } = await db
            .from('tenants')
            .update({
                onboarding_step: 4,
            })
            .eq('id', tenantId);

        if (error) throw error;
    }

    /**
     * Provision tenant with templates (final step)
     */
    static async provisionTenant(request: OnboardingRequest): Promise<OnboardingResponse> {
        const { tenantId, industryId, selectedModuleIds } = request;

        try {
            // 1. Get tenant's industry
            const { data: tenant } = await db
                .from('tenants')
                .select('industry_id')
                .eq('id', tenantId)
                .single();

            const finalIndustryId = industryId || tenant?.industry_id;

            // 2. Apply configuration templates if industry is selected
            let appliedTemplatesCount = 0;
            if (finalIndustryId) {
                appliedTemplatesCount = await this.applyConfigurationTemplates(
                    tenantId,
                    finalIndustryId,
                    selectedModuleIds
                );
            }

            // 3. Mark onboarding as complete
            await db
                .from('tenants')
                .update({
                    onboarding_completed: true,
                    onboarding_step: 5,
                    onboarding_completed_at: new Date().toISOString(),
                })
                .eq('id', tenantId);

            return {
                success: true,
                tenantId,
                enabledModules: selectedModuleIds,
                appliedTemplates: appliedTemplatesCount,
            };
        } catch (error) {
            console.error('Tenant provisioning failed:', error);
            throw new Error('Failed to provision tenant');
        }
    }

    /**
     * Apply configuration templates for industry/module combinations
     */
    private static async applyConfigurationTemplates(
        tenantId: string,
        industryId: string,
        moduleIds: string[]
    ): Promise<number> {
        // Get all templates for this industry and modules
        const { data: templates, error } = await db
            .from('configuration_templates')
            .select('*')
            .eq('industry_id', industryId)
            .in('module_id', moduleIds)
            .eq('is_active', true);

        if (error) {
            console.error('Failed to fetch templates:', error);
            return 0;
        }

        if (!templates || templates.length === 0) {
            return 0;
        }

        // Apply each template
        // This is where you would actually create the configuration data
        // For now, we'll just log the templates that would be applied
        console.log(`Applying ${templates.length} templates for tenant ${tenantId}`);

        for (const template of templates) {
            await this.applyTemplate(tenantId, template);
        }

        return templates.length;
    }

    /**
     * Apply a single configuration template
     */
    private static async applyTemplate(tenantId: string, template: any): Promise<void> {
        // Template application logic depends on template type
        const { template_type, template_data } = template;

        switch (template_type) {
            case 'coa': // Chart of Accounts
                await this.applyChartOfAccountsTemplate(tenantId, template_data);
                break;
            case 'product_categories':
                await this.applyProductCategoriesTemplate(tenantId, template_data);
                break;
            case 'workflows':
                await this.applyWorkflowsTemplate(tenantId, template_data);
                break;
            case 'approval_chains':
                await this.applyApprovalChainsTemplate(tenantId, template_data);
                break;
            case 'tax_rates':
                await this.applyTaxRatesTemplate(tenantId, template_data);
                break;
            default:
                console.log(`Unknown template type: ${template_type}`);
        }
    }

    // Template-specific application methods (to be implemented)
    private static async applyChartOfAccountsTemplate(tenantId: string, data: any): Promise<void> {
        // TODO: Implement GL account creation from template
        console.log('Applying Chart of Accounts template for tenant', tenantId);
    }

    private static async applyProductCategoriesTemplate(tenantId: string, data: any): Promise<void> {
        // TODO: Implement product category creation from template
        console.log('Applying Product Categories template for tenant', tenantId);
    }

    private static async applyWorkflowsTemplate(tenantId: string, data: any): Promise<void> {
        // TODO: Implement workflow creation from template
        console.log('Applying Workflows template for tenant', tenantId);
    }

    private static async applyApprovalChainsTemplate(tenantId: string, data: any): Promise<void> {
        // TODO: Implement approval chain creation from template
        console.log('Applying Approval Chains template for tenant', tenantId);
    }

    private static async applyTaxRatesTemplate(tenantId: string, data: any): Promise<void> {
        // TODO: Implement tax rate creation from template
        console.log('Applying Tax Rates template for tenant', tenantId);
    }

    /**
     * Get onboarding progress for a tenant
     */
    static async getOnboardingProgress(tenantId: string): Promise<OnboardingStep[]> {
        const { data: tenant } = await db
            .from('tenants')
            .select('onboarding_step, onboarding_completed')
            .eq('id', tenantId)
            .single();

        const currentStep = tenant?.onboarding_step || 0;
        const completed = tenant?.onboarding_completed || false;

        const steps: OnboardingStep[] = [
            { step: 1, name: 'Registration', status: 'completed' },
            { step: 2, name: 'Company Profile', status: currentStep >= 2 ? 'completed' : currentStep === 1 ? 'current' : 'pending' },
            { step: 3, name: 'Industry Selection', status: currentStep >= 3 ? 'completed' : currentStep === 2 ? 'current' : 'pending' },
            { step: 4, name: 'Module Selection', status: currentStep >= 4 ? 'completed' : currentStep === 3 ? 'current' : 'pending' },
            { step: 5, name: 'Provisioning', status: completed ? 'completed' : currentStep === 4 ? 'current' : 'pending' },
        ];

        return steps;
    }

    /**
     * Skip industry selection and continue with manual module selection
     */
    static async skipIndustrySelection(tenantId: string): Promise<void> {
        const { error } = await db
            .from('tenants')
            .update({
                industry_id: null,
                onboarding_step: 3,
            })
            .eq('id', tenantId);

        if (error) throw error;
    }

    /**
     * Get all available modules (when no industry selected)
     */
    static async getAllAvailableModules(): Promise<ModuleRecommendation[]> {
        const modules = await ModuleService.getAllModules();

        // Return all modules with no recommendations
        return modules.map(module => ({
            module,
            isRecommended: false,
            isRequired: false,
            priority: 0,
        }));
    }
}
