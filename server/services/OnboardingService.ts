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
        let appliedCount = 0;

        try {
            // Import TemplateService (dynamic to avoid circular dependencies)
            const { TemplateService } = await import('./TemplateService');

            // For each enabled module, find and apply default templates
            for (const moduleId of moduleIds) {
                try {
                    // Get default template for this industry/module combination
                    const template = await TemplateService.getDefaultTemplate(industryId, moduleId);

                    if (template) {
                        // Apply the template
                        const result = await TemplateService.applyTemplate({
                            tenantId,
                            templateId: template.id,
                        });

                        if (result.success) {
                            appliedCount++;
                            console.log(`✓ Applied template: ${template.name} (${result.appliedItems} items)`);
                        }
                    }
                } catch (error) {
                    console.error(`Failed to apply template for module ${moduleId}:`, error);
                    // Continue with other modules even if one fails
                }
            }

            return appliedCount;
        } catch (error) {
            console.error('Failed to apply configuration templates:', error);
            return appliedCount;
        }
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
