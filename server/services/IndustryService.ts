/**
 * Industry Service
 * Handles industry-related operations for onboarding system
 */

import { db } from '../db';
import type { Industry, IndustryWithModules, ModuleRecommendation } from '../../shared/types/industry';

export class IndustryService {
    /**
     * Get all active industries
     */
    static async getAllIndustries(): Promise<Industry[]> {
        const { data, error } = await db
            .from('industries')
            .select('*')
            .eq('is_active', true)
            .order('name');

        if (error) throw error;
        return data || [];
    }

    /**
     * Get industry by code
     */
    static async getIndustryByCode(code: string): Promise<Industry | null> {
        const { data, error } = await db
            .from('industries')
            .select('*')
            .eq('code', code)
            .eq('is_active', true)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }
        return data;
    }

    /**
     * Get industry with recommended modules
     */
    static async getIndustryWithModules(industryId: string): Promise<IndustryWithModules | null> {
        const { data: industry, error: industryError } = await db
            .from('industries')
            .select('*')
            .eq('id', industryId)
            .single();

        if (industryError) throw industryError;

        const { data: mappings, error: mappingsError } = await db
            .from('industry_module_mappings')
            .select(`
        is_recommended,
        is_required,
        priority,
        modules (*)
      `)
            .eq('industry_id', industryId)
            .order('priority', { ascending: false });

        if (mappingsError) throw mappingsError;

        const modules = (mappings || []).map((m: any) => ({
            ...m.modules,
            isRecommended: m.is_recommended,
            isRequired: m.is_required,
            priority: m.priority,
        }));

        return {
            ...industry,
            modules,
        };
    }

    /**
     * Get module recommendations for an industry
     */
    static async getModuleRecommendations(industryId: string): Promise<ModuleRecommendation[]> {
        const { data, error } = await db
            .from('industry_module_mappings')
            .select(`
        is_recommended,
        is_required,
        priority,
        modules (*)
      `)
            .eq('industry_id', industryId)
            .order('priority', { ascending: false });

        if (error) throw error;

        return (data || []).map((item: any) => ({
            module: item.modules,
            isRecommended: item.is_recommended,
            isRequired: item.is_required,
            priority: item.priority,
        }));
    }

    /**
     * Get module recommendations with tenant-specific enabled state
     */
    static async getModuleRecommendationsForTenant(
        industryId: string,
        tenantId: string
    ): Promise<ModuleRecommendation[]> {
        const recommendations = await this.getModuleRecommendations(industryId);

        // Get tenant's enabled modules
        const { data: tenantModules, error } = await db
            .from('tenant_modules')
            .select('module_id')
            .eq('tenant_id', tenantId)
            .eq('enabled', true);

        if (error) throw error;

        const enabledModuleIds = new Set((tenantModules || []).map(tm => tm.module_id));

        return recommendations.map(rec => ({
            ...rec,
            isEnabled: enabledModuleIds.has(rec.module.id),
        }));
    }
}
