/**
 * NexusAI First – Multi-Agent Configuration Template
 * 
 * This configuration defines the four coordinated agents (Auditor, Planner, Executor, Verifier)
 * with memory storage rules, audit logging schema, API/module templates, and RBAC enforcement.
 */

// ============================================================================
// AGENT DEFINITIONS
// ============================================================================

export interface AgentRole {
  id: string;
  name: string;
  description: string;
  responsibilities: string[];
  outputType: string;
}

export const NEXUSAI_AGENTS: AgentRole[] = [
  {
    id: "auditor",
    name: "Auditor Agent",
    description: "System & Codebase Awareness - Performs deep audit before any action",
    responsibilities: [
      "Identify modules, data models, APIs, workflows, services",
      "Detect gaps or missing hooks in the system",
      "Map user role, permissions, workspace access, industry templates",
      "Reference documentation, training guides, community discussions",
      "Output system map of feasible actions, constraints, and dependencies"
    ],
    outputType: "SystemAuditMap"
  },
  {
    id: "planner",
    name: "Planner Agent",
    description: "Action Planning & Workflow Orchestration",
    responsibilities: [
      "Classify user requests as Execution or Informational",
      "Design step-by-step Execution Plans with modules involved",
      "Determine workflow ordering and dependencies",
      "Detect missing parameters (name, owner, timeline, KPIs)",
      "Enforce RBAC rules and flag conflicts before execution"
    ],
    outputType: "ExecutionPlan"
  },
  {
    id: "executor",
    name: "Executor Agent",
    description: "Action Execution via APIs and Storage Layer",
    responsibilities: [
      "Execute actions via internal APIs, service layers, or workflow engines",
      "Persist state changes in database and memory",
      "Log actions with user intent, timestamp, API invoked, result, entity IDs",
      "Coordinate cross-module actions (ERP/EPM, emails, workflows)",
      "Output execution confirmation with IDs, status, affected modules"
    ],
    outputType: "ExecutionResult"
  },
  {
    id: "verifier",
    name: "Verifier Agent",
    description: "State Validation & Memory Reconciliation",
    responsibilities: [
      "Confirm execution by re-querying DB/API",
      "Cross-check memory, chat history, and audit logs",
      "Handle conflicts or user reports of missing data",
      "Provide factual, transparent feedback on outcomes"
    ],
    outputType: "VerificationResult"
  }
];

// ============================================================================
// MEMORY STORAGE RULES
// ============================================================================

export interface MemoryStorageConfig {
  conversationHistory: {
    maxMessages: number;
    persistTo: "localStorage" | "sessionStorage" | "database";
    storageKey: string;
    includeTimestamps: boolean;
    includeActionResults: boolean;
  };
  sessionContext: {
    persistAcrossRefresh: boolean;
    includeUserRole: boolean;
    includeTenantId: boolean;
    includeCurrentPage: boolean;
  };
  actionMemory: {
    trackExecutedActions: boolean;
    trackPendingConfirmations: boolean;
    maxStoredActions: number;
  };
}

export const MEMORY_STORAGE_CONFIG: MemoryStorageConfig = {
  conversationHistory: {
    maxMessages: 50,
    persistTo: "localStorage",
    storageKey: "nexusai-copilot-history",
    includeTimestamps: true,
    includeActionResults: true
  },
  sessionContext: {
    persistAcrossRefresh: true,
    includeUserRole: true,
    includeTenantId: true,
    includeCurrentPage: true
  },
  actionMemory: {
    trackExecutedActions: true,
    trackPendingConfirmations: true,
    maxStoredActions: 100
  }
};

// ============================================================================
// AUDIT & EXECUTION LOGGING SCHEMA
// ============================================================================

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userRole: string;
  tenantId: string;
  agentPhase: "audit" | "plan" | "execute" | "verify";
  action: string;
  entityType: string;
  entityId: string;
  inputData: Record<string, any>;
  outputData: Record<string, any>;
  outcome: "success" | "failed" | "denied" | "pending_confirmation";
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ExecutionLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  action: "create" | "update" | "delete" | "list" | "generate";
  entity: "project" | "task" | "lead" | "contact" | "invoice" | "report";
  inputData: Record<string, any>;
  resultId?: string;
  resultSummary: string;
  affectedModules: string[];
  crossModuleActions?: string[];
  nextSteps?: string[];
  auditLogId: string;
}

