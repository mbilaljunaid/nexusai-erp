import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeProvider } from "@/components/ThemeProvider";
import NotFound from "@/pages/not-found";

// Core pages
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const CRM = lazy(() => import("@/pages/CRM"));
const ERP = lazy(() => import("@/pages/ERP"));
const HR = lazy(() => import("@/pages/HR"));
const Projects = lazy(() => import("@/pages/Projects"));

// Phase 1: Payments & CRM (4 pages)
const InvoiceGenerator = lazy(() => import("@/pages/InvoiceGenerator"));
const QuoteBuilder = lazy(() => import("@/pages/QuoteBuilder"));
const ApprovalWorkflow = lazy(() => import("@/pages/ApprovalWorkflow"));
const PaymentFlow = lazy(() => import("@/pages/PaymentFlow"));

// Phase 2: ERP Workflows (4 pages)
const VendorInvoiceEntry = lazy(() => import("@/pages/VendorInvoiceEntry"));
const BankReconciliation = lazy(() => import("@/pages/BankReconciliation"));
const PaymentScheduling = lazy(() => import("@/pages/PaymentScheduling"));
const AgingReport = lazy(() => import("@/pages/AgingReport"));

// Phase 3: Projects & Automation (4 pages)
const AgileBoard = lazy(() => import("@/pages/AgileBoard"));
const TaskManagement = lazy(() => import("@/pages/TaskManagement"));
const WorkflowDesigner = lazy(() => import("@/pages/WorkflowDesigner"));
const TeamCollaboration = lazy(() => import("@/pages/TeamCollaboration"));

