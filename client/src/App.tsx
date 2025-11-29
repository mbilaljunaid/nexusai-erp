import { useState } from "react";
import { Switch, Route } from "wouter";
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
import Dashboard from "@/pages/Dashboard";
import CRM from "@/pages/CRM";
import Projects from "@/pages/Projects";
import Analytics from "@/pages/Analytics";
import Health from "@/pages/Health";
import Settings from "@/pages/Settings";
import Industries from "@/pages/Industries";
import PlatformAdmin from "@/pages/admin/PlatformAdmin";
import TenantAdmin from "@/pages/admin/TenantAdmin";
import ERP from "@/pages/ERP";
import EPMModule from "@/pages/EPMModule";
import HR from "@/pages/HR";
import Service from "@/pages/Service";
import Marketing from "@/pages/Marketing";
import BPM from "@/pages/BPM";
import Integrations from "@/pages/Integrations";
import Website from "@/pages/Website";
import Email from "@/pages/Email";
import Ecommerce from "@/pages/Ecommerce";
import FormShowcase from "@/pages/FormShowcase";
import IndustryConfiguration from "@/pages/IndustryConfiguration";
import ComplianceDashboard from "@/pages/ComplianceDashboard";
import UATAutomation from "@/pages/UATAutomation";
import AdvancedFeatures from "@/pages/AdvancedFeatures";
import IntegrationHub from "@/pages/IntegrationHub";
import WebsiteBuilder from "@/pages/WebsiteBuilder";
import EmailManagement from "@/pages/EmailManagement";
import SystemHealth from "@/pages/SystemHealth";
import EPMPage from "@/pages/EPMPage";
import AIAssistantPage from "@/pages/AIAssistant";
import FieldService from "@/pages/FieldService";
import Billing from "@/pages/Billing";
import Manufacturing from "@/pages/Manufacturing";
import ERPAdvanced from "@/pages/advanced/ERPAdvanced";
import CRMAdvanced from "@/pages/advanced/CRMAdvanced";
import HRAdvanced from "@/pages/advanced/HRAdvanced";
import Copilot from "@/pages/Copilot";
import Planning from "@/pages/Planning";
import Marketplace from "@/pages/Marketplace";
import MobileSync from "@/pages/MobileSync";
import AIChat from "@/pages/AIChat";
import BackendIntegration from "@/pages/BackendIntegration";
import LeadDetail from "@/pages/LeadDetail";
import InventoryManagement from "@/pages/InventoryManagement";
import AccountDirectory from "@/pages/AccountDirectory";
import AccountHierarchy from "@/pages/AccountHierarchy";
import ActivityTimeline from "@/pages/ActivityTimeline";
import ContactDirectory from "@/pages/ContactDirectory";
import FinancialReports from "@/pages/FinancialReports";
import ForecastDashboard from "@/pages/ForecastDashboard";
import GeneralLedger from "@/pages/GeneralLedger";
import InvoiceDetail from "@/pages/InvoiceDetail";
import InvoiceList from "@/pages/InvoiceList";
import LeadConversion from "@/pages/LeadConversion";
import LeadScoringDashboard from "@/pages/LeadScoringDashboard";
import MRPDashboard from "@/pages/MRPDashboard";
import OpportunityDetail from "@/pages/OpportunityDetail";
import OpportunityList from "@/pages/OpportunityList";
import PurchaseOrder from "@/pages/PurchaseOrder";
import QualityControl from "@/pages/QualityControl";
import SalesPipeline from "@/pages/SalesPipeline";
import ShopFloor from "@/pages/ShopFloor";
import VendorManagement from "@/pages/VendorManagement";
import WorkOrder from "@/pages/WorkOrder";
import EmployeeDirectory from "@/pages/EmployeeDirectory";
import OrgChart from "@/pages/OrgChart";
import LeaveRequest from "@/pages/LeaveRequest";
import LeaveApproval from "@/pages/LeaveApproval";
import AttendanceDashboard from "@/pages/AttendanceDashboard";
import PayrollProcessing from "@/pages/PayrollProcessing";
import CompensationManagement from "@/pages/CompensationManagement";
import PerformanceReviews from "@/pages/PerformanceReviews";
import TalentPool from "@/pages/TalentPool";
import HRAnalyticsDashboard from "@/pages/HRAnalyticsDashboard";
import ServiceTicket from "@/pages/ServiceTicket";
import TicketDashboard from "@/pages/TicketDashboard";
import SLATracking from "@/pages/SLATracking";
import KnowledgeBase from "@/pages/KnowledgeBase";
import CustomerPortal from "@/pages/CustomerPortal";
import ServiceAnalytics from "@/pages/ServiceAnalytics";
import TeamUtilization from "@/pages/TeamUtilization";
import ResponseAnalytics from "@/pages/ResponseAnalytics";
import DashboardBuilder from "@/pages/DashboardBuilder";
import ReportBuilder from "@/pages/ReportBuilder";
import DataExplorer from "@/pages/DataExplorer";
import SalesAnalytics from "@/pages/SalesAnalytics";
import FinancialAnalytics from "@/pages/FinancialAnalytics";
import OperationalAnalytics from "@/pages/OperationalAnalytics";
import PredictiveAnalytics from "@/pages/PredictiveAnalytics";
import LeadScoringAnalytics from "@/pages/LeadScoringAnalytics";
import RevenueForecasting from "@/pages/RevenueForecasting";
import ChurnRiskAnalysis from "@/pages/ChurnRiskAnalysis";
import ExportManager from "@/pages/ExportManager";
import ScheduledReports from "@/pages/ScheduledReports";
import WorkflowBuilder from "@/pages/WorkflowBuilder";
import WorkflowTemplates from "@/pages/WorkflowTemplates";
import WorkflowExecution from "@/pages/WorkflowExecution";
import APIManagement from "@/pages/APIManagement";
import WebhookManagement from "@/pages/WebhookManagement";
import APILogs from "@/pages/APILogs";
import RateLimiting from "@/pages/RateLimiting";
import AppStore from "@/pages/AppStore";
import InstalledApps from "@/pages/InstalledApps";
import SystemSettings from "@/pages/SystemSettings";
import UserManagement from "@/pages/UserManagement";
import RoleManagement from "@/pages/RoleManagement";
import PermissionMatrix from "@/pages/PermissionMatrix";
import CustomFields from "@/pages/CustomFields";
import FieldValidation from "@/pages/FieldValidation";
import DataImport from "@/pages/DataImport";
import DataExport from "@/pages/DataExport";
import DataCleanup from "@/pages/DataCleanup";
import AuditLogs from "@/pages/AuditLogs";
import ComplianceReports from "@/pages/ComplianceReports";
import DataGovernance from "@/pages/DataGovernance";
import BackupRestore from "@/pages/BackupRestore";
import PerformanceMonitoring from "@/pages/PerformanceMonitoring";
import IntegrationManagement from "@/pages/IntegrationManagement";
import OAuthManagement from "@/pages/OAuthManagement";
import SSO from "@/pages/SSO";
import TwoFactorAuth from "@/pages/TwoFactorAuth";
import AccessControl from "@/pages/AccessControl";
import FeatureFlags from "@/pages/FeatureFlags";
import Marketplace from "@/pages/Marketplace";
import Localization from "@/pages/Localization";
import EmailConfiguration from "@/pages/EmailConfiguration";
import NotificationSettings from "@/pages/NotificationSettings";
import ScheduledTasks from "@/pages/ScheduledTasks";
import SystemLogs from "@/pages/SystemLogs";
import DatabaseMaintenance from "@/pages/DatabaseMaintenance";
import BrandingCustomization from "@/pages/BrandingCustomization";
import LicenseManagement from "@/pages/LicenseManagement";
import APIDocumentation from "@/pages/APIDocumentation";
import WebhookEvents from "@/pages/WebhookEvents";
import Migrations from "@/pages/Migrations";
import DeploymentSettings from "@/pages/DeploymentSettings";
import SecurityAudit from "@/pages/SecurityAudit";
import CacheManagement from "@/pages/CacheManagement";
import ModuleSettings from "@/pages/ModuleSettings";
import Webhooks from "@/pages/Webhooks";
import DeveloperTools from "@/pages/DeveloperTools";
import ThirdPartyApps from "@/pages/ThirdPartyApps";
import ReportingConfiguration from "@/pages/ReportingConfiguration";
import ArchiveManagement from "@/pages/ArchiveManagement";
import MetricsAndMonitoring from "@/pages/MetricsAndMonitoring";
import ResourceAllocation from "@/pages/ResourceAllocation";
import APIRateLimitPolicy from "@/pages/APIRateLimitPolicy";
import AuthenticationMethods from "@/pages/AuthenticationMethods";
import AlertsAndNotifications from "@/pages/AlertsAndNotifications";
import HealthCheckDashboard from "@/pages/HealthCheckDashboard";
import BatchOperations from "@/pages/BatchOperations";
import ServiceLevelConfig from "@/pages/ServiceLevelConfig";
import MobileAppSettings from "@/pages/MobileAppSettings";
import VirtualAssistant from "@/pages/VirtualAssistant";
import PlatformStatus from "@/pages/PlatformStatus";
import MobileOptimization from "@/pages/MobileOptimization";
import AccessibilityAudit from "@/pages/AccessibilityAudit";
import PerformanceOptimization from "@/pages/PerformanceOptimization";
import InternationalizationConfig from "@/pages/InternationalizationConfig";
import AdvancedSearch from "@/pages/AdvancedSearch";
import BulkOperations from "@/pages/BulkOperations";
import DuplicateDetection from "@/pages/DuplicateDetection";
import DataValidation from "@/pages/DataValidation";
import RecommendationEngine from "@/pages/RecommendationEngine";
import AdvancedReporting from "@/pages/AdvancedReporting";
import GeolocationServices from "@/pages/GeolocationServices";
import CollaborationTools from "@/pages/CollaborationTools";
import NotificationCenter from "@/pages/NotificationCenter";
import PredictiveLeadScoring from "@/pages/PredictiveLeadScoring";
import CustomerJourneyMap from "@/pages/CustomerJourneyMap";
import CompetitorAnalysis from "@/pages/CompetitorAnalysis";
import RealTimeNotifications from "@/pages/RealTimeNotifications";
import TemplateLibrary from "@/pages/TemplateLibrary";
import QualityAssurance from "@/pages/QualityAssurance";
import GrowthMetrics from "@/pages/GrowthMetrics";
import CustomerSuccessPanel from "@/pages/CustomerSuccessPanel";
import AdvancedPermissions from "@/pages/AdvancedPermissions";
import AdvancedEncryption from "@/pages/AdvancedEncryption";
import MultiTenancy from "@/pages/MultiTenancy";
import APIVersioning from "@/pages/APIVersioning";
import CustomWorkflows from "@/pages/CustomWorkflows";
import TimeTracking from "@/pages/TimeTracking";
import ExpenseTracking from "@/pages/ExpenseTracking";
import ProcurementManagement from "@/pages/ProcurementManagement";
import ContractManagement from "@/pages/ContractManagement";
import SupplyChainOptimization from "@/pages/SupplyChainOptimization";
import AssetManagement from "@/pages/AssetManagement";
import KnowledgeBase from "@/pages/KnowledgeBase";
import CommunityForum from "@/pages/CommunityForum";
import TrainingAcademy from "@/pages/TrainingAcademy";
import NotFound from "@/pages/not-found";

function Router() {
  return (
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