export const AUDIT_LOG_ACTIONS = {
  AI_COPILOT_CREATE: "ai_copilot_create",
  AI_COPILOT_UPDATE: "ai_copilot_update",
  AI_COPILOT_DELETE: "ai_copilot_delete",
  AI_COPILOT_LIST: "ai_copilot_list",
  AI_COPILOT_GENERATE: "ai_copilot_generate",
  AI_COPILOT_DENIED: "ai_copilot_denied",
  AI_COPILOT_INVALID_ACTION: "ai_copilot_invalid_action",
  AI_COPILOT_VERIFICATION_FAILED: "ai_copilot_verification_failed"
};

// ============================================================================
// API / MODULE CALLING TEMPLATES
// ============================================================================

export interface ModuleTemplate {
  id: string;
  name: string;
  description: string;
  entities: EntityTemplate[];
  crossModuleIntegrations: string[];
}

export interface EntityTemplate {
  name: string;
  requiredFields: string[];
  optionalFields: string[];
  defaultValues: Record<string, any>;
  validationRules: Record<string, string>;
}

// Full list of 25+ modules available in NexusAI First
export const ALL_MODULES = [
  "Projects", "Tasks", "Workflows", "ERP", "EPM", "CRM", "Finance", "HR", "Payroll",
  "Analytics", "Automation", "Emails", "Documents", "SCM", "Quality", "Compliance",
  "Marketing", "E-Commerce", "Service", "Field Service", "Asset Management",
  "Training", "Marketplace", "Community", "API", "DevOps", "R&D"
];

