/**
 * TypeScript Types for Industry-Specific Onboarding System
 * Phase 2: Data Model & Architecture
 * Phase 6: Configuration Templates
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

// =====================================================
// TEMPLATE TYPES (Phase 6)
// =====================================================

export type TemplateCategory =
    | 'finance'
    | 'hr'
    | 'inventory'
    | 'healthcare'
    | 'saas'
    | 'real_estate'
    | 'construction'
    | 'education'
    | 'scheduling'
    | 'subscriptions'
    | 'crm'
    | 'other';

export interface ConfigurationTemplate {
    id: string;
    name: string;
    description: string | null;
    industryId: string | null;
    moduleId: string | null;
    templateData: TemplateData;
    templateCategory: TemplateCategory | null;
    isDefault: boolean;
    sortOrder: number;
    dependencies: string[]; // Module codes that must be enabled
    validationRules: ValidationRules;
    version: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface TemplateData {
    [key: string]: unknown;
    // Specific template structures
    accounts?: ChartOfAccountItem[];
    appointmentTypes?: AppointmentType[];
    productCategories?: ProductCategory[];
    subscriptionPlans?: SubscriptionPlan[];
    departments?: Department[];
    propertyTypes?: PropertyType[];
    costCodes?: CostCode[];
}

// Finance template data
export interface ChartOfAccountItem {
    code: string;
    name: string;
    type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
    category?: string;
    parentCode?: string;
    description?: string;
    isActive?: boolean;
}

// Healthcare template data
export interface AppointmentType {
    name: string;
    duration: number; // minutes
    color: string;
    description?: string;
    requiresPreparation?: boolean;
    allowsWalkIn?: boolean;
}

// Retail/E-commerce template data
export interface ProductCategory {
    name: string;
    code?: string;
    parentCode?: string;
    description?: string;
    attributes?: string[];
    isActive?: boolean;
}

// SaaS template data
export interface SubscriptionPlan {
    name: string;
    price: number;
    billingCycle: 'monthly' | 'quarterly' | 'annual';
    features: string[];
    limits: Record<string, number | string>;
    isPopular?: boolean;
    trialDays?: number;
}

// HR template data
export interface Department {
    name: string;
    code: string;
    parentCode?: string;
    description?: string;
    managerId?: string;
    costCenter?: string;
}

// Real Estate template data
export interface PropertyType {
    name: string;
    code: string;
    category: 'residential' | 'commercial' | 'industrial' | 'mixed';
    description?: string;
    defaultLeaseTermMonths?: number;
}

// Construction template data
export interface CostCode {
    code: string;
    name: string;
    category: string;
    subcategory?: string;
    unit?: string;
    estimatedCost?: number;
}

export interface ValidationRules {
    required?: string[];
    minLength?: Record<string, number>;
    maxLength?: Record<string, number>;
    pattern?: Record<string, string>;
    custom?: Record<string, unknown>;
}

export interface TemplateApplication {
    id: string;
    tenantId: string;
    templateId: string;
    appliedBy: string | null;
    appliedAt: string;
    status: 'applied' | 'rolled_back' | 'failed';
    appliedData: TemplateData;
    errorMessage: string | null;
    metadata: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

// DTOs for template operations
export interface ApplyTemplateRequest {
    tenantId: string;
    templateId: string;
    customizations?: Partial<TemplateData>;
}

export interface ApplyTemplateResponse {
    success: boolean;
    applicationId: string;
    appliedItems: number;
    errors?: string[];
}

export interface TemplatePreviewRequest {
    templateId: string;
    industryId?: string;
    moduleId?: string;
}

export interface TemplatePreviewResponse {
    template: ConfigurationTemplate;
    itemCount: number;
    preview: TemplateData;
    warnings?: string[];
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
