/**
 * TypeScript Types for Industry-Specific Onboarding System
 * Phase 2: Data Model & Architecture
 */

export interface Industry {
    id: string;
    code: string;
    name: string;
    description?: string;
    tagline?: string;
    icon?: string;
    color?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Module {
    id: string;
    code: string;
    name: string;
    description?: string;
    category?: string; // HR, Finance, SCM, Operations, etc.
    isCore: boolean;
    icon?: string;
    createdAt: string;
    updatedAt: string;
}

export interface IndustryModuleMapping {
    id: string;
    industryId: string;
    moduleId: string;
    isRecommended: boolean;
    isRequired: boolean;
    priority: number;
    createdAt: string;
}

export interface TenantModule {
    id: string;
    tenantId: string;
    moduleId: string;
    enabled: boolean;
    enabledAt: string;
    enabledBy?: string;
    disabledAt?: string;
    disabledBy?: string;
}

export interface ConfigurationTemplate {
    id: string;
    industryId?: string;
    moduleId?: string;
    templateType: string; // coa, product_categories, workflows, etc.
    templateName: string;
    templateDescription?: string;
    templateData: Record<string, any>; // JSONB data
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Extended tenant interface with industry support
export interface TenantWithIndustry {
    id: string;
    name: string;
    industryId?: string;
    onboardingCompleted: boolean;
    onboardingStep: number;
    onboardingCompletedAt?: string;
    // ... other tenant fields
}

// DTOs for API requests/responses
export interface IndustryWithModules extends Industry {
    modules: Array<Module & {
        isRecommended: boolean;
        isRequired: boolean;
        priority: number;
    }>;
    templateCount?: number;
}

export interface ModuleRecommendation {
    module: Module;
    isRecommended: boolean;
    isRequired: boolean;
    priority: number;
    isEnabled?: boolean; // For tenant-specific state
}

export interface OnboardingRequest {
    tenantId: string;
    industryId?: string;
    selectedModuleIds: string[];
}

export interface OnboardingResponse {
    success: boolean;
    tenantId: string;
    enabledModules: string[];
    appliedTemplates: number;
}

// Template provisioning types
export interface TemplateProvisionRequest {
    tenantId: string;
    industryId: string;
    moduleIds: string[];
}

export interface AppliedTemplate {
    templateId: string;
    templateType: string;
    templateName: string;
    appliedAt: string;
    status: 'success' | 'failed' | 'partial';
}