export const MODULE_TEMPLATES: ModuleTemplate[] = [
  {
    id: "projects",
    name: "Projects",
    description: "Project & Work Management",
    entities: [
      {
        name: "project",
        requiredFields: ["name"],
        optionalFields: ["description", "ownerId", "status", "priority", "dueDate"],
        defaultValues: { status: "active", priority: "medium" },
        validationRules: { name: "minLength:1" }
      },
      {
        name: "task",
        requiredFields: ["title"],
        optionalFields: ["description", "projectId", "assignee", "status", "priority", "dueDate"],
        defaultValues: { status: "pending", priority: "medium" },
        validationRules: { title: "minLength:1" }
      }
    ],
    crossModuleIntegrations: ["EPM", "Workflows", "Notifications"]
  },
  {
    id: "crm",
    name: "CRM & Sales",
    description: "Customer Relationship Management",
    entities: [
      {
        name: "lead",
        requiredFields: ["name"],
        optionalFields: ["email", "company", "phone", "status", "score", "source"],
        defaultValues: { status: "new", score: "0" },
        validationRules: { name: "minLength:1", email: "email" }
      },
      {
        name: "contact",
        requiredFields: ["name"],
        optionalFields: ["email", "phone", "company", "title", "notes"],
        defaultValues: {},
        validationRules: { name: "minLength:1", email: "email" }
      }
    ],
    crossModuleIntegrations: ["Emails", "Analytics", "Automation"]
  },
  {
    id: "finance",
    name: "Finance & Accounting",
    description: "Financial Management",
    entities: [
      {
        name: "invoice",
        requiredFields: ["amount"],
        optionalFields: ["customerId", "description", "dueDate", "status", "currency", "items"],
        defaultValues: { status: "draft", currency: "USD" },
        validationRules: { amount: "number|min:0.01" }
      }
    ],
    crossModuleIntegrations: ["CRM", "Reports", "Automation"]
  },
  {
    id: "hr",
    name: "HR & Payroll",
    description: "Human Resources Management",
    entities: [
      { name: "employee", requiredFields: ["name"], optionalFields: ["email", "department", "title", "hireDate", "salary"], defaultValues: { status: "active" }, validationRules: { name: "minLength:1" } }
    ],
    crossModuleIntegrations: ["Finance", "Projects", "Training"]
  },
  {
    id: "analytics",
    name: "Analytics & BI",
    description: "Business Intelligence & Reporting",
    entities: [
      {
        name: "report",
        requiredFields: ["type"],
        optionalFields: ["dateRange", "filters", "format", "schedule"],
        defaultValues: { format: "pdf" },
        validationRules: { type: "in:sales,finance,hr,project,custom" }
      }
    ],
    crossModuleIntegrations: ["Projects", "CRM", "Finance", "HR"]
  },
  {
    id: "workflows",
    name: "Workflows & Automation",
    description: "Business Process Automation",
    entities: [
      { name: "workflow", requiredFields: ["name"], optionalFields: ["trigger", "actions", "conditions"], defaultValues: { status: "active" }, validationRules: { name: "minLength:1" } }
    ],
    crossModuleIntegrations: ["Projects", "CRM", "Finance", "HR", "Emails"]
  },
  {
    id: "erp",
    name: "ERP",
    description: "Enterprise Resource Planning",
    entities: [
      { name: "order", requiredFields: ["customerId"], optionalFields: ["items", "total", "status"], defaultValues: { status: "pending" }, validationRules: {} }
    ],
    crossModuleIntegrations: ["Finance", "SCM", "CRM"]
  },
  {
    id: "epm",
    name: "EPM",
    description: "Enterprise Performance Management",
    entities: [
      { name: "goal", requiredFields: ["title"], optionalFields: ["kpis", "owner", "deadline"], defaultValues: { status: "active" }, validationRules: { title: "minLength:1" } }
    ],
    crossModuleIntegrations: ["Projects", "Analytics", "HR"]
  },
  {
    id: "scm",
    name: "Supply Chain Management",
    description: "Supply Chain & Logistics",
    entities: [
      { name: "shipment", requiredFields: ["origin", "destination"], optionalFields: ["carrier", "trackingId", "status"], defaultValues: { status: "pending" }, validationRules: {} }
    ],
    crossModuleIntegrations: ["ERP", "Finance", "Analytics"]
  },
  {
    id: "marketing",
    name: "Marketing & Campaigns",
    description: "Marketing Automation & Campaigns",
    entities: [
      { name: "campaign", requiredFields: ["name"], optionalFields: ["budget", "startDate", "endDate", "channels"], defaultValues: { status: "draft" }, validationRules: { name: "minLength:1" } }
    ],
    crossModuleIntegrations: ["CRM", "Analytics", "Emails"]
  },
  {
    id: "ecommerce",
    name: "E-Commerce & Retail",
    description: "Online Sales & Retail Management",
    entities: [
      { name: "product", requiredFields: ["name", "price"], optionalFields: ["sku", "inventory", "category"], defaultValues: { status: "active" }, validationRules: { price: "number|min:0" } }
    ],
    crossModuleIntegrations: ["Finance", "SCM", "Marketing"]
  },
  {
    id: "service",
    name: "Service & Support",
    description: "Customer Service & Support",
    entities: [
      { name: "ticket", requiredFields: ["subject"], optionalFields: ["description", "priority", "assignee", "status"], defaultValues: { status: "open", priority: "medium" }, validationRules: { subject: "minLength:1" } }
    ],
    crossModuleIntegrations: ["CRM", "Emails", "Analytics"]
  },
  {
    id: "documents",
    name: "Documents & Knowledge",
    description: "Document Management & Knowledge Base",
    entities: [
      { name: "document", requiredFields: ["title"], optionalFields: ["content", "category", "tags"], defaultValues: { status: "draft" }, validationRules: { title: "minLength:1" } }
    ],
    crossModuleIntegrations: ["Projects", "Compliance", "Training"]
  },
  {
    id: "compliance",
    name: "Compliance & Governance",
    description: "Regulatory Compliance & Governance",
    entities: [
      { name: "policy", requiredFields: ["title"], optionalFields: ["description", "effectiveDate", "category"], defaultValues: { status: "active" }, validationRules: { title: "minLength:1" } }
    ],
    crossModuleIntegrations: ["Documents", "HR", "Finance"]
  },
  {
    id: "training",
    name: "Training & LMS",
    description: "Learning Management System",
    entities: [
      { name: "course", requiredFields: ["title"], optionalFields: ["description", "duration", "instructor"], defaultValues: { status: "active" }, validationRules: { title: "minLength:1" } }
    ],
    crossModuleIntegrations: ["HR", "Documents", "Analytics"]
  },
  {
    id: "emails",
    name: "Emails & Communication",
    description: "Email & Messaging",
    entities: [
      { name: "email", requiredFields: ["to", "subject"], optionalFields: ["body", "attachments", "cc"], defaultValues: { status: "draft" }, validationRules: { to: "email", subject: "minLength:1" } }
    ],
    crossModuleIntegrations: ["CRM", "Marketing", "Workflows"]
  },
  {
    id: "marketplace",
    name: "Marketplace & Extensions",
    description: "App Marketplace & Integrations",
    entities: [
      { name: "extension", requiredFields: ["name"], optionalFields: ["description", "version", "author"], defaultValues: { status: "active" }, validationRules: { name: "minLength:1" } }
    ],
    crossModuleIntegrations: ["API", "All Modules"]
  },
  {
    id: "api",
    name: "API & Integration",
    description: "API Gateway & External Integrations",
    entities: [
      { name: "integration", requiredFields: ["name", "endpoint"], optionalFields: ["authType", "headers"], defaultValues: { status: "active" }, validationRules: { name: "minLength:1" } }
    ],
    crossModuleIntegrations: ["All Modules"]
  },
  {
    id: "asset-management",
    name: "Asset Management",
    description: "IT & Physical Asset Tracking",
    entities: [
      { name: "asset", requiredFields: ["name"], optionalFields: ["serialNumber", "location", "assignee", "purchaseDate"], defaultValues: { status: "active" }, validationRules: { name: "minLength:1" } }
    ],
    crossModuleIntegrations: ["Finance", "HR", "Service"]
  },
  {
    id: "field-service",
    name: "Field Service",
    description: "Field Service Management",
    entities: [
      { name: "workOrder", requiredFields: ["title"], optionalFields: ["location", "assignee", "scheduledDate"], defaultValues: { status: "scheduled" }, validationRules: { title: "minLength:1" } }
    ],
    crossModuleIntegrations: ["Service", "SCM", "HR"]
  }
];

