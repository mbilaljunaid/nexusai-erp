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
