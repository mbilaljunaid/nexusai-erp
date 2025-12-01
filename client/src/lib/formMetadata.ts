export interface FormFieldConfig {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "date" | "select" | "textarea";
  required: boolean;
  searchable: boolean;
  validation?: string;
}

export interface FormMetadata {
  id: string;
  name: string;
  apiEndpoint: string;
  fields: FormFieldConfig[];
  searchFields: string[];
  displayField: string;
  createButtonText: string;
  module: string;
  page: string;
  allowCreate: boolean;
  showSearch: boolean;
  breadcrumbs: Array<{ label: string; path: string }>;
}

export const formMetadataRegistry: Record<string, FormMetadata> = {
  aIAssistant: {
    id: "aIAssistant",
    name: "A I Assistant",
    apiEndpoint: "/api/aiassistant",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create A I Assistant",
    module: "AI",
    page: "/ai/aiassistant",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "AI", path: "/ai" },
      { label: "A I Assistant", path: "/ai/aiassistant" }
    ]
  },
  aIAssistantAdvanced: {
    id: "aIAssistantAdvanced",
    name: "A I Assistant Advanced",
    apiEndpoint: "/api/aiassistantadvanced",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create A I Assistant Advanced",
    module: "AI",
    page: "/ai/aiassistantadvanced",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "AI", path: "/ai" },
      { label: "A I Assistant Advanced", path: "/ai/aiassistantadvanced" }
    ]
  },
  aIAutomation: {
    id: "aIAutomation",
    name: "A I Automation",
    apiEndpoint: "/api/aiautomation",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create A I Automation",
    module: "AI",
    page: "/ai/aiautomation",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "AI", path: "/ai" },
      { label: "A I Automation", path: "/ai/aiautomation" }
    ]
  },
  aIChat: {
    id: "aIChat",
    name: "A I Chat",
    apiEndpoint: "/api/aichat",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create A I Chat",
    module: "AI",
    page: "/ai/aichat",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "AI", path: "/ai" },
      { label: "A I Chat", path: "/ai/aichat" }
    ]
  },
  aPIDocumentation: {
    id: "aPIDocumentation",
    name: "A P I Documentation",
    apiEndpoint: "/api/apidocumentation",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create A P I Documentation",
    module: "Developer",
    page: "/developer/apidocumentation",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Developer", path: "/developer" },
      { label: "A P I Documentation", path: "/developer/apidocumentation" }
    ]
  },
  aPIGateway: {
    id: "aPIGateway",
    name: "A P I Gateway",
    apiEndpoint: "/api/apigateway",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create A P I Gateway",
    module: "Developer",
    page: "/developer/apigateway",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Developer", path: "/developer" },
      { label: "A P I Gateway", path: "/developer/apigateway" }
    ]
  },
  aPILogs: {
    id: "aPILogs",
    name: "A P I Logs",
    apiEndpoint: "/api/apilogs",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create A P I Logs",
    module: "Developer",
    page: "/developer/apilogs",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Developer", path: "/developer" },
      { label: "A P I Logs", path: "/developer/apilogs" }
    ]
  },
  aPIManagement: {
    id: "aPIManagement",
    name: "A P I Management",
    apiEndpoint: "/api/apimanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create A P I Management",
    module: "Developer",
    page: "/developer/apimanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Developer", path: "/developer" },
      { label: "A P I Management", path: "/developer/apimanagement" }
    ]
  },
  aPIRateLimitPolicy: {
    id: "aPIRateLimitPolicy",
    name: "A P I Rate Limit Policy",
    apiEndpoint: "/api/apiratelimitpolicy",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create A P I Rate Limit Policy",
    module: "Developer",
    page: "/developer/apiratelimitpolicy",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Developer", path: "/developer" },
      { label: "A P I Rate Limit Policy", path: "/developer/apiratelimitpolicy" }
    ]
  },
  aPIVersioning: {
    id: "aPIVersioning",
    name: "A P I Versioning",
    apiEndpoint: "/api/apiversioning",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create A P I Versioning",
    module: "Developer",
    page: "/developer/apiversioning",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Developer", path: "/developer" },
      { label: "A P I Versioning", path: "/developer/apiversioning" }
    ]
  },
  aPInvoices: {
    id: "aPInvoices",
    name: "A P Invoices",
    apiEndpoint: "/api/apinvoices",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create A P Invoices",
    module: "Developer",
    page: "/developer/apinvoices",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Developer", path: "/developer" },
      { label: "A P Invoices", path: "/developer/apinvoices" }
    ]
  },
  aRInvoices: {
    id: "aRInvoices",
    name: "A R Invoices",
    apiEndpoint: "/api/arinvoices",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create A R Invoices",
    module: "Finance",
    page: "/finance/arinvoices",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "A R Invoices", path: "/finance/arinvoices" }
    ]
  },
  aboutPage: {
    id: "aboutPage",
    name: "About Page",
    apiEndpoint: "/api/aboutpage",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create About Page",
    module: "Operations",
    page: "/operations/aboutpage",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "About Page", path: "/operations/aboutpage" }
    ]
  },
  accessControl: {
    id: "accessControl",
    name: "Access Control",
    apiEndpoint: "/api/accesscontrol",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Access Control",
    module: "General",
    page: "/general/accesscontrol",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Access Control", path: "/general/accesscontrol" }
    ]
  },
  accessibilityAudit: {
    id: "accessibilityAudit",
    name: "Accessibility Audit",
    apiEndpoint: "/api/accessibilityaudit",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Accessibility Audit",
    module: "Admin",
    page: "/admin/accessibilityaudit",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Accessibility Audit", path: "/admin/accessibilityaudit" }
    ]
  },
  accountDirectory: {
    id: "accountDirectory",
    name: "Account Directory",
    apiEndpoint: "/api/accountdirectory",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Account Directory",
    module: "CRM",
    page: "/crm/accountdirectory",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Account Directory", path: "/crm/accountdirectory" }
    ]
  },
  accountHierarchy: {
    id: "accountHierarchy",
    name: "Account Hierarchy",
    apiEndpoint: "/api/accounthierarchy",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Account Hierarchy",
    module: "CRM",
    page: "/crm/accounthierarchy",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Account Hierarchy", path: "/crm/accounthierarchy" }
    ]
  },
  accountReconciliation: {
    id: "accountReconciliation",
    name: "Account Reconciliation",
    apiEndpoint: "/api/accountreconciliation",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Account Reconciliation",
    module: "CRM",
    page: "/crm/accountreconciliation",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Account Reconciliation", path: "/crm/accountreconciliation" }
    ]
  },
  activityTimeline: {
    id: "activityTimeline",
    name: "Activity Timeline",
    apiEndpoint: "/api/activitytimeline",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Activity Timeline",
    module: "CRM",
    page: "/crm/activitytimeline",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Activity Timeline", path: "/crm/activitytimeline" }
    ]
  },
  adminConsole: {
    id: "adminConsole",
    name: "Admin Console",
    apiEndpoint: "/api/adminconsole",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Admin Console",
    module: "Admin",
    page: "/admin/adminconsole",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Admin Console", path: "/admin/adminconsole" }
    ]
  },
  adminConsoleModule: {
    id: "adminConsoleModule",
    name: "Admin Console Module",
    apiEndpoint: "/api/adminconsolemodule",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Admin Console Module",
    module: "Admin",
    page: "/admin/adminconsolemodule",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Admin Console Module", path: "/admin/adminconsolemodule" }
    ]
  },
  adminRoles: {
    id: "adminRoles",
    name: "Admin Roles",
    apiEndpoint: "/api/adminroles",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Admin Roles",
    module: "Admin",
    page: "/admin/adminroles",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Admin Roles", path: "/admin/adminroles" }
    ]
  },
  admissionsEnrollment: {
    id: "admissionsEnrollment",
    name: "Admissions Enrollment",
    apiEndpoint: "/api/admissionsenrollment",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Admissions Enrollment",
    module: "Education",
    page: "/education/admissionsenrollment",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Education", path: "/education" },
      { label: "Admissions Enrollment", path: "/education/admissionsenrollment" }
    ]
  },
  advancedAnalytics: {
    id: "advancedAnalytics",
    name: "Advanced Analytics",
    apiEndpoint: "/api/advancedanalytics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Advanced Analytics",
    module: "Analytics",
    page: "/analytics/advancedanalytics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Advanced Analytics", path: "/analytics/advancedanalytics" }
    ]
  },
  advancedEncryption: {
    id: "advancedEncryption",
    name: "Advanced Encryption",
    apiEndpoint: "/api/advancedencryption",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Advanced Encryption",
    module: "Analytics",
    page: "/analytics/advancedencryption",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Advanced Encryption", path: "/analytics/advancedencryption" }
    ]
  },
  advancedFeatures: {
    id: "advancedFeatures",
    name: "Advanced Features",
    apiEndpoint: "/api/advancedfeatures",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Advanced Features",
    module: "Analytics",
    page: "/analytics/advancedfeatures",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Advanced Features", path: "/analytics/advancedfeatures" }
    ]
  },
  advancedPermissions: {
    id: "advancedPermissions",
    name: "Advanced Permissions",
    apiEndpoint: "/api/advancedpermissions",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Advanced Permissions",
    module: "Analytics",
    page: "/analytics/advancedpermissions",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Advanced Permissions", path: "/analytics/advancedpermissions" }
    ]
  },
  advancedReporting: {
    id: "advancedReporting",
    name: "Advanced Reporting",
    apiEndpoint: "/api/advancedreporting",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Advanced Reporting",
    module: "Analytics",
    page: "/analytics/advancedreporting",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Advanced Reporting", path: "/analytics/advancedreporting" }
    ]
  },
  advancedSearch: {
    id: "advancedSearch",
    name: "Advanced Search",
    apiEndpoint: "/api/advancedsearch",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Advanced Search",
    module: "Analytics",
    page: "/analytics/advancedsearch",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Advanced Search", path: "/analytics/advancedsearch" }
    ]
  },
  agileBoard: {
    id: "agileBoard",
    name: "Agile Board",
    apiEndpoint: "/api/agileboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Agile Board",
    module: "Projects",
    page: "/projects/agileboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Projects", path: "/projects" },
      { label: "Agile Board", path: "/projects/agileboard" }
    ]
  },
  agingReport: {
    id: "agingReport",
    name: "Aging Report",
    apiEndpoint: "/api/agingreport",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Aging Report",
    module: "Finance",
    page: "/finance/agingreport",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Aging Report", path: "/finance/agingreport" }
    ]
  },
  alertsAndNotifications: {
    id: "alertsAndNotifications",
    name: "Alerts And Notifications",
    apiEndpoint: "/api/alertsandnotifications",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Alerts And Notifications",
    module: "Operations",
    page: "/operations/alertsandnotifications",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Alerts And Notifications", path: "/operations/alertsandnotifications" }
    ]
  },
  alumniEngagement: {
    id: "alumniEngagement",
    name: "Alumni Engagement",
    apiEndpoint: "/api/alumniengagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Alumni Engagement",
    module: "General",
    page: "/general/alumniengagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Alumni Engagement", path: "/general/alumniengagement" }
    ]
  },
  analytics: {
    id: "analytics",
    name: "Analytics",
    apiEndpoint: "/api/analytics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Analytics",
    module: "Analytics",
    page: "/analytics/analytics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Analytics", path: "/analytics/analytics" }
    ]
  },
  analyticsModule: {
    id: "analyticsModule",
    name: "Analytics Module",
    apiEndpoint: "/api/analyticsmodule",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Analytics Module",
    module: "Analytics",
    page: "/analytics/analyticsmodule",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Analytics Module", path: "/analytics/analyticsmodule" }
    ]
  },
  anomalyDetection: {
    id: "anomalyDetection",
    name: "Anomaly Detection",
    apiEndpoint: "/api/anomalydetection",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Anomaly Detection",
    module: "General",
    page: "/general/anomalydetection",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Anomaly Detection", path: "/general/anomalydetection" }
    ]
  },
  appStore: {
    id: "appStore",
    name: "App Store",
    apiEndpoint: "/api/appstore",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create App Store",
    module: "General",
    page: "/general/appstore",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "App Store", path: "/general/appstore" }
    ]
  },
  appointmentScheduling: {
    id: "appointmentScheduling",
    name: "Appointment Scheduling",
    apiEndpoint: "/api/appointmentscheduling",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Appointment Scheduling",
    module: "Operations",
    page: "/operations/appointmentscheduling",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Appointment Scheduling", path: "/operations/appointmentscheduling" }
    ]
  },
  approvalEscalations: {
    id: "approvalEscalations",
    name: "Approval Escalations",
    apiEndpoint: "/api/approvalescalations",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Approval Escalations",
    module: "Workflow",
    page: "/workflow/approvalescalations",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Workflow", path: "/workflow" },
      { label: "Approval Escalations", path: "/workflow/approvalescalations" }
    ]
  },
  approvalWorkflow: {
    id: "approvalWorkflow",
    name: "Approval Workflow",
    apiEndpoint: "/api/approvalworkflow",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Approval Workflow",
    module: "Workflow",
    page: "/workflow/approvalworkflow",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Workflow", path: "/workflow" },
      { label: "Approval Workflow", path: "/workflow/approvalworkflow" }
    ]
  },
  archiveManagement: {
    id: "archiveManagement",
    name: "Archive Management",
    apiEndpoint: "/api/archivemanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Archive Management",
    module: "Operations",
    page: "/operations/archivemanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Archive Management", path: "/operations/archivemanagement" }
    ]
  },
  assessmentGrading: {
    id: "assessmentGrading",
    name: "Assessment Grading",
    apiEndpoint: "/api/assessmentgrading",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Assessment Grading",
    module: "General",
    page: "/general/assessmentgrading",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Assessment Grading", path: "/general/assessmentgrading" }
    ]
  },
  assessments: {
    id: "assessments",
    name: "Assessments",
    apiEndpoint: "/api/assessments",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Assessments",
    module: "General",
    page: "/general/assessments",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Assessments", path: "/general/assessments" }
    ]
  },
  assetManagement: {
    id: "assetManagement",
    name: "Asset Management",
    apiEndpoint: "/api/assetmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Asset Management",
    module: "Operations",
    page: "/operations/assetmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Asset Management", path: "/operations/assetmanagement" }
    ]
  },
  assortmentPlanner: {
    id: "assortmentPlanner",
    name: "Assortment Planner",
    apiEndpoint: "/api/assortmentplanner",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Assortment Planner",
    module: "General",
    page: "/general/assortmentplanner",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Assortment Planner", path: "/general/assortmentplanner" }
    ]
  },
  attendance: {
    id: "attendance",
    name: "Attendance",
    apiEndpoint: "/api/attendance",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Attendance",
    module: "HR",
    page: "/hr/attendance",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Attendance", path: "/hr/attendance" }
    ]
  },
  attendanceDashboard: {
    id: "attendanceDashboard",
    name: "Attendance Dashboard",
    apiEndpoint: "/api/attendancedashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Attendance Dashboard",
    module: "HR",
    page: "/hr/attendancedashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Attendance Dashboard", path: "/hr/attendancedashboard" }
    ]
  },
  auditLogs: {
    id: "auditLogs",
    name: "Audit Logs",
    apiEndpoint: "/api/auditlogs",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Audit Logs",
    module: "Admin",
    page: "/admin/auditlogs",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Audit Logs", path: "/admin/auditlogs" }
    ]
  },
  auditManagement: {
    id: "auditManagement",
    name: "Audit Management",
    apiEndpoint: "/api/auditmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Audit Management",
    module: "Admin",
    page: "/admin/auditmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Audit Management", path: "/admin/auditmanagement" }
    ]
  },
  auditTrails: {
    id: "auditTrails",
    name: "Audit Trails",
    apiEndpoint: "/api/audittrails",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Audit Trails",
    module: "Admin",
    page: "/admin/audittrails",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Audit Trails", path: "/admin/audittrails" }
    ]
  },
  authenticationMethods: {
    id: "authenticationMethods",
    name: "Authentication Methods",
    apiEndpoint: "/api/authenticationmethods",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Authentication Methods",
    module: "General",
    page: "/general/authenticationmethods",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Authentication Methods", path: "/general/authenticationmethods" }
    ]
  },
  automationRules: {
    id: "automationRules",
    name: "Automation Rules",
    apiEndpoint: "/api/automationrules",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Automation Rules",
    module: "Automation",
    page: "/automation/automationrules",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Automation", path: "/automation" },
      { label: "Automation Rules", path: "/automation/automationrules" }
    ]
  },
  automotiveAfterSalesService: {
    id: "automotiveAfterSalesService",
    name: "Automotive After Sales Service",
    apiEndpoint: "/api/automotiveaftersalesservice",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Automotive After Sales Service",
    module: "CRM",
    page: "/crm/automotiveaftersalesservice",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Automotive After Sales Service", path: "/crm/automotiveaftersalesservice" }
    ]
  },
  automotiveBIDashboard: {
    id: "automotiveBIDashboard",
    name: "Automotive B I Dashboard",
    apiEndpoint: "/api/automotivebidashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Automotive B I Dashboard",
    module: "Analytics",
    page: "/analytics/automotivebidashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Automotive B I Dashboard", path: "/analytics/automotivebidashboard" }
    ]
  },
  automotiveBIDashboards: {
    id: "automotiveBIDashboards",
    name: "Automotive B I Dashboards",
    apiEndpoint: "/api/automotivebidashboards",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Automotive B I Dashboards",
    module: "Analytics",
    page: "/analytics/automotivebidashboards",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Automotive B I Dashboards", path: "/analytics/automotivebidashboards" }
    ]
  },
  automotiveCompliance: {
    id: "automotiveCompliance",
    name: "Automotive Compliance",
    apiEndpoint: "/api/automotivecompliance",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Automotive Compliance",
    module: "Governance",
    page: "/governance/automotivecompliance",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Automotive Compliance", path: "/governance/automotivecompliance" }
    ]
  },
  automotiveDealerInventory: {
    id: "automotiveDealerInventory",
    name: "Automotive Dealer Inventory",
    apiEndpoint: "/api/automotivedealerinventory",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Automotive Dealer Inventory",
    module: "Operations",
    page: "/operations/automotivedealerinventory",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Automotive Dealer Inventory", path: "/operations/automotivedealerinventory" }
    ]
  },
  automotiveFinanceInvoicing: {
    id: "automotiveFinanceInvoicing",
    name: "Automotive Finance Invoicing",
    apiEndpoint: "/api/automotivefinanceinvoicing",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Automotive Finance Invoicing",
    module: "Finance",
    page: "/finance/automotivefinanceinvoicing",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Automotive Finance Invoicing", path: "/finance/automotivefinanceinvoicing" }
    ]
  },
  automotiveHRWorkforce: {
    id: "automotiveHRWorkforce",
    name: "Automotive H R Workforce",
    apiEndpoint: "/api/automotivehrworkforce",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Automotive H R Workforce",
    module: "HR",
    page: "/hr/automotivehrworkforce",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Automotive H R Workforce", path: "/hr/automotivehrworkforce" }
    ]
  },
  automotiveMobileApp: {
    id: "automotiveMobileApp",
    name: "Automotive Mobile App",
    apiEndpoint: "/api/automotivemobileapp",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Automotive Mobile App",
    module: "Operations",
    page: "/operations/automotivemobileapp",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Automotive Mobile App", path: "/operations/automotivemobileapp" }
    ]
  },
  automotiveProduction: {
    id: "automotiveProduction",
    name: "Automotive Production",
    apiEndpoint: "/api/automotiveproduction",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Automotive Production",
    module: "Operations",
    page: "/operations/automotiveproduction",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Automotive Production", path: "/operations/automotiveproduction" }
    ]
  },
  automotiveQualityAnalytics: {
    id: "automotiveQualityAnalytics",
    name: "Automotive Quality Analytics",
    apiEndpoint: "/api/automotivequalityanalytics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Automotive Quality Analytics",
    module: "Analytics",
    page: "/analytics/automotivequalityanalytics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Automotive Quality Analytics", path: "/analytics/automotivequalityanalytics" }
    ]
  },
  automotiveReporting: {
    id: "automotiveReporting",
    name: "Automotive Reporting",
    apiEndpoint: "/api/automotivereporting",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Automotive Reporting",
    module: "Analytics",
    page: "/analytics/automotivereporting",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Automotive Reporting", path: "/analytics/automotivereporting" }
    ]
  },
  automotiveSalesCRM: {
    id: "automotiveSalesCRM",
    name: "Automotive Sales C R M",
    apiEndpoint: "/api/automotivesalescrm",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Automotive Sales C R M",
    module: "CRM",
    page: "/crm/automotivesalescrm",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Automotive Sales C R M", path: "/crm/automotivesalescrm" }
    ]
  },
  automotiveSupplyChain: {
    id: "automotiveSupplyChain",
    name: "Automotive Supply Chain",
    apiEndpoint: "/api/automotivesupplychain",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Automotive Supply Chain",
    module: "Logistics",
    page: "/logistics/automotivesupplychain",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Logistics", path: "/logistics" },
      { label: "Automotive Supply Chain", path: "/logistics/automotivesupplychain" }
    ]
  },
  bOMDetail: {
    id: "bOMDetail",
    name: "B O M Detail",
    apiEndpoint: "/api/bomdetail",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create B O M Detail",
    module: "Manufacturing",
    page: "/manufacturing/bomdetail",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Manufacturing", path: "/manufacturing" },
      { label: "B O M Detail", path: "/manufacturing/bomdetail" }
    ]
  },
  bOMManagement: {
    id: "bOMManagement",
    name: "B O M Management",
    apiEndpoint: "/api/bommanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create B O M Management",
    module: "Manufacturing",
    page: "/manufacturing/bommanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Manufacturing", path: "/manufacturing" },
      { label: "B O M Management", path: "/manufacturing/bommanagement" }
    ]
  },
  bOMRouting: {
    id: "bOMRouting",
    name: "B O M Routing",
    apiEndpoint: "/api/bomrouting",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create B O M Routing",
    module: "Manufacturing",
    page: "/manufacturing/bomrouting",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Manufacturing", path: "/manufacturing" },
      { label: "B O M Routing", path: "/manufacturing/bomrouting" }
    ]
  },
  bOQManagementConstruction: {
    id: "bOQManagementConstruction",
    name: "B O Q Management Construction",
    apiEndpoint: "/api/boqmanagementconstruction",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create B O Q Management Construction",
    module: "Operations",
    page: "/operations/boqmanagementconstruction",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "B O Q Management Construction", path: "/operations/boqmanagementconstruction" }
    ]
  },
  bPM: {
    id: "bPM",
    name: "B P M",
    apiEndpoint: "/api/bpm",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create B P M",
    module: "Workflow",
    page: "/workflow/bpm",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Workflow", path: "/workflow" },
      { label: "B P M", path: "/workflow/bpm" }
    ]
  },
  backendIntegration: {
    id: "backendIntegration",
    name: "Backend Integration",
    apiEndpoint: "/api/backendintegration",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Backend Integration",
    module: "Developer",
    page: "/developer/backendintegration",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Developer", path: "/developer" },
      { label: "Backend Integration", path: "/developer/backendintegration" }
    ]
  },
  backupRestore: {
    id: "backupRestore",
    name: "Backup Restore",
    apiEndpoint: "/api/backuprestore",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Backup Restore",
    module: "Admin",
    page: "/admin/backuprestore",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Backup Restore", path: "/admin/backuprestore" }
    ]
  },
  bankReconciliation: {
    id: "bankReconciliation",
    name: "Bank Reconciliation",
    apiEndpoint: "/api/bankreconciliation",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Bank Reconciliation",
    module: "Finance",
    page: "/finance/bankreconciliation",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Bank Reconciliation", path: "/finance/bankreconciliation" }
    ]
  },
  bankingAIFraudDetection: {
    id: "bankingAIFraudDetection",
    name: "Banking A I Fraud Detection",
    apiEndpoint: "/api/bankingaifrauddetection",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Banking A I Fraud Detection",
    module: "AI",
    page: "/ai/bankingaifrauddetection",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "AI", path: "/ai" },
      { label: "Banking A I Fraud Detection", path: "/ai/bankingaifrauddetection" }
    ]
  },
  bankingBIDashboards: {
    id: "bankingBIDashboards",
    name: "Banking B I Dashboards",
    apiEndpoint: "/api/bankingbidashboards",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Banking B I Dashboards",
    module: "Finance",
    page: "/finance/bankingbidashboards",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Banking B I Dashboards", path: "/finance/bankingbidashboards" }
    ]
  },
  bankingCRMEngagement: {
    id: "bankingCRMEngagement",
    name: "Banking C R M Engagement",
    apiEndpoint: "/api/bankingcrmengagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Banking C R M Engagement",
    module: "Finance",
    page: "/finance/bankingcrmengagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Banking C R M Engagement", path: "/finance/bankingcrmengagement" }
    ]
  },
  bankingCoreBanking: {
    id: "bankingCoreBanking",
    name: "Banking Core Banking",
    apiEndpoint: "/api/bankingcorebanking",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Banking Core Banking",
    module: "Finance",
    page: "/finance/bankingcorebanking",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Banking Core Banking", path: "/finance/bankingcorebanking" }
    ]
  },
  bankingCustomerAccounts: {
    id: "bankingCustomerAccounts",
    name: "Banking Customer Accounts",
    apiEndpoint: "/api/bankingcustomeraccounts",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Banking Customer Accounts",
    module: "CRM",
    page: "/crm/bankingcustomeraccounts",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Banking Customer Accounts", path: "/crm/bankingcustomeraccounts" }
    ]
  },
  bankingDeposits: {
    id: "bankingDeposits",
    name: "Banking Deposits",
    apiEndpoint: "/api/bankingdeposits",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Banking Deposits",
    module: "Finance",
    page: "/finance/bankingdeposits",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Banking Deposits", path: "/finance/bankingdeposits" }
    ]
  },
  bankingHRWorkforce: {
    id: "bankingHRWorkforce",
    name: "Banking H R Workforce",
    apiEndpoint: "/api/bankinghrworkforce",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Banking H R Workforce",
    module: "Finance",
    page: "/finance/bankinghrworkforce",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Banking H R Workforce", path: "/finance/bankinghrworkforce" }
    ]
  },
  bankingLoansCredit: {
    id: "bankingLoansCredit",
    name: "Banking Loans Credit",
    apiEndpoint: "/api/bankingloanscredit",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Banking Loans Credit",
    module: "Finance",
    page: "/finance/bankingloanscredit",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Banking Loans Credit", path: "/finance/bankingloanscredit" }
    ]
  },
  bankingMobileApp: {
    id: "bankingMobileApp",
    name: "Banking Mobile App",
    apiEndpoint: "/api/bankingmobileapp",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Banking Mobile App",
    module: "Finance",
    page: "/finance/bankingmobileapp",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Banking Mobile App", path: "/finance/bankingmobileapp" }
    ]
  },
  bankingPayments: {
    id: "bankingPayments",
    name: "Banking Payments",
    apiEndpoint: "/api/bankingpayments",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Banking Payments",
    module: "Finance",
    page: "/finance/bankingpayments",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Banking Payments", path: "/finance/bankingpayments" }
    ]
  },
  bankingRiskCompliance: {
    id: "bankingRiskCompliance",
    name: "Banking Risk Compliance",
    apiEndpoint: "/api/bankingriskcompliance",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Banking Risk Compliance",
    module: "Finance",
    page: "/finance/bankingriskcompliance",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Banking Risk Compliance", path: "/finance/bankingriskcompliance" }
    ]
  },
  bankingTreasury: {
    id: "bankingTreasury",
    name: "Banking Treasury",
    apiEndpoint: "/api/bankingtreasury",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Banking Treasury",
    module: "Finance",
    page: "/finance/bankingtreasury",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Banking Treasury", path: "/finance/bankingtreasury" }
    ]
  },
  batchManufacturing: {
    id: "batchManufacturing",
    name: "Batch Manufacturing",
    apiEndpoint: "/api/batchmanufacturing",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Batch Manufacturing",
    module: "Manufacturing",
    page: "/manufacturing/batchmanufacturing",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Manufacturing", path: "/manufacturing" },
      { label: "Batch Manufacturing", path: "/manufacturing/batchmanufacturing" }
    ]
  },
  batchOperations: {
    id: "batchOperations",
    name: "Batch Operations",
    apiEndpoint: "/api/batchoperations",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Batch Operations",
    module: "Operations",
    page: "/operations/batchoperations",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Batch Operations", path: "/operations/batchoperations" }
    ]
  },
  batchOrdersManagement: {
    id: "batchOrdersManagement",
    name: "Batch Orders Management",
    apiEndpoint: "/api/batchordersmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Batch Orders Management",
    module: "Operations",
    page: "/operations/batchordersmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Batch Orders Management", path: "/operations/batchordersmanagement" }
    ]
  },
  batchTraceabilityGeology: {
    id: "batchTraceabilityGeology",
    name: "Batch Traceability Geology",
    apiEndpoint: "/api/batchtraceabilitygeology",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Batch Traceability Geology",
    module: "General",
    page: "/general/batchtraceabilitygeology",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Batch Traceability Geology", path: "/general/batchtraceabilitygeology" }
    ]
  },
  billing: {
    id: "billing",
    name: "Billing",
    apiEndpoint: "/api/billing",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Billing",
    module: "Finance",
    page: "/finance/billing",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Billing", path: "/finance/billing" }
    ]
  },
  billingCustomers: {
    id: "billingCustomers",
    name: "Billing Customers",
    apiEndpoint: "/api/billingcustomers",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Billing Customers",
    module: "Finance",
    page: "/finance/billingcustomers",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Billing Customers", path: "/finance/billingcustomers" }
    ]
  },
  billingEducation: {
    id: "billingEducation",
    name: "Billing Education",
    apiEndpoint: "/api/billingeducation",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Billing Education",
    module: "Finance",
    page: "/finance/billingeducation",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Billing Education", path: "/finance/billingeducation" }
    ]
  },
  billingInsurance: {
    id: "billingInsurance",
    name: "Billing Insurance",
    apiEndpoint: "/api/billinginsurance",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Billing Insurance",
    module: "Finance",
    page: "/finance/billinginsurance",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Billing Insurance", path: "/finance/billinginsurance" }
    ]
  },
  billingInvoicing: {
    id: "billingInvoicing",
    name: "Billing Invoicing",
    apiEndpoint: "/api/billinginvoicing",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Billing Invoicing",
    module: "Finance",
    page: "/finance/billinginvoicing",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Billing Invoicing", path: "/finance/billinginvoicing" }
    ]
  },
  billingLogistics: {
    id: "billingLogistics",
    name: "Billing Logistics",
    apiEndpoint: "/api/billinglogistics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Billing Logistics",
    module: "Finance",
    page: "/finance/billinglogistics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Billing Logistics", path: "/finance/billinglogistics" }
    ]
  },
  billingPaymentRetail: {
    id: "billingPaymentRetail",
    name: "Billing Payment Retail",
    apiEndpoint: "/api/billingpaymentretail",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Billing Payment Retail",
    module: "Finance",
    page: "/finance/billingpaymentretail",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Billing Payment Retail", path: "/finance/billingpaymentretail" }
    ]
  },
  billingPaymentsRetail: {
    id: "billingPaymentsRetail",
    name: "Billing Payments Retail",
    apiEndpoint: "/api/billingpaymentsretail",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Billing Payments Retail",
    module: "Finance",
    page: "/finance/billingpaymentsretail",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Billing Payments Retail", path: "/finance/billingpaymentsretail" }
    ]
  },
  billingPlans: {
    id: "billingPlans",
    name: "Billing Plans",
    apiEndpoint: "/api/billingplans",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Billing Plans",
    module: "Finance",
    page: "/finance/billingplans",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Billing Plans", path: "/finance/billingplans" }
    ]
  },
  blogPage: {
    id: "blogPage",
    name: "Blog Page",
    apiEndpoint: "/api/blogpage",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Blog Page",
    module: "Operations",
    page: "/operations/blogpage",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Blog Page", path: "/operations/blogpage" }
    ]
  },
  brandingCustomization: {
    id: "brandingCustomization",
    name: "Branding Customization",
    apiEndpoint: "/api/brandingcustomization",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Branding Customization",
    module: "General",
    page: "/general/brandingcustomization",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Branding Customization", path: "/general/brandingcustomization" }
    ]
  },
  budgetPlanning: {
    id: "budgetPlanning",
    name: "Budget Planning",
    apiEndpoint: "/api/budgetplanning",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Budget Planning",
    module: "Finance",
    page: "/finance/budgetplanning",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Budget Planning", path: "/finance/budgetplanning" }
    ]
  },
  budgetingDashboard: {
    id: "budgetingDashboard",
    name: "Budgeting Dashboard",
    apiEndpoint: "/api/budgetingdashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Budgeting Dashboard",
    module: "Finance",
    page: "/finance/budgetingdashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Budgeting Dashboard", path: "/finance/budgetingdashboard" }
    ]
  },
  bulkInventoryManagement: {
    id: "bulkInventoryManagement",
    name: "Bulk Inventory Management",
    apiEndpoint: "/api/bulkinventorymanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Bulk Inventory Management",
    module: "Operations",
    page: "/operations/bulkinventorymanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Bulk Inventory Management", path: "/operations/bulkinventorymanagement" }
    ]
  },
  bulkOperations: {
    id: "bulkOperations",
    name: "Bulk Operations",
    apiEndpoint: "/api/bulkoperations",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Bulk Operations",
    module: "Operations",
    page: "/operations/bulkoperations",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Bulk Operations", path: "/operations/bulkoperations" }
    ]
  },
  businessIntelligence: {
    id: "businessIntelligence",
    name: "Business Intelligence",
    apiEndpoint: "/api/businessintelligence",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Business Intelligence",
    module: "General",
    page: "/general/businessintelligence",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Business Intelligence", path: "/general/businessintelligence" }
    ]
  },
  cMMSMaintenance: {
    id: "cMMSMaintenance",
    name: "C M M S Maintenance",
    apiEndpoint: "/api/cmmsmaintenance",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create C M M S Maintenance",
    module: "General",
    page: "/general/cmmsmaintenance",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "C M M S Maintenance", path: "/general/cmmsmaintenance" }
    ]
  },
  cMTFactoryManagement: {
    id: "cMTFactoryManagement",
    name: "C M T Factory Management",
    apiEndpoint: "/api/cmtfactorymanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create C M T Factory Management",
    module: "Operations",
    page: "/operations/cmtfactorymanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "C M T Factory Management", path: "/operations/cmtfactorymanagement" }
    ]
  },
  cPGAnalytics: {
    id: "cPGAnalytics",
    name: "C P G Analytics",
    apiEndpoint: "/api/cpganalytics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create C P G Analytics",
    module: "Analytics",
    page: "/analytics/cpganalytics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "C P G Analytics", path: "/analytics/cpganalytics" }
    ]
  },
  cRM: {
    id: "cRM",
    name: "C R M",
    apiEndpoint: "/api/crm",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create C R M",
    module: "CRM",
    page: "/crm/crm",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "C R M", path: "/crm/crm" }
    ]
  },
  cRMCopilot: {
    id: "cRMCopilot",
    name: "C R M Copilot",
    apiEndpoint: "/api/crmcopilot",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create C R M Copilot",
    module: "CRM",
    page: "/crm/crmcopilot",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "C R M Copilot", path: "/crm/crmcopilot" }
    ]
  },
  cRMDealer: {
    id: "cRMDealer",
    name: "C R M Dealer",
    apiEndpoint: "/api/crmdealer",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create C R M Dealer",
    module: "CRM",
    page: "/crm/crmdealer",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "C R M Dealer", path: "/crm/crmdealer" }
    ]
  },
  cRMLoyalty: {
    id: "cRMLoyalty",
    name: "C R M Loyalty",
    apiEndpoint: "/api/crmloyalty",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create C R M Loyalty",
    module: "CRM",
    page: "/crm/crmloyalty",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "C R M Loyalty", path: "/crm/crmloyalty" }
    ]
  },
  cRMModule: {
    id: "cRMModule",
    name: "C R M Module",
    apiEndpoint: "/api/crmmodule",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create C R M Module",
    module: "CRM",
    page: "/crm/crmmodule",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "C R M Module", path: "/crm/crmmodule" }
    ]
  },
  cacheManagement: {
    id: "cacheManagement",
    name: "Cache Management",
    apiEndpoint: "/api/cachemanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Cache Management",
    module: "Operations",
    page: "/operations/cachemanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Cache Management", path: "/operations/cachemanagement" }
    ]
  },
  calendar: {
    id: "calendar",
    name: "Calendar",
    apiEndpoint: "/api/calendar",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Calendar",
    module: "General",
    page: "/general/calendar",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Calendar", path: "/general/calendar" }
    ]
  },
  campaignsDashboard: {
    id: "campaignsDashboard",
    name: "Campaigns Dashboard",
    apiEndpoint: "/api/campaignsdashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Campaigns Dashboard",
    module: "Marketing",
    page: "/marketing/campaignsdashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "Campaigns Dashboard", path: "/marketing/campaignsdashboard" }
    ]
  },
  campaignsDetail: {
    id: "campaignsDetail",
    name: "Campaigns Detail",
    apiEndpoint: "/api/campaignsdetail",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Campaigns Detail",
    module: "Marketing",
    page: "/marketing/campaignsdetail",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "Campaigns Detail", path: "/marketing/campaignsdetail" }
    ]
  },
  capacityPlanning: {
    id: "capacityPlanning",
    name: "Capacity Planning",
    apiEndpoint: "/api/capacityplanning",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Capacity Planning",
    module: "General",
    page: "/general/capacityplanning",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Capacity Planning", path: "/general/capacityplanning" }
    ]
  },
  carrierProcurement: {
    id: "carrierProcurement",
    name: "Carrier Procurement",
    apiEndpoint: "/api/carrierprocurement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Carrier Procurement",
    module: "Procurement",
    page: "/procurement/carrierprocurement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Procurement", path: "/procurement" },
      { label: "Carrier Procurement", path: "/procurement/carrierprocurement" }
    ]
  },
  cashManagementPage: {
    id: "cashManagementPage",
    name: "Cash Management Page",
    apiEndpoint: "/api/cashmanagementpage",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Cash Management Page",
    module: "Operations",
    page: "/operations/cashmanagementpage",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Cash Management Page", path: "/operations/cashmanagementpage" }
    ]
  },
  certification: {
    id: "certification",
    name: "Certification",
    apiEndpoint: "/api/certification",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Certification",
    module: "General",
    page: "/general/certification",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Certification", path: "/general/certification" }
    ]
  },
  changeManagement: {
    id: "changeManagement",
    name: "Change Management",
    apiEndpoint: "/api/changemanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Change Management",
    module: "Operations",
    page: "/operations/changemanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Change Management", path: "/operations/changemanagement" }
    ]
  },
  chartOfAccounts: {
    id: "chartOfAccounts",
    name: "Chart Of Accounts",
    apiEndpoint: "/api/chartofaccounts",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Chart Of Accounts",
    module: "CRM",
    page: "/crm/chartofaccounts",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Chart Of Accounts", path: "/crm/chartofaccounts" }
    ]
  },
  churnPrediction: {
    id: "churnPrediction",
    name: "Churn Prediction",
    apiEndpoint: "/api/churnprediction",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Churn Prediction",
    module: "General",
    page: "/general/churnprediction",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Churn Prediction", path: "/general/churnprediction" }
    ]
  },
  churnRiskAnalysis: {
    id: "churnRiskAnalysis",
    name: "Churn Risk Analysis",
    apiEndpoint: "/api/churnriskanalysis",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Churn Risk Analysis",
    module: "Governance",
    page: "/governance/churnriskanalysis",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Churn Risk Analysis", path: "/governance/churnriskanalysis" }
    ]
  },
  citizenCaseManagement: {
    id: "citizenCaseManagement",
    name: "Citizen Case Management",
    apiEndpoint: "/api/citizencasemanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Citizen Case Management",
    module: "Operations",
    page: "/operations/citizencasemanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Citizen Case Management", path: "/operations/citizencasemanagement" }
    ]
  },
  citizenEngagement: {
    id: "citizenEngagement",
    name: "Citizen Engagement",
    apiEndpoint: "/api/citizenengagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Citizen Engagement",
    module: "General",
    page: "/general/citizenengagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Citizen Engagement", path: "/general/citizenengagement" }
    ]
  },
  clientManagement: {
    id: "clientManagement",
    name: "Client Management",
    apiEndpoint: "/api/clientmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Client Management",
    module: "Service",
    page: "/service/clientmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Service", path: "/service" },
      { label: "Client Management", path: "/service/clientmanagement" }
    ]
  },
  clinicalDocumentation: {
    id: "clinicalDocumentation",
    name: "Clinical Documentation",
    apiEndpoint: "/api/clinicaldocumentation",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Clinical Documentation",
    module: "Operations",
    page: "/operations/clinicaldocumentation",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Clinical Documentation", path: "/operations/clinicaldocumentation" }
    ]
  },
  clinicalEHR: {
    id: "clinicalEHR",
    name: "Clinical E H R",
    apiEndpoint: "/api/clinicalehr",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Clinical E H R",
    module: "HR",
    page: "/hr/clinicalehr",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Clinical E H R", path: "/hr/clinicalehr" }
    ]
  },
  clinicalSupply: {
    id: "clinicalSupply",
    name: "Clinical Supply",
    apiEndpoint: "/api/clinicalsupply",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Clinical Supply",
    module: "Logistics",
    page: "/logistics/clinicalsupply",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Logistics", path: "/logistics" },
      { label: "Clinical Supply", path: "/logistics/clinicalsupply" }
    ]
  },
  clinicalTrials: {
    id: "clinicalTrials",
    name: "Clinical Trials",
    apiEndpoint: "/api/clinicaltrials",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Clinical Trials",
    module: "Operations",
    page: "/operations/clinicaltrials",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Clinical Trials", path: "/operations/clinicaltrials" }
    ]
  },
  cognitiveServices: {
    id: "cognitiveServices",
    name: "Cognitive Services",
    apiEndpoint: "/api/cognitiveservices",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Cognitive Services",
    module: "Service",
    page: "/service/cognitiveservices",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Service", path: "/service" },
      { label: "Cognitive Services", path: "/service/cognitiveservices" }
    ]
  },
  coldChainLogistics: {
    id: "coldChainLogistics",
    name: "Cold Chain Logistics",
    apiEndpoint: "/api/coldchainlogistics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Cold Chain Logistics",
    module: "Admin",
    page: "/admin/coldchainlogistics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Cold Chain Logistics", path: "/admin/coldchainlogistics" }
    ]
  },
  collaborationTools: {
    id: "collaborationTools",
    name: "Collaboration Tools",
    apiEndpoint: "/api/collaborationtools",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Collaboration Tools",
    module: "Projects",
    page: "/projects/collaborationtools",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Projects", path: "/projects" },
      { label: "Collaboration Tools", path: "/projects/collaborationtools" }
    ]
  },
  communicationCenter: {
    id: "communicationCenter",
    name: "Communication Center",
    apiEndpoint: "/api/communicationcenter",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Communication Center",
    module: "Marketing",
    page: "/marketing/communicationcenter",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "Communication Center", path: "/marketing/communicationcenter" }
    ]
  },
  communityForum: {
    id: "communityForum",
    name: "Community Forum",
    apiEndpoint: "/api/communityforum",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Community Forum",
    module: "General",
    page: "/general/communityforum",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Community Forum", path: "/general/communityforum" }
    ]
  },
  compensationManagement: {
    id: "compensationManagement",
    name: "Compensation Management",
    apiEndpoint: "/api/compensationmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Compensation Management",
    module: "Operations",
    page: "/operations/compensationmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Compensation Management", path: "/operations/compensationmanagement" }
    ]
  },
  competitorAnalysis: {
    id: "competitorAnalysis",
    name: "Competitor Analysis",
    apiEndpoint: "/api/competitoranalysis",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Competitor Analysis",
    module: "General",
    page: "/general/competitoranalysis",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Competitor Analysis", path: "/general/competitoranalysis" }
    ]
  },
  compliance: {
    id: "compliance",
    name: "Compliance",
    apiEndpoint: "/api/compliance",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Compliance",
    module: "Governance",
    page: "/governance/compliance",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Compliance", path: "/governance/compliance" }
    ]
  },
  complianceAudit: {
    id: "complianceAudit",
    name: "Compliance Audit",
    apiEndpoint: "/api/complianceaudit",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Compliance Audit",
    module: "Admin",
    page: "/admin/complianceaudit",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Compliance Audit", path: "/admin/complianceaudit" }
    ]
  },
  complianceDashboard: {
    id: "complianceDashboard",
    name: "Compliance Dashboard",
    apiEndpoint: "/api/compliancedashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Compliance Dashboard",
    module: "Governance",
    page: "/governance/compliancedashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Compliance Dashboard", path: "/governance/compliancedashboard" }
    ]
  },
  complianceDashboardNew: {
    id: "complianceDashboardNew",
    name: "Compliance Dashboard New",
    apiEndpoint: "/api/compliancedashboardnew",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Compliance Dashboard New",
    module: "Governance",
    page: "/governance/compliancedashboardnew",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Compliance Dashboard New", path: "/governance/compliancedashboardnew" }
    ]
  },
  complianceExceptions: {
    id: "complianceExceptions",
    name: "Compliance Exceptions",
    apiEndpoint: "/api/complianceexceptions",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Compliance Exceptions",
    module: "Governance",
    page: "/governance/complianceexceptions",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Compliance Exceptions", path: "/governance/complianceexceptions" }
    ]
  },
  complianceGovernance: {
    id: "complianceGovernance",
    name: "Compliance Governance",
    apiEndpoint: "/api/compliancegovernance",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Compliance Governance",
    module: "Governance",
    page: "/governance/compliancegovernance",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Compliance Governance", path: "/governance/compliancegovernance" }
    ]
  },
  complianceModule: {
    id: "complianceModule",
    name: "Compliance Module",
    apiEndpoint: "/api/compliancemodule",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Compliance Module",
    module: "Governance",
    page: "/governance/compliancemodule",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Compliance Module", path: "/governance/compliancemodule" }
    ]
  },
  complianceMonitoring: {
    id: "complianceMonitoring",
    name: "Compliance Monitoring",
    apiEndpoint: "/api/compliancemonitoring",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Compliance Monitoring",
    module: "Governance",
    page: "/governance/compliancemonitoring",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Compliance Monitoring", path: "/governance/compliancemonitoring" }
    ]
  },
  complianceQuality: {
    id: "complianceQuality",
    name: "Compliance Quality",
    apiEndpoint: "/api/compliancequality",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Compliance Quality",
    module: "Governance",
    page: "/governance/compliancequality",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Compliance Quality", path: "/governance/compliancequality" }
    ]
  },
  complianceReporting: {
    id: "complianceReporting",
    name: "Compliance Reporting",
    apiEndpoint: "/api/compliancereporting",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Compliance Reporting",
    module: "Governance",
    page: "/governance/compliancereporting",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Compliance Reporting", path: "/governance/compliancereporting" }
    ]
  },
  complianceReports: {
    id: "complianceReports",
    name: "Compliance Reports",
    apiEndpoint: "/api/compliancereports",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Compliance Reports",
    module: "Governance",
    page: "/governance/compliancereports",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Compliance Reports", path: "/governance/compliancereports" }
    ]
  },
  complianceTax: {
    id: "complianceTax",
    name: "Compliance Tax",
    apiEndpoint: "/api/compliancetax",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Compliance Tax",
    module: "Governance",
    page: "/governance/compliancetax",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Compliance Tax", path: "/governance/compliancetax" }
    ]
  },
  complianceTelecom: {
    id: "complianceTelecom",
    name: "Compliance Telecom",
    apiEndpoint: "/api/compliancetelecom",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Compliance Telecom",
    module: "Governance",
    page: "/governance/compliancetelecom",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Compliance Telecom", path: "/governance/compliancetelecom" }
    ]
  },
  consolidationEngine: {
    id: "consolidationEngine",
    name: "Consolidation Engine",
    apiEndpoint: "/api/consolidationengine",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Consolidation Engine",
    module: "Finance",
    page: "/finance/consolidationengine",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Consolidation Engine", path: "/finance/consolidationengine" }
    ]
  },
  contactDirectory: {
    id: "contactDirectory",
    name: "Contact Directory",
    apiEndpoint: "/api/contactdirectory",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Contact Directory",
    module: "CRM",
    page: "/crm/contactdirectory",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Contact Directory", path: "/crm/contactdirectory" }
    ]
  },
  contactManagement: {
    id: "contactManagement",
    name: "Contact Management",
    apiEndpoint: "/api/contactmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Contact Management",
    module: "CRM",
    page: "/crm/contactmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Contact Management", path: "/crm/contactmanagement" }
    ]
  },
  contentManagement: {
    id: "contentManagement",
    name: "Content Management",
    apiEndpoint: "/api/contentmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Content Management",
    module: "Operations",
    page: "/operations/contentmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Content Management", path: "/operations/contentmanagement" }
    ]
  },
  contentMedia: {
    id: "contentMedia",
    name: "Content Media",
    apiEndpoint: "/api/contentmedia",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Content Media",
    module: "General",
    page: "/general/contentmedia",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Content Media", path: "/general/contentmedia" }
    ]
  },
  contractManagement: {
    id: "contractManagement",
    name: "Contract Management",
    apiEndpoint: "/api/contractmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Contract Management",
    module: "Procurement",
    page: "/procurement/contractmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Procurement", path: "/procurement" },
      { label: "Contract Management", path: "/procurement/contractmanagement" }
    ]
  },
  copilot: {
    id: "copilot",
    name: "Copilot",
    apiEndpoint: "/api/copilot",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Copilot",
    module: "General",
    page: "/general/copilot",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Copilot", path: "/general/copilot" }
    ]
  },
  costOptimization: {
    id: "costOptimization",
    name: "Cost Optimization",
    apiEndpoint: "/api/costoptimization",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Cost Optimization",
    module: "General",
    page: "/general/costoptimization",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Cost Optimization", path: "/general/costoptimization" }
    ]
  },
  costingMarginCPG: {
    id: "costingMarginCPG",
    name: "Costing Margin C P G",
    apiEndpoint: "/api/costingmargincpg",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Costing Margin C P G",
    module: "General",
    page: "/general/costingmargincpg",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Costing Margin C P G", path: "/general/costingmargincpg" }
    ]
  },
  costingProfitability: {
    id: "costingProfitability",
    name: "Costing Profitability",
    apiEndpoint: "/api/costingprofitability",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Costing Profitability",
    module: "General",
    page: "/general/costingprofitability",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Costing Profitability", path: "/general/costingprofitability" }
    ]
  },
  courseManagement: {
    id: "courseManagement",
    name: "Course Management",
    apiEndpoint: "/api/coursemanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Course Management",
    module: "Education",
    page: "/education/coursemanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Education", path: "/education" },
      { label: "Course Management", path: "/education/coursemanagement" }
    ]
  },
  creditManagementCollections: {
    id: "creditManagementCollections",
    name: "Credit Management Collections",
    apiEndpoint: "/api/creditmanagementcollections",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Credit Management Collections",
    module: "Operations",
    page: "/operations/creditmanagementcollections",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Credit Management Collections", path: "/operations/creditmanagementcollections" }
    ]
  },
  customFields: {
    id: "customFields",
    name: "Custom Fields",
    apiEndpoint: "/api/customfields",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Custom Fields",
    module: "Service",
    page: "/service/customfields",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Service", path: "/service" },
      { label: "Custom Fields", path: "/service/customfields" }
    ]
  },
  customWorkflows: {
    id: "customWorkflows",
    name: "Custom Workflows",
    apiEndpoint: "/api/customworkflows",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Custom Workflows",
    module: "Workflow",
    page: "/workflow/customworkflows",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Workflow", path: "/workflow" },
      { label: "Custom Workflows", path: "/workflow/customworkflows" }
    ]
  },
  customerBilling: {
    id: "customerBilling",
    name: "Customer Billing",
    apiEndpoint: "/api/customerbilling",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Customer Billing",
    module: "Finance",
    page: "/finance/customerbilling",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Customer Billing", path: "/finance/customerbilling" }
    ]
  },
  customerCRM: {
    id: "customerCRM",
    name: "Customer C R M",
    apiEndpoint: "/api/customercrm",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Customer C R M",
    module: "CRM",
    page: "/crm/customercrm",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Customer C R M", path: "/crm/customercrm" }
    ]
  },
  customerDeviceManagement: {
    id: "customerDeviceManagement",
    name: "Customer Device Management",
    apiEndpoint: "/api/customerdevicemanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Customer Device Management",
    module: "CRM",
    page: "/crm/customerdevicemanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Customer Device Management", path: "/crm/customerdevicemanagement" }
    ]
  },
  customerJourneyMap: {
    id: "customerJourneyMap",
    name: "Customer Journey Map",
    apiEndpoint: "/api/customerjourneymap",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Customer Journey Map",
    module: "CRM",
    page: "/crm/customerjourneymap",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Customer Journey Map", path: "/crm/customerjourneymap" }
    ]
  },
  customerLoyalty: {
    id: "customerLoyalty",
    name: "Customer Loyalty",
    apiEndpoint: "/api/customerloyalty",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Customer Loyalty",
    module: "CRM",
    page: "/crm/customerloyalty",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Customer Loyalty", path: "/crm/customerloyalty" }
    ]
  },
  customerManagement: {
    id: "customerManagement",
    name: "Customer Management",
    apiEndpoint: "/api/customermanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Customer Management",
    module: "CRM",
    page: "/crm/customermanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Customer Management", path: "/crm/customermanagement" }
    ]
  },
  customerPortal: {
    id: "customerPortal",
    name: "Customer Portal",
    apiEndpoint: "/api/customerportal",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Customer Portal",
    module: "CRM",
    page: "/crm/customerportal",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Customer Portal", path: "/crm/customerportal" }
    ]
  },
  customerProfiles: {
    id: "customerProfiles",
    name: "Customer Profiles",
    apiEndpoint: "/api/customerprofiles",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Customer Profiles",
    module: "CRM",
    page: "/crm/customerprofiles",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Customer Profiles", path: "/crm/customerprofiles" }
    ]
  },
  customerSubscriberManagement: {
    id: "customerSubscriberManagement",
    name: "Customer Subscriber Management",
    apiEndpoint: "/api/customersubscribermanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Customer Subscriber Management",
    module: "CRM",
    page: "/crm/customersubscribermanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Customer Subscriber Management", path: "/crm/customersubscribermanagement" }
    ]
  },
  customerSuccessPanel: {
    id: "customerSuccessPanel",
    name: "Customer Success Panel",
    apiEndpoint: "/api/customersuccesspanel",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Customer Success Panel",
    module: "CRM",
    page: "/crm/customersuccesspanel",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Customer Success Panel", path: "/crm/customersuccesspanel" }
    ]
  },
  customerSupportCRM: {
    id: "customerSupportCRM",
    name: "Customer Support C R M",
    apiEndpoint: "/api/customersupportcrm",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Customer Support C R M",
    module: "CRM",
    page: "/crm/customersupportcrm",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Customer Support C R M", path: "/crm/customersupportcrm" }
    ]
  },
  customersDetail: {
    id: "customersDetail",
    name: "Customers Detail",
    apiEndpoint: "/api/customersdetail",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Customers Detail",
    module: "CRM",
    page: "/crm/customersdetail",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Customers Detail", path: "/crm/customersdetail" }
    ]
  },
  customsCompliance: {
    id: "customsCompliance",
    name: "Customs Compliance",
    apiEndpoint: "/api/customscompliance",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Customs Compliance",
    module: "Governance",
    page: "/governance/customscompliance",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Customs Compliance", path: "/governance/customscompliance" }
    ]
  },
  cycleCountingAudit: {
    id: "cycleCountingAudit",
    name: "Cycle Counting Audit",
    apiEndpoint: "/api/cyclecountingaudit",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Cycle Counting Audit",
    module: "Admin",
    page: "/admin/cyclecountingaudit",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Cycle Counting Audit", path: "/admin/cyclecountingaudit" }
    ]
  },
  dailyProgressReport: {
    id: "dailyProgressReport",
    name: "Daily Progress Report",
    apiEndpoint: "/api/dailyprogressreport",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Daily Progress Report",
    module: "Analytics",
    page: "/analytics/dailyprogressreport",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Daily Progress Report", path: "/analytics/dailyprogressreport" }
    ]
  },
  dashboard: {
    id: "dashboard",
    name: "Dashboard",
    apiEndpoint: "/api/dashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Dashboard",
    module: "Analytics",
    page: "/analytics/dashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Dashboard", path: "/analytics/dashboard" }
    ]
  },
  dashboardBuilder: {
    id: "dashboardBuilder",
    name: "Dashboard Builder",
    apiEndpoint: "/api/dashboardbuilder",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Dashboard Builder",
    module: "Analytics",
    page: "/analytics/dashboardbuilder",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Dashboard Builder", path: "/analytics/dashboardbuilder" }
    ]
  },
  dataCleanup: {
    id: "dataCleanup",
    name: "Data Cleanup",
    apiEndpoint: "/api/datacleanup",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Data Cleanup",
    module: "Analytics",
    page: "/analytics/datacleanup",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Data Cleanup", path: "/analytics/datacleanup" }
    ]
  },
  dataExplorer: {
    id: "dataExplorer",
    name: "Data Explorer",
    apiEndpoint: "/api/dataexplorer",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Data Explorer",
    module: "Analytics",
    page: "/analytics/dataexplorer",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Data Explorer", path: "/analytics/dataexplorer" }
    ]
  },
  dataExport: {
    id: "dataExport",
    name: "Data Export",
    apiEndpoint: "/api/dataexport",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Data Export",
    module: "Analytics",
    page: "/analytics/dataexport",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Data Export", path: "/analytics/dataexport" }
    ]
  },
  dataGovernance: {
    id: "dataGovernance",
    name: "Data Governance",
    apiEndpoint: "/api/datagovernance",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Data Governance",
    module: "Analytics",
    page: "/analytics/datagovernance",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Data Governance", path: "/analytics/datagovernance" }
    ]
  },
  dataGovernancePage: {
    id: "dataGovernancePage",
    name: "Data Governance Page",
    apiEndpoint: "/api/datagovernancepage",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Data Governance Page",
    module: "Analytics",
    page: "/analytics/datagovernancepage",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Data Governance Page", path: "/analytics/datagovernancepage" }
    ]
  },
  dataImport: {
    id: "dataImport",
    name: "Data Import",
    apiEndpoint: "/api/dataimport",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Data Import",
    module: "Analytics",
    page: "/analytics/dataimport",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Data Import", path: "/analytics/dataimport" }
    ]
  },
  dataSourceConfiguration: {
    id: "dataSourceConfiguration",
    name: "Data Source Configuration",
    apiEndpoint: "/api/datasourceconfiguration",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Data Source Configuration",
    module: "Analytics",
    page: "/analytics/datasourceconfiguration",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Data Source Configuration", path: "/analytics/datasourceconfiguration" }
    ]
  },
  dataValidation: {
    id: "dataValidation",
    name: "Data Validation",
    apiEndpoint: "/api/datavalidation",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Data Validation",
    module: "Analytics",
    page: "/analytics/datavalidation",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Data Validation", path: "/analytics/datavalidation" }
    ]
  },
  dataWarehouse: {
    id: "dataWarehouse",
    name: "Data Warehouse",
    apiEndpoint: "/api/datawarehouse",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Data Warehouse",
    module: "Analytics",
    page: "/analytics/datawarehouse",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Data Warehouse", path: "/analytics/datawarehouse" }
    ]
  },
  databaseMaintenance: {
    id: "databaseMaintenance",
    name: "Database Maintenance",
    apiEndpoint: "/api/databasemaintenance",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Database Maintenance",
    module: "Analytics",
    page: "/analytics/databasemaintenance",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Database Maintenance", path: "/analytics/databasemaintenance" }
    ]
  },
  deliveryScheduling: {
    id: "deliveryScheduling",
    name: "Delivery Scheduling",
    apiEndpoint: "/api/deliveryscheduling",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Delivery Scheduling",
    module: "Logistics",
    page: "/logistics/deliveryscheduling",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Logistics", path: "/logistics" },
      { label: "Delivery Scheduling", path: "/logistics/deliveryscheduling" }
    ]
  },
  demandForecastingAI: {
    id: "demandForecastingAI",
    name: "Demand Forecasting A I",
    apiEndpoint: "/api/demandforecastingai",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Demand Forecasting A I",
    module: "AI",
    page: "/ai/demandforecastingai",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "AI", path: "/ai" },
      { label: "Demand Forecasting A I", path: "/ai/demandforecastingai" }
    ]
  },
  demandForecastingFashion: {
    id: "demandForecastingFashion",
    name: "Demand Forecasting Fashion",
    apiEndpoint: "/api/demandforecastingfashion",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Demand Forecasting Fashion",
    module: "Finance",
    page: "/finance/demandforecastingfashion",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Demand Forecasting Fashion", path: "/finance/demandforecastingfashion" }
    ]
  },
  demandForecastingPage: {
    id: "demandForecastingPage",
    name: "Demand Forecasting Page",
    apiEndpoint: "/api/demandforecastingpage",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Demand Forecasting Page",
    module: "Finance",
    page: "/finance/demandforecastingpage",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Demand Forecasting Page", path: "/finance/demandforecastingpage" }
    ]
  },
  demoManagement: {
    id: "demoManagement",
    name: "Demo Management",
    apiEndpoint: "/api/demomanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Demo Management",
    module: "Operations",
    page: "/operations/demomanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Demo Management", path: "/operations/demomanagement" }
    ]
  },
  deploymentSettings: {
    id: "deploymentSettings",
    name: "Deployment Settings",
    apiEndpoint: "/api/deploymentsettings",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Deployment Settings",
    module: "Admin",
    page: "/admin/deploymentsettings",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Deployment Settings", path: "/admin/deploymentsettings" }
    ]
  },
  developerTools: {
    id: "developerTools",
    name: "Developer Tools",
    apiEndpoint: "/api/developertools",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Developer Tools",
    module: "Developer",
    page: "/developer/developertools",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Developer", path: "/developer" },
      { label: "Developer Tools", path: "/developer/developertools" }
    ]
  },
  deviceManagement: {
    id: "deviceManagement",
    name: "Device Management",
    apiEndpoint: "/api/devicemanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Device Management",
    module: "Operations",
    page: "/operations/devicemanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Device Management", path: "/operations/devicemanagement" }
    ]
  },
  deviceSIMManagement: {
    id: "deviceSIMManagement",
    name: "Device S I M Management",
    apiEndpoint: "/api/devicesimmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Device S I M Management",
    module: "Operations",
    page: "/operations/devicesimmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Device S I M Management", path: "/operations/devicesimmanagement" }
    ]
  },
  digitalRetailLeads: {
    id: "digitalRetailLeads",
    name: "Digital Retail Leads",
    apiEndpoint: "/api/digitalretailleads",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Digital Retail Leads",
    module: "CRM",
    page: "/crm/digitalretailleads",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Digital Retail Leads", path: "/crm/digitalretailleads" }
    ]
  },
  documentManagement: {
    id: "documentManagement",
    name: "Document Management",
    apiEndpoint: "/api/documentmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Document Management",
    module: "Operations",
    page: "/operations/documentmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Document Management", path: "/operations/documentmanagement" }
    ]
  },
  documentProcessing: {
    id: "documentProcessing",
    name: "Document Processing",
    apiEndpoint: "/api/documentprocessing",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Document Processing",
    module: "Operations",
    page: "/operations/documentprocessing",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Document Processing", path: "/operations/documentprocessing" }
    ]
  },
  duplicateDetection: {
    id: "duplicateDetection",
    name: "Duplicate Detection",
    apiEndpoint: "/api/duplicatedetection",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Duplicate Detection",
    module: "General",
    page: "/general/duplicatedetection",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Duplicate Detection", path: "/general/duplicatedetection" }
    ]
  },
  eCommerceDelivery: {
    id: "eCommerceDelivery",
    name: "E Commerce Delivery",
    apiEndpoint: "/api/ecommercedelivery",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create E Commerce Delivery",
    module: "Logistics",
    page: "/logistics/ecommercedelivery",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Logistics", path: "/logistics" },
      { label: "E Commerce Delivery", path: "/logistics/ecommercedelivery" }
    ]
  },
  eDIMarketplaceConnectors: {
    id: "eDIMarketplaceConnectors",
    name: "E D I Marketplace Connectors",
    apiEndpoint: "/api/edimarketplaceconnectors",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create E D I Marketplace Connectors",
    module: "Marketing",
    page: "/marketing/edimarketplaceconnectors",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "E D I Marketplace Connectors", path: "/marketing/edimarketplaceconnectors" }
    ]
  },
  eLNResearchNotebook: {
    id: "eLNResearchNotebook",
    name: "E L N Research Notebook",
    apiEndpoint: "/api/elnresearchnotebook",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create E L N Research Notebook",
    module: "General",
    page: "/general/elnresearchnotebook",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "E L N Research Notebook", path: "/general/elnresearchnotebook" }
    ]
  },
  ePMModule: {
    id: "ePMModule",
    name: "E P M Module",
    apiEndpoint: "/api/epmmodule",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create E P M Module",
    module: "Operations",
    page: "/operations/epmmodule",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "E P M Module", path: "/operations/epmmodule" }
    ]
  },
  ePMPage: {
    id: "ePMPage",
    name: "E P M Page",
    apiEndpoint: "/api/epmpage",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create E P M Page",
    module: "Operations",
    page: "/operations/epmpage",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "E P M Page", path: "/operations/epmpage" }
    ]
  },
  eRP: {
    id: "eRP",
    name: "E R P",
    apiEndpoint: "/api/erp",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create E R P",
    module: "ERP",
    page: "/erp/erp",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "ERP", path: "/erp" },
      { label: "E R P", path: "/erp/erp" }
    ]
  },
  eRPCopilot: {
    id: "eRPCopilot",
    name: "E R P Copilot",
    apiEndpoint: "/api/erpcopilot",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create E R P Copilot",
    module: "ERP",
    page: "/erp/erpcopilot",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "ERP", path: "/erp" },
      { label: "E R P Copilot", path: "/erp/erpcopilot" }
    ]
  },
  eRPModule: {
    id: "eRPModule",
    name: "E R P Module",
    apiEndpoint: "/api/erpmodule",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create E R P Module",
    module: "ERP",
    page: "/erp/erpmodule",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "ERP", path: "/erp" },
      { label: "E R P Module", path: "/erp/erpmodule" }
    ]
  },
  earnedValueAnalysis: {
    id: "earnedValueAnalysis",
    name: "Earned Value Analysis",
    apiEndpoint: "/api/earnedvalueanalysis",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Earned Value Analysis",
    module: "Finance",
    page: "/finance/earnedvalueanalysis",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Earned Value Analysis", path: "/finance/earnedvalueanalysis" }
    ]
  },
  ecommerce: {
    id: "ecommerce",
    name: "Ecommerce",
    apiEndpoint: "/api/ecommerce",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Ecommerce",
    module: "Marketing",
    page: "/marketing/ecommerce",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "Ecommerce", path: "/marketing/ecommerce" }
    ]
  },
  ecommerceBIDashboard: {
    id: "ecommerceBIDashboard",
    name: "Ecommerce B I Dashboard",
    apiEndpoint: "/api/ecommercebidashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Ecommerce B I Dashboard",
    module: "Analytics",
    page: "/analytics/ecommercebidashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Ecommerce B I Dashboard", path: "/analytics/ecommercebidashboard" }
    ]
  },
  ecommerceMarketplace: {
    id: "ecommerceMarketplace",
    name: "Ecommerce Marketplace",
    apiEndpoint: "/api/ecommercemarketplace",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Ecommerce Marketplace",
    module: "Marketing",
    page: "/marketing/ecommercemarketplace",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "Ecommerce Marketplace", path: "/marketing/ecommercemarketplace" }
    ]
  },
  edAnalytics: {
    id: "edAnalytics",
    name: "Ed Analytics",
    apiEndpoint: "/api/edanalytics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Ed Analytics",
    module: "Analytics",
    page: "/analytics/edanalytics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Ed Analytics", path: "/analytics/edanalytics" }
    ]
  },
  edCompliance: {
    id: "edCompliance",
    name: "Ed Compliance",
    apiEndpoint: "/api/edcompliance",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Ed Compliance",
    module: "Governance",
    page: "/governance/edcompliance",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Ed Compliance", path: "/governance/edcompliance" }
    ]
  },
  edDashboard: {
    id: "edDashboard",
    name: "Ed Dashboard",
    apiEndpoint: "/api/eddashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Ed Dashboard",
    module: "Analytics",
    page: "/analytics/eddashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Ed Dashboard", path: "/analytics/eddashboard" }
    ]
  },
  edFaculty: {
    id: "edFaculty",
    name: "Ed Faculty",
    apiEndpoint: "/api/edfaculty",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Ed Faculty",
    module: "General",
    page: "/general/edfaculty",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Ed Faculty", path: "/general/edfaculty" }
    ]
  },
  educationAnalytics: {
    id: "educationAnalytics",
    name: "Education Analytics",
    apiEndpoint: "/api/educationanalytics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Education Analytics",
    module: "Analytics",
    page: "/analytics/educationanalytics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Education Analytics", path: "/analytics/educationanalytics" }
    ]
  },
  educationAttendance: {
    id: "educationAttendance",
    name: "Education Attendance",
    apiEndpoint: "/api/educationattendance",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Education Attendance",
    module: "HR",
    page: "/hr/educationattendance",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Education Attendance", path: "/hr/educationattendance" }
    ]
  },
  educationBilling: {
    id: "educationBilling",
    name: "Education Billing",
    apiEndpoint: "/api/educationbilling",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Education Billing",
    module: "Finance",
    page: "/finance/educationbilling",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Education Billing", path: "/finance/educationbilling" }
    ]
  },
  educationCRM: {
    id: "educationCRM",
    name: "Education C R M",
    apiEndpoint: "/api/educationcrm",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Education C R M",
    module: "CRM",
    page: "/crm/educationcrm",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Education C R M", path: "/crm/educationcrm" }
    ]
  },
  educationEvents: {
    id: "educationEvents",
    name: "Education Events",
    apiEndpoint: "/api/educationevents",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Education Events",
    module: "Marketing",
    page: "/marketing/educationevents",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "Education Events", path: "/marketing/educationevents" }
    ]
  },
  educationHR: {
    id: "educationHR",
    name: "Education H R",
    apiEndpoint: "/api/educationhr",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Education H R",
    module: "HR",
    page: "/hr/educationhr",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Education H R", path: "/hr/educationhr" }
    ]
  },
  email: {
    id: "email",
    name: "Email",
    apiEndpoint: "/api/email",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Email",
    module: "Marketing",
    page: "/marketing/email",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "Email", path: "/marketing/email" }
    ]
  },
  emailConfiguration: {
    id: "emailConfiguration",
    name: "Email Configuration",
    apiEndpoint: "/api/emailconfiguration",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Email Configuration",
    module: "Marketing",
    page: "/marketing/emailconfiguration",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "Email Configuration", path: "/marketing/emailconfiguration" }
    ]
  },
  emailManagement: {
    id: "emailManagement",
    name: "Email Management",
    apiEndpoint: "/api/emailmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Email Management",
    module: "Marketing",
    page: "/marketing/emailmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "Email Management", path: "/marketing/emailmanagement" }
    ]
  },
  employeeDirectory: {
    id: "employeeDirectory",
    name: "Employee Directory",
    apiEndpoint: "/api/employeedirectory",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Employee Directory",
    module: "General",
    page: "/general/employeedirectory",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Employee Directory", path: "/general/employeedirectory" }
    ]
  },
  employeeEngagement: {
    id: "employeeEngagement",
    name: "Employee Engagement",
    apiEndpoint: "/api/employeeengagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Employee Engagement",
    module: "General",
    page: "/general/employeeengagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Employee Engagement", path: "/general/employeeengagement" }
    ]
  },
  employeesDetail: {
    id: "employeesDetail",
    name: "Employees Detail",
    apiEndpoint: "/api/employeesdetail",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Employees Detail",
    module: "General",
    page: "/general/employeesdetail",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Employees Detail", path: "/general/employeesdetail" }
    ]
  },
  employeesList: {
    id: "employeesList",
    name: "Employees List",
    apiEndpoint: "/api/employeeslist",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Employees List",
    module: "Operations",
    page: "/operations/employeeslist",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Employees List", path: "/operations/employeeslist" }
    ]
  },
  energyAnalytics: {
    id: "energyAnalytics",
    name: "Energy Analytics",
    apiEndpoint: "/api/energyanalytics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Energy Analytics",
    module: "Analytics",
    page: "/analytics/energyanalytics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Energy Analytics", path: "/analytics/energyanalytics" }
    ]
  },
  energyOptimization: {
    id: "energyOptimization",
    name: "Energy Optimization",
    apiEndpoint: "/api/energyoptimization",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Energy Optimization",
    module: "General",
    page: "/general/energyoptimization",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Energy Optimization", path: "/general/energyoptimization" }
    ]
  },
  energyTrading: {
    id: "energyTrading",
    name: "Energy Trading",
    apiEndpoint: "/api/energytrading",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Energy Trading",
    module: "General",
    page: "/general/energytrading",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Energy Trading", path: "/general/energytrading" }
    ]
  },
  enrollment: {
    id: "enrollment",
    name: "Enrollment",
    apiEndpoint: "/api/enrollment",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Enrollment",
    module: "Education",
    page: "/education/enrollment",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Education", path: "/education" },
      { label: "Enrollment", path: "/education/enrollment" }
    ]
  },
  epics: {
    id: "epics",
    name: "Epics",
    apiEndpoint: "/api/epics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Epics",
    module: "General",
    page: "/general/epics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Epics", path: "/general/epics" }
    ]
  },
  equipmentManagement: {
    id: "equipmentManagement",
    name: "Equipment Management",
    apiEndpoint: "/api/equipmentmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Equipment Management",
    module: "Operations",
    page: "/operations/equipmentmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Equipment Management", path: "/operations/equipmentmanagement" }
    ]
  },
  errorHandling: {
    id: "errorHandling",
    name: "Error Handling",
    apiEndpoint: "/api/errorhandling",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Error Handling",
    module: "General",
    page: "/general/errorhandling",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Error Handling", path: "/general/errorhandling" }
    ]
  },
  estimationWorkbook: {
    id: "estimationWorkbook",
    name: "Estimation Workbook",
    apiEndpoint: "/api/estimationworkbook",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Estimation Workbook",
    module: "General",
    page: "/general/estimationworkbook",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Estimation Workbook", path: "/general/estimationworkbook" }
    ]
  },
  eventBanquetingManagement: {
    id: "eventBanquetingManagement",
    name: "Event Banqueting Management",
    apiEndpoint: "/api/eventbanquetingmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Event Banqueting Management",
    module: "Marketing",
    page: "/marketing/eventbanquetingmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "Event Banqueting Management", path: "/marketing/eventbanquetingmanagement" }
    ]
  },
  eventTriggers: {
    id: "eventTriggers",
    name: "Event Triggers",
    apiEndpoint: "/api/eventtriggers",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Event Triggers",
    module: "Marketing",
    page: "/marketing/eventtriggers",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "Event Triggers", path: "/marketing/eventtriggers" }
    ]
  },
  eventsActivities: {
    id: "eventsActivities",
    name: "Events Activities",
    apiEndpoint: "/api/eventsactivities",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Events Activities",
    module: "Marketing",
    page: "/marketing/eventsactivities",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "Events Activities", path: "/marketing/eventsactivities" }
    ]
  },
  exceptionManagement: {
    id: "exceptionManagement",
    name: "Exception Management",
    apiEndpoint: "/api/exceptionmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Exception Management",
    module: "Operations",
    page: "/operations/exceptionmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Exception Management", path: "/operations/exceptionmanagement" }
    ]
  },
  expenseManagement: {
    id: "expenseManagement",
    name: "Expense Management",
    apiEndpoint: "/api/expensemanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Expense Management",
    module: "Finance",
    page: "/finance/expensemanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Expense Management", path: "/finance/expensemanagement" }
    ]
  },
  expenseTracking: {
    id: "expenseTracking",
    name: "Expense Tracking",
    apiEndpoint: "/api/expensetracking",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Expense Tracking",
    module: "Finance",
    page: "/finance/expensetracking",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Expense Tracking", path: "/finance/expensetracking" }
    ]
  },
  expensesDetail: {
    id: "expensesDetail",
    name: "Expenses Detail",
    apiEndpoint: "/api/expensesdetail",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Expenses Detail",
    module: "Finance",
    page: "/finance/expensesdetail",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Expenses Detail", path: "/finance/expensesdetail" }
    ]
  },
  exportManager: {
    id: "exportManager",
    name: "Export Manager",
    apiEndpoint: "/api/exportmanager",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Export Manager",
    module: "General",
    page: "/general/exportmanager",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Export Manager", path: "/general/exportmanager" }
    ]
  },
  fBDemandPlanning: {
    id: "fBDemandPlanning",
    name: "F B Demand Planning",
    apiEndpoint: "/api/fbdemandplanning",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create F B Demand Planning",
    module: "General",
    page: "/general/fbdemandplanning",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "F B Demand Planning", path: "/general/fbdemandplanning" }
    ]
  },
  fBInventoryColdChain: {
    id: "fBInventoryColdChain",
    name: "F B Inventory Cold Chain",
    apiEndpoint: "/api/fbinventorycoldchain",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create F B Inventory Cold Chain",
    module: "Operations",
    page: "/operations/fbinventorycoldchain",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "F B Inventory Cold Chain", path: "/operations/fbinventorycoldchain" }
    ]
  },
  facultyManagement: {
    id: "facultyManagement",
    name: "Faculty Management",
    apiEndpoint: "/api/facultymanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Faculty Management",
    module: "Operations",
    page: "/operations/facultymanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Faculty Management", path: "/operations/facultymanagement" }
    ]
  },
  fashionAnalytics: {
    id: "fashionAnalytics",
    name: "Fashion Analytics",
    apiEndpoint: "/api/fashionanalytics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Fashion Analytics",
    module: "Analytics",
    page: "/analytics/fashionanalytics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Fashion Analytics", path: "/analytics/fashionanalytics" }
    ]
  },
  fashionInventory: {
    id: "fashionInventory",
    name: "Fashion Inventory",
    apiEndpoint: "/api/fashioninventory",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Fashion Inventory",
    module: "Operations",
    page: "/operations/fashioninventory",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Fashion Inventory", path: "/operations/fashioninventory" }
    ]
  },
  fashionPOS: {
    id: "fashionPOS",
    name: "Fashion P O S",
    apiEndpoint: "/api/fashionpos",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Fashion P O S",
    module: "Procurement",
    page: "/procurement/fashionpos",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Procurement", path: "/procurement" },
      { label: "Fashion P O S", path: "/procurement/fashionpos" }
    ]
  },
  faultPerformanceMonitoring: {
    id: "faultPerformanceMonitoring",
    name: "Fault Performance Monitoring",
    apiEndpoint: "/api/faultperformancemonitoring",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Fault Performance Monitoring",
    module: "Admin",
    page: "/admin/faultperformancemonitoring",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Fault Performance Monitoring", path: "/admin/faultperformancemonitoring" }
    ]
  },
  featureFlags: {
    id: "featureFlags",
    name: "Feature Flags",
    apiEndpoint: "/api/featureflags",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Feature Flags",
    module: "General",
    page: "/general/featureflags",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Feature Flags", path: "/general/featureflags" }
    ]
  },
  fieldService: {
    id: "fieldService",
    name: "Field Service",
    apiEndpoint: "/api/fieldservice",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Field Service",
    module: "Service",
    page: "/service/fieldservice",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Service", path: "/service" },
      { label: "Field Service", path: "/service/fieldservice" }
    ]
  },
  fieldValidation: {
    id: "fieldValidation",
    name: "Field Validation",
    apiEndpoint: "/api/fieldvalidation",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Field Validation",
    module: "Service",
    page: "/service/fieldvalidation",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Service", path: "/service" },
      { label: "Field Validation", path: "/service/fieldvalidation" }
    ]
  },
  finance: {
    id: "finance",
    name: "Finance",
    apiEndpoint: "/api/finance",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Finance",
    module: "Finance",
    page: "/finance/finance",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Finance", path: "/finance/finance" }
    ]
  },
  financeAccounting: {
    id: "financeAccounting",
    name: "Finance Accounting",
    apiEndpoint: "/api/financeaccounting",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Finance Accounting",
    module: "CRM",
    page: "/crm/financeaccounting",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Finance Accounting", path: "/crm/financeaccounting" }
    ]
  },
  financeEnergy: {
    id: "financeEnergy",
    name: "Finance Energy",
    apiEndpoint: "/api/financeenergy",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Finance Energy",
    module: "Finance",
    page: "/finance/financeenergy",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Finance Energy", path: "/finance/financeenergy" }
    ]
  },
  financeGrants: {
    id: "financeGrants",
    name: "Finance Grants",
    apiEndpoint: "/api/financegrants",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Finance Grants",
    module: "Finance",
    page: "/finance/financegrants",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Finance Grants", path: "/finance/financegrants" }
    ]
  },
  financeHealthcare: {
    id: "financeHealthcare",
    name: "Finance Healthcare",
    apiEndpoint: "/api/financehealthcare",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Finance Healthcare",
    module: "Finance",
    page: "/finance/financehealthcare",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Finance Healthcare", path: "/finance/financehealthcare" }
    ]
  },
  financeMfg: {
    id: "financeMfg",
    name: "Finance Mfg",
    apiEndpoint: "/api/financemfg",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Finance Mfg",
    module: "Finance",
    page: "/finance/financemfg",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Finance Mfg", path: "/finance/financemfg" }
    ]
  },
  financeModule: {
    id: "financeModule",
    name: "Finance Module",
    apiEndpoint: "/api/financemodule",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Finance Module",
    module: "Finance",
    page: "/finance/financemodule",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Finance Module", path: "/finance/financemodule" }
    ]
  },
  financialAnalytics: {
    id: "financialAnalytics",
    name: "Financial Analytics",
    apiEndpoint: "/api/financialanalytics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Financial Analytics",
    module: "Analytics",
    page: "/analytics/financialanalytics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Financial Analytics", path: "/analytics/financialanalytics" }
    ]
  },
  financialConsolidation: {
    id: "financialConsolidation",
    name: "Financial Consolidation",
    apiEndpoint: "/api/financialconsolidation",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Financial Consolidation",
    module: "Finance",
    page: "/finance/financialconsolidation",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Financial Consolidation", path: "/finance/financialconsolidation" }
    ]
  },
  financialReports: {
    id: "financialReports",
    name: "Financial Reports",
    apiEndpoint: "/api/financialreports",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Financial Reports",
    module: "Analytics",
    page: "/analytics/financialreports",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Financial Reports", path: "/analytics/financialreports" }
    ]
  },
  financialReportsDashboard: {
    id: "financialReportsDashboard",
    name: "Financial Reports Dashboard",
    apiEndpoint: "/api/financialreportsdashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Financial Reports Dashboard",
    module: "Analytics",
    page: "/analytics/financialreportsdashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Financial Reports Dashboard", path: "/analytics/financialreportsdashboard" }
    ]
  },
  fleetDriverManagement: {
    id: "fleetDriverManagement",
    name: "Fleet Driver Management",
    apiEndpoint: "/api/fleetdrivermanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Fleet Driver Management",
    module: "Operations",
    page: "/operations/fleetdrivermanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Fleet Driver Management", path: "/operations/fleetdrivermanagement" }
    ]
  },
  fleetManagement: {
    id: "fleetManagement",
    name: "Fleet Management",
    apiEndpoint: "/api/fleetmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Fleet Management",
    module: "Operations",
    page: "/operations/fleetmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Fleet Management", path: "/operations/fleetmanagement" }
    ]
  },
  foodBeverageBIDashboard: {
    id: "foodBeverageBIDashboard",
    name: "Food Beverage B I Dashboard",
    apiEndpoint: "/api/foodbeveragebidashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Food Beverage B I Dashboard",
    module: "Analytics",
    page: "/analytics/foodbeveragebidashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Food Beverage B I Dashboard", path: "/analytics/foodbeveragebidashboard" }
    ]
  },
  foodBeveragePOS: {
    id: "foodBeveragePOS",
    name: "Food Beverage P O S",
    apiEndpoint: "/api/foodbeveragepos",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Food Beverage P O S",
    module: "Procurement",
    page: "/procurement/foodbeveragepos",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Procurement", path: "/procurement" },
      { label: "Food Beverage P O S", path: "/procurement/foodbeveragepos" }
    ]
  },
  forecastDashboard: {
    id: "forecastDashboard",
    name: "Forecast Dashboard",
    apiEndpoint: "/api/forecastdashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Forecast Dashboard",
    module: "Analytics",
    page: "/analytics/forecastdashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Forecast Dashboard", path: "/analytics/forecastdashboard" }
    ]
  },
  forecastingDemandCPG: {
    id: "forecastingDemandCPG",
    name: "Forecasting Demand C P G",
    apiEndpoint: "/api/forecastingdemandcpg",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Forecasting Demand C P G",
    module: "Finance",
    page: "/finance/forecastingdemandcpg",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Forecasting Demand C P G", path: "/finance/forecastingdemandcpg" }
    ]
  },
  forgotPasswordPage: {
    id: "forgotPasswordPage",
    name: "Forgot Password Page",
    apiEndpoint: "/api/forgotpasswordpage",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Forgot Password Page",
    module: "Operations",
    page: "/operations/forgotpasswordpage",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Forgot Password Page", path: "/operations/forgotpasswordpage" }
    ]
  },
  formShowcase: {
    id: "formShowcase",
    name: "Form Showcase",
    apiEndpoint: "/api/formshowcase",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Form Showcase",
    module: "Operations",
    page: "/operations/formshowcase",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Form Showcase", path: "/operations/formshowcase" }
    ]
  },
  formulationComposer: {
    id: "formulationComposer",
    name: "Formulation Composer",
    apiEndpoint: "/api/formulationcomposer",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Formulation Composer",
    module: "Operations",
    page: "/operations/formulationcomposer",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Formulation Composer", path: "/operations/formulationcomposer" }
    ]
  },
  formulationRecipeManagement: {
    id: "formulationRecipeManagement",
    name: "Formulation Recipe Management",
    apiEndpoint: "/api/formulationrecipemanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Formulation Recipe Management",
    module: "Operations",
    page: "/operations/formulationrecipemanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Formulation Recipe Management", path: "/operations/formulationrecipemanagement" }
    ]
  },
  freightCostingBilling: {
    id: "freightCostingBilling",
    name: "Freight Costing Billing",
    apiEndpoint: "/api/freightcostingbilling",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Freight Costing Billing",
    module: "Finance",
    page: "/finance/freightcostingbilling",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Freight Costing Billing", path: "/finance/freightcostingbilling" }
    ]
  },
  freightManagement: {
    id: "freightManagement",
    name: "Freight Management",
    apiEndpoint: "/api/freightmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Freight Management",
    module: "Operations",
    page: "/operations/freightmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Freight Management", path: "/operations/freightmanagement" }
    ]
  },
  freightRateCalculation: {
    id: "freightRateCalculation",
    name: "Freight Rate Calculation",
    apiEndpoint: "/api/freightratecalculation",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Freight Rate Calculation",
    module: "General",
    page: "/general/freightratecalculation",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Freight Rate Calculation", path: "/general/freightratecalculation" }
    ]
  },
  frontDeskOperations: {
    id: "frontDeskOperations",
    name: "Front Desk Operations",
    apiEndpoint: "/api/frontdeskoperations",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Front Desk Operations",
    module: "Operations",
    page: "/operations/frontdeskoperations",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Front Desk Operations", path: "/operations/frontdeskoperations" }
    ]
  },
  generalLedger: {
    id: "generalLedger",
    name: "General Ledger",
    apiEndpoint: "/api/generalledger",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create General Ledger",
    module: "Finance",
    page: "/finance/generalledger",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "General Ledger", path: "/finance/generalledger" }
    ]
  },
  generalLedgerDetail: {
    id: "generalLedgerDetail",
    name: "General Ledger Detail",
    apiEndpoint: "/api/generalledgerdetail",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create General Ledger Detail",
    module: "Finance",
    page: "/finance/generalledgerdetail",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "General Ledger Detail", path: "/finance/generalledgerdetail" }
    ]
  },
  geolocationServices: {
    id: "geolocationServices",
    name: "Geolocation Services",
    apiEndpoint: "/api/geolocationservices",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Geolocation Services",
    module: "Operations",
    page: "/operations/geolocationservices",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Geolocation Services", path: "/operations/geolocationservices" }
    ]
  },
  goodsReceipt: {
    id: "goodsReceipt",
    name: "Goods Receipt",
    apiEndpoint: "/api/goodsreceipt",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Goods Receipt",
    module: "General",
    page: "/general/goodsreceipt",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Goods Receipt", path: "/general/goodsreceipt" }
    ]
  },
  goodsReceiptPage: {
    id: "goodsReceiptPage",
    name: "Goods Receipt Page",
    apiEndpoint: "/api/goodsreceiptpage",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Goods Receipt Page",
    module: "Operations",
    page: "/operations/goodsreceiptpage",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Goods Receipt Page", path: "/operations/goodsreceiptpage" }
    ]
  },
  goodsReceiptPutaway: {
    id: "goodsReceiptPutaway",
    name: "Goods Receipt Putaway",
    apiEndpoint: "/api/goodsreceiptputaway",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Goods Receipt Putaway",
    module: "General",
    page: "/general/goodsreceiptputaway",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Goods Receipt Putaway", path: "/general/goodsreceiptputaway" }
    ]
  },
  governmentAIAnalytics: {
    id: "governmentAIAnalytics",
    name: "Government A I Analytics",
    apiEndpoint: "/api/governmentaianalytics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Government A I Analytics",
    module: "AI",
    page: "/ai/governmentaianalytics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "AI", path: "/ai" },
      { label: "Government A I Analytics", path: "/ai/governmentaianalytics" }
    ]
  },
  governmentBI: {
    id: "governmentBI",
    name: "Government B I",
    apiEndpoint: "/api/governmentbi",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Government B I",
    module: "General",
    page: "/general/governmentbi",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Government B I", path: "/general/governmentbi" }
    ]
  },
  governmentBIDashboards: {
    id: "governmentBIDashboards",
    name: "Government B I Dashboards",
    apiEndpoint: "/api/governmentbidashboards",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Government B I Dashboards",
    module: "Analytics",
    page: "/analytics/governmentbidashboards",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Government B I Dashboards", path: "/analytics/governmentbidashboards" }
    ]
  },
  governmentCRMEngagement: {
    id: "governmentCRMEngagement",
    name: "Government C R M Engagement",
    apiEndpoint: "/api/governmentcrmengagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Government C R M Engagement",
    module: "CRM",
    page: "/crm/governmentcrmengagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Government C R M Engagement", path: "/crm/governmentcrmengagement" }
    ]
  },
  governmentCitizenServices: {
    id: "governmentCitizenServices",
    name: "Government Citizen Services",
    apiEndpoint: "/api/governmentcitizenservices",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Government Citizen Services",
    module: "Service",
    page: "/service/governmentcitizenservices",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Service", path: "/service" },
      { label: "Government Citizen Services", path: "/service/governmentcitizenservices" }
    ]
  },
  governmentCompliance: {
    id: "governmentCompliance",
    name: "Government Compliance",
    apiEndpoint: "/api/governmentcompliance",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Government Compliance",
    module: "Governance",
    page: "/governance/governmentcompliance",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Government Compliance", path: "/governance/governmentcompliance" }
    ]
  },
  governmentFinanceBudgeting: {
    id: "governmentFinanceBudgeting",
    name: "Government Finance Budgeting",
    apiEndpoint: "/api/governmentfinancebudgeting",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Government Finance Budgeting",
    module: "Finance",
    page: "/finance/governmentfinancebudgeting",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Government Finance Budgeting", path: "/finance/governmentfinancebudgeting" }
    ]
  },
  governmentGrantsFunding: {
    id: "governmentGrantsFunding",
    name: "Government Grants Funding",
    apiEndpoint: "/api/governmentgrantsfunding",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Government Grants Funding",
    module: "Finance",
    page: "/finance/governmentgrantsfunding",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Government Grants Funding", path: "/finance/governmentgrantsfunding" }
    ]
  },
  governmentHR: {
    id: "governmentHR",
    name: "Government H R",
    apiEndpoint: "/api/governmenthr",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Government H R",
    module: "HR",
    page: "/hr/governmenthr",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Government H R", path: "/hr/governmenthr" }
    ]
  },
  governmentHRWorkforce: {
    id: "governmentHRWorkforce",
    name: "Government H R Workforce",
    apiEndpoint: "/api/governmenthrworkforce",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Government H R Workforce",
    module: "HR",
    page: "/hr/governmenthrworkforce",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Government H R Workforce", path: "/hr/governmenthrworkforce" }
    ]
  },
  governmentMobileApp: {
    id: "governmentMobileApp",
    name: "Government Mobile App",
    apiEndpoint: "/api/governmentmobileapp",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Government Mobile App",
    module: "Operations",
    page: "/operations/governmentmobileapp",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Government Mobile App", path: "/operations/governmentmobileapp" }
    ]
  },
  governmentPermitsLicensing: {
    id: "governmentPermitsLicensing",
    name: "Government Permits Licensing",
    apiEndpoint: "/api/governmentpermitslicensing",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Government Permits Licensing",
    module: "General",
    page: "/general/governmentpermitslicensing",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Government Permits Licensing", path: "/general/governmentpermitslicensing" }
    ]
  },
  governmentProcurement: {
    id: "governmentProcurement",
    name: "Government Procurement",
    apiEndpoint: "/api/governmentprocurement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Government Procurement",
    module: "Procurement",
    page: "/procurement/governmentprocurement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Procurement", path: "/procurement" },
      { label: "Government Procurement", path: "/procurement/governmentprocurement" }
    ]
  },
  governmentProjectsInfra: {
    id: "governmentProjectsInfra",
    name: "Government Projects Infra",
    apiEndpoint: "/api/governmentprojectsinfra",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Government Projects Infra",
    module: "Projects",
    page: "/projects/governmentprojectsinfra",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Projects", path: "/projects" },
      { label: "Government Projects Infra", path: "/projects/governmentprojectsinfra" }
    ]
  },
  governmentReporting: {
    id: "governmentReporting",
    name: "Government Reporting",
    apiEndpoint: "/api/governmentreporting",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Government Reporting",
    module: "Analytics",
    page: "/analytics/governmentreporting",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Government Reporting", path: "/analytics/governmentreporting" }
    ]
  },
  gradebook: {
    id: "gradebook",
    name: "Gradebook",
    apiEndpoint: "/api/gradebook",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Gradebook",
    module: "Education",
    page: "/education/gradebook",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Education", path: "/education" },
      { label: "Gradebook", path: "/education/gradebook" }
    ]
  },
  gridOperations: {
    id: "gridOperations",
    name: "Grid Operations",
    apiEndpoint: "/api/gridoperations",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Grid Operations",
    module: "Operations",
    page: "/operations/gridoperations",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Grid Operations", path: "/operations/gridoperations" }
    ]
  },
  growthMetrics: {
    id: "growthMetrics",
    name: "Growth Metrics",
    apiEndpoint: "/api/growthmetrics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Growth Metrics",
    module: "Analytics",
    page: "/analytics/growthmetrics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Growth Metrics", path: "/analytics/growthmetrics" }
    ]
  },
  guestCRMManagement: {
    id: "guestCRMManagement",
    name: "Guest C R M Management",
    apiEndpoint: "/api/guestcrmmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Guest C R M Management",
    module: "CRM",
    page: "/crm/guestcrmmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Guest C R M Management", path: "/crm/guestcrmmanagement" }
    ]
  },
  guestManagement: {
    id: "guestManagement",
    name: "Guest Management",
    apiEndpoint: "/api/guestmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Guest Management",
    module: "Operations",
    page: "/operations/guestmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Guest Management", path: "/operations/guestmanagement" }
    ]
  },
  hR: {
    id: "hR",
    name: "H R",
    apiEndpoint: "/api/hr",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create H R",
    module: "HR",
    page: "/hr/hr",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "H R", path: "/hr/hr" }
    ]
  },
  hRAnalyticsDashboard: {
    id: "hRAnalyticsDashboard",
    name: "H R Analytics Dashboard",
    apiEndpoint: "/api/hranalyticsdashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create H R Analytics Dashboard",
    module: "Analytics",
    page: "/analytics/hranalyticsdashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "H R Analytics Dashboard", path: "/analytics/hranalyticsdashboard" }
    ]
  },
  hRCopilot: {
    id: "hRCopilot",
    name: "H R Copilot",
    apiEndpoint: "/api/hrcopilot",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create H R Copilot",
    module: "HR",
    page: "/hr/hrcopilot",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "H R Copilot", path: "/hr/hrcopilot" }
    ]
  },
  hREnergy: {
    id: "hREnergy",
    name: "H R Energy",
    apiEndpoint: "/api/hrenergy",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create H R Energy",
    module: "HR",
    page: "/hr/hrenergy",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "H R Energy", path: "/hr/hrenergy" }
    ]
  },
  hRLogistics: {
    id: "hRLogistics",
    name: "H R Logistics",
    apiEndpoint: "/api/hrlogistics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create H R Logistics",
    module: "HR",
    page: "/hr/hrlogistics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "H R Logistics", path: "/hr/hrlogistics" }
    ]
  },
  hRMfg: {
    id: "hRMfg",
    name: "H R Mfg",
    apiEndpoint: "/api/hrmfg",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create H R Mfg",
    module: "HR",
    page: "/hr/hrmfg",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "H R Mfg", path: "/hr/hrmfg" }
    ]
  },
  hRModule: {
    id: "hRModule",
    name: "H R Module",
    apiEndpoint: "/api/hrmodule",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create H R Module",
    module: "HR",
    page: "/hr/hrmodule",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "H R Module", path: "/hr/hrmodule" }
    ]
  },
  hRRetail: {
    id: "hRRetail",
    name: "H R Retail",
    apiEndpoint: "/api/hrretail",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create H R Retail",
    module: "HR",
    page: "/hr/hrretail",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "H R Retail", path: "/hr/hrretail" }
    ]
  },
  hRRetailStaff: {
    id: "hRRetailStaff",
    name: "H R Retail Staff",
    apiEndpoint: "/api/hrretailstaff",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create H R Retail Staff",
    module: "HR",
    page: "/hr/hrretailstaff",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "H R Retail Staff", path: "/hr/hrretailstaff" }
    ]
  },
  hRScheduling: {
    id: "hRScheduling",
    name: "H R Scheduling",
    apiEndpoint: "/api/hrscheduling",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create H R Scheduling",
    module: "HR",
    page: "/hr/hrscheduling",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "H R Scheduling", path: "/hr/hrscheduling" }
    ]
  },
  hRTelecom: {
    id: "hRTelecom",
    name: "H R Telecom",
    apiEndpoint: "/api/hrtelecom",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create H R Telecom",
    module: "HR",
    page: "/hr/hrtelecom",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "H R Telecom", path: "/hr/hrtelecom" }
    ]
  },
  hSESafety: {
    id: "hSESafety",
    name: "H S E Safety",
    apiEndpoint: "/api/hsesafety",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create H S E Safety",
    module: "General",
    page: "/general/hsesafety",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "H S E Safety", path: "/general/hsesafety" }
    ]
  },
  health: {
    id: "health",
    name: "Health",
    apiEndpoint: "/api/health",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Health",
    module: "Admin",
    page: "/admin/health",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Health", path: "/admin/health" }
    ]
  },
  healthCheckDashboard: {
    id: "healthCheckDashboard",
    name: "Health Check Dashboard",
    apiEndpoint: "/api/healthcheckdashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Health Check Dashboard",
    module: "Analytics",
    page: "/analytics/healthcheckdashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Health Check Dashboard", path: "/analytics/healthcheckdashboard" }
    ]
  },
  healthcareAIDiagnostics: {
    id: "healthcareAIDiagnostics",
    name: "Healthcare A I Diagnostics",
    apiEndpoint: "/api/healthcareaidiagnostics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Healthcare A I Diagnostics",
    module: "AI",
    page: "/ai/healthcareaidiagnostics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "AI", path: "/ai" },
      { label: "Healthcare A I Diagnostics", path: "/ai/healthcareaidiagnostics" }
    ]
  },
  healthcareAppointments: {
    id: "healthcareAppointments",
    name: "Healthcare Appointments",
    apiEndpoint: "/api/healthcareappointments",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Healthcare Appointments",
    module: "Admin",
    page: "/admin/healthcareappointments",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Healthcare Appointments", path: "/admin/healthcareappointments" }
    ]
  },
  healthcareBI: {
    id: "healthcareBI",
    name: "Healthcare B I",
    apiEndpoint: "/api/healthcarebi",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Healthcare B I",
    module: "Admin",
    page: "/admin/healthcarebi",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Healthcare B I", path: "/admin/healthcarebi" }
    ]
  },
  healthcareBIDashboard: {
    id: "healthcareBIDashboard",
    name: "Healthcare B I Dashboard",
    apiEndpoint: "/api/healthcarebidashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Healthcare B I Dashboard",
    module: "Analytics",
    page: "/analytics/healthcarebidashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Healthcare B I Dashboard", path: "/analytics/healthcarebidashboard" }
    ]
  },
  healthcareBIDashboards: {
    id: "healthcareBIDashboards",
    name: "Healthcare B I Dashboards",
    apiEndpoint: "/api/healthcarebidashboards",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Healthcare B I Dashboards",
    module: "Analytics",
    page: "/analytics/healthcarebidashboards",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Healthcare B I Dashboards", path: "/analytics/healthcarebidashboards" }
    ]
  },
  healthcareBillingInsurance: {
    id: "healthcareBillingInsurance",
    name: "Healthcare Billing Insurance",
    apiEndpoint: "/api/healthcarebillinginsurance",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Healthcare Billing Insurance",
    module: "Finance",
    page: "/finance/healthcarebillinginsurance",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Healthcare Billing Insurance", path: "/finance/healthcarebillinginsurance" }
    ]
  },
  healthcareCRMEngagement: {
    id: "healthcareCRMEngagement",
    name: "Healthcare C R M Engagement",
    apiEndpoint: "/api/healthcarecrmengagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Healthcare C R M Engagement",
    module: "CRM",
    page: "/crm/healthcarecrmengagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Healthcare C R M Engagement", path: "/crm/healthcarecrmengagement" }
    ]
  },
  healthcareCompliance: {
    id: "healthcareCompliance",
    name: "Healthcare Compliance",
    apiEndpoint: "/api/healthcarecompliance",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Healthcare Compliance",
    module: "Governance",
    page: "/governance/healthcarecompliance",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Healthcare Compliance", path: "/governance/healthcarecompliance" }
    ]
  },
  healthcareDashboard: {
    id: "healthcareDashboard",
    name: "Healthcare Dashboard",
    apiEndpoint: "/api/healthcaredashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Healthcare Dashboard",
    module: "Analytics",
    page: "/analytics/healthcaredashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Healthcare Dashboard", path: "/analytics/healthcaredashboard" }
    ]
  },
  healthcareEMR: {
    id: "healthcareEMR",
    name: "Healthcare E M R",
    apiEndpoint: "/api/healthcareemr",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Healthcare E M R",
    module: "Admin",
    page: "/admin/healthcareemr",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Healthcare E M R", path: "/admin/healthcareemr" }
    ]
  },
  healthcareHRWorkforce: {
    id: "healthcareHRWorkforce",
    name: "Healthcare H R Workforce",
    apiEndpoint: "/api/healthcarehrworkforce",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Healthcare H R Workforce",
    module: "Admin",
    page: "/admin/healthcarehrworkforce",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Healthcare H R Workforce", path: "/admin/healthcarehrworkforce" }
    ]
  },
  healthcareLaboratory: {
    id: "healthcareLaboratory",
    name: "Healthcare Laboratory",
    apiEndpoint: "/api/healthcarelaboratory",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Healthcare Laboratory",
    module: "Admin",
    page: "/admin/healthcarelaboratory",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Healthcare Laboratory", path: "/admin/healthcarelaboratory" }
    ]
  },
  healthcareMobileApp: {
    id: "healthcareMobileApp",
    name: "Healthcare Mobile App",
    apiEndpoint: "/api/healthcaremobileapp",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Healthcare Mobile App",
    module: "Admin",
    page: "/admin/healthcaremobileapp",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Healthcare Mobile App", path: "/admin/healthcaremobileapp" }
    ]
  },
  healthcarePatientManagement: {
    id: "healthcarePatientManagement",
    name: "Healthcare Patient Management",
    apiEndpoint: "/api/healthcarepatientmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Healthcare Patient Management",
    module: "Admin",
    page: "/admin/healthcarepatientmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Healthcare Patient Management", path: "/admin/healthcarepatientmanagement" }
    ]
  },
  healthcarePharmacy: {
    id: "healthcarePharmacy",
    name: "Healthcare Pharmacy",
    apiEndpoint: "/api/healthcarepharmacy",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Healthcare Pharmacy",
    module: "Admin",
    page: "/admin/healthcarepharmacy",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Healthcare Pharmacy", path: "/admin/healthcarepharmacy" }
    ]
  },
  hospitalityAIPricing: {
    id: "hospitalityAIPricing",
    name: "Hospitality A I Pricing",
    apiEndpoint: "/api/hospitalityaipricing",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Hospitality A I Pricing",
    module: "AI",
    page: "/ai/hospitalityaipricing",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "AI", path: "/ai" },
      { label: "Hospitality A I Pricing", path: "/ai/hospitalityaipricing" }
    ]
  },
  hospitalityAnalytics: {
    id: "hospitalityAnalytics",
    name: "Hospitality Analytics",
    apiEndpoint: "/api/hospitalityanalytics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Hospitality Analytics",
    module: "Analytics",
    page: "/analytics/hospitalityanalytics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Hospitality Analytics", path: "/analytics/hospitalityanalytics" }
    ]
  },
  hospitalityBIDashboard: {
    id: "hospitalityBIDashboard",
    name: "Hospitality B I Dashboard",
    apiEndpoint: "/api/hospitalitybidashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Hospitality B I Dashboard",
    module: "Analytics",
    page: "/analytics/hospitalitybidashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Hospitality B I Dashboard", path: "/analytics/hospitalitybidashboard" }
    ]
  },
  hospitalityBIDashboards: {
    id: "hospitalityBIDashboards",
    name: "Hospitality B I Dashboards",
    apiEndpoint: "/api/hospitalitybidashboards",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Hospitality B I Dashboards",
    module: "Analytics",
    page: "/analytics/hospitalitybidashboards",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Hospitality B I Dashboards", path: "/analytics/hospitalitybidashboards" }
    ]
  },
  hospitalityBilling: {
    id: "hospitalityBilling",
    name: "Hospitality Billing",
    apiEndpoint: "/api/hospitalitybilling",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Hospitality Billing",
    module: "Finance",
    page: "/finance/hospitalitybilling",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Hospitality Billing", path: "/finance/hospitalitybilling" }
    ]
  },
  hospitalityBillingInvoicing: {
    id: "hospitalityBillingInvoicing",
    name: "Hospitality Billing Invoicing",
    apiEndpoint: "/api/hospitalitybillinginvoicing",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Hospitality Billing Invoicing",
    module: "Finance",
    page: "/finance/hospitalitybillinginvoicing",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Hospitality Billing Invoicing", path: "/finance/hospitalitybillinginvoicing" }
    ]
  },
  hospitalityCRM: {
    id: "hospitalityCRM",
    name: "Hospitality C R M",
    apiEndpoint: "/api/hospitalitycrm",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Hospitality C R M",
    module: "CRM",
    page: "/crm/hospitalitycrm",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Hospitality C R M", path: "/crm/hospitalitycrm" }
    ]
  },
  hospitalityCRMEngagement: {
    id: "hospitalityCRMEngagement",
    name: "Hospitality C R M Engagement",
    apiEndpoint: "/api/hospitalitycrmengagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Hospitality C R M Engagement",
    module: "CRM",
    page: "/crm/hospitalitycrmengagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Hospitality C R M Engagement", path: "/crm/hospitalitycrmengagement" }
    ]
  },
  hospitalityCompliance: {
    id: "hospitalityCompliance",
    name: "Hospitality Compliance",
    apiEndpoint: "/api/hospitalitycompliance",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Hospitality Compliance",
    module: "Governance",
    page: "/governance/hospitalitycompliance",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Hospitality Compliance", path: "/governance/hospitalitycompliance" }
    ]
  },
  hospitalityGuestServices: {
    id: "hospitalityGuestServices",
    name: "Hospitality Guest Services",
    apiEndpoint: "/api/hospitalityguestservices",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Hospitality Guest Services",
    module: "Service",
    page: "/service/hospitalityguestservices",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Service", path: "/service" },
      { label: "Hospitality Guest Services", path: "/service/hospitalityguestservices" }
    ]
  },
  hospitalityHR: {
    id: "hospitalityHR",
    name: "Hospitality H R",
    apiEndpoint: "/api/hospitalityhr",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Hospitality H R",
    module: "HR",
    page: "/hr/hospitalityhr",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Hospitality H R", path: "/hr/hospitalityhr" }
    ]
  },
  hospitalityHRRostering: {
    id: "hospitalityHRRostering",
    name: "Hospitality H R Rostering",
    apiEndpoint: "/api/hospitalityhrrostering",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Hospitality H R Rostering",
    module: "HR",
    page: "/hr/hospitalityhrrostering",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Hospitality H R Rostering", path: "/hr/hospitalityhrrostering" }
    ]
  },
  hospitalityHRWorkforce: {
    id: "hospitalityHRWorkforce",
    name: "Hospitality H R Workforce",
    apiEndpoint: "/api/hospitalityhrworkforce",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Hospitality H R Workforce",
    module: "HR",
    page: "/hr/hospitalityhrworkforce",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Hospitality H R Workforce", path: "/hr/hospitalityhrworkforce" }
    ]
  },
  hospitalityInventory: {
    id: "hospitalityInventory",
    name: "Hospitality Inventory",
    apiEndpoint: "/api/hospitalityinventory",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Hospitality Inventory",
    module: "Operations",
    page: "/operations/hospitalityinventory",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Hospitality Inventory", path: "/operations/hospitalityinventory" }
    ]
  },
  hospitalityMobileApp: {
    id: "hospitalityMobileApp",
    name: "Hospitality Mobile App",
    apiEndpoint: "/api/hospitalitymobileapp",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Hospitality Mobile App",
    module: "Operations",
    page: "/operations/hospitalitymobileapp",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Hospitality Mobile App", path: "/operations/hospitalitymobileapp" }
    ]
  },
  hospitalityPropertyManagement: {
    id: "hospitalityPropertyManagement",
    name: "Hospitality Property Management",
    apiEndpoint: "/api/hospitalitypropertymanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Hospitality Property Management",
    module: "Operations",
    page: "/operations/hospitalitypropertymanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Hospitality Property Management", path: "/operations/hospitalitypropertymanagement" }
    ]
  },
  hospitalityReporting: {
    id: "hospitalityReporting",
    name: "Hospitality Reporting",
    apiEndpoint: "/api/hospitalityreporting",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Hospitality Reporting",
    module: "Analytics",
    page: "/analytics/hospitalityreporting",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Hospitality Reporting", path: "/analytics/hospitalityreporting" }
    ]
  },
  hospitalityReservations: {
    id: "hospitalityReservations",
    name: "Hospitality Reservations",
    apiEndpoint: "/api/hospitalityreservations",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Hospitality Reservations",
    module: "General",
    page: "/general/hospitalityreservations",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Hospitality Reservations", path: "/general/hospitalityreservations" }
    ]
  },
  hospitalitySupply: {
    id: "hospitalitySupply",
    name: "Hospitality Supply",
    apiEndpoint: "/api/hospitalitysupply",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Hospitality Supply",
    module: "Logistics",
    page: "/logistics/hospitalitysupply",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Logistics", path: "/logistics" },
      { label: "Hospitality Supply", path: "/logistics/hospitalitysupply" }
    ]
  },
  hospitalityTravelPackages: {
    id: "hospitalityTravelPackages",
    name: "Hospitality Travel Packages",
    apiEndpoint: "/api/hospitalitytravelpackages",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Hospitality Travel Packages",
    module: "Operations",
    page: "/operations/hospitalitytravelpackages",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Hospitality Travel Packages", path: "/operations/hospitalitytravelpackages" }
    ]
  },
  housekeepingManagement: {
    id: "housekeepingManagement",
    name: "Housekeeping Management",
    apiEndpoint: "/api/housekeepingmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Housekeeping Management",
    module: "Operations",
    page: "/operations/housekeepingmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Housekeeping Management", path: "/operations/housekeepingmanagement" }
    ]
  },
  industries: {
    id: "industries",
    name: "Industries",
    apiEndpoint: "/api/industries",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Industries",
    module: "General",
    page: "/general/industries",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Industries", path: "/general/industries" }
    ]
  },
  industriesPage: {
    id: "industriesPage",
    name: "Industries Page",
    apiEndpoint: "/api/industriespage",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Industries Page",
    module: "Operations",
    page: "/operations/industriespage",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Industries Page", path: "/operations/industriespage" }
    ]
  },
  industryConfiguration: {
    id: "industryConfiguration",
    name: "Industry Configuration",
    apiEndpoint: "/api/industryconfiguration",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Industry Configuration",
    module: "General",
    page: "/general/industryconfiguration",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Industry Configuration", path: "/general/industryconfiguration" }
    ]
  },
  industryDemoPage: {
    id: "industryDemoPage",
    name: "Industry Demo Page",
    apiEndpoint: "/api/industrydemopage",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Industry Demo Page",
    module: "Operations",
    page: "/operations/industrydemopage",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Industry Demo Page", path: "/operations/industrydemopage" }
    ]
  },
  ingredientMasterCPG: {
    id: "ingredientMasterCPG",
    name: "Ingredient Master C P G",
    apiEndpoint: "/api/ingredientmastercpg",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Ingredient Master C P G",
    module: "Operations",
    page: "/operations/ingredientmastercpg",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Ingredient Master C P G", path: "/operations/ingredientmastercpg" }
    ]
  },
  inpatientManagement: {
    id: "inpatientManagement",
    name: "Inpatient Management",
    apiEndpoint: "/api/inpatientmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Inpatient Management",
    module: "Operations",
    page: "/operations/inpatientmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Inpatient Management", path: "/operations/inpatientmanagement" }
    ]
  },
  inspectionPlansITP: {
    id: "inspectionPlansITP",
    name: "Inspection Plans I T P",
    apiEndpoint: "/api/inspectionplansitp",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Inspection Plans I T P",
    module: "General",
    page: "/general/inspectionplansitp",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Inspection Plans I T P", path: "/general/inspectionplansitp" }
    ]
  },
  installedApps: {
    id: "installedApps",
    name: "Installed Apps",
    apiEndpoint: "/api/installedapps",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Installed Apps",
    module: "General",
    page: "/general/installedapps",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Installed Apps", path: "/general/installedapps" }
    ]
  },
  insuranceAIFraudDetection: {
    id: "insuranceAIFraudDetection",
    name: "Insurance A I Fraud Detection",
    apiEndpoint: "/api/insuranceaifrauddetection",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Insurance A I Fraud Detection",
    module: "AI",
    page: "/ai/insuranceaifrauddetection",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "AI", path: "/ai" },
      { label: "Insurance A I Fraud Detection", path: "/ai/insuranceaifrauddetection" }
    ]
  },
  insuranceBIDashboards: {
    id: "insuranceBIDashboards",
    name: "Insurance B I Dashboards",
    apiEndpoint: "/api/insurancebidashboards",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Insurance B I Dashboards",
    module: "Analytics",
    page: "/analytics/insurancebidashboards",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Insurance B I Dashboards", path: "/analytics/insurancebidashboards" }
    ]
  },
  insuranceBillingPremiums: {
    id: "insuranceBillingPremiums",
    name: "Insurance Billing Premiums",
    apiEndpoint: "/api/insurancebillingpremiums",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Insurance Billing Premiums",
    module: "Finance",
    page: "/finance/insurancebillingpremiums",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Insurance Billing Premiums", path: "/finance/insurancebillingpremiums" }
    ]
  },
  insuranceCRMEngagement: {
    id: "insuranceCRMEngagement",
    name: "Insurance C R M Engagement",
    apiEndpoint: "/api/insurancecrmengagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Insurance C R M Engagement",
    module: "CRM",
    page: "/crm/insurancecrmengagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Insurance C R M Engagement", path: "/crm/insurancecrmengagement" }
    ]
  },
  insuranceClaimsProcessing: {
    id: "insuranceClaimsProcessing",
    name: "Insurance Claims Processing",
    apiEndpoint: "/api/insuranceclaimsprocessing",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Insurance Claims Processing",
    module: "Workflow",
    page: "/workflow/insuranceclaimsprocessing",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Workflow", path: "/workflow" },
      { label: "Insurance Claims Processing", path: "/workflow/insuranceclaimsprocessing" }
    ]
  },
  insuranceCustomerAccounts: {
    id: "insuranceCustomerAccounts",
    name: "Insurance Customer Accounts",
    apiEndpoint: "/api/insurancecustomeraccounts",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Insurance Customer Accounts",
    module: "CRM",
    page: "/crm/insurancecustomeraccounts",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Insurance Customer Accounts", path: "/crm/insurancecustomeraccounts" }
    ]
  },
  insuranceHRWorkforce: {
    id: "insuranceHRWorkforce",
    name: "Insurance H R Workforce",
    apiEndpoint: "/api/insurancehrworkforce",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Insurance H R Workforce",
    module: "HR",
    page: "/hr/insurancehrworkforce",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Insurance H R Workforce", path: "/hr/insurancehrworkforce" }
    ]
  },
  insuranceMobileApp: {
    id: "insuranceMobileApp",
    name: "Insurance Mobile App",
    apiEndpoint: "/api/insurancemobileapp",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Insurance Mobile App",
    module: "Operations",
    page: "/operations/insurancemobileapp",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Insurance Mobile App", path: "/operations/insurancemobileapp" }
    ]
  },
  insurancePolicyManagement: {
    id: "insurancePolicyManagement",
    name: "Insurance Policy Management",
    apiEndpoint: "/api/insurancepolicymanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Insurance Policy Management",
    module: "Operations",
    page: "/operations/insurancepolicymanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Insurance Policy Management", path: "/operations/insurancepolicymanagement" }
    ]
  },
  insuranceReporting: {
    id: "insuranceReporting",
    name: "Insurance Reporting",
    apiEndpoint: "/api/insurancereporting",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Insurance Reporting",
    module: "Analytics",
    page: "/analytics/insurancereporting",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Insurance Reporting", path: "/analytics/insurancereporting" }
    ]
  },
  insuranceRiskCompliance: {
    id: "insuranceRiskCompliance",
    name: "Insurance Risk Compliance",
    apiEndpoint: "/api/insuranceriskcompliance",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Insurance Risk Compliance",
    module: "Governance",
    page: "/governance/insuranceriskcompliance",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Insurance Risk Compliance", path: "/governance/insuranceriskcompliance" }
    ]
  },
  insuranceUnderwriting: {
    id: "insuranceUnderwriting",
    name: "Insurance Underwriting",
    apiEndpoint: "/api/insuranceunderwriting",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Insurance Underwriting",
    module: "General",
    page: "/general/insuranceunderwriting",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Insurance Underwriting", path: "/general/insuranceunderwriting" }
    ]
  },
  integrationHub: {
    id: "integrationHub",
    name: "Integration Hub",
    apiEndpoint: "/api/integrationhub",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Integration Hub",
    module: "Operations",
    page: "/operations/integrationhub",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Integration Hub", path: "/operations/integrationhub" }
    ]
  },
  integrationHubNew: {
    id: "integrationHubNew",
    name: "Integration Hub New",
    apiEndpoint: "/api/integrationhubnew",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Integration Hub New",
    module: "Operations",
    page: "/operations/integrationhubnew",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Integration Hub New", path: "/operations/integrationhubnew" }
    ]
  },
  integrationManagement: {
    id: "integrationManagement",
    name: "Integration Management",
    apiEndpoint: "/api/integrationmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Integration Management",
    module: "Developer",
    page: "/developer/integrationmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Developer", path: "/developer" },
      { label: "Integration Management", path: "/developer/integrationmanagement" }
    ]
  },
  integrationStatus: {
    id: "integrationStatus",
    name: "Integration Status",
    apiEndpoint: "/api/integrationstatus",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Integration Status",
    module: "Developer",
    page: "/developer/integrationstatus",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Developer", path: "/developer" },
      { label: "Integration Status", path: "/developer/integrationstatus" }
    ]
  },
  integrations: {
    id: "integrations",
    name: "Integrations",
    apiEndpoint: "/api/integrations",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Integrations",
    module: "Developer",
    page: "/developer/integrations",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Developer", path: "/developer" },
      { label: "Integrations", path: "/developer/integrations" }
    ]
  },
  intercompanyEliminations: {
    id: "intercompanyEliminations",
    name: "Intercompany Eliminations",
    apiEndpoint: "/api/intercompanyeliminations",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Intercompany Eliminations",
    module: "General",
    page: "/general/intercompanyeliminations",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Intercompany Eliminations", path: "/general/intercompanyeliminations" }
    ]
  },
  intercompanyReconciliation: {
    id: "intercompanyReconciliation",
    name: "Intercompany Reconciliation",
    apiEndpoint: "/api/intercompanyreconciliation",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Intercompany Reconciliation",
    module: "Finance",
    page: "/finance/intercompanyreconciliation",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Intercompany Reconciliation", path: "/finance/intercompanyreconciliation" }
    ]
  },
  internationalizationConfig: {
    id: "internationalizationConfig",
    name: "Internationalization Config",
    apiEndpoint: "/api/internationalizationconfig",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Internationalization Config",
    module: "General",
    page: "/general/internationalizationconfig",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Internationalization Config", path: "/general/internationalizationconfig" }
    ]
  },
  inventory: {
    id: "inventory",
    name: "Inventory",
    apiEndpoint: "/api/inventory",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Inventory",
    module: "Operations",
    page: "/operations/inventory",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Inventory", path: "/operations/inventory" }
    ]
  },
  inventoryAllocationOptimization: {
    id: "inventoryAllocationOptimization",
    name: "Inventory Allocation Optimization",
    apiEndpoint: "/api/inventoryallocationoptimization",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Inventory Allocation Optimization",
    module: "Operations",
    page: "/operations/inventoryallocationoptimization",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Inventory Allocation Optimization", path: "/operations/inventoryallocationoptimization" }
    ]
  },
  inventoryDashboard: {
    id: "inventoryDashboard",
    name: "Inventory Dashboard",
    apiEndpoint: "/api/inventorydashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Inventory Dashboard",
    module: "Analytics",
    page: "/analytics/inventorydashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Inventory Dashboard", path: "/analytics/inventorydashboard" }
    ]
  },
  inventoryHealthcare: {
    id: "inventoryHealthcare",
    name: "Inventory Healthcare",
    apiEndpoint: "/api/inventoryhealthcare",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Inventory Healthcare",
    module: "Admin",
    page: "/admin/inventoryhealthcare",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Inventory Healthcare", path: "/admin/inventoryhealthcare" }
    ]
  },
  inventoryManagement: {
    id: "inventoryManagement",
    name: "Inventory Management",
    apiEndpoint: "/api/inventorymanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Inventory Management",
    module: "Operations",
    page: "/operations/inventorymanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Inventory Management", path: "/operations/inventorymanagement" }
    ]
  },
  inventoryMfg: {
    id: "inventoryMfg",
    name: "Inventory Mfg",
    apiEndpoint: "/api/inventorymfg",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Inventory Mfg",
    module: "Operations",
    page: "/operations/inventorymfg",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Inventory Mfg", path: "/operations/inventorymfg" }
    ]
  },
  inventoryOptimization: {
    id: "inventoryOptimization",
    name: "Inventory Optimization",
    apiEndpoint: "/api/inventoryoptimization",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Inventory Optimization",
    module: "Operations",
    page: "/operations/inventoryoptimization",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Inventory Optimization", path: "/operations/inventoryoptimization" }
    ]
  },
  inventoryStockManagement: {
    id: "inventoryStockManagement",
    name: "Inventory Stock Management",
    apiEndpoint: "/api/inventorystockmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Inventory Stock Management",
    module: "Operations",
    page: "/operations/inventorystockmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Inventory Stock Management", path: "/operations/inventorystockmanagement" }
    ]
  },
  inventoryTelecom: {
    id: "inventoryTelecom",
    name: "Inventory Telecom",
    apiEndpoint: "/api/inventorytelecom",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Inventory Telecom",
    module: "Operations",
    page: "/operations/inventorytelecom",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Inventory Telecom", path: "/operations/inventorytelecom" }
    ]
  },
  inventoryWarehouse: {
    id: "inventoryWarehouse",
    name: "Inventory Warehouse",
    apiEndpoint: "/api/inventorywarehouse",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Inventory Warehouse",
    module: "Operations",
    page: "/operations/inventorywarehouse",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Inventory Warehouse", path: "/operations/inventorywarehouse" }
    ]
  },
  inventoryWarehousingCPG: {
    id: "inventoryWarehousingCPG",
    name: "Inventory Warehousing C P G",
    apiEndpoint: "/api/inventorywarehousingcpg",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Inventory Warehousing C P G",
    module: "Operations",
    page: "/operations/inventorywarehousingcpg",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Inventory Warehousing C P G", path: "/operations/inventorywarehousingcpg" }
    ]
  },
  invoiceDetail: {
    id: "invoiceDetail",
    name: "Invoice Detail",
    apiEndpoint: "/api/invoicedetail",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Invoice Detail",
    module: "Finance",
    page: "/finance/invoicedetail",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Invoice Detail", path: "/finance/invoicedetail" }
    ]
  },
  invoiceGenerator: {
    id: "invoiceGenerator",
    name: "Invoice Generator",
    apiEndpoint: "/api/invoicegenerator",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Invoice Generator",
    module: "Finance",
    page: "/finance/invoicegenerator",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Invoice Generator", path: "/finance/invoicegenerator" }
    ]
  },
  invoiceList: {
    id: "invoiceList",
    name: "Invoice List",
    apiEndpoint: "/api/invoicelist",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Invoice List",
    module: "Finance",
    page: "/finance/invoicelist",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Invoice List", path: "/finance/invoicelist" }
    ]
  },
  invoicesDetail: {
    id: "invoicesDetail",
    name: "Invoices Detail",
    apiEndpoint: "/api/invoicesdetail",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Invoices Detail",
    module: "Finance",
    page: "/finance/invoicesdetail",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Invoices Detail", path: "/finance/invoicesdetail" }
    ]
  },
  ioT: {
    id: "ioT",
    name: "Io T",
    apiEndpoint: "/api/iot",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Io T",
    module: "General",
    page: "/general/iot",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Io T", path: "/general/iot" }
    ]
  },
  journalEntries: {
    id: "journalEntries",
    name: "Journal Entries",
    apiEndpoint: "/api/journalentries",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Journal Entries",
    module: "General",
    page: "/general/journalentries",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Journal Entries", path: "/general/journalentries" }
    ]
  },
  kPIDashboard: {
    id: "kPIDashboard",
    name: "K P I Dashboard",
    apiEndpoint: "/api/kpidashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create K P I Dashboard",
    module: "Analytics",
    page: "/analytics/kpidashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "K P I Dashboard", path: "/analytics/kpidashboard" }
    ]
  },
  kanbanBoard: {
    id: "kanbanBoard",
    name: "Kanban Board",
    apiEndpoint: "/api/kanbanboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Kanban Board",
    module: "General",
    page: "/general/kanbanboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Kanban Board", path: "/general/kanbanboard" }
    ]
  },
  knowledgeBase: {
    id: "knowledgeBase",
    name: "Knowledge Base",
    apiEndpoint: "/api/knowledgebase",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Knowledge Base",
    module: "Service",
    page: "/service/knowledgebase",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Service", path: "/service" },
      { label: "Knowledge Base", path: "/service/knowledgebase" }
    ]
  },
  knowledgeGraph: {
    id: "knowledgeGraph",
    name: "Knowledge Graph",
    apiEndpoint: "/api/knowledgegraph",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Knowledge Graph",
    module: "Analytics",
    page: "/analytics/knowledgegraph",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Knowledge Graph", path: "/analytics/knowledgegraph" }
    ]
  },
  knowledgeManagement: {
    id: "knowledgeManagement",
    name: "Knowledge Management",
    apiEndpoint: "/api/knowledgemanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Knowledge Management",
    module: "Service",
    page: "/service/knowledgemanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Service", path: "/service" },
      { label: "Knowledge Management", path: "/service/knowledgemanagement" }
    ]
  },
  lIMSLabIntegration: {
    id: "lIMSLabIntegration",
    name: "L I M S Lab Integration",
    apiEndpoint: "/api/limslabintegration",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create L I M S Lab Integration",
    module: "Developer",
    page: "/developer/limslabintegration",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Developer", path: "/developer" },
      { label: "L I M S Lab Integration", path: "/developer/limslabintegration" }
    ]
  },
  lIMSLabManagement: {
    id: "lIMSLabManagement",
    name: "L I M S Lab Management",
    apiEndpoint: "/api/limslabmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create L I M S Lab Management",
    module: "Operations",
    page: "/operations/limslabmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "L I M S Lab Management", path: "/operations/limslabmanagement" }
    ]
  },
  lMSContent: {
    id: "lMSContent",
    name: "L M S Content",
    apiEndpoint: "/api/lmscontent",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create L M S Content",
    module: "General",
    page: "/general/lmscontent",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "L M S Content", path: "/general/lmscontent" }
    ]
  },
  labTurnaround: {
    id: "labTurnaround",
    name: "Lab Turnaround",
    apiEndpoint: "/api/labturnaround",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Lab Turnaround",
    module: "General",
    page: "/general/labturnaround",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Lab Turnaround", path: "/general/labturnaround" }
    ]
  },
  laboratoryDiagnostics: {
    id: "laboratoryDiagnostics",
    name: "Laboratory Diagnostics",
    apiEndpoint: "/api/laboratorydiagnostics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Laboratory Diagnostics",
    module: "HR",
    page: "/hr/laboratorydiagnostics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Laboratory Diagnostics", path: "/hr/laboratorydiagnostics" }
    ]
  },
  laboratoryManagement: {
    id: "laboratoryManagement",
    name: "Laboratory Management",
    apiEndpoint: "/api/laboratorymanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Laboratory Management",
    module: "HR",
    page: "/hr/laboratorymanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Laboratory Management", path: "/hr/laboratorymanagement" }
    ]
  },
  landingPage: {
    id: "landingPage",
    name: "Landing Page",
    apiEndpoint: "/api/landingpage",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Landing Page",
    module: "Operations",
    page: "/operations/landingpage",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Landing Page", path: "/operations/landingpage" }
    ]
  },
  leadConversion: {
    id: "leadConversion",
    name: "Lead Conversion",
    apiEndpoint: "/api/leadconversion",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Lead Conversion",
    module: "CRM",
    page: "/crm/leadconversion",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Lead Conversion", path: "/crm/leadconversion" }
    ]
  },
  leadDetail: {
    id: "leadDetail",
    name: "Lead Detail",
    apiEndpoint: "/api/leaddetail",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Lead Detail",
    module: "CRM",
    page: "/crm/leaddetail",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Lead Detail", path: "/crm/leaddetail" }
    ]
  },
  leadScoringAnalytics: {
    id: "leadScoringAnalytics",
    name: "Lead Scoring Analytics",
    apiEndpoint: "/api/leadscoringanalytics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Lead Scoring Analytics",
    module: "Analytics",
    page: "/analytics/leadscoringanalytics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Lead Scoring Analytics", path: "/analytics/leadscoringanalytics" }
    ]
  },
  leadScoringDashboard: {
    id: "leadScoringDashboard",
    name: "Lead Scoring Dashboard",
    apiEndpoint: "/api/leadscoringdashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Lead Scoring Dashboard",
    module: "Analytics",
    page: "/analytics/leadscoringdashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Lead Scoring Dashboard", path: "/analytics/leadscoringdashboard" }
    ]
  },
  leadsDetail: {
    id: "leadsDetail",
    name: "Leads Detail",
    apiEndpoint: "/api/leadsdetail",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Leads Detail",
    module: "CRM",
    page: "/crm/leadsdetail",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Leads Detail", path: "/crm/leadsdetail" }
    ]
  },
  learningManagement: {
    id: "learningManagement",
    name: "Learning Management",
    apiEndpoint: "/api/learningmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Learning Management",
    module: "Education",
    page: "/education/learningmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Education", path: "/education" },
      { label: "Learning Management", path: "/education/learningmanagement" }
    ]
  },
  leaveApproval: {
    id: "leaveApproval",
    name: "Leave Approval",
    apiEndpoint: "/api/leaveapproval",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Leave Approval",
    module: "Workflow",
    page: "/workflow/leaveapproval",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Workflow", path: "/workflow" },
      { label: "Leave Approval", path: "/workflow/leaveapproval" }
    ]
  },
  leaveManagement: {
    id: "leaveManagement",
    name: "Leave Management",
    apiEndpoint: "/api/leavemanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Leave Management",
    module: "HR",
    page: "/hr/leavemanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Leave Management", path: "/hr/leavemanagement" }
    ]
  },
  leaveRequest: {
    id: "leaveRequest",
    name: "Leave Request",
    apiEndpoint: "/api/leaverequest",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Leave Request",
    module: "HR",
    page: "/hr/leaverequest",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Leave Request", path: "/hr/leaverequest" }
    ]
  },
  leaveWorkflows: {
    id: "leaveWorkflows",
    name: "Leave Workflows",
    apiEndpoint: "/api/leaveworkflows",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Leave Workflows",
    module: "HR",
    page: "/hr/leaveworkflows",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Leave Workflows", path: "/hr/leaveworkflows" }
    ]
  },
  licenseManagement: {
    id: "licenseManagement",
    name: "License Management",
    apiEndpoint: "/api/licensemanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create License Management",
    module: "Admin",
    page: "/admin/licensemanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "License Management", path: "/admin/licensemanagement" }
    ]
  },
  localization: {
    id: "localization",
    name: "Localization",
    apiEndpoint: "/api/localization",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Localization",
    module: "General",
    page: "/general/localization",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Localization", path: "/general/localization" }
    ]
  },
  loginHistory: {
    id: "loginHistory",
    name: "Login History",
    apiEndpoint: "/api/loginhistory",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Login History",
    module: "Admin",
    page: "/admin/loginhistory",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Login History", path: "/admin/loginhistory" }
    ]
  },
  loginPage: {
    id: "loginPage",
    name: "Login Page",
    apiEndpoint: "/api/loginpage",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Login Page",
    module: "Admin",
    page: "/admin/loginpage",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Login Page", path: "/admin/loginpage" }
    ]
  },
  logisticsAnalytics: {
    id: "logisticsAnalytics",
    name: "Logistics Analytics",
    apiEndpoint: "/api/logisticsanalytics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Logistics Analytics",
    module: "Analytics",
    page: "/analytics/logisticsanalytics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Logistics Analytics", path: "/analytics/logisticsanalytics" }
    ]
  },
  logisticsBIDashboard: {
    id: "logisticsBIDashboard",
    name: "Logistics B I Dashboard",
    apiEndpoint: "/api/logisticsbidashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Logistics B I Dashboard",
    module: "Analytics",
    page: "/analytics/logisticsbidashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Logistics B I Dashboard", path: "/analytics/logisticsbidashboard" }
    ]
  },
  logisticsComplianceSafety: {
    id: "logisticsComplianceSafety",
    name: "Logistics Compliance Safety",
    apiEndpoint: "/api/logisticscompliancesafety",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Logistics Compliance Safety",
    module: "Governance",
    page: "/governance/logisticscompliancesafety",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Logistics Compliance Safety", path: "/governance/logisticscompliancesafety" }
    ]
  },
  logisticsDashboard: {
    id: "logisticsDashboard",
    name: "Logistics Dashboard",
    apiEndpoint: "/api/logisticsdashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Logistics Dashboard",
    module: "Analytics",
    page: "/analytics/logisticsdashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Logistics Dashboard", path: "/analytics/logisticsdashboard" }
    ]
  },
  logisticsOptimization: {
    id: "logisticsOptimization",
    name: "Logistics Optimization",
    apiEndpoint: "/api/logisticsoptimization",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Logistics Optimization",
    module: "Admin",
    page: "/admin/logisticsoptimization",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Logistics Optimization", path: "/admin/logisticsoptimization" }
    ]
  },
  logisticsShipping: {
    id: "logisticsShipping",
    name: "Logistics Shipping",
    apiEndpoint: "/api/logisticsshipping",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Logistics Shipping",
    module: "Admin",
    page: "/admin/logisticsshipping",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Logistics Shipping", path: "/admin/logisticsshipping" }
    ]
  },
  loyaltyPrograms: {
    id: "loyaltyPrograms",
    name: "Loyalty Programs",
    apiEndpoint: "/api/loyaltyprograms",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Loyalty Programs",
    module: "HR",
    page: "/hr/loyaltyprograms",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Loyalty Programs", path: "/hr/loyaltyprograms" }
    ]
  },
  mFAEnrollment: {
    id: "mFAEnrollment",
    name: "M F A Enrollment",
    apiEndpoint: "/api/mfaenrollment",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create M F A Enrollment",
    module: "Education",
    page: "/education/mfaenrollment",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Education", path: "/education" },
      { label: "M F A Enrollment", path: "/education/mfaenrollment" }
    ]
  },
  mRPDashboard: {
    id: "mRPDashboard",
    name: "M R P Dashboard",
    apiEndpoint: "/api/mrpdashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create M R P Dashboard",
    module: "Analytics",
    page: "/analytics/mrpdashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "M R P Dashboard", path: "/analytics/mrpdashboard" }
    ]
  },
  mRPDashboardFull: {
    id: "mRPDashboardFull",
    name: "M R P Dashboard Full",
    apiEndpoint: "/api/mrpdashboardfull",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create M R P Dashboard Full",
    module: "Analytics",
    page: "/analytics/mrpdashboardfull",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "M R P Dashboard Full", path: "/analytics/mrpdashboardfull" }
    ]
  },
  mRPMPSPlanning: {
    id: "mRPMPSPlanning",
    name: "M R P M P S Planning",
    apiEndpoint: "/api/mrpmpsplanning",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create M R P M P S Planning",
    module: "Manufacturing",
    page: "/manufacturing/mrpmpsplanning",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Manufacturing", path: "/manufacturing" },
      { label: "M R P M P S Planning", path: "/manufacturing/mrpmpsplanning" }
    ]
  },
  maintenance: {
    id: "maintenance",
    name: "Maintenance",
    apiEndpoint: "/api/maintenance",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Maintenance",
    module: "General",
    page: "/general/maintenance",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Maintenance", path: "/general/maintenance" }
    ]
  },
  maintenanceReliability: {
    id: "maintenanceReliability",
    name: "Maintenance Reliability",
    apiEndpoint: "/api/maintenancereliability",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Maintenance Reliability",
    module: "General",
    page: "/general/maintenancereliability",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Maintenance Reliability", path: "/general/maintenancereliability" }
    ]
  },
  maintenanceScheduling: {
    id: "maintenanceScheduling",
    name: "Maintenance Scheduling",
    apiEndpoint: "/api/maintenancescheduling",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Maintenance Scheduling",
    module: "Operations",
    page: "/operations/maintenancescheduling",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Maintenance Scheduling", path: "/operations/maintenancescheduling" }
    ]
  },
  manufacturing: {
    id: "manufacturing",
    name: "Manufacturing",
    apiEndpoint: "/api/manufacturing",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Manufacturing",
    module: "Manufacturing",
    page: "/manufacturing/manufacturing",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Manufacturing", path: "/manufacturing" },
      { label: "Manufacturing", path: "/manufacturing/manufacturing" }
    ]
  },
  manufacturingModule: {
    id: "manufacturingModule",
    name: "Manufacturing Module",
    apiEndpoint: "/api/manufacturingmodule",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Manufacturing Module",
    module: "Manufacturing",
    page: "/manufacturing/manufacturingmodule",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Manufacturing", path: "/manufacturing" },
      { label: "Manufacturing Module", path: "/manufacturing/manufacturingmodule" }
    ]
  },
  marketing: {
    id: "marketing",
    name: "Marketing",
    apiEndpoint: "/api/marketing",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Marketing",
    module: "Marketing",
    page: "/marketing/marketing",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "Marketing", path: "/marketing/marketing" }
    ]
  },
  marketingCampaigns: {
    id: "marketingCampaigns",
    name: "Marketing Campaigns",
    apiEndpoint: "/api/marketingcampaigns",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Marketing Campaigns",
    module: "Marketing",
    page: "/marketing/marketingcampaigns",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "Marketing Campaigns", path: "/marketing/marketingcampaigns" }
    ]
  },
  marketingCampaignsRetail: {
    id: "marketingCampaignsRetail",
    name: "Marketing Campaigns Retail",
    apiEndpoint: "/api/marketingcampaignsretail",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Marketing Campaigns Retail",
    module: "Marketing",
    page: "/marketing/marketingcampaignsretail",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "Marketing Campaigns Retail", path: "/marketing/marketingcampaignsretail" }
    ]
  },
  marketingEngagement: {
    id: "marketingEngagement",
    name: "Marketing Engagement",
    apiEndpoint: "/api/marketingengagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Marketing Engagement",
    module: "Marketing",
    page: "/marketing/marketingengagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "Marketing Engagement", path: "/marketing/marketingengagement" }
    ]
  },
  marketingModule: {
    id: "marketingModule",
    name: "Marketing Module",
    apiEndpoint: "/api/marketingmodule",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Marketing Module",
    module: "Marketing",
    page: "/marketing/marketingmodule",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "Marketing Module", path: "/marketing/marketingmodule" }
    ]
  },
  marketingTelecom: {
    id: "marketingTelecom",
    name: "Marketing Telecom",
    apiEndpoint: "/api/marketingtelecom",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Marketing Telecom",
    module: "Marketing",
    page: "/marketing/marketingtelecom",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "Marketing Telecom", path: "/marketing/marketingtelecom" }
    ]
  },
  marketplace: {
    id: "marketplace",
    name: "Marketplace",
    apiEndpoint: "/api/marketplace",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Marketplace",
    module: "Marketing",
    page: "/marketing/marketplace",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "Marketplace", path: "/marketing/marketplace" }
    ]
  },
  materialMaster: {
    id: "materialMaster",
    name: "Material Master",
    apiEndpoint: "/api/materialmaster",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Material Master",
    module: "Operations",
    page: "/operations/materialmaster",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Material Master", path: "/operations/materialmaster" }
    ]
  },
  mediaAIRecommendations: {
    id: "mediaAIRecommendations",
    name: "Media A I Recommendations",
    apiEndpoint: "/api/mediaairecommendations",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Media A I Recommendations",
    module: "AI",
    page: "/ai/mediaairecommendations",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "AI", path: "/ai" },
      { label: "Media A I Recommendations", path: "/ai/mediaairecommendations" }
    ]
  },
  mediaAdvertisingMarketing: {
    id: "mediaAdvertisingMarketing",
    name: "Media Advertising Marketing",
    apiEndpoint: "/api/mediaadvertisingmarketing",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Media Advertising Marketing",
    module: "Marketing",
    page: "/marketing/mediaadvertisingmarketing",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "Media Advertising Marketing", path: "/marketing/mediaadvertisingmarketing" }
    ]
  },
  mediaBIDashboards: {
    id: "mediaBIDashboards",
    name: "Media B I Dashboards",
    apiEndpoint: "/api/mediabidashboards",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Media B I Dashboards",
    module: "Analytics",
    page: "/analytics/mediabidashboards",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Media B I Dashboards", path: "/analytics/mediabidashboards" }
    ]
  },
  mediaCRMEngagement: {
    id: "mediaCRMEngagement",
    name: "Media C R M Engagement",
    apiEndpoint: "/api/mediacrmengagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Media C R M Engagement",
    module: "CRM",
    page: "/crm/mediacrmengagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Media C R M Engagement", path: "/crm/mediacrmengagement" }
    ]
  },
  mediaCompliance: {
    id: "mediaCompliance",
    name: "Media Compliance",
    apiEndpoint: "/api/mediacompliance",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Media Compliance",
    module: "Governance",
    page: "/governance/mediacompliance",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Media Compliance", path: "/governance/mediacompliance" }
    ]
  },
  mediaContentManagement: {
    id: "mediaContentManagement",
    name: "Media Content Management",
    apiEndpoint: "/api/mediacontentmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Media Content Management",
    module: "Operations",
    page: "/operations/mediacontentmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Media Content Management", path: "/operations/mediacontentmanagement" }
    ]
  },
  mediaDistribution: {
    id: "mediaDistribution",
    name: "Media Distribution",
    apiEndpoint: "/api/mediadistribution",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Media Distribution",
    module: "Logistics",
    page: "/logistics/mediadistribution",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Logistics", path: "/logistics" },
      { label: "Media Distribution", path: "/logistics/mediadistribution" }
    ]
  },
  mediaHRWorkforce: {
    id: "mediaHRWorkforce",
    name: "Media H R Workforce",
    apiEndpoint: "/api/mediahrworkforce",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Media H R Workforce",
    module: "HR",
    page: "/hr/mediahrworkforce",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Media H R Workforce", path: "/hr/mediahrworkforce" }
    ]
  },
  mediaMobileApp: {
    id: "mediaMobileApp",
    name: "Media Mobile App",
    apiEndpoint: "/api/mediamobileapp",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Media Mobile App",
    module: "Operations",
    page: "/operations/mediamobileapp",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Media Mobile App", path: "/operations/mediamobileapp" }
    ]
  },
  mediaProductionWorkflows: {
    id: "mediaProductionWorkflows",
    name: "Media Production Workflows",
    apiEndpoint: "/api/mediaproductionworkflows",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Media Production Workflows",
    module: "Operations",
    page: "/operations/mediaproductionworkflows",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Media Production Workflows", path: "/operations/mediaproductionworkflows" }
    ]
  },
  mediaReporting: {
    id: "mediaReporting",
    name: "Media Reporting",
    apiEndpoint: "/api/mediareporting",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Media Reporting",
    module: "Analytics",
    page: "/analytics/mediareporting",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Media Reporting", path: "/analytics/mediareporting" }
    ]
  },
  mediaSubscriptionBilling: {
    id: "mediaSubscriptionBilling",
    name: "Media Subscription Billing",
    apiEndpoint: "/api/mediasubscriptionbilling",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Media Subscription Billing",
    module: "Finance",
    page: "/finance/mediasubscriptionbilling",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Media Subscription Billing", path: "/finance/mediasubscriptionbilling" }
    ]
  },
  medicalBilling: {
    id: "medicalBilling",
    name: "Medical Billing",
    apiEndpoint: "/api/medicalbilling",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Medical Billing",
    module: "Finance",
    page: "/finance/medicalbilling",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Medical Billing", path: "/finance/medicalbilling" }
    ]
  },
  menuPOSOperations: {
    id: "menuPOSOperations",
    name: "Menu P O S Operations",
    apiEndpoint: "/api/menuposoperations",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Menu P O S Operations",
    module: "Operations",
    page: "/operations/menuposoperations",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Menu P O S Operations", path: "/operations/menuposoperations" }
    ]
  },
  merchandisePlanning: {
    id: "merchandisePlanning",
    name: "Merchandise Planning",
    apiEndpoint: "/api/merchandiseplanning",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Merchandise Planning",
    module: "General",
    page: "/general/merchandiseplanning",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Merchandise Planning", path: "/general/merchandiseplanning" }
    ]
  },
  merchandisingAI: {
    id: "merchandisingAI",
    name: "Merchandising A I",
    apiEndpoint: "/api/merchandisingai",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Merchandising A I",
    module: "AI",
    page: "/ai/merchandisingai",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "AI", path: "/ai" },
      { label: "Merchandising A I", path: "/ai/merchandisingai" }
    ]
  },
  metricsAndMonitoring: {
    id: "metricsAndMonitoring",
    name: "Metrics And Monitoring",
    apiEndpoint: "/api/metricsandmonitoring",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Metrics And Monitoring",
    module: "Analytics",
    page: "/analytics/metricsandmonitoring",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Metrics And Monitoring", path: "/analytics/metricsandmonitoring" }
    ]
  },
  mfgAnalytics: {
    id: "mfgAnalytics",
    name: "Mfg Analytics",
    apiEndpoint: "/api/mfganalytics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Mfg Analytics",
    module: "Analytics",
    page: "/analytics/mfganalytics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Mfg Analytics", path: "/analytics/mfganalytics" }
    ]
  },
  mfgDashboard: {
    id: "mfgDashboard",
    name: "Mfg Dashboard",
    apiEndpoint: "/api/mfgdashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Mfg Dashboard",
    module: "Analytics",
    page: "/analytics/mfgdashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Mfg Dashboard", path: "/analytics/mfgdashboard" }
    ]
  },
  migrations: {
    id: "migrations",
    name: "Migrations",
    apiEndpoint: "/api/migrations",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Migrations",
    module: "Admin",
    page: "/admin/migrations",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Migrations", path: "/admin/migrations" }
    ]
  },
  mobileAppSettings: {
    id: "mobileAppSettings",
    name: "Mobile App Settings",
    apiEndpoint: "/api/mobileappsettings",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Mobile App Settings",
    module: "Operations",
    page: "/operations/mobileappsettings",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Mobile App Settings", path: "/operations/mobileappsettings" }
    ]
  },
  mobileApps: {
    id: "mobileApps",
    name: "Mobile Apps",
    apiEndpoint: "/api/mobileapps",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Mobile Apps",
    module: "Operations",
    page: "/operations/mobileapps",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Mobile Apps", path: "/operations/mobileapps" }
    ]
  },
  mobileOptimization: {
    id: "mobileOptimization",
    name: "Mobile Optimization",
    apiEndpoint: "/api/mobileoptimization",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Mobile Optimization",
    module: "Operations",
    page: "/operations/mobileoptimization",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Mobile Optimization", path: "/operations/mobileoptimization" }
    ]
  },
  mobileSync: {
    id: "mobileSync",
    name: "Mobile Sync",
    apiEndpoint: "/api/mobilesync",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Mobile Sync",
    module: "Operations",
    page: "/operations/mobilesync",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Mobile Sync", path: "/operations/mobilesync" }
    ]
  },
  moduleSettings: {
    id: "moduleSettings",
    name: "Module Settings",
    apiEndpoint: "/api/modulesettings",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Module Settings",
    module: "Operations",
    page: "/operations/modulesettings",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Module Settings", path: "/operations/modulesettings" }
    ]
  },
  multiTenancy: {
    id: "multiTenancy",
    name: "Multi Tenancy",
    apiEndpoint: "/api/multitenancy",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Multi Tenancy",
    module: "Admin",
    page: "/admin/multitenancy",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Multi Tenancy", path: "/admin/multitenancy" }
    ]
  },
  multiTenancyConfig: {
    id: "multiTenancyConfig",
    name: "Multi Tenancy Config",
    apiEndpoint: "/api/multitenancyconfig",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Multi Tenancy Config",
    module: "Admin",
    page: "/admin/multitenancyconfig",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Multi Tenancy Config", path: "/admin/multitenancyconfig" }
    ]
  },
  nCRCAMAManagement: {
    id: "nCRCAMAManagement",
    name: "N C R C A M A Management",
    apiEndpoint: "/api/ncrcamamanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create N C R C A M A Management",
    module: "Operations",
    page: "/operations/ncrcamamanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "N C R C A M A Management", path: "/operations/ncrcamamanagement" }
    ]
  },
  nCRManagement: {
    id: "nCRManagement",
    name: "N C R Management",
    apiEndpoint: "/api/ncrmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create N C R Management",
    module: "CRM",
    page: "/crm/ncrmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "N C R Management", path: "/crm/ncrmanagement" }
    ]
  },
  networkInfra: {
    id: "networkInfra",
    name: "Network Infra",
    apiEndpoint: "/api/networkinfra",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Network Infra",
    module: "Finance",
    page: "/finance/networkinfra",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Network Infra", path: "/finance/networkinfra" }
    ]
  },
  networkInventoryOSS: {
    id: "networkInventoryOSS",
    name: "Network Inventory O S S",
    apiEndpoint: "/api/networkinventoryoss",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Network Inventory O S S",
    module: "Operations",
    page: "/operations/networkinventoryoss",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Network Inventory O S S", path: "/operations/networkinventoryoss" }
    ]
  },
  networkOptimization: {
    id: "networkOptimization",
    name: "Network Optimization",
    apiEndpoint: "/api/networkoptimization",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Network Optimization",
    module: "Finance",
    page: "/finance/networkoptimization",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Network Optimization", path: "/finance/networkoptimization" }
    ]
  },
  networkProvisioning: {
    id: "networkProvisioning",
    name: "Network Provisioning",
    apiEndpoint: "/api/networkprovisioning",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Network Provisioning",
    module: "Finance",
    page: "/finance/networkprovisioning",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Network Provisioning", path: "/finance/networkprovisioning" }
    ]
  },
  networkUsageMonitoring: {
    id: "networkUsageMonitoring",
    name: "Network Usage Monitoring",
    apiEndpoint: "/api/networkusagemonitoring",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Network Usage Monitoring",
    module: "Admin",
    page: "/admin/networkusagemonitoring",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Network Usage Monitoring", path: "/admin/networkusagemonitoring" }
    ]
  },
  notificationCenter: {
    id: "notificationCenter",
    name: "Notification Center",
    apiEndpoint: "/api/notificationcenter",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Notification Center",
    module: "Communication",
    page: "/communication/notificationcenter",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Communication", path: "/communication" },
      { label: "Notification Center", path: "/communication/notificationcenter" }
    ]
  },
  notificationSettings: {
    id: "notificationSettings",
    name: "Notification Settings",
    apiEndpoint: "/api/notificationsettings",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Notification Settings",
    module: "Communication",
    page: "/communication/notificationsettings",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Communication", path: "/communication" },
      { label: "Notification Settings", path: "/communication/notificationsettings" }
    ]
  },
  oAuthManagement: {
    id: "oAuthManagement",
    name: "O Auth Management",
    apiEndpoint: "/api/oauthmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create O Auth Management",
    module: "Operations",
    page: "/operations/oauthmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "O Auth Management", path: "/operations/oauthmanagement" }
    ]
  },
  omniChannelFulfillment: {
    id: "omniChannelFulfillment",
    name: "Omni Channel Fulfillment",
    apiEndpoint: "/api/omnichannelfulfillment",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Omni Channel Fulfillment",
    module: "General",
    page: "/general/omnichannelfulfillment",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Omni Channel Fulfillment", path: "/general/omnichannelfulfillment" }
    ]
  },
  omniChannelOrders: {
    id: "omniChannelOrders",
    name: "Omni Channel Orders",
    apiEndpoint: "/api/omnichannelorders",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Omni Channel Orders",
    module: "Operations",
    page: "/operations/omnichannelorders",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Omni Channel Orders", path: "/operations/omnichannelorders" }
    ]
  },
  onboardingAutomation: {
    id: "onboardingAutomation",
    name: "Onboarding Automation",
    apiEndpoint: "/api/onboardingautomation",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Onboarding Automation",
    module: "Automation",
    page: "/automation/onboardingautomation",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Automation", path: "/automation" },
      { label: "Onboarding Automation", path: "/automation/onboardingautomation" }
    ]
  },
  operationalAnalytics: {
    id: "operationalAnalytics",
    name: "Operational Analytics",
    apiEndpoint: "/api/operationalanalytics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Operational Analytics",
    module: "Analytics",
    page: "/analytics/operationalanalytics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Operational Analytics", path: "/analytics/operationalanalytics" }
    ]
  },
  opportunitiesDetail: {
    id: "opportunitiesDetail",
    name: "Opportunities Detail",
    apiEndpoint: "/api/opportunitiesdetail",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Opportunities Detail",
    module: "General",
    page: "/general/opportunitiesdetail",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Opportunities Detail", path: "/general/opportunitiesdetail" }
    ]
  },
  opportunitiesNew: {
    id: "opportunitiesNew",
    name: "Opportunities New",
    apiEndpoint: "/api/opportunitiesnew",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Opportunities New",
    module: "General",
    page: "/general/opportunitiesnew",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Opportunities New", path: "/general/opportunitiesnew" }
    ]
  },
  opportunitiesPage: {
    id: "opportunitiesPage",
    name: "Opportunities Page",
    apiEndpoint: "/api/opportunitiespage",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Opportunities Page",
    module: "Operations",
    page: "/operations/opportunitiespage",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Opportunities Page", path: "/operations/opportunitiespage" }
    ]
  },
  opportunityDetail: {
    id: "opportunityDetail",
    name: "Opportunity Detail",
    apiEndpoint: "/api/opportunitydetail",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Opportunity Detail",
    module: "CRM",
    page: "/crm/opportunitydetail",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Opportunity Detail", path: "/crm/opportunitydetail" }
    ]
  },
  opportunityList: {
    id: "opportunityList",
    name: "Opportunity List",
    apiEndpoint: "/api/opportunitylist",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Opportunity List",
    module: "Operations",
    page: "/operations/opportunitylist",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Opportunity List", path: "/operations/opportunitylist" }
    ]
  },
  orderFulfillment: {
    id: "orderFulfillment",
    name: "Order Fulfillment",
    apiEndpoint: "/api/orderfulfillment",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Order Fulfillment",
    module: "Operations",
    page: "/operations/orderfulfillment",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Order Fulfillment", path: "/operations/orderfulfillment" }
    ]
  },
  orderManagementRetail: {
    id: "orderManagementRetail",
    name: "Order Management Retail",
    apiEndpoint: "/api/ordermanagementretail",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Order Management Retail",
    module: "Operations",
    page: "/operations/ordermanagementretail",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Order Management Retail", path: "/operations/ordermanagementretail" }
    ]
  },
  ordersLogistics: {
    id: "ordersLogistics",
    name: "Orders Logistics",
    apiEndpoint: "/api/orderslogistics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Orders Logistics",
    module: "Admin",
    page: "/admin/orderslogistics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Orders Logistics", path: "/admin/orderslogistics" }
    ]
  },
  ordersMfg: {
    id: "ordersMfg",
    name: "Orders Mfg",
    apiEndpoint: "/api/ordersmfg",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Orders Mfg",
    module: "Operations",
    page: "/operations/ordersmfg",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Orders Mfg", path: "/operations/ordersmfg" }
    ]
  },
  ordersNetwork: {
    id: "ordersNetwork",
    name: "Orders Network",
    apiEndpoint: "/api/ordersnetwork",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Orders Network",
    module: "Finance",
    page: "/finance/ordersnetwork",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Orders Network", path: "/finance/ordersnetwork" }
    ]
  },
  orgChart: {
    id: "orgChart",
    name: "Org Chart",
    apiEndpoint: "/api/orgchart",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Org Chart",
    module: "HR",
    page: "/hr/orgchart",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Org Chart", path: "/hr/orgchart" }
    ]
  },
  pLMEngineeringChangeControl: {
    id: "pLMEngineeringChangeControl",
    name: "P L M Engineering Change Control",
    apiEndpoint: "/api/plmengineeringchangecontrol",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create P L M Engineering Change Control",
    module: "General",
    page: "/general/plmengineeringchangecontrol",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "P L M Engineering Change Control", path: "/general/plmengineeringchangecontrol" }
    ]
  },
  pOSCashReconciliation: {
    id: "pOSCashReconciliation",
    name: "P O S Cash Reconciliation",
    apiEndpoint: "/api/poscashreconciliation",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create P O S Cash Reconciliation",
    module: "Procurement",
    page: "/procurement/poscashreconciliation",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Procurement", path: "/procurement" },
      { label: "P O S Cash Reconciliation", path: "/procurement/poscashreconciliation" }
    ]
  },
  pOSTerminalCheckout: {
    id: "pOSTerminalCheckout",
    name: "P O S Terminal Checkout",
    apiEndpoint: "/api/posterminalcheckout",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create P O S Terminal Checkout",
    module: "Procurement",
    page: "/procurement/posterminalcheckout",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Procurement", path: "/procurement" },
      { label: "P O S Terminal Checkout", path: "/procurement/posterminalcheckout" }
    ]
  },
  packagingTraceability: {
    id: "packagingTraceability",
    name: "Packaging Traceability",
    apiEndpoint: "/api/packagingtraceability",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Packaging Traceability",
    module: "General",
    page: "/general/packagingtraceability",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Packaging Traceability", path: "/general/packagingtraceability" }
    ]
  },
  pagesIndex: {
    id: "pagesIndex",
    name: "Pages Index",
    apiEndpoint: "/api/pagesindex",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Pages Index",
    module: "Operations",
    page: "/operations/pagesindex",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Pages Index", path: "/operations/pagesindex" }
    ]
  },
  partsInventory: {
    id: "partsInventory",
    name: "Parts Inventory",
    apiEndpoint: "/api/partsinventory",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Parts Inventory",
    module: "Operations",
    page: "/operations/partsinventory",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Parts Inventory", path: "/operations/partsinventory" }
    ]
  },
  passwordPolicies: {
    id: "passwordPolicies",
    name: "Password Policies",
    apiEndpoint: "/api/passwordpolicies",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Password Policies",
    module: "General",
    page: "/general/passwordpolicies",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Password Policies", path: "/general/passwordpolicies" }
    ]
  },
  patientManagement: {
    id: "patientManagement",
    name: "Patient Management",
    apiEndpoint: "/api/patientmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Patient Management",
    module: "Operations",
    page: "/operations/patientmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Patient Management", path: "/operations/patientmanagement" }
    ]
  },
  paymentFlow: {
    id: "paymentFlow",
    name: "Payment Flow",
    apiEndpoint: "/api/paymentflow",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Payment Flow",
    module: "Finance",
    page: "/finance/paymentflow",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Payment Flow", path: "/finance/paymentflow" }
    ]
  },
  paymentScheduling: {
    id: "paymentScheduling",
    name: "Payment Scheduling",
    apiEndpoint: "/api/paymentscheduling",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Payment Scheduling",
    module: "Finance",
    page: "/finance/paymentscheduling",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Payment Scheduling", path: "/finance/paymentscheduling" }
    ]
  },
  payrollDetail: {
    id: "payrollDetail",
    name: "Payroll Detail",
    apiEndpoint: "/api/payrolldetail",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Payroll Detail",
    module: "HR",
    page: "/hr/payrolldetail",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Payroll Detail", path: "/hr/payrolldetail" }
    ]
  },
  payrollEngine: {
    id: "payrollEngine",
    name: "Payroll Engine",
    apiEndpoint: "/api/payrollengine",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Payroll Engine",
    module: "HR",
    page: "/hr/payrollengine",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Payroll Engine", path: "/hr/payrollengine" }
    ]
  },
  payrollProcessing: {
    id: "payrollProcessing",
    name: "Payroll Processing",
    apiEndpoint: "/api/payrollprocessing",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Payroll Processing",
    module: "HR",
    page: "/hr/payrollprocessing",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Payroll Processing", path: "/hr/payrollprocessing" }
    ]
  },
  payrollRuns: {
    id: "payrollRuns",
    name: "Payroll Runs",
    apiEndpoint: "/api/payrollruns",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Payroll Runs",
    module: "HR",
    page: "/hr/payrollruns",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Payroll Runs", path: "/hr/payrollruns" }
    ]
  },
  performanceManagement: {
    id: "performanceManagement",
    name: "Performance Management",
    apiEndpoint: "/api/performancemanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Performance Management",
    module: "Operations",
    page: "/operations/performancemanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Performance Management", path: "/operations/performancemanagement" }
    ]
  },
  performanceMonitoring: {
    id: "performanceMonitoring",
    name: "Performance Monitoring",
    apiEndpoint: "/api/performancemonitoring",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Performance Monitoring",
    module: "Admin",
    page: "/admin/performancemonitoring",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Performance Monitoring", path: "/admin/performancemonitoring" }
    ]
  },
  performanceOptimization: {
    id: "performanceOptimization",
    name: "Performance Optimization",
    apiEndpoint: "/api/performanceoptimization",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Performance Optimization",
    module: "HR",
    page: "/hr/performanceoptimization",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Performance Optimization", path: "/hr/performanceoptimization" }
    ]
  },
  performanceReviews: {
    id: "performanceReviews",
    name: "Performance Reviews",
    apiEndpoint: "/api/performancereviews",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Performance Reviews",
    module: "HR",
    page: "/hr/performancereviews",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Performance Reviews", path: "/hr/performancereviews" }
    ]
  },
  performanceTuning: {
    id: "performanceTuning",
    name: "Performance Tuning",
    apiEndpoint: "/api/performancetuning",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Performance Tuning",
    module: "HR",
    page: "/hr/performancetuning",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Performance Tuning", path: "/hr/performancetuning" }
    ]
  },
  periodClose: {
    id: "periodClose",
    name: "Period Close",
    apiEndpoint: "/api/periodclose",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Period Close",
    module: "General",
    page: "/general/periodclose",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Period Close", path: "/general/periodclose" }
    ]
  },
  permissionMatrix: {
    id: "permissionMatrix",
    name: "Permission Matrix",
    apiEndpoint: "/api/permissionmatrix",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Permission Matrix",
    module: "Operations",
    page: "/operations/permissionmatrix",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Permission Matrix", path: "/operations/permissionmatrix" }
    ]
  },
  personalizedLearning: {
    id: "personalizedLearning",
    name: "Personalized Learning",
    apiEndpoint: "/api/personalizedlearning",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Personalized Learning",
    module: "Education",
    page: "/education/personalizedlearning",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Education", path: "/education" },
      { label: "Personalized Learning", path: "/education/personalizedlearning" }
    ]
  },
  pharmaAnalytics: {
    id: "pharmaAnalytics",
    name: "Pharma Analytics",
    apiEndpoint: "/api/pharmaanalytics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Pharma Analytics",
    module: "Analytics",
    page: "/analytics/pharmaanalytics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Pharma Analytics", path: "/analytics/pharmaanalytics" }
    ]
  },
  pharmacovigilance: {
    id: "pharmacovigilance",
    name: "Pharmacovigilance",
    apiEndpoint: "/api/pharmacovigilance",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Pharmacovigilance",
    module: "General",
    page: "/general/pharmacovigilance",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Pharmacovigilance", path: "/general/pharmacovigilance" }
    ]
  },
  pharmacyInventory: {
    id: "pharmacyInventory",
    name: "Pharmacy Inventory",
    apiEndpoint: "/api/pharmacyinventory",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Pharmacy Inventory",
    module: "Operations",
    page: "/operations/pharmacyinventory",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Pharmacy Inventory", path: "/operations/pharmacyinventory" }
    ]
  },
  pharmacyManagement: {
    id: "pharmacyManagement",
    name: "Pharmacy Management",
    apiEndpoint: "/api/pharmacymanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Pharmacy Management",
    module: "Operations",
    page: "/operations/pharmacymanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Pharmacy Management", path: "/operations/pharmacymanagement" }
    ]
  },
  planPackageManagement: {
    id: "planPackageManagement",
    name: "Plan Package Management",
    apiEndpoint: "/api/planpackagemanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Plan Package Management",
    module: "Operations",
    page: "/operations/planpackagemanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Plan Package Management", path: "/operations/planpackagemanagement" }
    ]
  },
  planning: {
    id: "planning",
    name: "Planning",
    apiEndpoint: "/api/planning",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Planning",
    module: "General",
    page: "/general/planning",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Planning", path: "/general/planning" }
    ]
  },
  platformStatus: {
    id: "platformStatus",
    name: "Platform Status",
    apiEndpoint: "/api/platformstatus",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Platform Status",
    module: "General",
    page: "/general/platformstatus",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Platform Status", path: "/general/platformstatus" }
    ]
  },
  pointOfSale: {
    id: "pointOfSale",
    name: "Point Of Sale",
    apiEndpoint: "/api/pointofsale",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Point Of Sale",
    module: "General",
    page: "/general/pointofsale",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Point Of Sale", path: "/general/pointofsale" }
    ]
  },
  portalManagement: {
    id: "portalManagement",
    name: "Portal Management",
    apiEndpoint: "/api/portalmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Portal Management",
    module: "Operations",
    page: "/operations/portalmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Portal Management", path: "/operations/portalmanagement" }
    ]
  },
  predictiveAnalytics: {
    id: "predictiveAnalytics",
    name: "Predictive Analytics",
    apiEndpoint: "/api/predictiveanalytics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Predictive Analytics",
    module: "Analytics",
    page: "/analytics/predictiveanalytics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Predictive Analytics", path: "/analytics/predictiveanalytics" }
    ]
  },
  predictiveLeadScoring: {
    id: "predictiveLeadScoring",
    name: "Predictive Lead Scoring",
    apiEndpoint: "/api/predictiveleadscoring",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Predictive Lead Scoring",
    module: "CRM",
    page: "/crm/predictiveleadscoring",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Predictive Lead Scoring", path: "/crm/predictiveleadscoring" }
    ]
  },
  predictiveMaintenance: {
    id: "predictiveMaintenance",
    name: "Predictive Maintenance",
    apiEndpoint: "/api/predictivemaintenance",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Predictive Maintenance",
    module: "General",
    page: "/general/predictivemaintenance",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Predictive Maintenance", path: "/general/predictivemaintenance" }
    ]
  },
  predictiveModeling: {
    id: "predictiveModeling",
    name: "Predictive Modeling",
    apiEndpoint: "/api/predictivemodeling",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Predictive Modeling",
    module: "Operations",
    page: "/operations/predictivemodeling",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Predictive Modeling", path: "/operations/predictivemodeling" }
    ]
  },
  pricingPromoEngine: {
    id: "pricingPromoEngine",
    name: "Pricing Promo Engine",
    apiEndpoint: "/api/pricingpromoengine",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Pricing Promo Engine",
    module: "General",
    page: "/general/pricingpromoengine",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Pricing Promo Engine", path: "/general/pricingpromoengine" }
    ]
  },
  pricingPromotionManagement: {
    id: "pricingPromotionManagement",
    name: "Pricing Promotion Management",
    apiEndpoint: "/api/pricingpromotionmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Pricing Promotion Management",
    module: "Operations",
    page: "/operations/pricingpromotionmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Pricing Promotion Management", path: "/operations/pricingpromotionmanagement" }
    ]
  },
  pricingPromotions: {
    id: "pricingPromotions",
    name: "Pricing Promotions",
    apiEndpoint: "/api/pricingpromotions",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Pricing Promotions",
    module: "Marketing",
    page: "/marketing/pricingpromotions",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "Pricing Promotions", path: "/marketing/pricingpromotions" }
    ]
  },
  pricingPromotionsRetail: {
    id: "pricingPromotionsRetail",
    name: "Pricing Promotions Retail",
    apiEndpoint: "/api/pricingpromotionsretail",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Pricing Promotions Retail",
    module: "Marketing",
    page: "/marketing/pricingpromotionsretail",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "Pricing Promotions Retail", path: "/marketing/pricingpromotionsretail" }
    ]
  },
  pricingRebatesEngine: {
    id: "pricingRebatesEngine",
    name: "Pricing Rebates Engine",
    apiEndpoint: "/api/pricingrebatesengine",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Pricing Rebates Engine",
    module: "General",
    page: "/general/pricingrebatesengine",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Pricing Rebates Engine", path: "/general/pricingrebatesengine" }
    ]
  },
  processAnalytics: {
    id: "processAnalytics",
    name: "Process Analytics",
    apiEndpoint: "/api/processanalytics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Process Analytics",
    module: "Analytics",
    page: "/analytics/processanalytics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Process Analytics", path: "/analytics/processanalytics" }
    ]
  },
  processDesigner: {
    id: "processDesigner",
    name: "Process Designer",
    apiEndpoint: "/api/processdesigner",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Process Designer",
    module: "Workflow",
    page: "/workflow/processdesigner",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Workflow", path: "/workflow" },
      { label: "Process Designer", path: "/workflow/processdesigner" }
    ]
  },
  procurementAutomation: {
    id: "procurementAutomation",
    name: "Procurement Automation",
    apiEndpoint: "/api/procurementautomation",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Procurement Automation",
    module: "Automation",
    page: "/automation/procurementautomation",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Automation", path: "/automation" },
      { label: "Procurement Automation", path: "/automation/procurementautomation" }
    ]
  },
  procurementManagement: {
    id: "procurementManagement",
    name: "Procurement Management",
    apiEndpoint: "/api/procurementmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Procurement Management",
    module: "Operations",
    page: "/operations/procurementmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Procurement Management", path: "/operations/procurementmanagement" }
    ]
  },
  procurementSourcing: {
    id: "procurementSourcing",
    name: "Procurement Sourcing",
    apiEndpoint: "/api/procurementsourcing",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Procurement Sourcing",
    module: "Procurement",
    page: "/procurement/procurementsourcing",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Procurement", path: "/procurement" },
      { label: "Procurement Sourcing", path: "/procurement/procurementsourcing" }
    ]
  },
  productCatalog: {
    id: "productCatalog",
    name: "Product Catalog",
    apiEndpoint: "/api/productcatalog",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Product Catalog",
    module: "Operations",
    page: "/operations/productcatalog",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Product Catalog", path: "/operations/productcatalog" }
    ]
  },
  productInventory: {
    id: "productInventory",
    name: "Product Inventory",
    apiEndpoint: "/api/productinventory",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Product Inventory",
    module: "Operations",
    page: "/operations/productinventory",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Product Inventory", path: "/operations/productinventory" }
    ]
  },
  productMaster: {
    id: "productMaster",
    name: "Product Master",
    apiEndpoint: "/api/productmaster",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Product Master",
    module: "Operations",
    page: "/operations/productmaster",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Product Master", path: "/operations/productmaster" }
    ]
  },
  productMasterCPG: {
    id: "productMasterCPG",
    name: "Product Master C P G",
    apiEndpoint: "/api/productmastercpg",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Product Master C P G",
    module: "Operations",
    page: "/operations/productmastercpg",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Product Master C P G", path: "/operations/productmastercpg" }
    ]
  },
  productRecommendations: {
    id: "productRecommendations",
    name: "Product Recommendations",
    apiEndpoint: "/api/productrecommendations",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Product Recommendations",
    module: "Operations",
    page: "/operations/productrecommendations",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Product Recommendations", path: "/operations/productrecommendations" }
    ]
  },
  productReviewsRatings: {
    id: "productReviewsRatings",
    name: "Product Reviews Ratings",
    apiEndpoint: "/api/productreviewsratings",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Product Reviews Ratings",
    module: "Operations",
    page: "/operations/productreviewsratings",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Product Reviews Ratings", path: "/operations/productreviewsratings" }
    ]
  },
  productionPackaging: {
    id: "productionPackaging",
    name: "Production Packaging",
    apiEndpoint: "/api/productionpackaging",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Production Packaging",
    module: "Operations",
    page: "/operations/productionpackaging",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Production Packaging", path: "/operations/productionpackaging" }
    ]
  },
  productionPlanning: {
    id: "productionPlanning",
    name: "Production Planning",
    apiEndpoint: "/api/productionplanning",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Production Planning",
    module: "Operations",
    page: "/operations/productionplanning",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Production Planning", path: "/operations/productionplanning" }
    ]
  },
  productionSchedulingGantt: {
    id: "productionSchedulingGantt",
    name: "Production Scheduling Gantt",
    apiEndpoint: "/api/productionschedulinggantt",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Production Scheduling Gantt",
    module: "Projects",
    page: "/projects/productionschedulinggantt",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Projects", path: "/projects" },
      { label: "Production Scheduling Gantt", path: "/projects/productionschedulinggantt" }
    ]
  },
  projectBudgetManagement: {
    id: "projectBudgetManagement",
    name: "Project Budget Management",
    apiEndpoint: "/api/projectbudgetmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Project Budget Management",
    module: "Finance",
    page: "/finance/projectbudgetmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Project Budget Management", path: "/finance/projectbudgetmanagement" }
    ]
  },
  projectInfrastructure: {
    id: "projectInfrastructure",
    name: "Project Infrastructure",
    apiEndpoint: "/api/projectinfrastructure",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Project Infrastructure",
    module: "Projects",
    page: "/projects/projectinfrastructure",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Projects", path: "/projects" },
      { label: "Project Infrastructure", path: "/projects/projectinfrastructure" }
    ]
  },
  projects: {
    id: "projects",
    name: "Projects",
    apiEndpoint: "/api/projects",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Projects",
    module: "Projects",
    page: "/projects/projects",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Projects", path: "/projects" },
      { label: "Projects", path: "/projects/projects" }
    ]
  },
  projectsModule: {
    id: "projectsModule",
    name: "Projects Module",
    apiEndpoint: "/api/projectsmodule",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Projects Module",
    module: "Operations",
    page: "/operations/projectsmodule",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Projects Module", path: "/operations/projectsmodule" }
    ]
  },
  promotionDiscountCodes: {
    id: "promotionDiscountCodes",
    name: "Promotion Discount Codes",
    apiEndpoint: "/api/promotiondiscountcodes",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Promotion Discount Codes",
    module: "Marketing",
    page: "/marketing/promotiondiscountcodes",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "Promotion Discount Codes", path: "/marketing/promotiondiscountcodes" }
    ]
  },
  propertyManagement: {
    id: "propertyManagement",
    name: "Property Management",
    apiEndpoint: "/api/propertymanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Property Management",
    module: "Operations",
    page: "/operations/propertymanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Property Management", path: "/operations/propertymanagement" }
    ]
  },
  publicServicesDelivery: {
    id: "publicServicesDelivery",
    name: "Public Services Delivery",
    apiEndpoint: "/api/publicservicesdelivery",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Public Services Delivery",
    module: "Logistics",
    page: "/logistics/publicservicesdelivery",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Logistics", path: "/logistics" },
      { label: "Public Services Delivery", path: "/logistics/publicservicesdelivery" }
    ]
  },
  purchaseOrder: {
    id: "purchaseOrder",
    name: "Purchase Order",
    apiEndpoint: "/api/purchaseorder",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Purchase Order",
    module: "Operations",
    page: "/operations/purchaseorder",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Purchase Order", path: "/operations/purchaseorder" }
    ]
  },
  purchaseOrders: {
    id: "purchaseOrders",
    name: "Purchase Orders",
    apiEndpoint: "/api/purchaseorders",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Purchase Orders",
    module: "Operations",
    page: "/operations/purchaseorders",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Purchase Orders", path: "/operations/purchaseorders" }
    ]
  },
  purchaseOrdersDetail: {
    id: "purchaseOrdersDetail",
    name: "Purchase Orders Detail",
    apiEndpoint: "/api/purchaseordersdetail",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Purchase Orders Detail",
    module: "Operations",
    page: "/operations/purchaseordersdetail",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Purchase Orders Detail", path: "/operations/purchaseordersdetail" }
    ]
  },
  purchaseRequisitions: {
    id: "purchaseRequisitions",
    name: "Purchase Requisitions",
    apiEndpoint: "/api/purchaserequisitions",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Purchase Requisitions",
    module: "Procurement",
    page: "/procurement/purchaserequisitions",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Procurement", path: "/procurement" },
      { label: "Purchase Requisitions", path: "/procurement/purchaserequisitions" }
    ]
  },
  qMSCAPA: {
    id: "qMSCAPA",
    name: "Q M S C A P A",
    apiEndpoint: "/api/qmscapa",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Q M S C A P A",
    module: "General",
    page: "/general/qmscapa",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Q M S C A P A", path: "/general/qmscapa" }
    ]
  },
  qualityAssurance: {
    id: "qualityAssurance",
    name: "Quality Assurance",
    apiEndpoint: "/api/qualityassurance",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Quality Assurance",
    module: "Manufacturing",
    page: "/manufacturing/qualityassurance",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Manufacturing", path: "/manufacturing" },
      { label: "Quality Assurance", path: "/manufacturing/qualityassurance" }
    ]
  },
  qualityAssuranceHub: {
    id: "qualityAssuranceHub",
    name: "Quality Assurance Hub",
    apiEndpoint: "/api/qualityassurancehub",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Quality Assurance Hub",
    module: "Operations",
    page: "/operations/qualityassurancehub",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Quality Assurance Hub", path: "/operations/qualityassurancehub" }
    ]
  },
  qualityCompliance: {
    id: "qualityCompliance",
    name: "Quality Compliance",
    apiEndpoint: "/api/qualitycompliance",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Quality Compliance",
    module: "Governance",
    page: "/governance/qualitycompliance",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Quality Compliance", path: "/governance/qualitycompliance" }
    ]
  },
  qualityControl: {
    id: "qualityControl",
    name: "Quality Control",
    apiEndpoint: "/api/qualitycontrol",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Quality Control",
    module: "Manufacturing",
    page: "/manufacturing/qualitycontrol",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Manufacturing", path: "/manufacturing" },
      { label: "Quality Control", path: "/manufacturing/qualitycontrol" }
    ]
  },
  qualityFoodSafety: {
    id: "qualityFoodSafety",
    name: "Quality Food Safety",
    apiEndpoint: "/api/qualityfoodsafety",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Quality Food Safety",
    module: "Manufacturing",
    page: "/manufacturing/qualityfoodsafety",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Manufacturing", path: "/manufacturing" },
      { label: "Quality Food Safety", path: "/manufacturing/qualityfoodsafety" }
    ]
  },
  qualityManagement: {
    id: "qualityManagement",
    name: "Quality Management",
    apiEndpoint: "/api/qualitymanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Quality Management",
    module: "Operations",
    page: "/operations/qualitymanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Quality Management", path: "/operations/qualitymanagement" }
    ]
  },
  quoteBuilder: {
    id: "quoteBuilder",
    name: "Quote Builder",
    apiEndpoint: "/api/quotebuilder",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Quote Builder",
    module: "CRM",
    page: "/crm/quotebuilder",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Quote Builder", path: "/crm/quotebuilder" }
    ]
  },
  quotesAndOrders: {
    id: "quotesAndOrders",
    name: "Quotes And Orders",
    apiEndpoint: "/api/quotesandorders",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Quotes And Orders",
    module: "Operations",
    page: "/operations/quotesandorders",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Quotes And Orders", path: "/operations/quotesandorders" }
    ]
  },
  rAGEmbeddingsPipeline: {
    id: "rAGEmbeddingsPipeline",
    name: "R A G Embeddings Pipeline",
    apiEndpoint: "/api/ragembeddingspipeline",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create R A G Embeddings Pipeline",
    module: "General",
    page: "/general/ragembeddingspipeline",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "R A G Embeddings Pipeline", path: "/general/ragembeddingspipeline" }
    ]
  },
  rFQs: {
    id: "rFQs",
    name: "R F Qs",
    apiEndpoint: "/api/rfqs",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create R F Qs",
    module: "General",
    page: "/general/rfqs",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "R F Qs", path: "/general/rfqs" }
    ]
  },
  rMAManagement: {
    id: "rMAManagement",
    name: "R M A Management",
    apiEndpoint: "/api/rmamanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create R M A Management",
    module: "Operations",
    page: "/operations/rmamanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "R M A Management", path: "/operations/rmamanagement" }
    ]
  },
  rateLimiting: {
    id: "rateLimiting",
    name: "Rate Limiting",
    apiEndpoint: "/api/ratelimiting",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Rate Limiting",
    module: "General",
    page: "/general/ratelimiting",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Rate Limiting", path: "/general/ratelimiting" }
    ]
  },
  readmissionRisk: {
    id: "readmissionRisk",
    name: "Readmission Risk",
    apiEndpoint: "/api/readmissionrisk",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Readmission Risk",
    module: "Governance",
    page: "/governance/readmissionrisk",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Readmission Risk", path: "/governance/readmissionrisk" }
    ]
  },
  realTimeNotifications: {
    id: "realTimeNotifications",
    name: "Real Time Notifications",
    apiEndpoint: "/api/realtimenotifications",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Real Time Notifications",
    module: "Communication",
    page: "/communication/realtimenotifications",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Communication", path: "/communication" },
      { label: "Real Time Notifications", path: "/communication/realtimenotifications" }
    ]
  },
  recipeBOMMaster: {
    id: "recipeBOMMaster",
    name: "Recipe B O M Master",
    apiEndpoint: "/api/recipebommaster",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Recipe B O M Master",
    module: "Manufacturing",
    page: "/manufacturing/recipebommaster",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Manufacturing", path: "/manufacturing" },
      { label: "Recipe B O M Master", path: "/manufacturing/recipebommaster" }
    ]
  },
  recipeFormulation: {
    id: "recipeFormulation",
    name: "Recipe Formulation",
    apiEndpoint: "/api/recipeformulation",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Recipe Formulation",
    module: "Operations",
    page: "/operations/recipeformulation",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Recipe Formulation", path: "/operations/recipeformulation" }
    ]
  },
  recommendationEngine: {
    id: "recommendationEngine",
    name: "Recommendation Engine",
    apiEndpoint: "/api/recommendationengine",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Recommendation Engine",
    module: "AI",
    page: "/ai/recommendationengine",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "AI", path: "/ai" },
      { label: "Recommendation Engine", path: "/ai/recommendationengine" }
    ]
  },
  recruitmentManagement: {
    id: "recruitmentManagement",
    name: "Recruitment Management",
    apiEndpoint: "/api/recruitmentmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Recruitment Management",
    module: "Operations",
    page: "/operations/recruitmentmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Recruitment Management", path: "/operations/recruitmentmanagement" }
    ]
  },
  regulatoryCompliance: {
    id: "regulatoryCompliance",
    name: "Regulatory Compliance",
    apiEndpoint: "/api/regulatorycompliance",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Regulatory Compliance",
    module: "Governance",
    page: "/governance/regulatorycompliance",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Regulatory Compliance", path: "/governance/regulatorycompliance" }
    ]
  },
  regulatoryeCTD: {
    id: "regulatoryeCTD",
    name: "Regulatorye C T D",
    apiEndpoint: "/api/regulatoryectd",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Regulatorye C T D",
    module: "General",
    page: "/general/regulatoryectd",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Regulatorye C T D", path: "/general/regulatoryectd" }
    ]
  },
  replenishmentPlanning: {
    id: "replenishmentPlanning",
    name: "Replenishment Planning",
    apiEndpoint: "/api/replenishmentplanning",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Replenishment Planning",
    module: "General",
    page: "/general/replenishmentplanning",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Replenishment Planning", path: "/general/replenishmentplanning" }
    ]
  },
  reportBuilder: {
    id: "reportBuilder",
    name: "Report Builder",
    apiEndpoint: "/api/reportbuilder",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Report Builder",
    module: "Analytics",
    page: "/analytics/reportbuilder",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Report Builder", path: "/analytics/reportbuilder" }
    ]
  },
  reporting: {
    id: "reporting",
    name: "Reporting",
    apiEndpoint: "/api/reporting",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Reporting",
    module: "Analytics",
    page: "/analytics/reporting",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Reporting", path: "/analytics/reporting" }
    ]
  },
  reportingConfiguration: {
    id: "reportingConfiguration",
    name: "Reporting Configuration",
    apiEndpoint: "/api/reportingconfiguration",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Reporting Configuration",
    module: "Analytics",
    page: "/analytics/reportingconfiguration",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Reporting Configuration", path: "/analytics/reportingconfiguration" }
    ]
  },
  reservationBooking: {
    id: "reservationBooking",
    name: "Reservation Booking",
    apiEndpoint: "/api/reservationbooking",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Reservation Booking",
    module: "General",
    page: "/general/reservationbooking",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Reservation Booking", path: "/general/reservationbooking" }
    ]
  },
  reservationsBookings: {
    id: "reservationsBookings",
    name: "Reservations Bookings",
    apiEndpoint: "/api/reservationsbookings",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Reservations Bookings",
    module: "General",
    page: "/general/reservationsbookings",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Reservations Bookings", path: "/general/reservationsbookings" }
    ]
  },
  resourceAllocation: {
    id: "resourceAllocation",
    name: "Resource Allocation",
    apiEndpoint: "/api/resourceallocation",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Resource Allocation",
    module: "HR",
    page: "/hr/resourceallocation",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Resource Allocation", path: "/hr/resourceallocation" }
    ]
  },
  resourceUtilizationDashboard: {
    id: "resourceUtilizationDashboard",
    name: "Resource Utilization Dashboard",
    apiEndpoint: "/api/resourceutilizationdashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Resource Utilization Dashboard",
    module: "Analytics",
    page: "/analytics/resourceutilizationdashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Resource Utilization Dashboard", path: "/analytics/resourceutilizationdashboard" }
    ]
  },
  responseAnalytics: {
    id: "responseAnalytics",
    name: "Response Analytics",
    apiEndpoint: "/api/responseanalytics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Response Analytics",
    module: "Analytics",
    page: "/analytics/responseanalytics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Response Analytics", path: "/analytics/responseanalytics" }
    ]
  },
  retailAIRecommendations: {
    id: "retailAIRecommendations",
    name: "Retail A I Recommendations",
    apiEndpoint: "/api/retailairecommendations",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Retail A I Recommendations",
    module: "AI",
    page: "/ai/retailairecommendations",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "AI", path: "/ai" },
      { label: "Retail A I Recommendations", path: "/ai/retailairecommendations" }
    ]
  },
  retailAnalytics: {
    id: "retailAnalytics",
    name: "Retail Analytics",
    apiEndpoint: "/api/retailanalytics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Retail Analytics",
    module: "Analytics",
    page: "/analytics/retailanalytics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Retail Analytics", path: "/analytics/retailanalytics" }
    ]
  },
  retailAnalyticsBI: {
    id: "retailAnalyticsBI",
    name: "Retail Analytics B I",
    apiEndpoint: "/api/retailanalyticsbi",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Retail Analytics B I",
    module: "Analytics",
    page: "/analytics/retailanalyticsbi",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Retail Analytics B I", path: "/analytics/retailanalyticsbi" }
    ]
  },
  retailAnalyticsDashboard: {
    id: "retailAnalyticsDashboard",
    name: "Retail Analytics Dashboard",
    apiEndpoint: "/api/retailanalyticsdashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Retail Analytics Dashboard",
    module: "Analytics",
    page: "/analytics/retailanalyticsdashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Retail Analytics Dashboard", path: "/analytics/retailanalyticsdashboard" }
    ]
  },
  retailBIDashboard: {
    id: "retailBIDashboard",
    name: "Retail B I Dashboard",
    apiEndpoint: "/api/retailbidashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Retail B I Dashboard",
    module: "Analytics",
    page: "/analytics/retailbidashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Retail B I Dashboard", path: "/analytics/retailbidashboard" }
    ]
  },
  retailBIDashboards: {
    id: "retailBIDashboards",
    name: "Retail B I Dashboards",
    apiEndpoint: "/api/retailbidashboards",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Retail B I Dashboards",
    module: "Analytics",
    page: "/analytics/retailbidashboards",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Retail B I Dashboards", path: "/analytics/retailbidashboards" }
    ]
  },
  retailCRMMarketing: {
    id: "retailCRMMarketing",
    name: "Retail C R M Marketing",
    apiEndpoint: "/api/retailcrmmarketing",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Retail C R M Marketing",
    module: "CRM",
    page: "/crm/retailcrmmarketing",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Retail C R M Marketing", path: "/crm/retailcrmmarketing" }
    ]
  },
  retailCustomerManagement: {
    id: "retailCustomerManagement",
    name: "Retail Customer Management",
    apiEndpoint: "/api/retailcustomermanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Retail Customer Management",
    module: "CRM",
    page: "/crm/retailcustomermanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Retail Customer Management", path: "/crm/retailcustomermanagement" }
    ]
  },
  retailDashboard: {
    id: "retailDashboard",
    name: "Retail Dashboard",
    apiEndpoint: "/api/retaildashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Retail Dashboard",
    module: "Analytics",
    page: "/analytics/retaildashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Retail Dashboard", path: "/analytics/retaildashboard" }
    ]
  },
  retailHRWorkforce: {
    id: "retailHRWorkforce",
    name: "Retail H R Workforce",
    apiEndpoint: "/api/retailhrworkforce",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Retail H R Workforce",
    module: "HR",
    page: "/hr/retailhrworkforce",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Retail H R Workforce", path: "/hr/retailhrworkforce" }
    ]
  },
  retailInventoryWarehouse: {
    id: "retailInventoryWarehouse",
    name: "Retail Inventory Warehouse",
    apiEndpoint: "/api/retailinventorywarehouse",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Retail Inventory Warehouse",
    module: "Operations",
    page: "/operations/retailinventorywarehouse",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Retail Inventory Warehouse", path: "/operations/retailinventorywarehouse" }
    ]
  },
  retailOrderManagement: {
    id: "retailOrderManagement",
    name: "Retail Order Management",
    apiEndpoint: "/api/retailordermanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Retail Order Management",
    module: "Operations",
    page: "/operations/retailordermanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Retail Order Management", path: "/operations/retailordermanagement" }
    ]
  },
  retailPOSOperations: {
    id: "retailPOSOperations",
    name: "Retail P O S Operations",
    apiEndpoint: "/api/retailposoperations",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Retail P O S Operations",
    module: "Operations",
    page: "/operations/retailposoperations",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Retail P O S Operations", path: "/operations/retailposoperations" }
    ]
  },
  retailPaymentsBilling: {
    id: "retailPaymentsBilling",
    name: "Retail Payments Billing",
    apiEndpoint: "/api/retailpaymentsbilling",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Retail Payments Billing",
    module: "Finance",
    page: "/finance/retailpaymentsbilling",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Retail Payments Billing", path: "/finance/retailpaymentsbilling" }
    ]
  },
  retailProductCatalog: {
    id: "retailProductCatalog",
    name: "Retail Product Catalog",
    apiEndpoint: "/api/retailproductcatalog",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Retail Product Catalog",
    module: "Operations",
    page: "/operations/retailproductcatalog",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Retail Product Catalog", path: "/operations/retailproductcatalog" }
    ]
  },
  retailPromotionsLoyalty: {
    id: "retailPromotionsLoyalty",
    name: "Retail Promotions Loyalty",
    apiEndpoint: "/api/retailpromotionsloyalty",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Retail Promotions Loyalty",
    module: "Marketing",
    page: "/marketing/retailpromotionsloyalty",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "Retail Promotions Loyalty", path: "/marketing/retailpromotionsloyalty" }
    ]
  },
  retailSupplyChainProcurement: {
    id: "retailSupplyChainProcurement",
    name: "Retail Supply Chain Procurement",
    apiEndpoint: "/api/retailsupplychainprocurement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Retail Supply Chain Procurement",
    module: "Procurement",
    page: "/procurement/retailsupplychainprocurement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Procurement", path: "/procurement" },
      { label: "Retail Supply Chain Procurement", path: "/procurement/retailsupplychainprocurement" }
    ]
  },
  returnsExchanges: {
    id: "returnsExchanges",
    name: "Returns Exchanges",
    apiEndpoint: "/api/returnsexchanges",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Returns Exchanges",
    module: "General",
    page: "/general/returnsexchanges",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Returns Exchanges", path: "/general/returnsexchanges" }
    ]
  },
  returnsManagement: {
    id: "returnsManagement",
    name: "Returns Management",
    apiEndpoint: "/api/returnsmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Returns Management",
    module: "Operations",
    page: "/operations/returnsmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Returns Management", path: "/operations/returnsmanagement" }
    ]
  },
  returnsRefundsManagement: {
    id: "returnsRefundsManagement",
    name: "Returns Refunds Management",
    apiEndpoint: "/api/returnsrefundsmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Returns Refunds Management",
    module: "Operations",
    page: "/operations/returnsrefundsmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Returns Refunds Management", path: "/operations/returnsrefundsmanagement" }
    ]
  },
  returnsWarranty: {
    id: "returnsWarranty",
    name: "Returns Warranty",
    apiEndpoint: "/api/returnswarranty",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Returns Warranty",
    module: "Operations",
    page: "/operations/returnswarranty",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Returns Warranty", path: "/operations/returnswarranty" }
    ]
  },
  revenueAssurance: {
    id: "revenueAssurance",
    name: "Revenue Assurance",
    apiEndpoint: "/api/revenueassurance",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Revenue Assurance",
    module: "Finance",
    page: "/finance/revenueassurance",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Revenue Assurance", path: "/finance/revenueassurance" }
    ]
  },
  revenueForecasting: {
    id: "revenueForecasting",
    name: "Revenue Forecasting",
    apiEndpoint: "/api/revenueforecasting",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Revenue Forecasting",
    module: "Finance",
    page: "/finance/revenueforecasting",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Revenue Forecasting", path: "/finance/revenueforecasting" }
    ]
  },
  revenueManagement: {
    id: "revenueManagement",
    name: "Revenue Management",
    apiEndpoint: "/api/revenuemanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Revenue Management",
    module: "Operations",
    page: "/operations/revenuemanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Revenue Management", path: "/operations/revenuemanagement" }
    ]
  },
  revenueOptimization: {
    id: "revenueOptimization",
    name: "Revenue Optimization",
    apiEndpoint: "/api/revenueoptimization",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Revenue Optimization",
    module: "Finance",
    page: "/finance/revenueoptimization",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Revenue Optimization", path: "/finance/revenueoptimization" }
    ]
  },
  riskManagement: {
    id: "riskManagement",
    name: "Risk Management",
    apiEndpoint: "/api/riskmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Risk Management",
    module: "Operations",
    page: "/operations/riskmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Risk Management", path: "/operations/riskmanagement" }
    ]
  },
  roleAssignment: {
    id: "roleAssignment",
    name: "Role Assignment",
    apiEndpoint: "/api/roleassignment",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Role Assignment",
    module: "Admin",
    page: "/admin/roleassignment",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Role Assignment", path: "/admin/roleassignment" }
    ]
  },
  roleHierarchy: {
    id: "roleHierarchy",
    name: "Role Hierarchy",
    apiEndpoint: "/api/rolehierarchy",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Role Hierarchy",
    module: "Admin",
    page: "/admin/rolehierarchy",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Role Hierarchy", path: "/admin/rolehierarchy" }
    ]
  },
  roleManagement: {
    id: "roleManagement",
    name: "Role Management",
    apiEndpoint: "/api/rolemanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Role Management",
    module: "Operations",
    page: "/operations/rolemanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Role Management", path: "/operations/rolemanagement" }
    ]
  },
  routeLoadOptimization: {
    id: "routeLoadOptimization",
    name: "Route Load Optimization",
    apiEndpoint: "/api/routeloadoptimization",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Route Load Optimization",
    module: "Operations",
    page: "/operations/routeloadoptimization",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Route Load Optimization", path: "/operations/routeloadoptimization" }
    ]
  },
  routeOptimization: {
    id: "routeOptimization",
    name: "Route Optimization",
    apiEndpoint: "/api/routeoptimization",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Route Optimization",
    module: "General",
    page: "/general/routeoptimization",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Route Optimization", path: "/general/routeoptimization" }
    ]
  },
  routingMaster: {
    id: "routingMaster",
    name: "Routing Master",
    apiEndpoint: "/api/routingmaster",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Routing Master",
    module: "Operations",
    page: "/operations/routingmaster",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Routing Master", path: "/operations/routingmaster" }
    ]
  },
  sLAServiceTierManagement: {
    id: "sLAServiceTierManagement",
    name: "S L A Service Tier Management",
    apiEndpoint: "/api/slaservicetiermanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create S L A Service Tier Management",
    module: "Operations",
    page: "/operations/slaservicetiermanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "S L A Service Tier Management", path: "/operations/slaservicetiermanagement" }
    ]
  },
  sLATracking: {
    id: "sLATracking",
    name: "S L A Tracking",
    apiEndpoint: "/api/slatracking",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create S L A Tracking",
    module: "Service",
    page: "/service/slatracking",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Service", path: "/service" },
      { label: "S L A Tracking", path: "/service/slatracking" }
    ]
  },
  sSO: {
    id: "sSO",
    name: "S S O",
    apiEndpoint: "/api/sso",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create S S O",
    module: "General",
    page: "/general/sso",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "S S O", path: "/general/sso" }
    ]
  },
  salesActivities: {
    id: "salesActivities",
    name: "Sales Activities",
    apiEndpoint: "/api/salesactivities",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Sales Activities",
    module: "CRM",
    page: "/crm/salesactivities",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Sales Activities", path: "/crm/salesactivities" }
    ]
  },
  salesAnalytics: {
    id: "salesAnalytics",
    name: "Sales Analytics",
    apiEndpoint: "/api/salesanalytics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Sales Analytics",
    module: "Analytics",
    page: "/analytics/salesanalytics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Sales Analytics", path: "/analytics/salesanalytics" }
    ]
  },
  salesCommissionManagement: {
    id: "salesCommissionManagement",
    name: "Sales Commission Management",
    apiEndpoint: "/api/salescommissionmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Sales Commission Management",
    module: "Operations",
    page: "/operations/salescommissionmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Sales Commission Management", path: "/operations/salescommissionmanagement" }
    ]
  },
  salesDistribution: {
    id: "salesDistribution",
    name: "Sales Distribution",
    apiEndpoint: "/api/salesdistribution",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Sales Distribution",
    module: "Logistics",
    page: "/logistics/salesdistribution",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Logistics", path: "/logistics" },
      { label: "Sales Distribution", path: "/logistics/salesdistribution" }
    ]
  },
  salesOrderManagement: {
    id: "salesOrderManagement",
    name: "Sales Order Management",
    apiEndpoint: "/api/salesordermanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Sales Order Management",
    module: "Operations",
    page: "/operations/salesordermanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Sales Order Management", path: "/operations/salesordermanagement" }
    ]
  },
  salesPipeline: {
    id: "salesPipeline",
    name: "Sales Pipeline",
    apiEndpoint: "/api/salespipeline",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Sales Pipeline",
    module: "CRM",
    page: "/crm/salespipeline",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Sales Pipeline", path: "/crm/salespipeline" }
    ]
  },
  sampleTracking: {
    id: "sampleTracking",
    name: "Sample Tracking",
    apiEndpoint: "/api/sampletracking",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Sample Tracking",
    module: "Analytics",
    page: "/analytics/sampletracking",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Sample Tracking", path: "/analytics/sampletracking" }
    ]
  },
  scheduledReports: {
    id: "scheduledReports",
    name: "Scheduled Reports",
    apiEndpoint: "/api/scheduledreports",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Scheduled Reports",
    module: "Analytics",
    page: "/analytics/scheduledreports",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Scheduled Reports", path: "/analytics/scheduledreports" }
    ]
  },
  scheduledTasks: {
    id: "scheduledTasks",
    name: "Scheduled Tasks",
    apiEndpoint: "/api/scheduledtasks",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Scheduled Tasks",
    module: "HR",
    page: "/hr/scheduledtasks",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Scheduled Tasks", path: "/hr/scheduledtasks" }
    ]
  },
  securityAudit: {
    id: "securityAudit",
    name: "Security Audit",
    apiEndpoint: "/api/securityaudit",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Security Audit",
    module: "Admin",
    page: "/admin/securityaudit",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Security Audit", path: "/admin/securityaudit" }
    ]
  },
  securityEventLog: {
    id: "securityEventLog",
    name: "Security Event Log",
    apiEndpoint: "/api/securityeventlog",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Security Event Log",
    module: "Marketing",
    page: "/marketing/securityeventlog",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "Security Event Log", path: "/marketing/securityeventlog" }
    ]
  },
  securityManagement: {
    id: "securityManagement",
    name: "Security Management",
    apiEndpoint: "/api/securitymanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Security Management",
    module: "Operations",
    page: "/operations/securitymanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Security Management", path: "/operations/securitymanagement" }
    ]
  },
  securitySettings: {
    id: "securitySettings",
    name: "Security Settings",
    apiEndpoint: "/api/securitysettings",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Security Settings",
    module: "Admin",
    page: "/admin/securitysettings",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Security Settings", path: "/admin/securitysettings" }
    ]
  },
  semanticSearch: {
    id: "semanticSearch",
    name: "Semantic Search",
    apiEndpoint: "/api/semanticsearch",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Semantic Search",
    module: "Operations",
    page: "/operations/semanticsearch",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Semantic Search", path: "/operations/semanticsearch" }
    ]
  },
  serialization: {
    id: "serialization",
    name: "Serialization",
    apiEndpoint: "/api/serialization",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Serialization",
    module: "General",
    page: "/general/serialization",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Serialization", path: "/general/serialization" }
    ]
  },
  service: {
    id: "service",
    name: "Service",
    apiEndpoint: "/api/service",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Service",
    module: "Service",
    page: "/service/service",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Service", path: "/service" },
      { label: "Service", path: "/service/service" }
    ]
  },
  serviceAnalytics: {
    id: "serviceAnalytics",
    name: "Service Analytics",
    apiEndpoint: "/api/serviceanalytics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Service Analytics",
    module: "Analytics",
    page: "/analytics/serviceanalytics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Service Analytics", path: "/analytics/serviceanalytics" }
    ]
  },
  serviceCatalog: {
    id: "serviceCatalog",
    name: "Service Catalog",
    apiEndpoint: "/api/servicecatalog",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Service Catalog",
    module: "Service",
    page: "/service/servicecatalog",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Service", path: "/service" },
      { label: "Service Catalog", path: "/service/servicecatalog" }
    ]
  },
  serviceLevelConfig: {
    id: "serviceLevelConfig",
    name: "Service Level Config",
    apiEndpoint: "/api/servicelevelconfig",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Service Level Config",
    module: "Service",
    page: "/service/servicelevelconfig",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Service", path: "/service" },
      { label: "Service Level Config", path: "/service/servicelevelconfig" }
    ]
  },
  serviceModule: {
    id: "serviceModule",
    name: "Service Module",
    apiEndpoint: "/api/servicemodule",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Service Module",
    module: "Operations",
    page: "/operations/servicemodule",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Service Module", path: "/operations/servicemodule" }
    ]
  },
  serviceProvisioning: {
    id: "serviceProvisioning",
    name: "Service Provisioning",
    apiEndpoint: "/api/serviceprovisioning",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Service Provisioning",
    module: "Admin",
    page: "/admin/serviceprovisioning",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Service Provisioning", path: "/admin/serviceprovisioning" }
    ]
  },
  serviceProvisioningOrder: {
    id: "serviceProvisioningOrder",
    name: "Service Provisioning Order",
    apiEndpoint: "/api/serviceprovisioningorder",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Service Provisioning Order",
    module: "Operations",
    page: "/operations/serviceprovisioningorder",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Service Provisioning Order", path: "/operations/serviceprovisioningorder" }
    ]
  },
  serviceTicket: {
    id: "serviceTicket",
    name: "Service Ticket",
    apiEndpoint: "/api/serviceticket",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Service Ticket",
    module: "Service",
    page: "/service/serviceticket",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Service", path: "/service" },
      { label: "Service Ticket", path: "/service/serviceticket" }
    ]
  },
  serviceTicketsDetail: {
    id: "serviceTicketsDetail",
    name: "Service Tickets Detail",
    apiEndpoint: "/api/serviceticketsdetail",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Service Tickets Detail",
    module: "Service",
    page: "/service/serviceticketsdetail",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Service", path: "/service" },
      { label: "Service Tickets Detail", path: "/service/serviceticketsdetail" }
    ]
  },
  sessionManagement: {
    id: "sessionManagement",
    name: "Session Management",
    apiEndpoint: "/api/sessionmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Session Management",
    module: "Operations",
    page: "/operations/sessionmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Session Management", path: "/operations/sessionmanagement" }
    ]
  },
  settings: {
    id: "settings",
    name: "Settings",
    apiEndpoint: "/api/settings",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Settings",
    module: "Admin",
    page: "/admin/settings",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Settings", path: "/admin/settings" }
    ]
  },
  shipmentOrderManagement: {
    id: "shipmentOrderManagement",
    name: "Shipment Order Management",
    apiEndpoint: "/api/shipmentordermanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Shipment Order Management",
    module: "Operations",
    page: "/operations/shipmentordermanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Shipment Order Management", path: "/operations/shipmentordermanagement" }
    ]
  },
  shipmentPlanning: {
    id: "shipmentPlanning",
    name: "Shipment Planning",
    apiEndpoint: "/api/shipmentplanning",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Shipment Planning",
    module: "Logistics",
    page: "/logistics/shipmentplanning",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Logistics", path: "/logistics" },
      { label: "Shipment Planning", path: "/logistics/shipmentplanning" }
    ]
  },
  shipmentTracking: {
    id: "shipmentTracking",
    name: "Shipment Tracking",
    apiEndpoint: "/api/shipmenttracking",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Shipment Tracking",
    module: "Logistics",
    page: "/logistics/shipmenttracking",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Logistics", path: "/logistics" },
      { label: "Shipment Tracking", path: "/logistics/shipmenttracking" }
    ]
  },
  shippingManagement: {
    id: "shippingManagement",
    name: "Shipping Management",
    apiEndpoint: "/api/shippingmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Shipping Management",
    module: "Operations",
    page: "/operations/shippingmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Shipping Management", path: "/operations/shippingmanagement" }
    ]
  },
  shopFloor: {
    id: "shopFloor",
    name: "Shop Floor",
    apiEndpoint: "/api/shopfloor",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Shop Floor",
    module: "Manufacturing",
    page: "/manufacturing/shopfloor",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Manufacturing", path: "/manufacturing" },
      { label: "Shop Floor", path: "/manufacturing/shopfloor" }
    ]
  },
  shopFloorDataCollection: {
    id: "shopFloorDataCollection",
    name: "Shop Floor Data Collection",
    apiEndpoint: "/api/shopfloordatacollection",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Shop Floor Data Collection",
    module: "Analytics",
    page: "/analytics/shopfloordatacollection",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Shop Floor Data Collection", path: "/analytics/shopfloordatacollection" }
    ]
  },
  shoppingCartCheckout: {
    id: "shoppingCartCheckout",
    name: "Shopping Cart Checkout",
    apiEndpoint: "/api/shoppingcartcheckout",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Shopping Cart Checkout",
    module: "Manufacturing",
    page: "/manufacturing/shoppingcartcheckout",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Manufacturing", path: "/manufacturing" },
      { label: "Shopping Cart Checkout", path: "/manufacturing/shoppingcartcheckout" }
    ]
  },
  signupPage: {
    id: "signupPage",
    name: "Signup Page",
    apiEndpoint: "/api/signuppage",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Signup Page",
    module: "Operations",
    page: "/operations/signuppage",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Signup Page", path: "/operations/signuppage" }
    ]
  },
  soDRules: {
    id: "soDRules",
    name: "So D Rules",
    apiEndpoint: "/api/sodrules",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create So D Rules",
    module: "Workflow",
    page: "/workflow/sodrules",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Workflow", path: "/workflow" },
      { label: "So D Rules", path: "/workflow/sodrules" }
    ]
  },
  sprints: {
    id: "sprints",
    name: "Sprints",
    apiEndpoint: "/api/sprints",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Sprints",
    module: "General",
    page: "/general/sprints",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Sprints", path: "/general/sprints" }
    ]
  },
  stabilityStudies: {
    id: "stabilityStudies",
    name: "Stability Studies",
    apiEndpoint: "/api/stabilitystudies",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Stability Studies",
    module: "General",
    page: "/general/stabilitystudies",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Stability Studies", path: "/general/stabilitystudies" }
    ]
  },
  standardCosting: {
    id: "standardCosting",
    name: "Standard Costing",
    apiEndpoint: "/api/standardcosting",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Standard Costing",
    module: "Manufacturing",
    page: "/manufacturing/standardcosting",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Manufacturing", path: "/manufacturing" },
      { label: "Standard Costing", path: "/manufacturing/standardcosting" }
    ]
  },
  stockIssue: {
    id: "stockIssue",
    name: "Stock Issue",
    apiEndpoint: "/api/stockissue",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Stock Issue",
    module: "Operations",
    page: "/operations/stockissue",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Stock Issue", path: "/operations/stockissue" }
    ]
  },
  stockPickingPacking: {
    id: "stockPickingPacking",
    name: "Stock Picking Packing",
    apiEndpoint: "/api/stockpickingpacking",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Stock Picking Packing",
    module: "Operations",
    page: "/operations/stockpickingpacking",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Stock Picking Packing", path: "/operations/stockpickingpacking" }
    ]
  },
  stockTransfer: {
    id: "stockTransfer",
    name: "Stock Transfer",
    apiEndpoint: "/api/stocktransfer",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Stock Transfer",
    module: "Operations",
    page: "/operations/stocktransfer",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Stock Transfer", path: "/operations/stocktransfer" }
    ]
  },
  storeOperationsDashboard: {
    id: "storeOperationsDashboard",
    name: "Store Operations Dashboard",
    apiEndpoint: "/api/storeoperationsdashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Store Operations Dashboard",
    module: "Analytics",
    page: "/analytics/storeoperationsdashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Store Operations Dashboard", path: "/analytics/storeoperationsdashboard" }
    ]
  },
  storeOutletManagement: {
    id: "storeOutletManagement",
    name: "Store Outlet Management",
    apiEndpoint: "/api/storeoutletmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Store Outlet Management",
    module: "Operations",
    page: "/operations/storeoutletmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Store Outlet Management", path: "/operations/storeoutletmanagement" }
    ]
  },
  stories: {
    id: "stories",
    name: "Stories",
    apiEndpoint: "/api/stories",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Stories",
    module: "General",
    page: "/general/stories",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Stories", path: "/general/stories" }
    ]
  },
  studentManagement: {
    id: "studentManagement",
    name: "Student Management",
    apiEndpoint: "/api/studentmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Student Management",
    module: "Operations",
    page: "/operations/studentmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Student Management", path: "/operations/studentmanagement" }
    ]
  },
  studentManagementEd: {
    id: "studentManagementEd",
    name: "Student Management Ed",
    apiEndpoint: "/api/studentmanagemented",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Student Management Ed",
    module: "Operations",
    page: "/operations/studentmanagemented",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Student Management Ed", path: "/operations/studentmanagemented" }
    ]
  },
  styleMasterSKU: {
    id: "styleMasterSKU",
    name: "Style Master S K U",
    apiEndpoint: "/api/stylemastersku",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Style Master S K U",
    module: "Operations",
    page: "/operations/stylemastersku",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Style Master S K U", path: "/operations/stylemastersku" }
    ]
  },
  subcontractorManagement: {
    id: "subcontractorManagement",
    name: "Subcontractor Management",
    apiEndpoint: "/api/subcontractormanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Subcontractor Management",
    module: "Operations",
    page: "/operations/subcontractormanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Subcontractor Management", path: "/operations/subcontractormanagement" }
    ]
  },
  subscriberAccounts: {
    id: "subscriberAccounts",
    name: "Subscriber Accounts",
    apiEndpoint: "/api/subscriberaccounts",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Subscriber Accounts",
    module: "CRM",
    page: "/crm/subscriberaccounts",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Subscriber Accounts", path: "/crm/subscriberaccounts" }
    ]
  },
  subscriberManagement: {
    id: "subscriberManagement",
    name: "Subscriber Management",
    apiEndpoint: "/api/subscribermanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Subscriber Management",
    module: "Operations",
    page: "/operations/subscribermanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Subscriber Management", path: "/operations/subscribermanagement" }
    ]
  },
  subscriptionLifecycle: {
    id: "subscriptionLifecycle",
    name: "Subscription Lifecycle",
    apiEndpoint: "/api/subscriptionlifecycle",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Subscription Lifecycle",
    module: "Finance",
    page: "/finance/subscriptionlifecycle",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Subscription Lifecycle", path: "/finance/subscriptionlifecycle" }
    ]
  },
  successionPlanning: {
    id: "successionPlanning",
    name: "Succession Planning",
    apiEndpoint: "/api/successionplanning",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Succession Planning",
    module: "General",
    page: "/general/successionplanning",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Succession Planning", path: "/general/successionplanning" }
    ]
  },
  supplierCarrierManagement: {
    id: "supplierCarrierManagement",
    name: "Supplier Carrier Management",
    apiEndpoint: "/api/suppliercarriermanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Supplier Carrier Management",
    module: "Operations",
    page: "/operations/suppliercarriermanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Supplier Carrier Management", path: "/operations/suppliercarriermanagement" }
    ]
  },
  supplierCollaborationPortal: {
    id: "supplierCollaborationPortal",
    name: "Supplier Collaboration Portal",
    apiEndpoint: "/api/suppliercollaborationportal",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Supplier Collaboration Portal",
    module: "Projects",
    page: "/projects/suppliercollaborationportal",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Projects", path: "/projects" },
      { label: "Supplier Collaboration Portal", path: "/projects/suppliercollaborationportal" }
    ]
  },
  supplierInvoices: {
    id: "supplierInvoices",
    name: "Supplier Invoices",
    apiEndpoint: "/api/supplierinvoices",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Supplier Invoices",
    module: "Finance",
    page: "/finance/supplierinvoices",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Supplier Invoices", path: "/finance/supplierinvoices" }
    ]
  },
  supplierManagement: {
    id: "supplierManagement",
    name: "Supplier Management",
    apiEndpoint: "/api/suppliermanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Supplier Management",
    module: "Operations",
    page: "/operations/suppliermanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Supplier Management", path: "/operations/suppliermanagement" }
    ]
  },
  supplierPerformance: {
    id: "supplierPerformance",
    name: "Supplier Performance",
    apiEndpoint: "/api/supplierperformance",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Supplier Performance",
    module: "HR",
    page: "/hr/supplierperformance",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Supplier Performance", path: "/hr/supplierperformance" }
    ]
  },
  supplierQualification: {
    id: "supplierQualification",
    name: "Supplier Qualification",
    apiEndpoint: "/api/supplierqualification",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Supplier Qualification",
    module: "General",
    page: "/general/supplierqualification",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Supplier Qualification", path: "/general/supplierqualification" }
    ]
  },
  supplierQualityScorecard: {
    id: "supplierQualityScorecard",
    name: "Supplier Quality Scorecard",
    apiEndpoint: "/api/supplierqualityscorecard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Supplier Quality Scorecard",
    module: "Manufacturing",
    page: "/manufacturing/supplierqualityscorecard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Manufacturing", path: "/manufacturing" },
      { label: "Supplier Quality Scorecard", path: "/manufacturing/supplierqualityscorecard" }
    ]
  },
  supplyChain: {
    id: "supplyChain",
    name: "Supply Chain",
    apiEndpoint: "/api/supplychain",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Supply Chain",
    module: "Logistics",
    page: "/logistics/supplychain",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Logistics", path: "/logistics" },
      { label: "Supply Chain", path: "/logistics/supplychain" }
    ]
  },
  supplyChainEnergy: {
    id: "supplyChainEnergy",
    name: "Supply Chain Energy",
    apiEndpoint: "/api/supplychainenergy",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Supply Chain Energy",
    module: "Logistics",
    page: "/logistics/supplychainenergy",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Logistics", path: "/logistics" },
      { label: "Supply Chain Energy", path: "/logistics/supplychainenergy" }
    ]
  },
  supplyChainHealthcare: {
    id: "supplyChainHealthcare",
    name: "Supply Chain Healthcare",
    apiEndpoint: "/api/supplychainhealthcare",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Supply Chain Healthcare",
    module: "Admin",
    page: "/admin/supplychainhealthcare",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Supply Chain Healthcare", path: "/admin/supplychainhealthcare" }
    ]
  },
  supplyChainLogistics: {
    id: "supplyChainLogistics",
    name: "Supply Chain Logistics",
    apiEndpoint: "/api/supplychainlogistics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Supply Chain Logistics",
    module: "Admin",
    page: "/admin/supplychainlogistics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Supply Chain Logistics", path: "/admin/supplychainlogistics" }
    ]
  },
  supplyChainMfg: {
    id: "supplyChainMfg",
    name: "Supply Chain Mfg",
    apiEndpoint: "/api/supplychainmfg",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Supply Chain Mfg",
    module: "Logistics",
    page: "/logistics/supplychainmfg",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Logistics", path: "/logistics" },
      { label: "Supply Chain Mfg", path: "/logistics/supplychainmfg" }
    ]
  },
  supplyChainOptimization: {
    id: "supplyChainOptimization",
    name: "Supply Chain Optimization",
    apiEndpoint: "/api/supplychainoptimization",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Supply Chain Optimization",
    module: "Logistics",
    page: "/logistics/supplychainoptimization",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Logistics", path: "/logistics" },
      { label: "Supply Chain Optimization", path: "/logistics/supplychainoptimization" }
    ]
  },
  supplyChainRetail: {
    id: "supplyChainRetail",
    name: "Supply Chain Retail",
    apiEndpoint: "/api/supplychainretail",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Supply Chain Retail",
    module: "Logistics",
    page: "/logistics/supplychainretail",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Logistics", path: "/logistics" },
      { label: "Supply Chain Retail", path: "/logistics/supplychainretail" }
    ]
  },
  supplyNetworkOptimization: {
    id: "supplyNetworkOptimization",
    name: "Supply Network Optimization",
    apiEndpoint: "/api/supplynetworkoptimization",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Supply Network Optimization",
    module: "Finance",
    page: "/finance/supplynetworkoptimization",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Supply Network Optimization", path: "/finance/supplynetworkoptimization" }
    ]
  },
  support: {
    id: "support",
    name: "Support",
    apiEndpoint: "/api/support",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Support",
    module: "Service",
    page: "/service/support",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Service", path: "/service" },
      { label: "Support", path: "/service/support" }
    ]
  },
  sustainabilityComplianceCPG: {
    id: "sustainabilityComplianceCPG",
    name: "Sustainability Compliance C P G",
    apiEndpoint: "/api/sustainabilitycompliancecpg",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Sustainability Compliance C P G",
    module: "Governance",
    page: "/governance/sustainabilitycompliancecpg",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Sustainability Compliance C P G", path: "/governance/sustainabilitycompliancecpg" }
    ]
  },
  sustainabilityMaterials: {
    id: "sustainabilityMaterials",
    name: "Sustainability Materials",
    apiEndpoint: "/api/sustainabilitymaterials",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Sustainability Materials",
    module: "Manufacturing",
    page: "/manufacturing/sustainabilitymaterials",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Manufacturing", path: "/manufacturing" },
      { label: "Sustainability Materials", path: "/manufacturing/sustainabilitymaterials" }
    ]
  },
  sustainabilityReporting: {
    id: "sustainabilityReporting",
    name: "Sustainability Reporting",
    apiEndpoint: "/api/sustainabilityreporting",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Sustainability Reporting",
    module: "Analytics",
    page: "/analytics/sustainabilityreporting",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Sustainability Reporting", path: "/analytics/sustainabilityreporting" }
    ]
  },
  sustainabilityTraceability: {
    id: "sustainabilityTraceability",
    name: "Sustainability Traceability",
    apiEndpoint: "/api/sustainabilitytraceability",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Sustainability Traceability",
    module: "General",
    page: "/general/sustainabilitytraceability",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Sustainability Traceability", path: "/general/sustainabilitytraceability" }
    ]
  },
  systemHealth: {
    id: "systemHealth",
    name: "System Health",
    apiEndpoint: "/api/systemhealth",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create System Health",
    module: "Admin",
    page: "/admin/systemhealth",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "System Health", path: "/admin/systemhealth" }
    ]
  },
  systemLogs: {
    id: "systemLogs",
    name: "System Logs",
    apiEndpoint: "/api/systemlogs",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create System Logs",
    module: "Admin",
    page: "/admin/systemlogs",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "System Logs", path: "/admin/systemlogs" }
    ]
  },
  systemSettings: {
    id: "systemSettings",
    name: "System Settings",
    apiEndpoint: "/api/systemsettings",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create System Settings",
    module: "Admin",
    page: "/admin/systemsettings",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "System Settings", path: "/admin/systemsettings" }
    ]
  },
  talentPool: {
    id: "talentPool",
    name: "Talent Pool",
    apiEndpoint: "/api/talentpool",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Talent Pool",
    module: "General",
    page: "/general/talentpool",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Talent Pool", path: "/general/talentpool" }
    ]
  },
  taskManagement: {
    id: "taskManagement",
    name: "Task Management",
    apiEndpoint: "/api/taskmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Task Management",
    module: "Operations",
    page: "/operations/taskmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Task Management", path: "/operations/taskmanagement" }
    ]
  },
  tasksDetail: {
    id: "tasksDetail",
    name: "Tasks Detail",
    apiEndpoint: "/api/tasksdetail",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Tasks Detail",
    module: "Projects",
    page: "/projects/tasksdetail",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Projects", path: "/projects" },
      { label: "Tasks Detail", path: "/projects/tasksdetail" }
    ]
  },
  taxManagement: {
    id: "taxManagement",
    name: "Tax Management",
    apiEndpoint: "/api/taxmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Tax Management",
    module: "Operations",
    page: "/operations/taxmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Tax Management", path: "/operations/taxmanagement" }
    ]
  },
  teamCollaboration: {
    id: "teamCollaboration",
    name: "Team Collaboration",
    apiEndpoint: "/api/teamcollaboration",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Team Collaboration",
    module: "Projects",
    page: "/projects/teamcollaboration",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Projects", path: "/projects" },
      { label: "Team Collaboration", path: "/projects/teamcollaboration" }
    ]
  },
  teamCollaborationHub: {
    id: "teamCollaborationHub",
    name: "Team Collaboration Hub",
    apiEndpoint: "/api/teamcollaborationhub",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Team Collaboration Hub",
    module: "Projects",
    page: "/projects/teamcollaborationhub",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Projects", path: "/projects" },
      { label: "Team Collaboration Hub", path: "/projects/teamcollaborationhub" }
    ]
  },
  teamUtilization: {
    id: "teamUtilization",
    name: "Team Utilization",
    apiEndpoint: "/api/teamutilization",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Team Utilization",
    module: "HR",
    page: "/hr/teamutilization",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Team Utilization", path: "/hr/teamutilization" }
    ]
  },
  techPackBuilder: {
    id: "techPackBuilder",
    name: "Tech Pack Builder",
    apiEndpoint: "/api/techpackbuilder",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Tech Pack Builder",
    module: "General",
    page: "/general/techpackbuilder",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Tech Pack Builder", path: "/general/techpackbuilder" }
    ]
  },
  telecomAIOptimization: {
    id: "telecomAIOptimization",
    name: "Telecom A I Optimization",
    apiEndpoint: "/api/telecomaioptimization",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Telecom A I Optimization",
    module: "AI",
    page: "/ai/telecomaioptimization",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "AI", path: "/ai" },
      { label: "Telecom A I Optimization", path: "/ai/telecomaioptimization" }
    ]
  },
  telecomAnalytics: {
    id: "telecomAnalytics",
    name: "Telecom Analytics",
    apiEndpoint: "/api/telecomanalytics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Telecom Analytics",
    module: "Analytics",
    page: "/analytics/telecomanalytics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Telecom Analytics", path: "/analytics/telecomanalytics" }
    ]
  },
  telecomBI: {
    id: "telecomBI",
    name: "Telecom B I",
    apiEndpoint: "/api/telecombi",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Telecom B I",
    module: "General",
    page: "/general/telecombi",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Telecom B I", path: "/general/telecombi" }
    ]
  },
  telecomBIDashboard: {
    id: "telecomBIDashboard",
    name: "Telecom B I Dashboard",
    apiEndpoint: "/api/telecombidashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Telecom B I Dashboard",
    module: "Analytics",
    page: "/analytics/telecombidashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Telecom B I Dashboard", path: "/analytics/telecombidashboard" }
    ]
  },
  telecomBIDashboards: {
    id: "telecomBIDashboards",
    name: "Telecom B I Dashboards",
    apiEndpoint: "/api/telecombidashboards",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Telecom B I Dashboards",
    module: "Analytics",
    page: "/analytics/telecombidashboards",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Telecom B I Dashboards", path: "/analytics/telecombidashboards" }
    ]
  },
  telecomBilling: {
    id: "telecomBilling",
    name: "Telecom Billing",
    apiEndpoint: "/api/telecombilling",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Telecom Billing",
    module: "Finance",
    page: "/finance/telecombilling",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Telecom Billing", path: "/finance/telecombilling" }
    ]
  },
  telecomBillingInvoicing: {
    id: "telecomBillingInvoicing",
    name: "Telecom Billing Invoicing",
    apiEndpoint: "/api/telecombillinginvoicing",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Telecom Billing Invoicing",
    module: "Finance",
    page: "/finance/telecombillinginvoicing",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Telecom Billing Invoicing", path: "/finance/telecombillinginvoicing" }
    ]
  },
  telecomBillingRevenue: {
    id: "telecomBillingRevenue",
    name: "Telecom Billing Revenue",
    apiEndpoint: "/api/telecombillingrevenue",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Telecom Billing Revenue",
    module: "Finance",
    page: "/finance/telecombillingrevenue",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Telecom Billing Revenue", path: "/finance/telecombillingrevenue" }
    ]
  },
  telecomCRM: {
    id: "telecomCRM",
    name: "Telecom C R M",
    apiEndpoint: "/api/telecomcrm",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Telecom C R M",
    module: "CRM",
    page: "/crm/telecomcrm",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Telecom C R M", path: "/crm/telecomcrm" }
    ]
  },
  telecomCRMEngagement: {
    id: "telecomCRMEngagement",
    name: "Telecom C R M Engagement",
    apiEndpoint: "/api/telecomcrmengagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Telecom C R M Engagement",
    module: "CRM",
    page: "/crm/telecomcrmengagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Telecom C R M Engagement", path: "/crm/telecomcrmengagement" }
    ]
  },
  telecomCompliance: {
    id: "telecomCompliance",
    name: "Telecom Compliance",
    apiEndpoint: "/api/telecomcompliance",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Telecom Compliance",
    module: "Governance",
    page: "/governance/telecomcompliance",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Telecom Compliance", path: "/governance/telecomcompliance" }
    ]
  },
  telecomCustomerSupport: {
    id: "telecomCustomerSupport",
    name: "Telecom Customer Support",
    apiEndpoint: "/api/telecomcustomersupport",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Telecom Customer Support",
    module: "CRM",
    page: "/crm/telecomcustomersupport",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Telecom Customer Support", path: "/crm/telecomcustomersupport" }
    ]
  },
  telecomDashboard: {
    id: "telecomDashboard",
    name: "Telecom Dashboard",
    apiEndpoint: "/api/telecomdashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Telecom Dashboard",
    module: "Analytics",
    page: "/analytics/telecomdashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Telecom Dashboard", path: "/analytics/telecomdashboard" }
    ]
  },
  telecomFieldService: {
    id: "telecomFieldService",
    name: "Telecom Field Service",
    apiEndpoint: "/api/telecomfieldservice",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Telecom Field Service",
    module: "Service",
    page: "/service/telecomfieldservice",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Service", path: "/service" },
      { label: "Telecom Field Service", path: "/service/telecomfieldservice" }
    ]
  },
  telecomFinanceCompliance: {
    id: "telecomFinanceCompliance",
    name: "Telecom Finance Compliance",
    apiEndpoint: "/api/telecomfinancecompliance",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Telecom Finance Compliance",
    module: "Governance",
    page: "/governance/telecomfinancecompliance",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Telecom Finance Compliance", path: "/governance/telecomfinancecompliance" }
    ]
  },
  telecomHR: {
    id: "telecomHR",
    name: "Telecom H R",
    apiEndpoint: "/api/telecomhr",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Telecom H R",
    module: "HR",
    page: "/hr/telecomhr",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Telecom H R", path: "/hr/telecomhr" }
    ]
  },
  telecomHRWorkforce: {
    id: "telecomHRWorkforce",
    name: "Telecom H R Workforce",
    apiEndpoint: "/api/telecomhrworkforce",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Telecom H R Workforce",
    module: "HR",
    page: "/hr/telecomhrworkforce",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Telecom H R Workforce", path: "/hr/telecomhrworkforce" }
    ]
  },
  telecomMarketing: {
    id: "telecomMarketing",
    name: "Telecom Marketing",
    apiEndpoint: "/api/telecommarketing",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Telecom Marketing",
    module: "Marketing",
    page: "/marketing/telecommarketing",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "Telecom Marketing", path: "/marketing/telecommarketing" }
    ]
  },
  telecomMobileApp: {
    id: "telecomMobileApp",
    name: "Telecom Mobile App",
    apiEndpoint: "/api/telecommobileapp",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Telecom Mobile App",
    module: "Operations",
    page: "/operations/telecommobileapp",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Telecom Mobile App", path: "/operations/telecommobileapp" }
    ]
  },
  telecomNetworkOperations: {
    id: "telecomNetworkOperations",
    name: "Telecom Network Operations",
    apiEndpoint: "/api/telecomnetworkoperations",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Telecom Network Operations",
    module: "Finance",
    page: "/finance/telecomnetworkoperations",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Telecom Network Operations", path: "/finance/telecomnetworkoperations" }
    ]
  },
  telecomPlansPackages: {
    id: "telecomPlansPackages",
    name: "Telecom Plans Packages",
    apiEndpoint: "/api/telecomplanspackages",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Telecom Plans Packages",
    module: "Operations",
    page: "/operations/telecomplanspackages",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Telecom Plans Packages", path: "/operations/telecomplanspackages" }
    ]
  },
  telecomReporting: {
    id: "telecomReporting",
    name: "Telecom Reporting",
    apiEndpoint: "/api/telecomreporting",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Telecom Reporting",
    module: "Analytics",
    page: "/analytics/telecomreporting",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Telecom Reporting", path: "/analytics/telecomreporting" }
    ]
  },
  telecomServiceProvisioning: {
    id: "telecomServiceProvisioning",
    name: "Telecom Service Provisioning",
    apiEndpoint: "/api/telecomserviceprovisioning",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Telecom Service Provisioning",
    module: "Admin",
    page: "/admin/telecomserviceprovisioning",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Telecom Service Provisioning", path: "/admin/telecomserviceprovisioning" }
    ]
  },
  telecomSubscriberManagement: {
    id: "telecomSubscriberManagement",
    name: "Telecom Subscriber Management",
    apiEndpoint: "/api/telecomsubscribermanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Telecom Subscriber Management",
    module: "Operations",
    page: "/operations/telecomsubscribermanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Telecom Subscriber Management", path: "/operations/telecomsubscribermanagement" }
    ]
  },
  telematicsVehicleData: {
    id: "telematicsVehicleData",
    name: "Telematics Vehicle Data",
    apiEndpoint: "/api/telematicsvehicledata",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Telematics Vehicle Data",
    module: "Analytics",
    page: "/analytics/telematicsvehicledata",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Telematics Vehicle Data", path: "/analytics/telematicsvehicledata" }
    ]
  },
  templateLibrary: {
    id: "templateLibrary",
    name: "Template Library",
    apiEndpoint: "/api/templatelibrary",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Template Library",
    module: "Operations",
    page: "/operations/templatelibrary",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Template Library", path: "/operations/templatelibrary" }
    ]
  },
  tenantAdmin: {
    id: "tenantAdmin",
    name: "Tenant Admin",
    apiEndpoint: "/api/tenantadmin",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Tenant Admin",
    module: "Admin",
    page: "/admin/tenantadmin",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Tenant Admin", path: "/admin/tenantadmin" }
    ]
  },
  thirdPartyApps: {
    id: "thirdPartyApps",
    name: "Third Party Apps",
    apiEndpoint: "/api/thirdpartyapps",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Third Party Apps",
    module: "General",
    page: "/general/thirdpartyapps",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Third Party Apps", path: "/general/thirdpartyapps" }
    ]
  },
  thirdPartyLogistics: {
    id: "thirdPartyLogistics",
    name: "Third Party Logistics",
    apiEndpoint: "/api/thirdpartylogistics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Third Party Logistics",
    module: "Admin",
    page: "/admin/thirdpartylogistics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Third Party Logistics", path: "/admin/thirdpartylogistics" }
    ]
  },
  threeWayMatch: {
    id: "threeWayMatch",
    name: "Three Way Match",
    apiEndpoint: "/api/threewaymatch",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Three Way Match",
    module: "General",
    page: "/general/threewaymatch",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Three Way Match", path: "/general/threewaymatch" }
    ]
  },
  ticketDashboard: {
    id: "ticketDashboard",
    name: "Ticket Dashboard",
    apiEndpoint: "/api/ticketdashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Ticket Dashboard",
    module: "Analytics",
    page: "/analytics/ticketdashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Ticket Dashboard", path: "/analytics/ticketdashboard" }
    ]
  },
  ticketsDashboard: {
    id: "ticketsDashboard",
    name: "Tickets Dashboard",
    apiEndpoint: "/api/ticketsdashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Tickets Dashboard",
    module: "Analytics",
    page: "/analytics/ticketsdashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Tickets Dashboard", path: "/analytics/ticketsdashboard" }
    ]
  },
  timeAttendance: {
    id: "timeAttendance",
    name: "Time Attendance",
    apiEndpoint: "/api/timeattendance",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Time Attendance",
    module: "HR",
    page: "/hr/timeattendance",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Time Attendance", path: "/hr/timeattendance" }
    ]
  },
  timeTracking: {
    id: "timeTracking",
    name: "Time Tracking",
    apiEndpoint: "/api/timetracking",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Time Tracking",
    module: "Analytics",
    page: "/analytics/timetracking",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Time Tracking", path: "/analytics/timetracking" }
    ]
  },
  timesheetManagement: {
    id: "timesheetManagement",
    name: "Timesheet Management",
    apiEndpoint: "/api/timesheetmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Timesheet Management",
    module: "Operations",
    page: "/operations/timesheetmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Timesheet Management", path: "/operations/timesheetmanagement" }
    ]
  },
  toolingManagement: {
    id: "toolingManagement",
    name: "Tooling Management",
    apiEndpoint: "/api/toolingmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Tooling Management",
    module: "Operations",
    page: "/operations/toolingmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Tooling Management", path: "/operations/toolingmanagement" }
    ]
  },
  trackingDashboard: {
    id: "trackingDashboard",
    name: "Tracking Dashboard",
    apiEndpoint: "/api/trackingdashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Tracking Dashboard",
    module: "Analytics",
    page: "/analytics/trackingdashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Tracking Dashboard", path: "/analytics/trackingdashboard" }
    ]
  },
  tradeComplianceDashboard: {
    id: "tradeComplianceDashboard",
    name: "Trade Compliance Dashboard",
    apiEndpoint: "/api/tradecompliancedashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Trade Compliance Dashboard",
    module: "Governance",
    page: "/governance/tradecompliancedashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Trade Compliance Dashboard", path: "/governance/tradecompliancedashboard" }
    ]
  },
  tradePromotions: {
    id: "tradePromotions",
    name: "Trade Promotions",
    apiEndpoint: "/api/tradepromotions",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Trade Promotions",
    module: "Marketing",
    page: "/marketing/tradepromotions",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "Trade Promotions", path: "/marketing/tradepromotions" }
    ]
  },
  trainingAcademy: {
    id: "trainingAcademy",
    name: "Training Academy",
    apiEndpoint: "/api/trainingacademy",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Training Academy",
    module: "General",
    page: "/general/trainingacademy",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Training Academy", path: "/general/trainingacademy" }
    ]
  },
  transportationBIDashboard: {
    id: "transportationBIDashboard",
    name: "Transportation B I Dashboard",
    apiEndpoint: "/api/transportationbidashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Transportation B I Dashboard",
    module: "Analytics",
    page: "/analytics/transportationbidashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Transportation B I Dashboard", path: "/analytics/transportationbidashboard" }
    ]
  },
  transportationManagementSystem: {
    id: "transportationManagementSystem",
    name: "Transportation Management System",
    apiEndpoint: "/api/transportationmanagementsystem",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Transportation Management System",
    module: "Operations",
    page: "/operations/transportationmanagementsystem",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Transportation Management System", path: "/operations/transportationmanagementsystem" }
    ]
  },
  travelItinerary: {
    id: "travelItinerary",
    name: "Travel Itinerary",
    apiEndpoint: "/api/travelitinerary",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Travel Itinerary",
    module: "General",
    page: "/general/travelitinerary",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Travel Itinerary", path: "/general/travelitinerary" }
    ]
  },
  travelManagement: {
    id: "travelManagement",
    name: "Travel Management",
    apiEndpoint: "/api/travelmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Travel Management",
    module: "Operations",
    page: "/operations/travelmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Travel Management", path: "/operations/travelmanagement" }
    ]
  },
  twoFactorAuth: {
    id: "twoFactorAuth",
    name: "Two Factor Auth",
    apiEndpoint: "/api/twofactorauth",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Two Factor Auth",
    module: "General",
    page: "/general/twofactorauth",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Two Factor Auth", path: "/general/twofactorauth" }
    ]
  },
  uATAutomation: {
    id: "uATAutomation",
    name: "U A T Automation",
    apiEndpoint: "/api/uatautomation",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create U A T Automation",
    module: "Automation",
    page: "/automation/uatautomation",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Automation", path: "/automation" },
      { label: "U A T Automation", path: "/automation/uatautomation" }
    ]
  },
  useCasesPage: {
    id: "useCasesPage",
    name: "Use Cases Page",
    apiEndpoint: "/api/usecasespage",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Use Cases Page",
    module: "Operations",
    page: "/operations/usecasespage",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Use Cases Page", path: "/operations/usecasespage" }
    ]
  },
  userActivityDashboard: {
    id: "userActivityDashboard",
    name: "User Activity Dashboard",
    apiEndpoint: "/api/useractivitydashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create User Activity Dashboard",
    module: "CRM",
    page: "/crm/useractivitydashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "User Activity Dashboard", path: "/crm/useractivitydashboard" }
    ]
  },
  userManagement: {
    id: "userManagement",
    name: "User Management",
    apiEndpoint: "/api/usermanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create User Management",
    module: "Operations",
    page: "/operations/usermanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "User Management", path: "/operations/usermanagement" }
    ]
  },
  validationCSV: {
    id: "validationCSV",
    name: "Validation C S V",
    apiEndpoint: "/api/validationcsv",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Validation C S V",
    module: "Operations",
    page: "/operations/validationcsv",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Validation C S V", path: "/operations/validationcsv" }
    ]
  },
  varianceAnalysis: {
    id: "varianceAnalysis",
    name: "Variance Analysis",
    apiEndpoint: "/api/varianceanalysis",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Variance Analysis",
    module: "General",
    page: "/general/varianceanalysis",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Variance Analysis", path: "/general/varianceanalysis" }
    ]
  },
  vehicleFleetManagement: {
    id: "vehicleFleetManagement",
    name: "Vehicle Fleet Management",
    apiEndpoint: "/api/vehiclefleetmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Vehicle Fleet Management",
    module: "Operations",
    page: "/operations/vehiclefleetmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Vehicle Fleet Management", path: "/operations/vehiclefleetmanagement" }
    ]
  },
  vehicleInventoryManagement: {
    id: "vehicleInventoryManagement",
    name: "Vehicle Inventory Management",
    apiEndpoint: "/api/vehicleinventorymanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Vehicle Inventory Management",
    module: "Operations",
    page: "/operations/vehicleinventorymanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Vehicle Inventory Management", path: "/operations/vehicleinventorymanagement" }
    ]
  },
  vehicleSalesDeals: {
    id: "vehicleSalesDeals",
    name: "Vehicle Sales Deals",
    apiEndpoint: "/api/vehiclesalesdeals",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Vehicle Sales Deals",
    module: "CRM",
    page: "/crm/vehiclesalesdeals",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Vehicle Sales Deals", path: "/crm/vehiclesalesdeals" }
    ]
  },
  vendorInvoiceEntry: {
    id: "vendorInvoiceEntry",
    name: "Vendor Invoice Entry",
    apiEndpoint: "/api/vendorinvoiceentry",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Vendor Invoice Entry",
    module: "Finance",
    page: "/finance/vendorinvoiceentry",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Vendor Invoice Entry", path: "/finance/vendorinvoiceentry" }
    ]
  },
  vendorManagement: {
    id: "vendorManagement",
    name: "Vendor Management",
    apiEndpoint: "/api/vendormanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Vendor Management",
    module: "Operations",
    page: "/operations/vendormanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Vendor Management", path: "/operations/vendormanagement" }
    ]
  },
  vendorsDetail: {
    id: "vendorsDetail",
    name: "Vendors Detail",
    apiEndpoint: "/api/vendorsdetail",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Vendors Detail",
    module: "Procurement",
    page: "/procurement/vendorsdetail",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Procurement", path: "/procurement" },
      { label: "Vendors Detail", path: "/procurement/vendorsdetail" }
    ]
  },
  virtualAssistant: {
    id: "virtualAssistant",
    name: "Virtual Assistant",
    apiEndpoint: "/api/virtualassistant",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Virtual Assistant",
    module: "General",
    page: "/general/virtualassistant",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Virtual Assistant", path: "/general/virtualassistant" }
    ]
  },
  virtualClassroom: {
    id: "virtualClassroom",
    name: "Virtual Classroom",
    apiEndpoint: "/api/virtualclassroom",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Virtual Classroom",
    module: "Education",
    page: "/education/virtualclassroom",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Education", path: "/education" },
      { label: "Virtual Classroom", path: "/education/virtualclassroom" }
    ]
  },
  voiceOfCustomer: {
    id: "voiceOfCustomer",
    name: "Voice Of Customer",
    apiEndpoint: "/api/voiceofcustomer",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Voice Of Customer",
    module: "CRM",
    page: "/crm/voiceofcustomer",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Voice Of Customer", path: "/crm/voiceofcustomer" }
    ]
  },
  wIPTracking: {
    id: "wIPTracking",
    name: "W I P Tracking",
    apiEndpoint: "/api/wiptracking",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create W I P Tracking",
    module: "Analytics",
    page: "/analytics/wiptracking",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "W I P Tracking", path: "/analytics/wiptracking" }
    ]
  },
  wIPTrackingDashboard: {
    id: "wIPTrackingDashboard",
    name: "W I P Tracking Dashboard",
    apiEndpoint: "/api/wiptrackingdashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create W I P Tracking Dashboard",
    module: "Analytics",
    page: "/analytics/wiptrackingdashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "W I P Tracking Dashboard", path: "/analytics/wiptrackingdashboard" }
    ]
  },
  warehouse: {
    id: "warehouse",
    name: "Warehouse",
    apiEndpoint: "/api/warehouse",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Warehouse",
    module: "Logistics",
    page: "/logistics/warehouse",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Logistics", path: "/logistics" },
      { label: "Warehouse", path: "/logistics/warehouse" }
    ]
  },
  warehouseInventoryLogistics: {
    id: "warehouseInventoryLogistics",
    name: "Warehouse Inventory Logistics",
    apiEndpoint: "/api/warehouseinventorylogistics",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Warehouse Inventory Logistics",
    module: "Operations",
    page: "/operations/warehouseinventorylogistics",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Warehouse Inventory Logistics", path: "/operations/warehouseinventorylogistics" }
    ]
  },
  warehouseManagement: {
    id: "warehouseManagement",
    name: "Warehouse Management",
    apiEndpoint: "/api/warehousemanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Warehouse Management",
    module: "Operations",
    page: "/operations/warehousemanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Warehouse Management", path: "/operations/warehousemanagement" }
    ]
  },
  warrantyClaimsManagement: {
    id: "warrantyClaimsManagement",
    name: "Warranty Claims Management",
    apiEndpoint: "/api/warrantyclaimsmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Warranty Claims Management",
    module: "Operations",
    page: "/operations/warrantyclaimsmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Warranty Claims Management", path: "/operations/warrantyclaimsmanagement" }
    ]
  },
  warrantyReturns: {
    id: "warrantyReturns",
    name: "Warranty Returns",
    apiEndpoint: "/api/warrantyreturns",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Warranty Returns",
    module: "Operations",
    page: "/operations/warrantyreturns",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Warranty Returns", path: "/operations/warrantyreturns" }
    ]
  },
  webhookEvents: {
    id: "webhookEvents",
    name: "Webhook Events",
    apiEndpoint: "/api/webhookevents",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Webhook Events",
    module: "Marketing",
    page: "/marketing/webhookevents",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "Webhook Events", path: "/marketing/webhookevents" }
    ]
  },
  webhookManagement: {
    id: "webhookManagement",
    name: "Webhook Management",
    apiEndpoint: "/api/webhookmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Webhook Management",
    module: "Operations",
    page: "/operations/webhookmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Webhook Management", path: "/operations/webhookmanagement" }
    ]
  },
  webhooks: {
    id: "webhooks",
    name: "Webhooks",
    apiEndpoint: "/api/webhooks",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Webhooks",
    module: "Developer",
    page: "/developer/webhooks",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Developer", path: "/developer" },
      { label: "Webhooks", path: "/developer/webhooks" }
    ]
  },
  website: {
    id: "website",
    name: "Website",
    apiEndpoint: "/api/website",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Website",
    module: "Marketing",
    page: "/marketing/website",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "Website", path: "/marketing/website" }
    ]
  },
  websiteBuilder: {
    id: "websiteBuilder",
    name: "Website Builder",
    apiEndpoint: "/api/websitebuilder",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Website Builder",
    module: "Marketing",
    page: "/marketing/websitebuilder",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketing", path: "/marketing" },
      { label: "Website Builder", path: "/marketing/websitebuilder" }
    ]
  },
  websiteManagement: {
    id: "websiteManagement",
    name: "Website Management",
    apiEndpoint: "/api/websitemanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Website Management",
    module: "Operations",
    page: "/operations/websitemanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Website Management", path: "/operations/websitemanagement" }
    ]
  },
  wholesaleB2B: {
    id: "wholesaleB2B",
    name: "Wholesale B2 B",
    apiEndpoint: "/api/wholesaleb2b",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Wholesale B2 B",
    module: "General",
    page: "/general/wholesaleb2b",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "Wholesale B2 B", path: "/general/wholesaleb2b" }
    ]
  },
  workOrder: {
    id: "workOrder",
    name: "Work Order",
    apiEndpoint: "/api/workorder",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Work Order",
    module: "Operations",
    page: "/operations/workorder",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Work Order", path: "/operations/workorder" }
    ]
  },
  workOrdersDashboard: {
    id: "workOrdersDashboard",
    name: "Work Orders Dashboard",
    apiEndpoint: "/api/workordersdashboard",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Work Orders Dashboard",
    module: "Analytics",
    page: "/analytics/workordersdashboard",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Work Orders Dashboard", path: "/analytics/workordersdashboard" }
    ]
  },
  workflowAutomation: {
    id: "workflowAutomation",
    name: "Workflow Automation",
    apiEndpoint: "/api/workflowautomation",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Workflow Automation",
    module: "Automation",
    page: "/automation/workflowautomation",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Automation", path: "/automation" },
      { label: "Workflow Automation", path: "/automation/workflowautomation" }
    ]
  },
  workflowBuilder: {
    id: "workflowBuilder",
    name: "Workflow Builder",
    apiEndpoint: "/api/workflowbuilder",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Workflow Builder",
    module: "Workflow",
    page: "/workflow/workflowbuilder",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Workflow", path: "/workflow" },
      { label: "Workflow Builder", path: "/workflow/workflowbuilder" }
    ]
  },
  workflowDesigner: {
    id: "workflowDesigner",
    name: "Workflow Designer",
    apiEndpoint: "/api/workflowdesigner",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Workflow Designer",
    module: "Workflow",
    page: "/workflow/workflowdesigner",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Workflow", path: "/workflow" },
      { label: "Workflow Designer", path: "/workflow/workflowdesigner" }
    ]
  },
  workflowExecution: {
    id: "workflowExecution",
    name: "Workflow Execution",
    apiEndpoint: "/api/workflowexecution",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Workflow Execution",
    module: "Workflow",
    page: "/workflow/workflowexecution",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Workflow", path: "/workflow" },
      { label: "Workflow Execution", path: "/workflow/workflowexecution" }
    ]
  },
  workflowMonitoring: {
    id: "workflowMonitoring",
    name: "Workflow Monitoring",
    apiEndpoint: "/api/workflowmonitoring",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Workflow Monitoring",
    module: "Admin",
    page: "/admin/workflowmonitoring",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Workflow Monitoring", path: "/admin/workflowmonitoring" }
    ]
  },
  workflowTemplates: {
    id: "workflowTemplates",
    name: "Workflow Templates",
    apiEndpoint: "/api/workflowtemplates",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Workflow Templates",
    module: "Operations",
    page: "/operations/workflowtemplates",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Workflow Templates", path: "/operations/workflowtemplates" }
    ]
  },
  workforceScheduling: {
    id: "workforceScheduling",
    name: "Workforce Scheduling",
    apiEndpoint: "/api/workforcescheduling",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Workforce Scheduling",
    module: "Operations",
    page: "/operations/workforcescheduling",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Workforce Scheduling", path: "/operations/workforcescheduling" }
    ]
  },
  workshopServiceOrders: {
    id: "workshopServiceOrders",
    name: "Workshop Service Orders",
    apiEndpoint: "/api/workshopserviceorders",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Workshop Service Orders",
    module: "Operations",
    page: "/operations/workshopserviceorders",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Workshop Service Orders", path: "/operations/workshopserviceorders" }
    ]
  },
  yardDockManagement: {
    id: "yardDockManagement",
    name: "Yard Dock Management",
    apiEndpoint: "/api/yarddockmanagement",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Yard Dock Management",
    module: "Operations",
    page: "/operations/yarddockmanagement",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Operations", path: "/operations" },
      { label: "Yard Dock Management", path: "/operations/yarddockmanagement" }
    ]
  },
  yieldVarianceTracking: {
    id: "yieldVarianceTracking",
    name: "Yield Variance Tracking",
    apiEndpoint: "/api/yieldvariancetracking",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create Yield Variance Tracking",
    module: "Analytics",
    page: "/analytics/yieldvariancetracking",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Yield Variance Tracking", path: "/analytics/yieldvariancetracking" }
    ]
  },
  eBatchRecord: {
    id: "eBatchRecord",
    name: "e Batch Record",
    apiEndpoint: "/api/ebatchrecord",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true }
    ],
    searchFields: ["name", "status"],
    displayField: "name",
    createButtonText: "Create e Batch Record",
    module: "General",
    page: "/general/ebatchrecord",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "General", path: "/general" },
      { label: "e Batch Record", path: "/general/ebatchrecord" }
    ]
  },
};

export function getFormMetadata(id: string): FormMetadata | undefined {
  return formMetadataRegistry[id];
}