// ============================================================================
// ROLE-BASED ACCESS CONTROL (RBAC)
// ============================================================================

export type UserRole = "admin" | "editor" | "viewer";
export type ActionType = "create" | "update" | "delete" | "list" | "generate";

export interface RBACConfig {
  roles: Record<UserRole, RolePermissions>;
  destructiveActions: ActionType[];
  requireConfirmation: ActionType[];
}

export interface RolePermissions {
  allowedActions: ActionType[];
  deniedActions: ActionType[];
  description: string;
}

export const RBAC_CONFIG: RBACConfig = {
  roles: {
    admin: {
      allowedActions: ["create", "update", "delete", "list", "generate"],
      deniedActions: [],
      description: "Full access - can perform all actions"
    },
    editor: {
      allowedActions: ["create", "update", "list", "generate"],
      deniedActions: ["delete"],
      description: "Create and edit records, but cannot delete"
    },
    viewer: {
      allowedActions: ["list"],
      deniedActions: ["create", "update", "delete", "generate"],
      description: "View/list data only - read-only access"
    }
  },
  destructiveActions: ["delete"],
  requireConfirmation: ["delete", "update"]
};

export function canPerformAction(role: UserRole, action: ActionType): boolean {
  const roleConfig = RBAC_CONFIG.roles[role];
  if (!roleConfig) return false;
  return roleConfig.allowedActions.includes(action) && !roleConfig.deniedActions.includes(action);
}

export function requiresConfirmation(action: ActionType, dataSize?: number): boolean {
  if (RBAC_CONFIG.requireConfirmation.includes(action)) {
    if (action === "update" && dataSize && dataSize > 3) return true;
    if (action === "delete") return true;
  }
  return false;
}

// ============================================================================
// EXECUTION FLOW CONFIGURATION
// ============================================================================

export interface ExecutionFlowConfig {
  phases: ExecutionPhase[];
  maxRetries: number;
  timeoutMs: number;
  enableParallelExecution: boolean;
}

export interface ExecutionPhase {
  id: string;
  name: string;
  order: number;
  required: boolean;
  onFailure: "abort" | "continue" | "retry";
}

export const EXECUTION_FLOW_CONFIG: ExecutionFlowConfig = {
  phases: [
    { id: "audit", name: "Auditor Agent", order: 1, required: true, onFailure: "abort" },
    { id: "plan", name: "Planner Agent", order: 2, required: true, onFailure: "abort" },
    { id: "execute", name: "Executor Agent", order: 3, required: true, onFailure: "retry" },
    { id: "verify", name: "Verifier Agent", order: 4, required: true, onFailure: "continue" }
  ],
  maxRetries: 2,
  timeoutMs: 30000,
  enableParallelExecution: false
};

// ============================================================================
// INDUSTRY TEMPLATES (40+ Industries)
// ============================================================================

export interface IndustryTemplate {
  id: string;
  name: string;
  category: string;
  enabledModules: string[];
  customFields: Record<string, string[]>;
  workflows: string[];
}

