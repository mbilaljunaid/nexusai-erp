
// Basic Role Definitions
export const ROLES = {
    ADMIN: "admin",
    GL_MANAGER: "gl_manager",
    GL_USER: "gl_user",
    GL_VIEWER: "gl_viewer"
} as const;

// Permission Constants
export const PERMISSIONS = {
    // GL
    GL_READ: "gl.read",
    GL_WRITE: "gl.write",
    GL_APPROVE: "gl.approve",
    GL_POST: "gl.post",
    GL_CONFIG: "gl.config",
    GL_CLOSE_PERIOD: "gl.close_period",
    // AP
    AP_READ: "ap.read",
    AP_WRITE: "ap.write",
    // AR
    AR_READ: "ar.read",
    AR_WRITE: "ar.write",
    // Fixed Assets
    FA_READ: "fa.read",
    FA_WRITE: "fa.write",
    // Cash Management
    CASH_READ: "cash.read",
    CASH_WRITE: "cash.write",
    // CRM
    CRM_READ: "crm.read",
    CRM_WRITE: "crm.write",
    // HR
    HR_READ: "hr.read",
    HR_WRITE: "hr.write",
    // Projects / PPM
    PROJECT_READ: "project.read",
    PROJECT_WRITE: "project.write",
    // SCM
    SCM_READ: "scm.read",
    SCM_WRITE: "scm.write",
    // Manufacturing
    MFG_READ: "mfg.read",
    MFG_WRITE: "mfg.write",
    // Intercompany
    IC_READ: "ic.read",
    IC_WRITE: "ic.write",
    // Landed Cost Management
    LCM_READ: "lcm.read",
    LCM_WRITE: "lcm.write",
    // Lease / Real Estate
    LEASE_READ: "lease.read",
    LEASE_WRITE: "lease.write",
    // AI
    AI_CHAT: "ai.chat",
    AI_EXECUTE: "ai.execute",
    // Treasury
    TREASURY_READ: "treasury.read",
    TREASURY_WRITE: "treasury.write",
    // Tax
    TAX_READ: "tax.read",
    TAX_WRITE: "tax.write",
    // Revenue Recognition
    REVENUE_READ: "revenue.read",
    REVENUE_WRITE: "revenue.write",
    // EPM / Budgeting
    EPM_READ: "epm.read",
    EPM_WRITE: "epm.write",
    // Payroll
    PAYROLL_READ: "payroll.read",
    PAYROLL_WRITE: "payroll.write",
    // Benefits
    BENEFITS_READ: "benefits.read",
    // Recruitment
    RECRUIT_READ: "recruit.read",
    RECRUIT_WRITE: "recruit.write",
    // Performance
    PERF_READ: "perf.read",
    PERF_WRITE: "perf.write",
    // Expenses
    EXPENSE_READ: "expense.read",
    EXPENSE_WRITE: "expense.write",
    // Field Service
    FIELD_SERVICE_READ: "field_service.read",
    FIELD_SERVICE_WRITE: "field_service.write",
    // Construction
    CONSTRUCTION_READ: "construction.read",
    CONSTRUCTION_WRITE: "construction.write",
    // Maintenance / EAM
    MAINTENANCE_READ: "maintenance.read",
    MAINTENANCE_WRITE: "maintenance.write",
    // MDM / Data Quality
    MDM_READ: "mdm.read",
    MDM_WRITE: "mdm.write",
    // Netting
    NETTING_READ: "netting.read",
    NETTING_WRITE: "netting.write",
    // Order Management
    ORDER_READ: "order.read",
    ORDER_WRITE: "order.write",
    // Campaigns / Marketing
    CAMPAIGN_READ: "campaign.read",
    CAMPAIGN_WRITE: "campaign.write",
    // Commission
    COMMISSION_READ: "commission.read",
    // Contracts
    CONTRACT_READ: "contract.read",
    CONTRACT_WRITE: "contract.write",
    // Transportation / Freight
    TRANSPORT_READ: "transport.read",
    // Governance / Audit
    AUDIT_READ: "audit.read",
    // Reporting
    REPORTING_READ: "reporting.read",
    // Allocations
    ALLOCATION_READ: "allocation.read",
    ALLOCATION_WRITE: "allocation.write",
    // Succession
    SUCCESSION_READ: "succession.read",
    SUCCESSION_WRITE: "succession.write",
    // Inventory
    INVENTORY_READ: "inventory.read",
    INVENTORY_WRITE: "inventory.write",
    // Approvals / Workflow
    APPROVAL_READ: "approval.read",
    APPROVAL_WRITE: "approval.write",
    // Analytics
    ANALYTICS_READ: "analytics.read",
    // Service / SLA
    SERVICE_READ: "service.read",
    SERVICE_WRITE: "service.write",
    // Knowledge Base
    KNOWLEDGE_READ: "knowledge.read",
    // Learning
    LEARNING_READ: "learning.read",
    LEARNING_WRITE: "learning.write",
    // Partner
    PARTNER_READ: "partner.read",
    // Billing
    BILLING_READ: "billing.read",
    BILLING_WRITE: "billing.write",
    // Notifications
    NOTIFICATION_WRITE: "notification.write",
    // Document / OCR
    DOCUMENT_READ: "document.read",
    // Compensation
    COMPENSATION_READ: "compensation.read",
    // Sourcing
    SOURCING_READ: "sourcing.read",
    SOURCING_WRITE: "sourcing.write",
    // Territory
    TERRITORY_READ: "territory.read",

    // ═══════════════════════════════════════════════
    // Phase 4 — Industry & Operational Modules
    // ═══════════════════════════════════════════════
    // Quality Management
    QUALITY_READ: "quality.read",
    QUALITY_WRITE: "quality.write",
    // BPM
    BPM_READ: "bpm.read",
    BPM_WRITE: "bpm.write",
    // Ecommerce / Marketplace
    ECOMMERCE_READ: "ecommerce.read",
    ECOMMERCE_WRITE: "ecommerce.write",
    // WFM
    WFM_READ: "wfm.read",
    WFM_WRITE: "wfm.write",
    // Portal
    PORTAL_READ: "portal.read",
    // Fleet
    FLEET_READ: "fleet.read",
    FLEET_WRITE: "fleet.write",
    // MRP
    MRP_READ: "mrp.read",
    MRP_WRITE: "mrp.write",
    // Data Governance
    GOVERNANCE_READ: "governance.read",
    GOVERNANCE_WRITE: "governance.write",
    // API Management
    API_MGMT_READ: "api_mgmt.read",
    // Communication
    COMMUNICATION_WRITE: "communication.write",
    // Customs
    CUSTOMS_READ: "customs.read",
    CUSTOMS_WRITE: "customs.write",
    // Clinical / Pharma
    CLINICAL_READ: "clinical.read",
    CLINICAL_WRITE: "clinical.write",
    // Hospitality
    HOSPITALITY_READ: "hospitality.read",
    HOSPITALITY_WRITE: "hospitality.write",
    // Healthcare
    HEALTHCARE_READ: "healthcare.read",
    HEALTHCARE_WRITE: "healthcare.write",
    // Education
    EDUCATION_READ: "education.read",
    EDUCATION_WRITE: "education.write",
    // Energy
    ENERGY_READ: "energy.read",
    ENERGY_WRITE: "energy.write",
    // Banking
    BANKING_READ: "banking.read",
    BANKING_WRITE: "banking.write",
    // Insurance
    INSURANCE_READ: "insurance.read",
    INSURANCE_WRITE: "insurance.write",
    // Retail
    RETAIL_READ: "retail.read",
    RETAIL_WRITE: "retail.write",
    // Automotive
    AUTOMOTIVE_READ: "automotive.read",
    AUTOMOTIVE_WRITE: "automotive.write",
    // Government
    GOVERNMENT_READ: "government.read",
    GOVERNMENT_WRITE: "government.write",
    // Telecom
    TELECOM_READ: "telecom.read",
    TELECOM_WRITE: "telecom.write",
    // Food & Beverage / CPG
    FNB_READ: "fnb.read",
    FNB_WRITE: "fnb.write",
} as const;

