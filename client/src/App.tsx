import { useState, Suspense } from "react";
import { Switch, Route } from "wouter";
import { lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppSidebar } from "@/components/AppSidebar";
import { GlobalSearch } from "@/components/GlobalSearch";
import { TenantSwitcher } from "@/components/TenantSwitcher";
import { AIAssistant, AIAssistantTrigger } from "@/components/AIAssistant";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import NotFound from "@/pages/not-found";

// Lazy load all pages with code splitting
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const CRM = lazy(() => import("@/pages/CRM"));
const Projects = lazy(() => import("@/pages/Projects"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Health = lazy(() => import("@/pages/Health"));
const Settings = lazy(() => import("@/pages/Settings"));
const Industries = lazy(() => import("@/pages/Industries"));
const PlatformAdmin = lazy(() => import("@/pages/admin/PlatformAdmin"));
const TenantAdmin = lazy(() => import("@/pages/admin/TenantAdmin"));
const ERP = lazy(() => import("@/pages/ERP"));
const EPMModule = lazy(() => import("@/pages/EPMModule"));
const HR = lazy(() => import("@/pages/HR"));
const Service = lazy(() => import("@/pages/Service"));
const Marketing = lazy(() => import("@/pages/Marketing"));
const BPM = lazy(() => import("@/pages/BPM"));
const Integrations = lazy(() => import("@/pages/Integrations"));
const Website = lazy(() => import("@/pages/Website"));
const Email = lazy(() => import("@/pages/Email"));
const Ecommerce = lazy(() => import("@/pages/Ecommerce"));
const FormShowcase = lazy(() => import("@/pages/FormShowcase"));
const IndustryConfiguration = lazy(() => import("@/pages/IndustryConfiguration"));
const ComplianceDashboard = lazy(() => import("@/pages/ComplianceDashboard"));
const UATAutomation = lazy(() => import("@/pages/UATAutomation"));
const AdvancedFeatures = lazy(() => import("@/pages/AdvancedFeatures"));
const IntegrationHub = lazy(() => import("@/pages/IntegrationHub"));
const WebsiteBuilder = lazy(() => import("@/pages/WebsiteBuilder"));
const EmailManagement = lazy(() => import("@/pages/EmailManagement"));
const SystemHealth = lazy(() => import("@/pages/SystemHealth"));
const EPMPage = lazy(() => import("@/pages/EPMPage"));
const AIAssistantPage = lazy(() => import("@/pages/AIAssistant"));
const FieldService = lazy(() => import("@/pages/FieldService"));
const Billing = lazy(() => import("@/pages/Billing"));
const Manufacturing = lazy(() => import("@/pages/Manufacturing"));
const ERPAdvanced = lazy(() => import("@/pages/advanced/ERPAdvanced"));
const CRMAdvanced = lazy(() => import("@/pages/advanced/CRMAdvanced"));
const HRAdvanced = lazy(() => import("@/pages/advanced/HRAdvanced"));
const Copilot = lazy(() => import("@/pages/Copilot"));
const Planning = lazy(() => import("@/pages/Planning"));
const Marketplace = lazy(() => import("@/pages/Marketplace"));
const MobileSync = lazy(() => import("@/pages/MobileSync"));
const AIChat = lazy(() => import("@/pages/AIChat"));
const BackendIntegration = lazy(() => import("@/pages/BackendIntegration"));
const LeadDetail = lazy(() => import("@/pages/LeadDetail"));
const InventoryManagement = lazy(() => import("@/pages/InventoryManagement"));
const AccountDirectory = lazy(() => import("@/pages/AccountDirectory"));
const AccountHierarchy = lazy(() => import("@/pages/AccountHierarchy"));
const ActivityTimeline = lazy(() => import("@/pages/ActivityTimeline"));
const ContactDirectory = lazy(() => import("@/pages/ContactDirectory"));
const FinancialReports = lazy(() => import("@/pages/FinancialReports"));
const ForecastDashboard = lazy(() => import("@/pages/ForecastDashboard"));
const GeneralLedger = lazy(() => import("@/pages/GeneralLedger"));
const InvoiceDetail = lazy(() => import("@/pages/InvoiceDetail"));
const InvoiceList = lazy(() => import("@/pages/InvoiceList"));
const LeadConversion = lazy(() => import("@/pages/LeadConversion"));
const LeadScoringDashboard = lazy(() => import("@/pages/LeadScoringDashboard"));
const MRPDashboard = lazy(() => import("@/pages/MRPDashboard"));
const OpportunityDetail = lazy(() => import("@/pages/OpportunityDetail"));
const OpportunityList = lazy(() => import("@/pages/OpportunityList"));
const PurchaseOrder = lazy(() => import("@/pages/PurchaseOrder"));
const QualityControl = lazy(() => import("@/pages/QualityControl"));
const SalesPipeline = lazy(() => import("@/pages/SalesPipeline"));
const ShopFloor = lazy(() => import("@/pages/ShopFloor"));
const VendorManagement = lazy(() => import("@/pages/VendorManagement"));
const WorkOrder = lazy(() => import("@/pages/WorkOrder"));
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
const DashboardBuilder = lazy(() => import("@/pages/DashboardBuilder"));
const ReportBuilder = lazy(() => import("@/pages/ReportBuilder"));
const DataExplorer = lazy(() => import("@/pages/DataExplorer"));
const SalesAnalytics = lazy(() => import("@/pages/SalesAnalytics"));
const FinancialAnalytics = lazy(() => import("@/pages/FinancialAnalytics"));
const OperationalAnalytics = lazy(() => import("@/pages/OperationalAnalytics"));
const PredictiveAnalytics = lazy(() => import("@/pages/PredictiveAnalytics"));
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
const ServiceLevelConfig = lazy(() => import("@/pages/ServiceLevelConfig"));
const MobileAppSettings = lazy(() => import("@/pages/MobileAppSettings"));
const VirtualAssistant = lazy(() => import("@/pages/VirtualAssistant"));
const PlatformStatus = lazy(() => import("@/pages/PlatformStatus"));
const MobileOptimization = lazy(() => import("@/pages/MobileOptimization"));
const AccessibilityAudit = lazy(() => import("@/pages/AccessibilityAudit"));
const InvoiceGenerator = lazy(() => import("@/pages/InvoiceGenerator"));
const QuoteBuilder = lazy(() => import("@/pages/QuoteBuilder"));
const ApprovalWorkflow = lazy(() => import("@/pages/ApprovalWorkflow"));
const PaymentFlow = lazy(() => import("@/pages/PaymentFlow"));
const VendorInvoiceEntry = lazy(() => import("@/pages/VendorInvoiceEntry"));
const BankReconciliation = lazy(() => import("@/pages/BankReconciliation"));
const PaymentScheduling = lazy(() => import("@/pages/PaymentScheduling"));
const AgingReport = lazy(() => import("@/pages/AgingReport"));
const PerformanceOptimization = lazy(() => import("@/pages/PerformanceOptimization"));
const InternationalizationConfig = lazy(() => import("@/pages/InternationalizationConfig"));
const AdvancedSearch = lazy(() => import("@/pages/AdvancedSearch"));
const BulkOperations = lazy(() => import("@/pages/BulkOperations"));
const DuplicateDetection = lazy(() => import("@/pages/DuplicateDetection"));
const DataValidation = lazy(() => import("@/pages/DataValidation"));
const RecommendationEngine = lazy(() => import("@/pages/RecommendationEngine"));
const AdvancedReporting = lazy(() => import("@/pages/AdvancedReporting"));
const GeolocationServices = lazy(() => import("@/pages/GeolocationServices"));
const CollaborationTools = lazy(() => import("@/pages/CollaborationTools"));
const NotificationCenter = lazy(() => import("@/pages/NotificationCenter"));
const PredictiveLeadScoring = lazy(() => import("@/pages/PredictiveLeadScoring"));
const CustomerJourneyMap = lazy(() => import("@/pages/CustomerJourneyMap"));
const CompetitorAnalysis = lazy(() => import("@/pages/CompetitorAnalysis"));
const RealTimeNotifications = lazy(() => import("@/pages/RealTimeNotifications"));
const TemplateLibrary = lazy(() => import("@/pages/TemplateLibrary"));
const QualityAssurance = lazy(() => import("@/pages/QualityAssurance"));
const GrowthMetrics = lazy(() => import("@/pages/GrowthMetrics"));
const CustomerSuccessPanel = lazy(() => import("@/pages/CustomerSuccessPanel"));
const AdvancedPermissions = lazy(() => import("@/pages/AdvancedPermissions"));
const AdvancedEncryption = lazy(() => import("@/pages/AdvancedEncryption"));
const MultiTenancy = lazy(() => import("@/pages/MultiTenancy"));
const APIVersioning = lazy(() => import("@/pages/APIVersioning"));
const CustomWorkflows = lazy(() => import("@/pages/CustomWorkflows"));
const TimeTracking = lazy(() => import("@/pages/TimeTracking"));
const ExpenseTracking = lazy(() => import("@/pages/ExpenseTracking"));
const ProcurementManagement = lazy(() => import("@/pages/ProcurementManagement"));
const ContractManagement = lazy(() => import("@/pages/ContractManagement"));
const SupplyChainOptimization = lazy(() => import("@/pages/SupplyChainOptimization"));
const AssetManagement = lazy(() => import("@/pages/AssetManagement"));
const CommunityForum = lazy(() => import("@/pages/CommunityForum"));
const TrainingAcademy = lazy(() => import("@/pages/TrainingAcademy"));

const PageLoader = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-sm text-muted-foreground">Loading page...</p>
    </div>
  </div>
);

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/crm" component={CRM} />
        <Route path="/projects" component={Projects} />
        <Route path="/analytics-legacy" component={Analytics} />
        <Route path="/health" component={Health} />
        <Route path="/settings" component={Settings} />
        <Route path="/industries" component={Industries} />
        <Route path="/industry-config" component={IndustryConfiguration} />
        <Route path="/admin/platform" component={PlatformAdmin} />
        <Route path="/admin/tenant" component={TenantAdmin} />
        <Route path="/erp" component={ERP} />
        <Route path="/manufacturing" component={Manufacturing} />
        <Route path="/epm" component={EPMPage} />
        <Route path="/hr" component={HR} />
        <Route path="/service" component={Service} />
        <Route path="/marketing" component={Marketing} />
        <Route path="/compliance" component={ComplianceDashboard} />
        <Route path="/bpm" component={BPM} />
        <Route path="/integrations" component={IntegrationHub} />
        <Route path="/website" component={WebsiteBuilder} />
        <Route path="/email" component={EmailManagement} />
        <Route path="/ecommerce" component={Ecommerce} />
        <Route path="/forms" component={FormShowcase} />
        <Route path="/uat" component={UATAutomation} />
        <Route path="/advanced" component={AdvancedFeatures} />
        <Route path="/system-health" component={SystemHealth} />
        <Route path="/copilot" component={Copilot} />
        <Route path="/field-service" component={FieldService} />
        <Route path="/planning" component={Planning} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/mobile-sync" component={MobileSync} />
        <Route path="/ai-chat" component={AIChat} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/billing" component={Billing} />
        <Route path="/erp-advanced" component={ERPAdvanced} />
        <Route path="/backend-integration" component={BackendIntegration} />
        <Route path="/crm-advanced" component={CRMAdvanced} />
        <Route path="/hr-advanced" component={HRAdvanced} />
        <Route path="/leads/:id" component={LeadDetail} />
        <Route path="/lead-detail" component={LeadDetail} />
        <Route path="/inventory" component={InventoryManagement} />
        <Route path="/opportunities" component={OpportunityList} />
        <Route path="/opportunity/:id" component={OpportunityDetail} />
        <Route path="/sales-pipeline" component={SalesPipeline} />
        <Route path="/forecast" component={ForecastDashboard} />
        <Route path="/accounts" component={AccountDirectory} />
        <Route path="/account-hierarchy" component={AccountHierarchy} />
        <Route path="/contacts" component={ContactDirectory} />
        <Route path="/activity-timeline" component={ActivityTimeline} />
        <Route path="/lead-scoring" component={LeadScoringDashboard} />
        <Route path="/lead-conversion" component={LeadConversion} />
        <Route path="/invoice-generator" component={InvoiceGenerator} />
        <Route path="/quote-builder" component={QuoteBuilder} />
        <Route path="/approval-workflow" component={ApprovalWorkflow} />
        <Route path="/payment-flow" component={PaymentFlow} />
        <Route path="/vendor-invoice-entry" component={VendorInvoiceEntry} />
        <Route path="/bank-reconciliation" component={BankReconciliation} />
        <Route path="/payment-scheduling" component={PaymentScheduling} />
        <Route path="/aging-report" component={AgingReport} />
        <Route path="/invoices" component={InvoiceList} />
        <Route path="/invoice/:id" component={InvoiceDetail} />
        <Route path="/purchase-orders" component={PurchaseOrder} />
        <Route path="/vendors" component={VendorManagement} />
        <Route path="/general-ledger" component={GeneralLedger} />
        <Route path="/financial-reports" component={FinancialReports} />
        <Route path="/work-orders" component={WorkOrder} />
        <Route path="/mrp" component={MRPDashboard} />
        <Route path="/shop-floor" component={ShopFloor} />
        <Route path="/quality-control" component={QualityControl} />
        <Route path="/employees" component={EmployeeDirectory} />
        <Route path="/org-chart" component={OrgChart} />
        <Route path="/leave-request" component={LeaveRequest} />
        <Route path="/leave-approval" component={LeaveApproval} />
        <Route path="/attendance" component={AttendanceDashboard} />
        <Route path="/payroll" component={PayrollProcessing} />
        <Route path="/compensation" component={CompensationManagement} />
        <Route path="/performance-reviews" component={PerformanceReviews} />
        <Route path="/talent-pool" component={TalentPool} />
        <Route path="/hr-analytics" component={HRAnalyticsDashboard} />
        <Route path="/service-tickets" component={ServiceTicket} />
        <Route path="/ticket-dashboard" component={TicketDashboard} />
        <Route path="/sla-tracking" component={SLATracking} />
        <Route path="/knowledge-base" component={KnowledgeBase} />
        <Route path="/customer-portal" component={CustomerPortal} />
        <Route path="/service-analytics" component={ServiceAnalytics} />
        <Route path="/team-utilization" component={TeamUtilization} />
        <Route path="/response-analytics" component={ResponseAnalytics} />
        <Route path="/dashboard-builder" component={DashboardBuilder} />
        <Route path="/report-builder" component={ReportBuilder} />
        <Route path="/data-explorer" component={DataExplorer} />
        <Route path="/sales-analytics" component={SalesAnalytics} />
        <Route path="/financial-analytics" component={FinancialAnalytics} />
        <Route path="/operational-analytics" component={OperationalAnalytics} />
        <Route path="/predictive-analytics" component={PredictiveAnalytics} />
        <Route path="/lead-scoring-analytics" component={LeadScoringAnalytics} />
        <Route path="/revenue-forecasting" component={RevenueForecasting} />
        <Route path="/churn-risk" component={ChurnRiskAnalysis} />
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
        <Route path="/system-health" component={SystemHealth} />
        <Route path="/backup-restore" component={BackupRestore} />
        <Route path="/performance-monitoring" component={PerformanceMonitoring} />
        <Route path="/integration-management" component={IntegrationManagement} />
        <Route path="/oauth-management" component={OAuthManagement} />
        <Route path="/sso" component={SSO} />
        <Route path="/two-factor-auth" component={TwoFactorAuth} />
        <Route path="/access-control" component={AccessControl} />
        <Route path="/feature-flags" component={FeatureFlags} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/localization" component={Localization} />
        <Route path="/email-config" component={EmailConfiguration} />
        <Route path="/notifications" component={NotificationSettings} />
        <Route path="/scheduled-tasks-config" component={ScheduledTasks} />
        <Route path="/system-logs" component={SystemLogs} />
        <Route path="/database-maintenance" component={DatabaseMaintenance} />
        <Route path="/branding" component={BrandingCustomization} />
        <Route path="/license" component={LicenseManagement} />
        <Route path="/api-docs" component={APIDocumentation} />
        <Route path="/webhook-events" component={WebhookEvents} />
        <Route path="/migrations" component={Migrations} />
        <Route path="/deployment-settings" component={DeploymentSettings} />
        <Route path="/security-audit" component={SecurityAudit} />
        <Route path="/cache-management" component={CacheManagement} />
        <Route path="/module-settings" component={ModuleSettings} />
        <Route path="/webhooks" component={Webhooks} />
        <Route path="/developer-tools" component={DeveloperTools} />
        <Route path="/third-party-apps" component={ThirdPartyApps} />
        <Route path="/reporting-config" component={ReportingConfiguration} />
        <Route path="/archive-management" component={ArchiveManagement} />
        <Route path="/metrics-monitoring" component={MetricsAndMonitoring} />
        <Route path="/resource-allocation" component={ResourceAllocation} />
        <Route path="/api-rate-limit-policy" component={APIRateLimitPolicy} />
        <Route path="/auth-methods" component={AuthenticationMethods} />
        <Route path="/alerts-notifications" component={AlertsAndNotifications} />
        <Route path="/health-check" component={HealthCheckDashboard} />
        <Route path="/batch-operations" component={BatchOperations} />
        <Route path="/service-level-config" component={ServiceLevelConfig} />
        <Route path="/mobile-app-settings" component={MobileAppSettings} />
        <Route path="/virtual-assistant" component={VirtualAssistant} />
        <Route path="/platform-status" component={PlatformStatus} />
        <Route path="/mobile-optimization" component={MobileOptimization} />
        <Route path="/accessibility-audit" component={AccessibilityAudit} />
        <Route path="/performance-optimization" component={PerformanceOptimization} />
        <Route path="/i18n-config" component={InternationalizationConfig} />
        <Route path="/advanced-search" component={AdvancedSearch} />
        <Route path="/bulk-ops" component={BulkOperations} />
        <Route path="/duplicate-detection" component={DuplicateDetection} />
        <Route path="/data-validation" component={DataValidation} />
        <Route path="/recommendation-engine" component={RecommendationEngine} />
        <Route path="/advanced-reporting" component={AdvancedReporting} />
        <Route path="/geolocation" component={GeolocationServices} />
        <Route path="/collaboration" component={CollaborationTools} />
        <Route path="/notifications" component={NotificationCenter} />
        <Route path="/lead-scoring-ml" component={PredictiveLeadScoring} />
        <Route path="/customer-journey" component={CustomerJourneyMap} />
        <Route path="/competitor-analysis" component={CompetitorAnalysis} />
        <Route path="/realtime-notifications" component={RealTimeNotifications} />
        <Route path="/templates" component={TemplateLibrary} />
        <Route path="/qa-dashboard" component={QualityAssurance} />
        <Route path="/growth-metrics" component={GrowthMetrics} />
        <Route path="/customer-success" component={CustomerSuccessPanel} />
        <Route path="/advanced-permissions" component={AdvancedPermissions} />
        <Route path="/advanced-encryption" component={AdvancedEncryption} />
        <Route path="/multi-tenancy" component={MultiTenancy} />
        <Route path="/api-versioning" component={APIVersioning} />
        <Route path="/custom-workflows" component={CustomWorkflows} />
        <Route path="/time-tracking" component={TimeTracking} />
        <Route path="/expense-tracking" component={ExpenseTracking} />
        <Route path="/procurement" component={ProcurementManagement} />
        <Route path="/contracts" component={ContractManagement} />
        <Route path="/supply-chain" component={SupplyChainOptimization} />
        <Route path="/assets" component={AssetManagement} />
        <Route path="/knowledge-base" component={KnowledgeBase} />
        <Route path="/community-forum" component={CommunityForum} />
        <Route path="/training-academy" component={TrainingAcademy} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function AppLayout() {
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [currentTenant, setCurrentTenant] = useState("acme");

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-4 h-14 px-4 border-b bg-background shrink-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <TenantSwitcher currentTenant={currentTenant} onTenantChange={setCurrentTenant} />
              <div className="text-xs text-muted-foreground font-medium px-2 py-1 rounded bg-muted hidden md:block">
                US • English
              </div>
              <GlobalSearch />
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="text-xs hidden md:flex" data-testid="button-industry-context">
                Manufacturing
              </Button>
              <Button variant="ghost" size="icon" data-testid="button-notifications">
                <Bell className="h-4 w-4" />
              </Button>
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Router />
          </main>
        </div>
      </div>
      
      {!aiAssistantOpen && (
        <AIAssistantTrigger onClick={() => setAiAssistantOpen(true)} />
      )}
      <AIAssistant 
        isOpen={aiAssistantOpen} 
        onClose={() => setAiAssistantOpen(false)} 
      />
    </SidebarProvider>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="nexusai-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <AppLayout />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;