export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  // Health & Life Sciences (5)
  { id: "healthcare", name: "Healthcare", category: "Health & Life Sciences", enabledModules: ["Projects", "CRM", "Finance", "HR", "Compliance"], customFields: { patient: ["mrn", "insuranceId"], appointment: ["diagnosis", "provider"] }, workflows: ["patient-intake", "insurance-verification"] },
  { id: "pharmaceuticals", name: "Pharmaceuticals", category: "Health & Life Sciences", enabledModules: ["Projects", "ERP", "Compliance", "SCM", "R&D"], customFields: { drug: ["ndc", "fda_status"], trial: ["phase", "participants"] }, workflows: ["clinical-trial", "fda-approval"] },
  { id: "biotech", name: "Biotechnology", category: "Health & Life Sciences", enabledModules: ["Projects", "R&D", "Finance", "Compliance", "Analytics"], customFields: { research: ["patent", "grant"], specimen: ["type", "storage"] }, workflows: ["research-approval", "patent-filing"] },
  { id: "medical-devices", name: "Medical Devices", category: "Health & Life Sciences", enabledModules: ["Projects", "ERP", "SCM", "Compliance", "Quality"], customFields: { device: ["fda_class", "serial"], maintenance: ["schedule", "certification"] }, workflows: ["device-approval", "quality-audit"] },
  { id: "veterinary", name: "Veterinary Services", category: "Health & Life Sciences", enabledModules: ["Projects", "CRM", "Finance", "Scheduling", "Inventory"], customFields: { patient: ["species", "owner"], treatment: ["diagnosis", "medication"] }, workflows: ["appointment-booking", "treatment-plan"] },
  
  // Industrial (6)
  { id: "manufacturing", name: "Manufacturing", category: "Industrial", enabledModules: ["Projects", "ERP", "EPM", "Finance", "SCM"], customFields: { product: ["sku", "bom"], order: ["quantity", "leadTime"] }, workflows: ["production-scheduling", "quality-control"] },
  { id: "construction", name: "Construction", category: "Industrial", enabledModules: ["Projects", "Finance", "SCM", "HR", "Compliance"], customFields: { project: ["siteLocation", "permitId"], contractor: ["license", "insurance"] }, workflows: ["permit-approval", "safety-inspection"] },
  { id: "logistics", name: "Logistics & Supply Chain", category: "Industrial", enabledModules: ["Projects", "SCM", "Finance", "Analytics", "Automation"], customFields: { shipment: ["trackingId", "carrier"], warehouse: ["capacity", "location"] }, workflows: ["shipment-tracking", "inventory-management"] },
  { id: "automotive", name: "Automotive", category: "Industrial", enabledModules: ["Projects", "ERP", "SCM", "Quality", "Service"], customFields: { vehicle: ["vin", "model"], part: ["partNumber", "supplier"] }, workflows: ["production-line", "recall-management"] },
  { id: "aerospace", name: "Aerospace & Defense", category: "Industrial", enabledModules: ["Projects", "ERP", "Compliance", "SCM", "Quality"], customFields: { aircraft: ["tailNumber", "certification"], component: ["serialNumber", "traceability"] }, workflows: ["certification", "maintenance-tracking"] },
  { id: "oil-gas", name: "Oil & Gas", category: "Industrial", enabledModules: ["Projects", "ERP", "HSE", "Finance", "Asset Management"], customFields: { well: ["location", "production"], equipment: ["serialNumber", "maintenance"] }, workflows: ["drilling-ops", "safety-compliance"] },
  
  // Consumer (5)
  { id: "retail", name: "Retail & E-Commerce", category: "Consumer", enabledModules: ["CRM", "Finance", "Analytics", "Marketing", "E-Commerce"], customFields: { product: ["sku", "inventory"], order: ["shippingMethod", "trackingId"] }, workflows: ["order-fulfillment", "inventory-sync"] },
  { id: "hospitality", name: "Hospitality", category: "Consumer", enabledModules: ["CRM", "Finance", "HR", "Marketing", "Reservations"], customFields: { reservation: ["roomType", "guests"], guest: ["loyalty", "preferences"] }, workflows: ["booking", "check-in"] },
  { id: "food-beverage", name: "Food & Beverage", category: "Consumer", enabledModules: ["Projects", "SCM", "Compliance", "Quality", "POS"], customFields: { product: ["lot", "expiry"], order: ["deliveryTime", "temperature"] }, workflows: ["food-safety", "inventory-rotation"] },
  { id: "fashion", name: "Fashion & Apparel", category: "Consumer", enabledModules: ["CRM", "SCM", "E-Commerce", "Marketing", "PLM"], customFields: { product: ["season", "size"], collection: ["designer", "launchDate"] }, workflows: ["collection-planning", "trend-analysis"] },
  { id: "consumer-goods", name: "Consumer Goods", category: "Consumer", enabledModules: ["Projects", "SCM", "Marketing", "Analytics", "Distribution"], customFields: { product: ["upc", "shelfLife"], promotion: ["campaign", "roi"] }, workflows: ["product-launch", "promotion-tracking"] },
  
  // Financial Services (5)
  { id: "banking", name: "Banking & Finance", category: "Financial Services", enabledModules: ["CRM", "Finance", "Compliance", "Analytics", "Automation"], customFields: { account: ["accountType", "tier"], transaction: ["category", "riskScore"] }, workflows: ["kyc-verification", "fraud-detection"] },
  { id: "insurance", name: "Insurance", category: "Financial Services", enabledModules: ["CRM", "Finance", "Compliance", "Claims", "Analytics"], customFields: { policy: ["type", "premium"], claim: ["status", "adjuster"] }, workflows: ["underwriting", "claims-processing"] },
  { id: "investment", name: "Investment Management", category: "Financial Services", enabledModules: ["CRM", "Finance", "Compliance", "Analytics", "Portfolio"], customFields: { fund: ["aum", "strategy"], client: ["riskProfile", "allocation"] }, workflows: ["rebalancing", "compliance-reporting"] },
  { id: "fintech", name: "FinTech", category: "Financial Services", enabledModules: ["Projects", "CRM", "Compliance", "Analytics", "API"], customFields: { product: ["api", "integration"], transaction: ["volume", "fee"] }, workflows: ["api-onboarding", "transaction-monitoring"] },
  { id: "accounting", name: "Accounting & Tax", category: "Financial Services", enabledModules: ["Projects", "CRM", "Finance", "Documents", "Compliance"], customFields: { client: ["fiscalYear", "taxId"], engagement: ["type", "deadline"] }, workflows: ["tax-preparation", "audit-support"] },
  
  // Professional Services (5)
  { id: "legal", name: "Legal Services", category: "Professional Services", enabledModules: ["Projects", "CRM", "Finance", "Documents", "Compliance"], customFields: { case: ["caseNumber", "court"], client: ["retainer", "conflictCheck"] }, workflows: ["case-intake", "billing"] },
  { id: "consulting", name: "Management Consulting", category: "Professional Services", enabledModules: ["Projects", "CRM", "Finance", "HR", "Analytics"], customFields: { engagement: ["scope", "deliverables"], consultant: ["utilization", "rate"] }, workflows: ["proposal", "resource-allocation"] },
  { id: "architecture", name: "Architecture & Engineering", category: "Professional Services", enabledModules: ["Projects", "CRM", "Finance", "CAD", "Documents"], customFields: { project: ["phase", "drawings"], permit: ["status", "jurisdiction"] }, workflows: ["design-review", "permit-submission"] },
  { id: "marketing-agency", name: "Marketing & Advertising", category: "Professional Services", enabledModules: ["Projects", "CRM", "Finance", "Creative", "Analytics"], customFields: { campaign: ["budget", "kpis"], client: ["industry", "brandGuidelines"] }, workflows: ["campaign-planning", "creative-approval"] },
  { id: "hr-services", name: "HR & Staffing", category: "Professional Services", enabledModules: ["Projects", "CRM", "HR", "Finance", "Recruiting"], customFields: { candidate: ["skills", "availability"], placement: ["rate", "duration"] }, workflows: ["candidate-sourcing", "placement-tracking"] },
  
  // Technology (5)
  { id: "technology", name: "Technology & SaaS", category: "Technology", enabledModules: ["Projects", "CRM", "Finance", "HR", "Analytics", "DevOps"], customFields: { feature: ["sprint", "priority"], customer: ["plan", "mrr"] }, workflows: ["sprint-planning", "release-management"] },
  { id: "telecommunications", name: "Telecommunications", category: "Technology", enabledModules: ["Projects", "CRM", "Network", "Finance", "Service"], customFields: { customer: ["plan", "usage"], network: ["coverage", "capacity"] }, workflows: ["service-activation", "network-monitoring"] },
  { id: "cybersecurity", name: "Cybersecurity", category: "Technology", enabledModules: ["Projects", "Compliance", "Incidents", "Analytics", "Training"], customFields: { incident: ["severity", "vector"], assessment: ["score", "recommendations"] }, workflows: ["incident-response", "vulnerability-assessment"] },
  { id: "gaming", name: "Gaming & Entertainment", category: "Technology", enabledModules: ["Projects", "CRM", "Analytics", "Marketing", "Creative"], customFields: { game: ["platform", "rating"], player: ["level", "spending"] }, workflows: ["game-development", "live-ops"] },
  { id: "ai-ml", name: "AI & Machine Learning", category: "Technology", enabledModules: ["Projects", "R&D", "Analytics", "Data", "DevOps"], customFields: { model: ["accuracy", "version"], dataset: ["size", "quality"] }, workflows: ["model-training", "deployment"] },
  
  // Public Sector (5)
  { id: "education", name: "Education", category: "Public Sector", enabledModules: ["Projects", "HR", "Finance", "LMS", "Analytics"], customFields: { student: ["enrollmentId", "program"], course: ["credits", "semester"] }, workflows: ["enrollment", "grading"] },
  { id: "government", name: "Government", category: "Public Sector", enabledModules: ["Projects", "Finance", "Compliance", "Documents", "HR"], customFields: { citizen: ["id", "district"], service: ["type", "status"] }, workflows: ["permit-processing", "public-records"] },
  { id: "nonprofit", name: "Nonprofit & NGO", category: "Public Sector", enabledModules: ["Projects", "CRM", "Finance", "Fundraising", "Volunteers"], customFields: { donor: ["level", "interests"], grant: ["funder", "reporting"] }, workflows: ["grant-management", "donor-stewardship"] },
  { id: "healthcare-public", name: "Public Health", category: "Public Sector", enabledModules: ["Projects", "Analytics", "Compliance", "Outreach", "Research"], customFields: { program: ["population", "outcomes"], outbreak: ["region", "cases"] }, workflows: ["disease-surveillance", "vaccination-campaign"] },
  { id: "utilities", name: "Utilities", category: "Public Sector", enabledModules: ["Projects", "Asset Management", "CRM", "Field Service", "Analytics"], customFields: { meter: ["reading", "location"], outage: ["duration", "affected"] }, workflows: ["meter-reading", "outage-response"] },
  
  // Real Estate (3)
  { id: "real-estate", name: "Real Estate", category: "Real Estate", enabledModules: ["Projects", "CRM", "Finance", "Documents", "Marketing"], customFields: { property: ["address", "listing"], transaction: ["price", "commission"] }, workflows: ["listing-management", "closing-coordination"] },
  { id: "property-management", name: "Property Management", category: "Real Estate", enabledModules: ["Projects", "CRM", "Finance", "Maintenance", "Leasing"], customFields: { property: ["units", "occupancy"], tenant: ["lease", "balance"] }, workflows: ["lease-renewal", "maintenance-request"] },
  { id: "commercial-real-estate", name: "Commercial Real Estate", category: "Real Estate", enabledModules: ["Projects", "CRM", "Finance", "Analytics", "Leasing"], customFields: { property: ["sqft", "capRate"], tenant: ["creditRating", "term"] }, workflows: ["deal-pipeline", "tenant-improvement"] },
  
  // Media & Entertainment (3)
  { id: "media", name: "Media & Publishing", category: "Media & Entertainment", enabledModules: ["Projects", "CRM", "Creative", "Analytics", "Distribution"], customFields: { content: ["format", "rights"], campaign: ["impressions", "engagement"] }, workflows: ["content-creation", "distribution-scheduling"] },
  { id: "sports", name: "Sports & Recreation", category: "Media & Entertainment", enabledModules: ["Projects", "CRM", "Events", "Marketing", "Analytics"], customFields: { event: ["venue", "capacity"], athlete: ["contract", "stats"] }, workflows: ["event-planning", "ticketing"] },
  { id: "film-production", name: "Film & TV Production", category: "Media & Entertainment", enabledModules: ["Projects", "Finance", "HR", "Creative", "Scheduling"], customFields: { production: ["budget", "schedule"], talent: ["contract", "availability"] }, workflows: ["pre-production", "post-production"] },
  
  // Transportation (3)
  { id: "airlines", name: "Airlines", category: "Transportation", enabledModules: ["Projects", "CRM", "Operations", "HR", "Compliance"], customFields: { flight: ["route", "capacity"], crew: ["certification", "schedule"] }, workflows: ["flight-scheduling", "crew-management"] },
  { id: "shipping", name: "Shipping & Maritime", category: "Transportation", enabledModules: ["Projects", "SCM", "Compliance", "Fleet", "Finance"], customFields: { vessel: ["imo", "capacity"], cargo: ["type", "weight"] }, workflows: ["voyage-planning", "cargo-tracking"] },
  { id: "trucking", name: "Trucking & Freight", category: "Transportation", enabledModules: ["Projects", "Fleet", "CRM", "Finance", "Compliance"], customFields: { load: ["origin", "destination"], driver: ["cdl", "hours"] }, workflows: ["dispatch", "driver-scheduling"] },
  
  // Agriculture (2)
  { id: "agriculture", name: "Agriculture", category: "Agriculture", enabledModules: ["Projects", "SCM", "Analytics", "Finance", "Field"], customFields: { crop: ["variety", "yield"], field: ["acres", "soil"] }, workflows: ["planting-schedule", "harvest-tracking"] },
  { id: "agribusiness", name: "Agribusiness", category: "Agriculture", enabledModules: ["Projects", "SCM", "Finance", "Analytics", "Commodities"], customFields: { commodity: ["grade", "price"], contract: ["volume", "delivery"] }, workflows: ["commodity-trading", "supply-forecasting"] }
];