// Role-Permission Mapping (In a real app, this might be DB driven)
export const ROLE_PERMISSIONS: Record<string, string[]> = {
    [ROLES.ADMIN]: Object.values(PERMISSIONS),
    [ROLES.GL_MANAGER]: [
        // GL
        PERMISSIONS.GL_READ, PERMISSIONS.GL_WRITE, PERMISSIONS.GL_APPROVE,
        PERMISSIONS.GL_POST, PERMISSIONS.GL_CONFIG, PERMISSIONS.GL_CLOSE_PERIOD,
        // AP / AR
        PERMISSIONS.AP_READ, PERMISSIONS.AP_WRITE,
        PERMISSIONS.AR_READ, PERMISSIONS.AR_WRITE,
        // Fixed Assets / Cash
        PERMISSIONS.FA_READ, PERMISSIONS.FA_WRITE,
        PERMISSIONS.CASH_READ, PERMISSIONS.CASH_WRITE,
        // CRM
        PERMISSIONS.CRM_READ, PERMISSIONS.CRM_WRITE,
        // HR
        PERMISSIONS.HR_READ,
        // Projects
        PERMISSIONS.PROJECT_READ, PERMISSIONS.PROJECT_WRITE,
        // SCM / Mfg
        PERMISSIONS.SCM_READ, PERMISSIONS.MFG_READ,
        // IC
        PERMISSIONS.IC_READ, PERMISSIONS.IC_WRITE,
        // LCM / Lease
        PERMISSIONS.LCM_READ, PERMISSIONS.LEASE_READ,
        // AI
        PERMISSIONS.AI_CHAT, PERMISSIONS.AI_EXECUTE,
        // Treasury
        PERMISSIONS.TREASURY_READ, PERMISSIONS.TREASURY_WRITE,
        // Tax
        PERMISSIONS.TAX_READ, PERMISSIONS.TAX_WRITE,
        // Revenue
        PERMISSIONS.REVENUE_READ, PERMISSIONS.REVENUE_WRITE,
        // EPM
        PERMISSIONS.EPM_READ, PERMISSIONS.EPM_WRITE,
        // Payroll
        PERMISSIONS.PAYROLL_READ,
        // Benefits
        PERMISSIONS.BENEFITS_READ,
        // Expenses
        PERMISSIONS.EXPENSE_READ, PERMISSIONS.EXPENSE_WRITE,
        // Reporting / Allocations
        PERMISSIONS.REPORTING_READ,
        PERMISSIONS.ALLOCATION_READ, PERMISSIONS.ALLOCATION_WRITE,
        // Netting
        PERMISSIONS.NETTING_READ, PERMISSIONS.NETTING_WRITE,
        // Order
        PERMISSIONS.ORDER_READ,
        // Campaign / Commission / Contract
        PERMISSIONS.CAMPAIGN_READ, PERMISSIONS.COMMISSION_READ,
        PERMISSIONS.CONTRACT_READ, PERMISSIONS.CONTRACT_WRITE,
        // Audit / Transport
        PERMISSIONS.AUDIT_READ, PERMISSIONS.TRANSPORT_READ,
        // Recruit / Perf / Succession
        PERMISSIONS.RECRUIT_READ, PERMISSIONS.PERF_READ,
        PERMISSIONS.SUCCESSION_READ,
        // Field Service / Construction / Maintenance / MDM
        PERMISSIONS.FIELD_SERVICE_READ, PERMISSIONS.CONSTRUCTION_READ,
        PERMISSIONS.MAINTENANCE_READ, PERMISSIONS.MDM_READ,
        // New Phase 3
        PERMISSIONS.INVENTORY_READ, PERMISSIONS.INVENTORY_WRITE,
        PERMISSIONS.APPROVAL_READ, PERMISSIONS.APPROVAL_WRITE,
        PERMISSIONS.ANALYTICS_READ,
        PERMISSIONS.SERVICE_READ, PERMISSIONS.SERVICE_WRITE,
        PERMISSIONS.KNOWLEDGE_READ,
        PERMISSIONS.LEARNING_READ, PERMISSIONS.LEARNING_WRITE,
        PERMISSIONS.PARTNER_READ,
        PERMISSIONS.BILLING_READ, PERMISSIONS.BILLING_WRITE,
        PERMISSIONS.NOTIFICATION_WRITE,
        PERMISSIONS.DOCUMENT_READ,
        PERMISSIONS.COMPENSATION_READ,
        PERMISSIONS.SOURCING_READ, PERMISSIONS.SOURCING_WRITE,
        PERMISSIONS.TERRITORY_READ,
        // Phase 4
        PERMISSIONS.QUALITY_READ, PERMISSIONS.QUALITY_WRITE,
        PERMISSIONS.BPM_READ, PERMISSIONS.BPM_WRITE,
        PERMISSIONS.ECOMMERCE_READ, PERMISSIONS.ECOMMERCE_WRITE,
        PERMISSIONS.WFM_READ, PERMISSIONS.WFM_WRITE,
        PERMISSIONS.PORTAL_READ,
        PERMISSIONS.FLEET_READ, PERMISSIONS.FLEET_WRITE,
        PERMISSIONS.MRP_READ, PERMISSIONS.MRP_WRITE,
        PERMISSIONS.GOVERNANCE_READ, PERMISSIONS.GOVERNANCE_WRITE,
        PERMISSIONS.API_MGMT_READ,
        PERMISSIONS.COMMUNICATION_WRITE,
        PERMISSIONS.CUSTOMS_READ, PERMISSIONS.CUSTOMS_WRITE,
        PERMISSIONS.CLINICAL_READ, PERMISSIONS.CLINICAL_WRITE,
        PERMISSIONS.HOSPITALITY_READ, PERMISSIONS.HOSPITALITY_WRITE,
        PERMISSIONS.HEALTHCARE_READ, PERMISSIONS.HEALTHCARE_WRITE,
        PERMISSIONS.EDUCATION_READ, PERMISSIONS.EDUCATION_WRITE,
        PERMISSIONS.ENERGY_READ, PERMISSIONS.ENERGY_WRITE,
        PERMISSIONS.BANKING_READ, PERMISSIONS.BANKING_WRITE,
        PERMISSIONS.INSURANCE_READ, PERMISSIONS.INSURANCE_WRITE,
        PERMISSIONS.RETAIL_READ, PERMISSIONS.RETAIL_WRITE,
        PERMISSIONS.AUTOMOTIVE_READ, PERMISSIONS.AUTOMOTIVE_WRITE,
        PERMISSIONS.GOVERNMENT_READ, PERMISSIONS.GOVERNMENT_WRITE,
        PERMISSIONS.TELECOM_READ, PERMISSIONS.TELECOM_WRITE,
        PERMISSIONS.FNB_READ, PERMISSIONS.FNB_WRITE,
    ],
    [ROLES.GL_USER]: [
        // GL
        PERMISSIONS.GL_READ, PERMISSIONS.GL_WRITE,
        // AP / AR
        PERMISSIONS.AP_READ, PERMISSIONS.AP_WRITE,
        PERMISSIONS.AR_READ, PERMISSIONS.AR_WRITE,
        // FA / Cash
        PERMISSIONS.FA_READ, PERMISSIONS.CASH_READ,
        // CRM
        PERMISSIONS.CRM_READ, PERMISSIONS.CRM_WRITE,
        // HR
        PERMISSIONS.HR_READ,
        // Projects
        PERMISSIONS.PROJECT_READ, PERMISSIONS.PROJECT_WRITE,
        // SCM / Mfg
        PERMISSIONS.SCM_READ, PERMISSIONS.MFG_READ,
        // IC / LCM / Lease
        PERMISSIONS.IC_READ, PERMISSIONS.LCM_READ, PERMISSIONS.LEASE_READ,
        // AI
        PERMISSIONS.AI_CHAT, PERMISSIONS.AI_EXECUTE,
        // Treasury / Tax / Revenue / EPM (read-only)
        PERMISSIONS.TREASURY_READ, PERMISSIONS.TAX_READ,
        PERMISSIONS.REVENUE_READ, PERMISSIONS.EPM_READ,
        // Payroll / Benefits / Expenses (read-only)
        PERMISSIONS.PAYROLL_READ, PERMISSIONS.BENEFITS_READ,
        PERMISSIONS.EXPENSE_READ, PERMISSIONS.EXPENSE_WRITE,
        // Reporting
        PERMISSIONS.REPORTING_READ,
        // Order / Campaign / Commission / Contract (read)
        PERMISSIONS.ORDER_READ, PERMISSIONS.CAMPAIGN_READ,
        PERMISSIONS.COMMISSION_READ, PERMISSIONS.CONTRACT_READ,
        // Audit / Transport
        PERMISSIONS.AUDIT_READ, PERMISSIONS.TRANSPORT_READ,
        // Recruit / Perf / Succession (read)
        PERMISSIONS.RECRUIT_READ, PERMISSIONS.PERF_READ, PERMISSIONS.SUCCESSION_READ,
        // Field Service / Construction / Maintenance / MDM (read)
        PERMISSIONS.FIELD_SERVICE_READ, PERMISSIONS.CONSTRUCTION_READ,
        PERMISSIONS.MAINTENANCE_READ, PERMISSIONS.MDM_READ,
        // Netting / Allocation (read)
        PERMISSIONS.NETTING_READ, PERMISSIONS.ALLOCATION_READ,
        // New Phase 3
        PERMISSIONS.INVENTORY_READ,
        PERMISSIONS.APPROVAL_READ,
        PERMISSIONS.ANALYTICS_READ,
        PERMISSIONS.SERVICE_READ,
        PERMISSIONS.KNOWLEDGE_READ,
        PERMISSIONS.LEARNING_READ,
        PERMISSIONS.PARTNER_READ,
        PERMISSIONS.BILLING_READ,
        PERMISSIONS.DOCUMENT_READ,
        PERMISSIONS.COMPENSATION_READ,
        PERMISSIONS.SOURCING_READ,
        PERMISSIONS.TERRITORY_READ,
        // Phase 4 (reads + limited writes)
        PERMISSIONS.QUALITY_READ,
        PERMISSIONS.BPM_READ,
        PERMISSIONS.ECOMMERCE_READ,
        PERMISSIONS.WFM_READ,
        PERMISSIONS.PORTAL_READ,
        PERMISSIONS.FLEET_READ,
        PERMISSIONS.MRP_READ,
        PERMISSIONS.GOVERNANCE_READ,
        PERMISSIONS.API_MGMT_READ,
        PERMISSIONS.CUSTOMS_READ,
        PERMISSIONS.CLINICAL_READ,
        PERMISSIONS.HOSPITALITY_READ,
        PERMISSIONS.HEALTHCARE_READ,
        PERMISSIONS.EDUCATION_READ,
        PERMISSIONS.ENERGY_READ,
        PERMISSIONS.BANKING_READ,
        PERMISSIONS.INSURANCE_READ,
        PERMISSIONS.RETAIL_READ,
        PERMISSIONS.AUTOMOTIVE_READ,
        PERMISSIONS.GOVERNMENT_READ,
        PERMISSIONS.TELECOM_READ,
        PERMISSIONS.FNB_READ,
    ],
    [ROLES.GL_VIEWER]: [
        PERMISSIONS.GL_READ, PERMISSIONS.AP_READ, PERMISSIONS.AR_READ,
        PERMISSIONS.FA_READ, PERMISSIONS.CASH_READ,
        PERMISSIONS.CRM_READ, PERMISSIONS.HR_READ,
        PERMISSIONS.PROJECT_READ, PERMISSIONS.SCM_READ,
        PERMISSIONS.MFG_READ, PERMISSIONS.IC_READ,
        PERMISSIONS.LCM_READ, PERMISSIONS.LEASE_READ,
        PERMISSIONS.AI_CHAT,
        // New module reads
        PERMISSIONS.TREASURY_READ, PERMISSIONS.TAX_READ,
        PERMISSIONS.REVENUE_READ, PERMISSIONS.EPM_READ,
        PERMISSIONS.PAYROLL_READ, PERMISSIONS.BENEFITS_READ,
        PERMISSIONS.EXPENSE_READ, PERMISSIONS.REPORTING_READ,
        PERMISSIONS.ORDER_READ, PERMISSIONS.CAMPAIGN_READ,
        PERMISSIONS.COMMISSION_READ, PERMISSIONS.CONTRACT_READ,
        PERMISSIONS.AUDIT_READ, PERMISSIONS.TRANSPORT_READ,
        PERMISSIONS.RECRUIT_READ, PERMISSIONS.PERF_READ, PERMISSIONS.SUCCESSION_READ,
        PERMISSIONS.FIELD_SERVICE_READ, PERMISSIONS.CONSTRUCTION_READ,
        PERMISSIONS.MAINTENANCE_READ, PERMISSIONS.MDM_READ,
        PERMISSIONS.NETTING_READ, PERMISSIONS.ALLOCATION_READ,
        // New Phase 3
        PERMISSIONS.INVENTORY_READ,
        PERMISSIONS.APPROVAL_READ,
        PERMISSIONS.ANALYTICS_READ,
        PERMISSIONS.SERVICE_READ,
        PERMISSIONS.KNOWLEDGE_READ,
        PERMISSIONS.LEARNING_READ,
        PERMISSIONS.PARTNER_READ,
        PERMISSIONS.BILLING_READ,
        PERMISSIONS.DOCUMENT_READ,
        PERMISSIONS.COMPENSATION_READ,
        PERMISSIONS.SOURCING_READ,
        PERMISSIONS.TERRITORY_READ,
        // Phase 4 (read-only)
        PERMISSIONS.QUALITY_READ,
        PERMISSIONS.BPM_READ,
        PERMISSIONS.ECOMMERCE_READ,
        PERMISSIONS.WFM_READ,
        PERMISSIONS.PORTAL_READ,
        PERMISSIONS.FLEET_READ,
        PERMISSIONS.MRP_READ,
        PERMISSIONS.GOVERNANCE_READ,
        PERMISSIONS.API_MGMT_READ,
        PERMISSIONS.CUSTOMS_READ,
        PERMISSIONS.CLINICAL_READ,
        PERMISSIONS.HOSPITALITY_READ,
        PERMISSIONS.HEALTHCARE_READ,
        PERMISSIONS.EDUCATION_READ,
        PERMISSIONS.ENERGY_READ,
        PERMISSIONS.BANKING_READ,
        PERMISSIONS.INSURANCE_READ,
        PERMISSIONS.RETAIL_READ,
        PERMISSIONS.AUTOMOTIVE_READ,
        PERMISSIONS.GOVERNMENT_READ,
        PERMISSIONS.TELECOM_READ,
        PERMISSIONS.FNB_READ,
    ]
};

// Segregation of Duties (SoD) Rules
// Key: A permission that conflicts with others
// Value: Array of permissions that are incompatible with the key
export const SOD_MATRIX: Record<string, string[]> = {
    [PERMISSIONS.GL_POST]: [PERMISSIONS.GL_APPROVE], // Cannot Approve if you can Post (simplistic view, usually it's per transaction)
    [PERMISSIONS.GL_APPROVE]: [PERMISSIONS.GL_POST]
};

export const hasPermission = (userRole: string, permission: string): boolean => {
    const perms = ROLE_PERMISSIONS[userRole] || [];
    return perms.includes(permission);
};
