/**
 * Module Service
 * Handles module enablement and access control
 */

import { db } from '../db';
import type { Module, TenantModule } from '../../shared/types/industry';

export class ModuleService {
    /**
     * Get all modules
     */
    static async getAllModules(): Promise<Module[]> {
        const { data, error } = await db
            .from('modules')
            .select('*')
            .order('category, name');

        if (error) throw error;
        return data || [];
    }

    /**
     * Get modules by category
     */
    static async getModulesByCategory(category: string): Promise<Module[]> {
        const { data, error } = await db
            .from('modules')
            .select('*')
            .eq('category', category)
            .order('name');

        if (error) throw error;
        return data || [];
    }

    /**
     * Get core modules (fundamental modules like HR, Finance)
     */
    static async getCoreModules(): Promise<Module[]> {
        const { data, error } = await db
            .from('modules')
            .select('*')
            .eq('is_core', true)
            .order('name');

        if (error) throw error;
        return data || [];
    }

    /**
     * Get enabled modules for a tenant
     */
    static async getEnabledModulesForTenant(tenantId: string): Promise<Module[]> {
        const { data, error } = await db
            .from('tenant_modules')
            .select(`
        modules (*)
      `)
            .eq('tenant_id', tenantId)
            .eq('enabled', true);

        if (error) throw error;
        return (data || []).map((item: any) => item.modules);
    }

    /**
     * Check if a module is enabled for a tenant
     */
    static async isModuleEnabledForTenant(
        tenantId: string,
        moduleCode: string
    ): Promise<boolean> {
        const { data, error } = await db
            .from('tenant_modules')
            .select('enabled')
            .eq('tenant_id', tenantId)
            .eq('modules.code', moduleCode)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return false; // Not found
            throw error;
        }
        return data?.enabled || false;
    }

    /**
     * Enable a module for a tenant
     */
    static async enableModuleForTenant(
        tenantId: string,
        moduleId: string,
        userId: string
    ): Promise<TenantModule> {
        const { data, error } = await db
            .from('tenant_modules')
            .upsert({
                tenant_id: tenantId,
                module_id: moduleId,
                enabled: true,
                enabled_at: new Date().toISOString(),
                enabled_by: userId,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Enable multiple modules for a tenant (bulk operation)
     */
    static async enableModulesForTenant(
        tenantId: string,
        moduleIds: string[],
        userId: string
    ): Promise<TenantModule[]> {
        const records = moduleIds.map(moduleId => ({
            tenant_id: tenantId,
            module_id: moduleId,
            enabled: true,
            enabled_at: new Date().toISOString(),
            enabled_by: userId,
        }));

        const { data, error } = await db
            .from('tenant_modules')
            .upsert(records)
            .select();

        if (error) throw error;
        return data || [];
    }

    /**
     * Disable a module for a tenant
     */
    static async disableModuleForTenant(
        tenantId: string,
        moduleId: string,
        userId: string
    ): Promise<TenantModule> {
        const { data, error } = await db
            .from('tenant_modules')
            .update({
                enabled: false,
                disabled_at: new Date().toISOString(),
                disabled_by: userId,
            })
            .eq('tenant_id', tenantId)
            .eq('module_id', moduleId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Get module usage statistics
     */
    static async getModuleStats(moduleId: string): Promise<{
        totalTenants: number;
        enabledTenants: number;
        adoptionRate: number;
    }> {
        const { count: enabledCount, error: enabledError } = await db
            .from('tenant_modules')
            .select('*', { count: 'exact', head: true })
            .eq('module_id', moduleId)
            .eq('enabled', true);

        if (enabledError) throw enabledError;

        const { count: totalCount, error: totalError } = await db
            .from('tenants')
            .select('*', { count: 'exact', head: true });

        if (totalError) throw totalError;

        const enabled = enabledCount || 0;
        const total = totalCount || 1; // Avoid division by zero

        return {
            totalTenants: total,
            enabledTenants: enabled,
            adoptionRate: (enabled / total) * 100,
        };
    }
}