// ============================================================================
// CORE OPERATING PRINCIPLES
// ============================================================================

export const CORE_PRINCIPLES = {
  PERSISTENT_CONTEXT: "Maintain conversation history, user intents, and system actions across sessions",
  ACTION_FIRST: "Execute all actionable requests directly; avoid theoretical responses",
  READ_BEFORE_RESPOND: "Every response must consider conversation history, system state, and documentation",
  FAILURE_TRANSPARENCY: "On failure, explicitly state what failed, why, and suggested next steps",
  CONFIRMATION_OVER_ASSUMPTION: "Ask one precise clarifying question for ambiguous requests",
  CROSS_MODULE_AWARENESS: "Coordinate actions across ERP, EPM, Projects, CRM, Workflows",
  RBAC_SECURITY: "Validate user role and permissions for all actions",
  INFORMATIONAL_MODE: "Contextualize answers based on role, industry, and enabled modules"
};

export const FINAL_PRINCIPLE = "If the user asked for it, the system must either execute it, prove why it didn't, or show exactly where it exists.";

// ============================================================================
// ACTION BLOCK SCHEMA
// ============================================================================

export interface ActionBlock {
  action: "create" | "update" | "delete" | "list" | "generate";
  entity: "project" | "task" | "lead" | "contact" | "invoice" | "report";
  data: Record<string, any>;
  confirmation?: string;
}

