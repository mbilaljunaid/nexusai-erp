/**
 * Advanced Metadata Type Definitions for NexusAIFirst Form System
 * Supports validation, GL configuration, workflow transitions, and conditional logic
 */

import { z } from "zod";

// ============================================
// FIELD VALIDATION CONFIGURATION
// ============================================

export interface FormFieldValidation {
  type: "required" | "email" | "min" | "max" | "pattern" | "custom" | "unique";
  value?: any;
  message?: string;
}

// ============================================
// FIELD CONDITIONS & DEPENDENCIES
// ============================================

export interface FormFieldCondition {
  field: string;
  operator: "equals" | "notEquals" | "greaterThan" | "lessThan" | "contains" | "in";
  value: any;
  action: "show" | "hide" | "disable" | "enable" | "require";
}

// ============================================
// GL MAPPING CONFIGURATION
// ============================================

export interface GLMappingConfig {
  account: string; // "1000", "2100", "4000", etc.
  debitCredit: "debit" | "credit";
  amount: "fixed" | "dynamic" | "percentage";
  amountField?: string; // Field to calculate from for dynamic amounts
  autoPost: boolean; // Auto-create GL entry
  description?: string; // GL entry description template
  conditions?: FormFieldCondition[]; // Only post GL if conditions met
}

export interface GLConfig {
  autoCreateGL: boolean;
  glMappings: GLMappingConfig[];
  requireBalance: boolean; // For dual-entry accounting
  postingAccount?: string; // Where to post
}

// ============================================
// WORKFLOW CONFIGURATION
// ============================================

export interface WorkflowTransition {
  fromStatus: string;
  toStatus: string;
  triggers?: string[]; // Field changes that trigger
  actions?: WorkflowAction[]; // Post-transition actions
  permissions?: string[]; // Roles allowed to make this transition
  requiresApproval?: boolean;
  approverRoles?: string[];
}

export interface WorkflowAction {
  type: "createGL" | "sendNotification" | "createRelated" | "updateInventory" | "webhook" | "customScript";
  config: Record<string, any>;
}

// ============================================
// FIELD CONFIGURATION
// ============================================

export interface FieldOption {
  label: string;
  value: string;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "number"
    | "date"
    | "datetime"
    | "select"
    | "multiselect"
    | "textarea"
    | "checkbox"
    | "radio"
    | "file"
    | "lineitem"
    | "nested"
    | "calculated";
  required: boolean;
  searchable: boolean;

  // Validations
  validations?: FormFieldValidation[];

  // Dependencies
  dependsOn?: string[]; // Field dependencies
  conditions?: FormFieldCondition[];

  // Display
  placeholder?: string;
  helpText?: string;
  category?: string; // Group in UI
  order?: number;
  width?: "full" | "half" | "third";

  // Data
  defaultValue?: any;
  readOnly?: boolean;
  hidden?: boolean;

  // For select/multiselect
  options?: FieldOption[];
  optionsEndpoint?: string; // Dynamic options from API
  optionLabelField?: string;
  optionValueField?: string;

  // For nested objects and line items
  nestedFields?: FormFieldConfig[];
  minItems?: number;
  maxItems?: number;

  // For calculated fields
  formula?: string; // e.g., "amount * quantity"

  // Relationships
  linkedEntity?: string; // e.g., "customers", "vendors"
  linkedField?: string; // Field to link to
}

// ============================================
// FORM SECTIONS
// ============================================

export interface FormSection {
  name: string;
  title: string;
  description?: string;
  fields: string[]; // Field names in this section
  collapsible?: boolean;
}

// ============================================
// LINKED FORMS
// ============================================

export interface LinkedFormConfig {
  targetFormId: string;
  relationshipType: "parent" | "child" | "reference";
  linkField: string;
  displayField: string;
  autoCreate?: boolean; // Auto-create target form on source submission
  fieldMappings?: Record<string, string>; // Map source fields to target fields
}

// ============================================
// FORM PERMISSIONS
// ============================================

export interface FormPermissions {
  create?: string[]; // Roles that can create
  edit?: string[];
  delete?: string[];
  view?: string[];
  export?: string[];
}

// ============================================
// FORM THEME
// ============================================

export interface FormTheme {
  layout: "single-column" | "two-column" | "tabbed" | "wizard" | "accordion";
  width: "sm" | "md" | "lg" | "xl" | "full";
  showHeader: boolean;
  showBreadcrumbs: boolean;
  showProgress?: boolean; // For wizard layout
  spacing?: "compact" | "normal" | "comfortable";
}

// ============================================
// ADVANCED FORM METADATA
// ============================================

export interface FormMetadataAdvanced {
  // Core form info
  id: string;
  name: string;
  description?: string;
  apiEndpoint: string;
  module: string;
  page: string;
  version: number;
  status: "draft" | "active" | "deprecated";

  // Fields with advanced config
  fields: FormFieldConfig[];
  searchFields: string[];
  displayField: string;
  createButtonText: string;

  // Sections for organizing large forms
  sections?: FormSection[];

  // Status workflow
  statusWorkflow?: WorkflowTransition[];
  allowedStatuses?: string[];
  initialStatus?: string;

  // GL Configuration (for transaction forms)
  glConfig?: GLConfig;

  // Permissions & Access
  permissions?: FormPermissions;

  // Cross-form relationships
  linkedForms?: LinkedFormConfig[];

  // Submission & Actions
  onSubmitActions?: WorkflowAction[];

  // Validation rules
  customValidations?: Array<{
    type: "crossField" | "business" | "external";
    rule: string;
    message: string;
  }>;

  // UI Customization
  theme?: FormTheme;

  // Audit & Tracking
  auditFields?: boolean;
  trackChanges?: boolean;
  retentionDays?: number;

  // Metadata
  breadcrumbs: Array<{ label: string; path: string }>;
  tags?: string[];
  category?: string;

  // Legacy support
  allowCreate: boolean;
  showSearch: boolean;
}

// ============================================
// VALIDATION RESULT
// ============================================

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// ============================================
// ZOD SCHEMA TYPES
// ============================================

export type FormZodSchema = z.ZodObject<any>;

export interface FormSchemaCache {
  formId: string;
  schema: FormZodSchema;
  insertSchema: FormZodSchema;
  selectSchema: FormZodSchema;
  createdAt: Date;
  ttl?: number; // Time to live in ms
}

// ============================================
// MIGRATION RESULT
// ============================================

export interface MigrationResult {
  success: number;
  failed: number;
  errors: Array<{
    formId: string;
    error: string;
  }>;
}

// ============================================
// FORM COMPONENT PROPS
// ============================================

export interface MetadataFormRendererProps {
  formId: string;
  metadata: FormMetadataAdvanced;
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  readOnly?: boolean;
  hideFields?: string[];
}

// ============================================
// GL ENTRY TYPE
// ============================================

export interface GLEntry {
  id: string;
  formId: string;
  recordId: string;
  account: string;
  debitCredit: "debit" | "credit";
  amount: number;
  description: string;
  createdAt: Date;
  reversalOfId?: string; // If this is a reversal entry
}

// ============================================
// FIELD OPTION LOADER
// ============================================

export interface FieldOptionLoader {
  endpoint: string;
  labelField: string;
  valueField: string;
  filterField?: string;
  filterValue?: string;
}