// All existing pages (keep imports for all 191 pages)
const LeadDetail = lazy(() => import("@/pages/LeadDetail"));
const LeadConversion = lazy(() => import("@/pages/LeadConversion"));
const InvoiceList = lazy(() => import("@/pages/InvoiceList"));
const InvoiceDetail = lazy(() => import("@/pages/InvoiceDetail"));
const PurchaseOrder = lazy(() => import("@/pages/PurchaseOrder"));
const VendorManagement = lazy(() => import("@/pages/VendorManagement"));
const GeneralLedger = lazy(() => import("@/pages/GeneralLedger"));
const FinancialReports = lazy(() => import("@/pages/FinancialReports"));
const WorkOrder = lazy(() => import("@/pages/WorkOrder"));
const MRPDashboard = lazy(() => import("@/pages/MRPDashboard"));
const ShopFloor = lazy(() => import("@/pages/ShopFloor"));
const QualityControl = lazy(() => import("@/pages/QualityControl"));
const EmployeeDirectory = lazy(() => import("@/pages/EmployeeDirectory"));
const OrgChart = lazy(() => import("@/pages/OrgChart"));
const LeaveRequest = lazy(() => import("@/pages/LeaveRequest"));
const LeaveApproval = lazy(() => import("@/pages/LeaveApproval"));
const AttendanceDashboard = lazy(() => import("@/pages/AttendanceDashboard"));
const PayrollProcessing = lazy(() => import("@/pages/PayrollProcessing"));
const CompensationManagement = lazy(() => import("@/pages/CompensationManagement"));
const PerformanceReviews = lazy(() => import("@/pages/PerformanceReviews"));
const TalentPool = lazy(() => import("@/pages/TalentPool"));
const HRAnalyticsDashboard = lazy(() => import("@/pages/HRAnalyticsDashboard"));
const ServiceTicket = lazy(() => import("@/pages/ServiceTicket"));
const TicketDashboard = lazy(() => import("@/pages/TicketDashboard"));
const SLATracking = lazy(() => import("@/pages/SLATracking"));
const KnowledgeBase = lazy(() => import("@/pages/KnowledgeBase"));
const CustomerPortal = lazy(() => import("@/pages/CustomerPortal"));
const ServiceAnalytics = lazy(() => import("@/pages/ServiceAnalytics"));
const TeamUtilization = lazy(() => import("@/pages/TeamUtilization"));
const ResponseAnalytics = lazy(() => import("@/pages/ResponseAnalytics"));
const InventoryManagement = lazy(() => import("@/pages/InventoryManagement"));
const OpportunityList = lazy(() => import("@/pages/OpportunityList"));
const OpportunityDetail = lazy(() => import("@/pages/OpportunityDetail"));
const SalesPipeline = lazy(() => import("@/pages/SalesPipeline"));
const ForecastDashboard = lazy(() => import("@/pages/ForecastDashboard"));
const AccountDirectory = lazy(() => import("@/pages/AccountDirectory"));
const AccountHierarchy = lazy(() => import("@/pages/AccountHierarchy"));
const ContactDirectory = lazy(() => import("@/pages/ContactDirectory"));
const ActivityTimeline = lazy(() => import("@/pages/ActivityTimeline"));
const LeadScoringDashboard = lazy(() => import("@/pages/LeadScoringDashboard"));
const Manufacturing = lazy(() => import("@/pages/Manufacturing"));
const Service = lazy(() => import("@/pages/Service"));
const Marketing = lazy(() => import("@/pages/Marketing"));
const ComplianceDashboard = lazy(() => import("@/pages/ComplianceDashboard"));
const BPM = lazy(() => import("@/pages/BPM"));
const IntegrationHub = lazy(() => import("@/pages/IntegrationHub"));
const WebsiteBuilder = lazy(() => import("@/pages/WebsiteBuilder"));
const EmailManagement = lazy(() => import("@/pages/EmailManagement"));
const Ecommerce = lazy(() => import("@/pages/Ecommerce"));
const FormShowcase = lazy(() => import("@/pages/FormShowcase"));
const UATAutomation = lazy(() => import("@/pages/UATAutomation"));
const AdvancedFeatures = lazy(() => import("@/pages/AdvancedFeatures"));
const SystemHealth = lazy(() => import("@/pages/SystemHealth"));
const Copilot = lazy(() => import("@/pages/Copilot"));
const FieldService = lazy(() => import("@/pages/FieldService"));
const Planning = lazy(() => import("@/pages/Planning"));
const Marketplace = lazy(() => import("@/pages/Marketplace"));
const MobileSync = lazy(() => import("@/pages/MobileSync"));
const AIChat = lazy(() => import("@/pages/AIChat"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Billing = lazy(() => import("@/pages/Billing"));
const PayrollEngine = lazy(() => import("@/pages/PayrollEngine"));
const LeaveWorkflows = lazy(() => import("@/pages/LeaveWorkflows"));
const PerformanceManagement = lazy(() => import("@/pages/PerformanceManagement"));
const OnboardingAutomation = lazy(() => import("@/pages/OnboardingAutomation"));
const BudgetPlanning = lazy(() => import("@/pages/BudgetPlanning"));
const ConsolidationEngine = lazy(() => import("@/pages/ConsolidationEngine"));

// Detail pages for section navigation
const LeadsDetail = lazy(() => import("@/pages/LeadsDetail"));
const OpportunitiesDetail = lazy(() => import("@/pages/OpportunitiesDetail"));
const InvoicesDetail = lazy(() => import("@/pages/InvoicesDetail"));
const GeneralLedgerDetail = lazy(() => import("@/pages/GeneralLedgerDetail"));
const ServiceTicketsDetail = lazy(() => import("@/pages/ServiceTicketsDetail"));
const VarianceAnalysis = lazy(() => import("@/pages/VarianceAnalysis"));
const PredictiveAnalytics = lazy(() => import("@/pages/PredictiveAnalytics"));
const RAGEmbeddingsPipeline = lazy(() => import("@/pages/RAGEmbeddingsPipeline"));
const CRMCopilot = lazy(() => import("@/pages/CRMCopilot"));
const ERPCopilot = lazy(() => import("@/pages/ERPCopilot"));
const HRCopilot = lazy(() => import("@/pages/HRCopilot"));
const PerformanceTuning = lazy(() => import("@/pages/PerformanceTuning"));
const ErrorHandling = lazy(() => import("@/pages/ErrorHandling"));
const SemanticSearch = lazy(() => import("@/pages/SemanticSearch"));
const KnowledgeGraph = lazy(() => import("@/pages/KnowledgeGraph"));
const Health = lazy(() => import("@/pages/Health"));
const Settings = lazy(() => import("@/pages/Settings"));
const Industries = lazy(() => import("@/pages/Industries"));
const IndustryConfiguration = lazy(() => import("@/pages/IndustryConfiguration"));
const DashboardBuilder = lazy(() => import("@/pages/DashboardBuilder"));
const ReportBuilder = lazy(() => import("@/pages/ReportBuilder"));
const DataExplorer = lazy(() => import("@/pages/DataExplorer"));
const SalesAnalytics = lazy(() => import("@/pages/SalesAnalytics"));
const FinancialAnalytics = lazy(() => import("@/pages/FinancialAnalytics"));
const OperationalAnalytics = lazy(() => import("@/pages/OperationalAnalytics"));
const LeadScoringAnalytics = lazy(() => import("@/pages/LeadScoringAnalytics"));
const RevenueForecasting = lazy(() => import("@/pages/RevenueForecasting"));
const ChurnRiskAnalysis = lazy(() => import("@/pages/ChurnRiskAnalysis"));
const ExportManager = lazy(() => import("@/pages/ExportManager"));
const ScheduledReports = lazy(() => import("@/pages/ScheduledReports"));
const WorkflowBuilder = lazy(() => import("@/pages/WorkflowBuilder"));
const WorkflowTemplates = lazy(() => import("@/pages/WorkflowTemplates"));
const WorkflowExecution = lazy(() => import("@/pages/WorkflowExecution"));
const APIManagement = lazy(() => import("@/pages/APIManagement"));
const WebhookManagement = lazy(() => import("@/pages/WebhookManagement"));
const APILogs = lazy(() => import("@/pages/APILogs"));
const RateLimiting = lazy(() => import("@/pages/RateLimiting"));
const AppStore = lazy(() => import("@/pages/AppStore"));
const InstalledApps = lazy(() => import("@/pages/InstalledApps"));
const SystemSettings = lazy(() => import("@/pages/SystemSettings"));
const UserManagement = lazy(() => import("@/pages/UserManagement"));
const RoleManagement = lazy(() => import("@/pages/RoleManagement"));
const PermissionMatrix = lazy(() => import("@/pages/PermissionMatrix"));
const CustomFields = lazy(() => import("@/pages/CustomFields"));
const FieldValidation = lazy(() => import("@/pages/FieldValidation"));
const DataImport = lazy(() => import("@/pages/DataImport"));
const DataExport = lazy(() => import("@/pages/DataExport"));
const DataCleanup = lazy(() => import("@/pages/DataCleanup"));
const AuditLogs = lazy(() => import("@/pages/AuditLogs"));
const ComplianceReports = lazy(() => import("@/pages/ComplianceReports"));
const DataGovernance = lazy(() => import("@/pages/DataGovernance"));
const BackupRestore = lazy(() => import("@/pages/BackupRestore"));
const PerformanceMonitoring = lazy(() => import("@/pages/PerformanceMonitoring"));
const IntegrationManagement = lazy(() => import("@/pages/IntegrationManagement"));
const OAuthManagement = lazy(() => import("@/pages/OAuthManagement"));
const SSO = lazy(() => import("@/pages/SSO"));
const TwoFactorAuth = lazy(() => import("@/pages/TwoFactorAuth"));
const AccessControl = lazy(() => import("@/pages/AccessControl"));
const FeatureFlags = lazy(() => import("@/pages/FeatureFlags"));
const Localization = lazy(() => import("@/pages/Localization"));
const EmailConfiguration = lazy(() => import("@/pages/EmailConfiguration"));
const NotificationSettings = lazy(() => import("@/pages/NotificationSettings"));
const ScheduledTasks = lazy(() => import("@/pages/ScheduledTasks"));
const SystemLogs = lazy(() => import("@/pages/SystemLogs"));
const DatabaseMaintenance = lazy(() => import("@/pages/DatabaseMaintenance"));
const BrandingCustomization = lazy(() => import("@/pages/BrandingCustomization"));
const LicenseManagement = lazy(() => import("@/pages/LicenseManagement"));
const APIDocumentation = lazy(() => import("@/pages/APIDocumentation"));
const WebhookEvents = lazy(() => import("@/pages/WebhookEvents"));
const Migrations = lazy(() => import("@/pages/Migrations"));
const DeploymentSettings = lazy(() => import("@/pages/DeploymentSettings"));
const SecurityAudit = lazy(() => import("@/pages/SecurityAudit"));
const CacheManagement = lazy(() => import("@/pages/CacheManagement"));
const ModuleSettings = lazy(() => import("@/pages/ModuleSettings"));
const Webhooks = lazy(() => import("@/pages/Webhooks"));
const DeveloperTools = lazy(() => import("@/pages/DeveloperTools"));
const ThirdPartyApps = lazy(() => import("@/pages/ThirdPartyApps"));
const ReportingConfiguration = lazy(() => import("@/pages/ReportingConfiguration"));
const ArchiveManagement = lazy(() => import("@/pages/ArchiveManagement"));
const MetricsAndMonitoring = lazy(() => import("@/pages/MetricsAndMonitoring"));
const ResourceAllocation = lazy(() => import("@/pages/ResourceAllocation"));
const APIRateLimitPolicy = lazy(() => import("@/pages/APIRateLimitPolicy"));
const AuthenticationMethods = lazy(() => import("@/pages/AuthenticationMethods"));
const AlertsAndNotifications = lazy(() => import("@/pages/AlertsAndNotifications"));
const HealthCheckDashboard = lazy(() => import("@/pages/HealthCheckDashboard"));
const BatchOperations = lazy(() => import("@/pages/BatchOperations"));
const VirtualAssistant = lazy(() => import("@/pages/VirtualAssistant"));
const PlatformStatus = lazy(() => import("@/pages/PlatformStatus"));
const MobileOptimization = lazy(() => import("@/pages/MobileOptimization"));
const AccessibilityAudit = lazy(() => import("@/pages/AccessibilityAudit"));
const PerformanceOptimization = lazy(() => import("@/pages/PerformanceOptimization"));
const InternationalizationConfig = lazy(() => import("@/pages/InternationalizationConfig"));
const AdvancedSearch = lazy(() => import("@/pages/AdvancedSearch"));
const BulkOperations = lazy(() => import("@/pages/BulkOperations"));
const Website = lazy(() => import("@/pages/Website"));
const TimeTracking = lazy(() => import("@/pages/TimeTracking"));
const TrainingAcademy = lazy(() => import("@/pages/TrainingAcademy"));
const EPMPage = lazy(() => import("@/pages/EPMPage"));

// Additional page imports
const AdvancedEncryption = lazy(() => import("@/pages/AdvancedEncryption"));
const AdvancedPermissions = lazy(() => import("@/pages/AdvancedPermissions"));
const AdvancedReporting = lazy(() => import("@/pages/AdvancedReporting"));
const AIAssistant = lazy(() => import("@/pages/AIAssistant"));
const APIVersioning = lazy(() => import("@/pages/APIVersioning"));
const AssetManagement = lazy(() => import("@/pages/AssetManagement"));
const BackendIntegration = lazy(() => import("@/pages/BackendIntegration"));
const CollaborationTools = lazy(() => import("@/pages/CollaborationTools"));
const CommunityForum = lazy(() => import("@/pages/CommunityForum"));
const CompetitorAnalysis = lazy(() => import("@/pages/CompetitorAnalysis"));
const Compliance = lazy(() => import("@/pages/Compliance"));
const ContractManagement = lazy(() => import("@/pages/ContractManagement"));
const CustomerJourneyMap = lazy(() => import("@/pages/CustomerJourneyMap"));
const CustomerSuccessPanel = lazy(() => import("@/pages/CustomerSuccessPanel"));
const CustomWorkflows = lazy(() => import("@/pages/CustomWorkflows"));
const DataValidation = lazy(() => import("@/pages/DataValidation"));
const DataWarehouse = lazy(() => import("@/pages/DataWarehouse"));
const DuplicateDetection = lazy(() => import("@/pages/DuplicateDetection"));
const Email = lazy(() => import("@/pages/Email"));
const EPMModule = lazy(() => import("@/pages/EPMModule"));
const ExpenseTracking = lazy(() => import("@/pages/ExpenseTracking"));
const GeolocationServices = lazy(() => import("@/pages/GeolocationServices"));
const GrowthMetrics = lazy(() => import("@/pages/GrowthMetrics"));
const Integrations = lazy(() => import("@/pages/Integrations"));
const MobileAppSettings = lazy(() => import("@/pages/MobileAppSettings"));
const MultiTenancy = lazy(() => import("@/pages/MultiTenancy"));
const NotificationCenter = lazy(() => import("@/pages/NotificationCenter"));
const PlatformAdmin = lazy(() => import("@/pages/admin/PlatformAdmin"));
const PredictiveLeadScoring = lazy(() => import("@/pages/PredictiveLeadScoring"));
const ProcurementManagement = lazy(() => import("@/pages/ProcurementManagement"));
const QualityAssurance = lazy(() => import("@/pages/QualityAssurance"));
const RealTimeNotifications = lazy(() => import("@/pages/RealTimeNotifications"));
const RecommendationEngine = lazy(() => import("@/pages/RecommendationEngine"));
const ServiceLevelConfig = lazy(() => import("@/pages/ServiceLevelConfig"));
const SupplyChainOptimization = lazy(() => import("@/pages/SupplyChainOptimization"));
const TemplateLibrary = lazy(() => import("@/pages/TemplateLibrary"));
const TenantAdmin = lazy(() => import("@/pages/admin/TenantAdmin"));

// Phase 3: Procurement Module
const RFQs = lazy(() => import("@/pages/RFQs"));
const PurchaseOrders = lazy(() => import("@/pages/PurchaseOrders"));
const GoodsReceipt = lazy(() => import("@/pages/GoodsReceipt"));
const SupplierInvoices = lazy(() => import("@/pages/SupplierInvoices"));
const ThreeWayMatch = lazy(() => import("@/pages/ThreeWayMatch"));

// Phase 3B: Projects & Agile Module
const Epics = lazy(() => import("@/pages/Epics"));
const Stories = lazy(() => import("@/pages/Stories"));
const Sprints = lazy(() => import("@/pages/Sprints"));
const KanbanBoard = lazy(() => import("@/pages/KanbanBoard"));

// Phase 4: Finance & Accounting Module
const ChartOfAccounts = lazy(() => import("@/pages/ChartOfAccounts"));
const APInvoices = lazy(() => import("@/pages/APInvoices"));
const ARInvoices = lazy(() => import("@/pages/ARInvoices"));
const BankReconciliationPage = lazy(() => import("@/pages/BankReconciliation"));

// Phase 5: HRMS & Payroll Module
const EmployeesList = lazy(() => import("@/pages/EmployeesList"));
const PayrollRuns = lazy(() => import("@/pages/PayrollRuns"));

// Phase 6: CRM & Sales Module
const OpportunitiesNew = lazy(() => import("@/pages/OpportunitiesNew"));

// Phase 7-14: Additional Enterprise Modules
const InventoryDashboard = lazy(() => import("@/pages/InventoryDashboard"));
const WorkOrdersDashboard = lazy(() => import("@/pages/WorkOrdersDashboard"));
const BudgetingDashboard = lazy(() => import("@/pages/BudgetingDashboard"));
const TicketsDashboard = lazy(() => import("@/pages/TicketsDashboard"));
const CampaignsDashboard = lazy(() => import("@/pages/CampaignsDashboard"));
const ComplianceDashboardNew = lazy(() => import("@/pages/ComplianceDashboardNew"));
const ContentManagement = lazy(() => import("@/pages/ContentManagement"));
const AdminConsole = lazy(() => import("@/pages/AdminConsole"));

// Phase 15-20: Advanced Enterprise Features
const IntegrationHubNew = lazy(() => import("@/pages/IntegrationHubNew"));
const AIAssistantAdvanced = lazy(() => import("@/pages/AIAssistantAdvanced"));
const AdvancedAnalytics = lazy(() => import("@/pages/AdvancedAnalytics"));
const MultiTenancyConfig = lazy(() => import("@/pages/MultiTenancyConfig"));
const SecurityManagement = lazy(() => import("@/pages/SecurityManagement"));
const AuditTrails = lazy(() => import("@/pages/AuditTrails"));
const WarehouseManagement = lazy(() => import("@/pages/WarehouseManagement"));
const SupplierManagement = lazy(() => import("@/pages/SupplierManagement"));
const CustomerLoyalty = lazy(() => import("@/pages/CustomerLoyalty"));

// Phase 21-25: Final Enterprise Modules
const DataGovernancePage = lazy(() => import("@/pages/DataGovernancePage"));
const BusinessIntelligence = lazy(() => import("@/pages/BusinessIntelligence"));
const VoiceOfCustomer = lazy(() => import("@/pages/VoiceOfCustomer"));
const ProcurementAutomation = lazy(() => import("@/pages/ProcurementAutomation"));
const RiskManagement = lazy(() => import("@/pages/RiskManagement"));
const EmployeeEngagement = lazy(() => import("@/pages/EmployeeEngagement"));
const SuccessionPlanning = lazy(() => import("@/pages/SuccessionPlanning"));
const CapacityPlanning = lazy(() => import("@/pages/CapacityPlanning"));
const ChangeManagement = lazy(() => import("@/pages/ChangeManagement"));
const CostOptimization = lazy(() => import("@/pages/CostOptimization"));
const SustainabilityReporting = lazy(() => import("@/pages/SustainabilityReporting"));
const QualityAssuranceHub = lazy(() => import("@/pages/QualityAssuranceHub"));

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/crm" component={CRM} />
      <Route path="/projects" component={Projects} />
      <Route path="/erp" component={ERP} />
      <Route path="/hr" component={HR} />
      <Route path="/manufacturing" component={Manufacturing} />
      <Route path="/service" component={Service} />
      <Route path="/invoice-generator" component={InvoiceGenerator} />
      <Route path="/quote-builder" component={QuoteBuilder} />
      <Route path="/approval-workflow" component={ApprovalWorkflow} />
      <Route path="/payment-flow" component={PaymentFlow} />
      <Route path="/vendor-invoice-entry" component={VendorInvoiceEntry} />
      <Route path="/bank-reconciliation" component={BankReconciliation} />
      <Route path="/payment-scheduling" component={PaymentScheduling} />
      <Route path="/aging-report" component={AgingReport} />
      <Route path="/agile-board" component={AgileBoard} />
      <Route path="/task-management" component={TaskManagement} />
      <Route path="/workflow-designer" component={WorkflowDesigner} />
      <Route path="/team-collaboration" component={TeamCollaboration} />
      <Route path="/payroll-engine" component={PayrollEngine} />
      <Route path="/leave-workflows" component={LeaveWorkflows} />
      <Route path="/performance-management" component={PerformanceManagement} />
      <Route path="/onboarding-automation" component={OnboardingAutomation} />
      <Route path="/budget-planning" component={BudgetPlanning} />
      <Route path="/consolidation-engine" component={ConsolidationEngine} />
      <Route path="/variance-analysis" component={VarianceAnalysis} />
      <Route path="/predictive-analytics" component={PredictiveAnalytics} />
      <Route path="/rag-embeddings" component={RAGEmbeddingsPipeline} />
      <Route path="/crm-copilot" component={CRMCopilot} />
      <Route path="/erp-copilot" component={ERPCopilot} />
      <Route path="/hr-copilot" component={HRCopilot} />
      <Route path="/performance-tuning" component={PerformanceTuning} />
      <Route path="/error-handling" component={ErrorHandling} />
      <Route path="/semantic-search" component={SemanticSearch} />
      <Route path="/knowledge-graph" component={KnowledgeGraph} />
      <Route path="/opportunities" component={OpportunityList} />
      <Route path="/opportunity/:id" component={OpportunityDetail} />
      <Route path="/leads/:id" component={LeadDetail} />
      <Route path="/invoices" component={InvoiceList} />
      <Route path="/invoice/:id" component={InvoiceDetail} />
      <Route path="/vendors" component={VendorManagement} />
      <Route path="/purchase-orders" component={PurchaseOrder} />
      <Route path="/general-ledger" component={GeneralLedger} />
      <Route path="/financial-reports" component={FinancialReports} />
      <Route path="/inventory" component={InventoryManagement} />
      <Route path="/employees" component={EmployeeDirectory} />
      <Route path="/payroll" component={PayrollProcessing} />
      <Route path="/leave-request" component={LeaveRequest} />
      <Route path="/service-tickets" component={ServiceTicket} />
      <Route path="/knowledge-base" component={KnowledgeBase} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/copilot" component={Copilot} />
      <Route path="/ai-chat" component={AIChat} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/integrations" component={IntegrationHub} />
      <Route path="/settings" component={Settings} />
      <Route path="/admin/platform" component={PlatformAdmin} />
      <Route path="/admin/tenant" component={TenantAdmin} />
      <Route path="/advanced-encryption" component={AdvancedEncryption} />
      <Route path="/advanced-permissions" component={AdvancedPermissions} />
      <Route path="/advanced-reporting" component={AdvancedReporting} />
      <Route path="/ai-assistant" component={AIAssistant} />
      <Route path="/api-versioning" component={APIVersioning} />
      <Route path="/asset-management" component={AssetManagement} />
      <Route path="/backend-integration" component={BackendIntegration} />
      <Route path="/collaboration-tools" component={CollaborationTools} />
      <Route path="/community-forum" component={CommunityForum} />
      <Route path="/competitor-analysis" component={CompetitorAnalysis} />
      <Route path="/compliance" component={Compliance} />
      <Route path="/contract-management" component={ContractManagement} />
      <Route path="/customer-journey-map" component={CustomerJourneyMap} />
      <Route path="/customer-success-panel" component={CustomerSuccessPanel} />
      <Route path="/custom-workflows" component={CustomWorkflows} />
      <Route path="/data-validation" component={DataValidation} />
      <Route path="/data-warehouse" component={DataWarehouse} />
      <Route path="/duplicate-detection" component={DuplicateDetection} />
      <Route path="/email" component={Email} />
      <Route path="/epm-module" component={EPMModule} />
      <Route path="/expense-tracking" component={ExpenseTracking} />
      <Route path="/geolocation-services" component={GeolocationServices} />
      <Route path="/growth-metrics" component={GrowthMetrics} />
      <Route path="/integrations-alt" component={Integrations} />
      <Route path="/mobile-app-settings" component={MobileAppSettings} />
      <Route path="/multi-tenancy" component={MultiTenancy} />
      <Route path="/notification-center" component={NotificationCenter} />
      <Route path="/predictive-lead-scoring" component={PredictiveLeadScoring} />
      <Route path="/procurement-management" component={ProcurementManagement} />
      <Route path="/quality-assurance" component={QualityAssurance} />
      <Route path="/real-time-notifications" component={RealTimeNotifications} />
      <Route path="/recommendation-engine" component={RecommendationEngine} />
      <Route path="/service-level-config" component={ServiceLevelConfig} />
      <Route path="/supply-chain-optimization" component={SupplyChainOptimization} />
      <Route path="/template-library" component={TemplateLibrary} />
      <Route path="/quality-control" component={QualityControl} />
      <Route path="/purchase-orders" component={PurchaseOrder} />
      <Route path="/ticket-dashboard" component={TicketDashboard} />
      <Route path="/sla-tracking" component={SLATracking} />
      <Route path="/customer-portal" component={CustomerPortal} />
      <Route path="/service-analytics" component={ServiceAnalytics} />
      <Route path="/team-utilization" component={TeamUtilization} />
      <Route path="/response-analytics" component={ResponseAnalytics} />
      <Route path="/account-directory" component={AccountDirectory} />
      <Route path="/account-hierarchy" component={AccountHierarchy} />
      <Route path="/contact-directory" component={ContactDirectory} />
      <Route path="/activity-timeline" component={ActivityTimeline} />
      <Route path="/lead-scoring-dashboard" component={LeadScoringDashboard} />
      <Route path="/lead-conversion" component={LeadConversion} />
      <Route path="/org-chart" component={OrgChart} />
      <Route path="/leave-approval" component={LeaveApproval} />
      <Route path="/performance-reviews" component={PerformanceReviews} />
      <Route path="/talent-pool" component={TalentPool} />
      <Route path="/website" component={Website} />
      <Route path="/website-builder" component={WebsiteBuilder} />
      <Route path="/ecommerce" component={Ecommerce} />
      <Route path="/form-showcase" component={FormShowcase} />
      <Route path="/uat-automation" component={UATAutomation} />
      <Route path="/system-health" component={SystemHealth} />
      <Route path="/planning" component={Planning} />
      <Route path="/health" component={Health} />
      <Route path="/industries" component={Industries} />
      <Route path="/industry-configuration" component={IndustryConfiguration} />
      <Route path="/dashboard-builder" component={DashboardBuilder} />
      <Route path="/report-builder" component={ReportBuilder} />
      <Route path="/data-explorer" component={DataExplorer} />
      <Route path="/sales-analytics" component={SalesAnalytics} />
      <Route path="/financial-analytics" component={FinancialAnalytics} />
      <Route path="/operational-analytics" component={OperationalAnalytics} />
      <Route path="/lead-scoring-analytics" component={LeadScoringAnalytics} />
      <Route path="/revenue-forecasting" component={RevenueForecasting} />
      <Route path="/churn-risk-analysis" component={ChurnRiskAnalysis} />
      <Route path="/export-manager" component={ExportManager} />
      <Route path="/scheduled-reports" component={ScheduledReports} />
      <Route path="/workflow-builder" component={WorkflowBuilder} />
      <Route path="/workflow-templates" component={WorkflowTemplates} />
      <Route path="/workflow-execution" component={WorkflowExecution} />
      <Route path="/api-management" component={APIManagement} />
      <Route path="/webhook-management" component={WebhookManagement} />
      <Route path="/api-logs" component={APILogs} />
      <Route path="/rate-limiting" component={RateLimiting} />
      <Route path="/app-store" component={AppStore} />
      <Route path="/installed-apps" component={InstalledApps} />
      <Route path="/system-settings" component={SystemSettings} />
      <Route path="/user-management" component={UserManagement} />
      <Route path="/role-management" component={RoleManagement} />
      <Route path="/permission-matrix" component={PermissionMatrix} />
      <Route path="/custom-fields" component={CustomFields} />
      <Route path="/field-validation" component={FieldValidation} />
      <Route path="/data-import" component={DataImport} />
      <Route path="/data-export" component={DataExport} />
      <Route path="/data-cleanup" component={DataCleanup} />
      <Route path="/audit-logs" component={AuditLogs} />
      <Route path="/compliance-reports" component={ComplianceReports} />
      <Route path="/data-governance" component={DataGovernance} />
      <Route path="/backup-restore" component={BackupRestore} />
      <Route path="/performance-monitoring" component={PerformanceMonitoring} />
      <Route path="/integration-management" component={IntegrationManagement} />
      <Route path="/oauth-management" component={OAuthManagement} />
      <Route path="/sso" component={SSO} />
      <Route path="/two-factor-auth" component={TwoFactorAuth} />
      <Route path="/access-control" component={AccessControl} />
      <Route path="/feature-flags" component={FeatureFlags} />
      <Route path="/localization" component={Localization} />
      <Route path="/email-configuration" component={EmailConfiguration} />
      <Route path="/notification-settings" component={NotificationSettings} />
      <Route path="/scheduled-tasks" component={ScheduledTasks} />
      <Route path="/system-logs" component={SystemLogs} />
      <Route path="/database-maintenance" component={DatabaseMaintenance} />
      <Route path="/branding-customization" component={BrandingCustomization} />
      <Route path="/license-management" component={LicenseManagement} />
      <Route path="/api-documentation" component={APIDocumentation} />
      <Route path="/webhook-events" component={WebhookEvents} />
      <Route path="/migrations" component={Migrations} />
      <Route path="/deployment-settings" component={DeploymentSettings} />
      <Route path="/security-audit" component={SecurityAudit} />
      <Route path="/cache-management" component={CacheManagement} />
      <Route path="/module-settings" component={ModuleSettings} />
      <Route path="/webhooks" component={Webhooks} />
      <Route path="/developer-tools" component={DeveloperTools} />
      <Route path="/third-party-apps" component={ThirdPartyApps} />
      <Route path="/reporting-configuration" component={ReportingConfiguration} />
      <Route path="/archive-management" component={ArchiveManagement} />
      <Route path="/metrics-and-monitoring" component={MetricsAndMonitoring} />
      <Route path="/resource-allocation" component={ResourceAllocation} />
      <Route path="/api-rate-limit-policy" component={APIRateLimitPolicy} />
      <Route path="/authentication-methods" component={AuthenticationMethods} />
      <Route path="/alerts-and-notifications" component={AlertsAndNotifications} />
      <Route path="/health-check-dashboard" component={HealthCheckDashboard} />
      <Route path="/batch-operations" component={BatchOperations} />
      <Route path="/virtual-assistant" component={VirtualAssistant} />
      <Route path="/mobile-optimization" component={MobileOptimization} />
      <Route path="/accessibility-audit" component={AccessibilityAudit} />
      <Route path="/performance-optimization" component={PerformanceOptimization} />
      <Route path="/internationalization-config" component={InternationalizationConfig} />
      <Route path="/bulk-operations" component={BulkOperations} />
      <Route path="/time-tracking" component={TimeTracking} />
      <Route path="/training-academy" component={TrainingAcademy} />
      <Route path="/work-order" component={WorkOrder} />
      <Route path="/mrp-dashboard" component={MRPDashboard} />
      <Route path="/shop-floor" component={ShopFloor} />
      <Route path="/bpm" component={BPM} />
      <Route path="/compliance-dashboard" component={ComplianceDashboard} />
      <Route path="/payroll-processing" component={PayrollProcessing} />
      <Route path="/hranalytics-dashboard" component={HRAnalyticsDashboard} />
      <Route path="/forecast-dashboard" component={ForecastDashboard} />
      <Route path="/mobile-sync" component={MobileSync} />
      <Route path="/rfqs" component={RFQs} />
      <Route path="/purchase-orders" component={PurchaseOrders} />
      <Route path="/goods-receipt" component={GoodsReceipt} />
      <Route path="/supplier-invoices" component={SupplierInvoices} />
      <Route path="/three-way-match" component={ThreeWayMatch} />
      <Route path="/epics" component={Epics} />
      <Route path="/stories" component={Stories} />
      <Route path="/sprints" component={Sprints} />
      <Route path="/kanban-board" component={KanbanBoard} />
      <Route path="/chart-of-accounts" component={ChartOfAccounts} />
      <Route path="/general-ledger" component={GeneralLedger} />
      <Route path="/ap-invoices" component={APInvoices} />
      <Route path="/ar-invoices" component={ARInvoices} />
      <Route path="/finance-bank-reconciliation" component={BankReconciliationPage} />
      <Route path="/employees-list" component={EmployeesList} />
      <Route path="/payroll-runs" component={PayrollRuns} />
      <Route path="/opportunities-sales" component={OpportunitiesNew} />
      <Route path="/inventory-dashboard" component={InventoryDashboard} />
      <Route path="/work-orders" component={WorkOrdersDashboard} />
      <Route path="/budgeting" component={BudgetingDashboard} />
      <Route path="/tickets" component={TicketsDashboard} />
      <Route path="/campaigns" component={CampaignsDashboard} />
      <Route path="/compliance-risk" component={ComplianceDashboardNew} />
      <Route path="/content-management" component={ContentManagement} />
      <Route path="/admin-console" component={AdminConsole} />
      <Route path="/integration-hub" component={IntegrationHubNew} />
      <Route path="/ai-assistant-advanced" component={AIAssistantAdvanced} />
      <Route path="/advanced-analytics" component={AdvancedAnalytics} />
      <Route path="/multi-tenancy" component={MultiTenancyConfig} />
      <Route path="/security-management" component={SecurityManagement} />
      <Route path="/audit-trails" component={AuditTrails} />
      <Route path="/warehouse-management" component={WarehouseManagement} />
      <Route path="/supplier-management" component={SupplierManagement} />
      <Route path="/customer-loyalty" component={CustomerLoyalty} />
      <Route path="/data-governance" component={DataGovernancePage} />
      <Route path="/business-intelligence" component={BusinessIntelligence} />
      <Route path="/voice-of-customer" component={VoiceOfCustomer} />
      <Route path="/procurement-automation" component={ProcurementAutomation} />
      <Route path="/risk-management" component={RiskManagement} />
      <Route path="/employee-engagement" component={EmployeeEngagement} />
      <Route path="/succession-planning" component={SuccessionPlanning} />
      <Route path="/capacity-planning" component={CapacityPlanning} />
      <Route path="/change-management" component={ChangeManagement} />
      <Route path="/cost-optimization" component={CostOptimization} />
      <Route path="/sustainability-reporting" component={SustainabilityReporting} />
      <Route path="/quality-assurance" component={QualityAssuranceHub} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const style = { "--sidebar-width": "18rem" } as React.CSSProperties;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <SidebarProvider style={style}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1">
                <header className="flex items-center justify-between p-2 border-b">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <ThemeToggle />
                </header>
                <main className="flex-1 overflow-auto">
                  <Suspense fallback={<div className="p-4">Loading...</div>}>
                    <Router />
                  </Suspense>
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