export function parseActionBlock(response: string): ActionBlock | null {
  const match = response.match(/```action\s*([\s\S]*?)```/);
  if (!match) return null;
  
  try {
    return JSON.parse(match[1].trim());
  } catch {
    return null;
  }
}

export function validateActionBlock(block: ActionBlock): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const validActions = ["create", "update", "delete", "list", "generate"];
  const validEntities = ["project", "task", "lead", "contact", "invoice", "report"];
  
  if (!validActions.includes(block.action)) {
    errors.push(`Invalid action: ${block.action}. Must be one of: ${validActions.join(", ")}`);
  }
  
  if (!validEntities.includes(block.entity)) {
    errors.push(`Invalid entity: ${block.entity}. Must be one of: ${validEntities.join(", ")}`);
  }
  
  if (!block.data || typeof block.data !== "object") {
    errors.push("Data must be an object");
  }
  
  return { valid: errors.length === 0, errors };
}

// ============================================================================
// EXPORT DEFAULT CONFIGURATION
// ============================================================================

export const NEXUSAI_CONFIG = {
  agents: NEXUSAI_AGENTS,
  memoryStorage: MEMORY_STORAGE_CONFIG,
  auditLogActions: AUDIT_LOG_ACTIONS,
  moduleTemplates: MODULE_TEMPLATES,
  rbac: RBAC_CONFIG,
  executionFlow: EXECUTION_FLOW_CONFIG,
  industryTemplates: INDUSTRY_TEMPLATES,
  corePrinciples: CORE_PRINCIPLES,
  finalPrinciple: FINAL_PRINCIPLE
};

export default NEXUSAI_CONFIG;
