import { Switch, Route, useLocation } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar"; // removed unused SidebarTrigger
import GlobalLayout from "@/components/GlobalLayout"; // default import
// import { AppSidebar } from "@/components/AppSidebar"; // removed unused import
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RBACProvider } from "@/components/RBACContext";
import { TourProvider } from "@/hooks/use-tour";
import { GuidedTourOverlay } from "@/components/GuidedTour";
import { HelpButton } from "@/components/HelpButton";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { WhatsNew } from "@/components/WhatsNew";
import { NotificationCenter as NotificationCenterWidget } from "@/components/NotificationCenter";
import { QuickTipsProvider } from "@/components/QuickTips"; // restored
import { AIChatWidget } from "@/components/AIChatWidget";
import { LedgerProvider } from "@/context/LedgerContext";
import { LedgerSelector } from "@/components/LedgerSelector";
import NotFound from "@/pages/not-found";
// Imports fixed

// Landing Page
const LandingPage = lazy(() => import("@/pages/LandingPage"));

// Public Pages (resolve 404s)
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const BlogPostPage = lazy(() => import("@/pages/BlogPostPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const DemoManagement = lazy(() => import("@/pages/DemoManagement"));
const UseCases = lazy(() => import("@/pages/UseCases"));
const IndustriesPage = lazy(() => import("@/pages/IndustriesPage"));
const IndustryDetail = lazy(() => import("@/pages/IndustryDetail"));
const ModuleDetail = lazy(() => import("@/pages/ModuleDetail"));
const IndustrySetup = lazy(() => import("@/pages/IndustrySetup"));
const EnvironmentManagement = lazy(() => import("@/pages/EnvironmentManagement"));
const SubscriptionManagement = lazy(() => import("@/pages/SubscriptionManagement"));
const BillingManagement = lazy(() => import("@/pages/BillingManagement"));

// Core pages
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const CRM = lazy(() => import("@/pages/CRM"));
const ERP = lazy(() => import("@/pages/ERP"));
const AccountsPayable = lazy(() => import("@/pages/AccountsPayable"));
const AccountsReceivable = lazy(() => import("@/pages/AccountsReceivable"));
const HR = lazy(() => import("@/pages/HR"));
const Projects = lazy(() => import("@/pages/Projects"));

// Phase 2: Module Overviews
const CRMModule = lazy(() => import("@/pages/CRMModule"));
const FinanceModule = lazy(() => import("@/pages/FinanceModule"));
const CloseDashboard = lazy(() => import("@/pages/gl/CloseDashboard")); // Added Chunk 6
const HRModule = lazy(() => import("@/pages/HRModule"));
const ERPModule = lazy(() => import("@/pages/ERPModule"));
const ServiceModule = lazy(() => import("@/pages/ServiceModule"));

// Phase 3: Advanced Modules
const ProjectsModule = lazy(() => import("@/pages/ProjectsModule"));
const MarketingModule = lazy(() => import("@/pages/MarketingModule"));
const ManufacturingModule = lazy(() => import("@/pages/ManufacturingModule"));
const ManufacturingDashboard = lazy(() => import("@/pages/manufacturing/ManufacturingDashboard"));
const BOMDesigner = lazy(() => import("@/pages/manufacturing/BOMDesigner"));
const RoutingEditor = lazy(() => import("@/pages/manufacturing/RoutingEditor"));
const WorkCenterManager = lazy(() => import("@/pages/manufacturing/WorkCenterManager"));
const ResourceManager = lazy(() => import("@/pages/manufacturing/ResourceManager"));
const WorkOrderList = lazy(() => import("@/pages/manufacturing/WorkOrderList"));
const ShopFloorTerminal = lazy(() => import("@/pages/manufacturing/ShopFloorTerminal"));
const QualityManager = lazy(() => import("@/pages/manufacturing/QualityManager"));
const MRPWorkbench = lazy(() => import("@/pages/manufacturing/MRPWorkbench"));
const ProductionGantt = lazy(() => import("@/pages/manufacturing/ProductionGantt"));
const CalendarManager = lazy(() => import("@/pages/manufacturing/CalendarManager")); // L8
const StandardOpLibrary = lazy(() => import("@/pages/manufacturing/StandardOpLibrary")); // L9
const CostingWorkbench = lazy(() => import("@/pages/manufacturing/CostingWorkbench")); // L20
const WIPDashboard = lazy(() => import("@/pages/manufacturing/WIPDashboard")); // L20
const MFGVarianceAnalysis = lazy(() => import("@/pages/manufacturing/VarianceAnalysis")); // L20
const FormulaDesigner = lazy(() => import("@/pages/manufacturing/FormulaDesigner")); // Phase 22
const RecipeManager = lazy(() => import("@/pages/manufacturing/RecipeManager")); // Phase 25
const BatchWorkbench = lazy(() => import("@/pages/manufacturing/BatchWorkbench")); // Phase 22
const BatchGenealogy = lazy(() => import("@/pages/manufacturing/BatchGenealogy")); // Phase 24
const AnalyticsModule = lazy(() => import("@/pages/AnalyticsModule"));
const AdminConsoleModule = lazy(() => import("@/pages/AdminConsoleModule"));
const ComplianceModule = lazy(() => import("@/pages/ComplianceModule"));

// Reports & Analytics
const Reports = lazy(() => import("@/pages/Reports"));
const FeaturesComparison = lazy(() => import("@/pages/FeaturesComparison"));

// Phase 1: Enterprise Foundation (8 pages)
const TenantAdmin = lazy(() => import("@/pages/TenantAdmin"));
const PlatformAdmin = lazy(() => import("@/pages/admin/PlatformAdmin"));
const AccessControl = lazy(() => import("@/pages/admin/AccessControl"));
const AdminRoles = lazy(() => import("@/pages/AdminRoles"));
const APIGateway = lazy(() => import("@/pages/APIGateway"));
const InvoiceGenerator = lazy(() => import("@/pages/InvoiceGenerator"));
const QuoteBuilder = lazy(() => import("@/pages/QuoteBuilder"));
const ApprovalWorkflow = lazy(() => import("@/pages/ApprovalWorkflow"));
const PaymentFlow = lazy(() => import("@/pages/PaymentFlow"));

// Authenticated Process Pages - Phase 1, 2, 3
const ProcessHub = lazy(() => import("@/pages/processes/ProcessHub"));
const ProcureToPayProcess = lazy(() => import("@/pages/processes/pages/ProcureToPayProcess"));
const OrderToCashProcess = lazy(() => import("@/pages/processes/pages/OrderToCashProcess"));
const HireToRetireProcess = lazy(() => import("@/pages/processes/pages/HireToRetireProcess"));
const MonthEndConsolidationProcess = lazy(() => import("@/pages/processes/pages/MonthEndConsolidationProcess"));
const ComplianceRiskProcess = lazy(() => import("@/pages/processes/pages/ComplianceRiskProcess"));
const InventoryManagementProcess = lazy(() => import("@/pages/processes/pages/InventoryManagementProcess"));
const FixedAssetLifecycleProcess = lazy(() => import("@/pages/processes/pages/FixedAssetLifecycleProcess"));
const ProductionPlanningProcess = lazy(() => import("@/pages/processes/pages/ProductionPlanningProcess"));
const MRPProcess = lazy(() => import("@/pages/processes/pages/MRPProcess"));
const QualityAssuranceProcess = lazy(() => import("@/pages/processes/pages/QualityAssuranceProcess"));
const ContractManagementProcess = lazy(() => import("@/pages/processes/pages/ContractManagementProcess"));
const BudgetPlanningProcess = lazy(() => import("@/pages/processes/pages/BudgetPlanningProcess"));
const DemandPlanningProcess = lazy(() => import("@/pages/processes/pages/DemandPlanningProcess"));
const CapacityPlanningProcess = lazy(() => import("@/pages/processes/pages/CapacityPlanningProcess"));
const WarehouseManagementProcess = lazy(() => import("@/pages/processes/pages/WarehouseManagementProcess"));
const CustomerReturnsProcess = lazy(() => import("@/pages/processes/pages/CustomerReturnsProcess"));
const VendorPerformanceProcess = lazy(() => import("@/pages/processes/pages/VendorPerformanceProcess"));
const SubscriptionBillingProcess = lazy(() => import("@/pages/processes/pages/SubscriptionBillingProcess"));

// Public Process Pages
const PublicProcessHub = lazy(() => import("@/pages/public/processes/PublicProcessHub"));
const PublicProcureToPayProcess = lazy(() => import("@/pages/public/processes/pages/PublicProcureToPayProcess"));
const PublicOrderToCashProcess = lazy(() => import("@/pages/public/processes/pages/PublicOrderToCashProcess"));
const PublicHireToRetireProcess = lazy(() => import("@/pages/public/processes/pages/PublicHireToRetireProcess"));
const PublicMonthEndProcess = lazy(() => import("@/pages/public/processes/pages/PublicMonthEndProcess"));
const PublicComplianceProcess = lazy(() => import("@/pages/public/processes/pages/PublicComplianceProcess"));
const PublicInventoryProcess = lazy(() => import("@/pages/public/processes/pages/PublicInventoryProcess"));
const PublicFixedAssetProcess = lazy(() => import("@/pages/public/processes/pages/PublicFixedAssetProcess"));
const PublicProductionProcess = lazy(() => import("@/pages/public/processes/pages/PublicProductionProcess"));
const PublicMRPProcess = lazy(() => import("@/pages/public/processes/pages/PublicMRPProcess"));
const PublicQualityProcess = lazy(() => import("@/pages/public/processes/pages/PublicQualityProcess"));
const PublicContractProcess = lazy(() => import("@/pages/public/processes/pages/PublicContractProcess"));
const PublicBudgetProcess = lazy(() => import("@/pages/public/processes/pages/PublicBudgetProcess"));
const PublicDemandProcess = lazy(() => import("@/pages/public/processes/pages/PublicDemandProcess"));
const PublicCapacityProcess = lazy(() => import("@/pages/public/processes/pages/PublicCapacityProcess"));
const PublicWarehouseProcess = lazy(() => import("@/pages/public/processes/pages/PublicWarehouseProcess"));
const PublicCustomerReturnsProcess = lazy(() => import("@/pages/public/processes/pages/PublicCustomerReturnsProcess"));
const PublicVendorPerformanceProcess = lazy(() => import("@/pages/public/processes/pages/PublicVendorPerformanceProcess"));
const PublicSubscriptionBillingProcess = lazy(() => import("@/pages/public/processes/pages/PublicSubscriptionBillingProcess"));

// Public Documentation Pages
const ProcessFlowsPage = lazy(() => import("@/pages/public/documentation/ProcessFlowsPage"));
const TrainingGuidesPage = lazy(() => import("@/pages/public/documentation/TrainingGuidesPage"));
const TechnicalDocumentationPage = lazy(() => import("@/pages/public/documentation/TechnicalDocumentationPage"));
const ImplementationGuidelinesPage = lazy(() => import("@/pages/public/documentation/ImplementationGuidelinesPage"));
const TrainingGuideCRM = lazy(() => import("@/pages/public/documentation/TrainingGuideCRM"));
const TrainingGuideFinance = lazy(() => import("@/pages/public/documentation/TrainingGuideFinance"));
const TrainingGuideInventory = lazy(() => import("@/pages/public/documentation/TrainingGuideInventory"));
const TrainingGuideManufacturing = lazy(() => import("@/pages/public/documentation/TrainingGuideManufacturing"));
const TrainingGuideAnalytics = lazy(() => import("@/pages/public/documentation/TrainingGuideAnalytics"));
const TrainingGuideHR = lazy(() => import("@/pages/public/documentation/TrainingGuideHR"));
const TrainingLessonPage = lazy(() => import("@/pages/public/documentation/TrainingLessonPage"));
const TechnicalAPIReference = lazy(() => import("@/pages/public/documentation/TechnicalAPIReference"));
const CareersPage = lazy(() => import("@/pages/public/CareersPage"));
const ImplementationSystemSetup = lazy(() => import("@/pages/public/documentation/ImplementationSystemSetup"));

// Training Content Pages
const TrainingContent = lazy(() => import("@/pages/TrainingContent"));
const TrainingContentSubmit = lazy(() => import("@/pages/TrainingContentSubmit"));
const TrainingContentAdmin = lazy(() => import("@/pages/admin/TrainingContentAdmin"));

// Open Source Pages
const OpenSourcePage = lazy(() => import("@/pages/OpenSourcePage"));
const LicensePage = lazy(() => import("@/pages/LicensePage"));
const ContributingPage = lazy(() => import("@/pages/ContributingPage"));
const ContributionPage = lazy(() => import("@/pages/ContributionPage"));
const SecurityPolicyPage = lazy(() => import("@/pages/SecurityPolicyPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const LegalPage = lazy(() => import("@/pages/LegalPage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
const PartnersPage = lazy(() => import("@/pages/PartnersPage"));
const ModulesPage = lazy(() => import("@/pages/ModulesPage"));
const FeaturesPage = lazy(() => import("@/pages/FeaturesPage"));
const FeatureDetailPage = lazy(() => import("@/pages/FeatureDetailPage"));

// Phase 2: ERP Workflows (4 pages)
const VendorInvoiceEntry = lazy(() => import("@/pages/VendorInvoiceEntry"));
const BankReconciliation = lazy(() => import("@/pages/BankReconciliation"));
const PaymentScheduling = lazy(() => import("@/pages/PaymentScheduling"));
const AgingReport = lazy(() => import("@/pages/AgingReport"));

// Phase 3: Projects & Automation (4 pages)
const AgileBoard = lazy(() => import("@/pages/AgileBoard"));
const Revaluation = lazy(() => import("@/pages/gl/Revaluation"));
const WorkflowDesigner = lazy(() => import("@/pages/WorkflowDesigner"));
const TeamCollaboration = lazy(() => import("@/pages/TeamCollaboration"));

// All existing pages (keep imports for all 191 pages)
const LeadDetail = lazy(() => import("@/pages/LeadDetail"));
const LeadsDetail = lazy(() => import("@/pages/LeadsDetail"));
const AccountsDetail = lazy(() => import("@/pages/AccountsDetail"));
const ContactsDetail = lazy(() => import("@/pages/ContactsDetail"));
const LeadConversion = lazy(() => import("@/pages/LeadConversion"));
const InvoiceList = lazy(() => import("@/pages/InvoiceList"));
const InvoiceDetail = lazy(() => import("@/pages/InvoiceDetail"));
const PurchaseOrder = lazy(() => import("@/pages/PurchaseOrder"));
const VendorManagement = lazy(() => import("@/pages/VendorManagement"));
const GeneralLedger = lazy(() => import("@/pages/GeneralLedgerDetail"));

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
const Analytics = lazy(() => import("@/pages/Analytics"));
const Copilot = lazy(() => import("@/pages/Copilot"));
const AIChat = lazy(() => import("@/pages/AIChat"));
const Marketplace = lazy(() => import("@/pages/Marketplace"));
const DeveloperPortal = lazy(() => import("@/pages/DeveloperPortal"));
const MarketplaceAdmin = lazy(() => import("@/pages/MarketplaceAdmin"));
const MarketplaceServices = lazy(() => import("@/pages/MarketplaceServices"));
const MarketplaceJobs = lazy(() => import("@/pages/MarketplaceJobs"));
const MarketplaceJobDetail = lazy(() => import("@/pages/MarketplaceJobDetail"));
const MyJobsDashboard = lazy(() => import("@/pages/MyJobsDashboard"));
const MyProposalsDashboard = lazy(() => import("@/pages/MyProposalsDashboard"));
const ContributorDashboard = lazy(() => import("@/pages/ContributorDashboard"));
const ContributorProfile = lazy(() => import("@/pages/ContributorProfile"));
const IntegrationHub = lazy(() => import("@/pages/IntegrationHub"));
const Settings = lazy(() => import("@/pages/Settings"));

// All additional page imports...
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
const PredictiveLeadScoring = lazy(() => import("@/pages/PredictiveLeadScoring"));
const ProcurementManagement = lazy(() => import("@/pages/ProcurementManagement"));
const QualityAssurance = lazy(() => import("@/pages/QualityAssurance"));
const RealTimeNotifications = lazy(() => import("@/pages/RealTimeNotifications"));
const RecommendationEngine = lazy(() => import("@/pages/RecommendationEngine"));
const AnomalyDetection = lazy(() => import("@/pages/AnomalyDetection"));
const PredictiveModeling = lazy(() => import("@/pages/PredictiveModeling"));
const ServiceLevelConfig = lazy(() => import("@/pages/ServiceLevelConfig"));
const SupplyChainOptimization = lazy(() => import("@/pages/SupplyChainOptimization"));
const TemplateLibrary = lazy(() => import("@/pages/TemplateLibrary"));
const TicketDashboard = lazy(() => import("@/pages/TicketDashboard"));
const SLATracking = lazy(() => import("@/pages/SLATracking"));
const CustomerPortal = lazy(() => import("@/pages/CustomerPortal"));
const ServiceAnalytics = lazy(() => import("@/pages/ServiceAnalytics"));
const TeamUtilization = lazy(() => import("@/pages/TeamUtilization"));
const ResponseAnalytics = lazy(() => import("@/pages/ResponseAnalytics"));
const AccountDirectory = lazy(() => import("@/pages/AccountDirectory"));
const AccountHierarchy = lazy(() => import("@/pages/AccountHierarchy"));
const ContactDirectory = lazy(() => import("@/pages/ContactDirectory"));
const ActivityTimeline = lazy(() => import("@/pages/ActivityTimeline"));
const LeadScoringDashboard = lazy(() => import("@/pages/LeadScoringDashboard"));
const OrgChartFull = lazy(() => import("@/pages/OrgChart"));
const LeaveApprovalFull = lazy(() => import("@/pages/LeaveApproval"));
const PerformanceReviews = lazy(() => import("@/pages/PerformanceReviews"));
const TalentPool = lazy(() => import("@/pages/TalentPool"));
const Website = lazy(() => import("@/pages/Website"));
const WebsiteBuilder = lazy(() => import("@/pages/WebsiteBuilder"));
const Ecommerce = lazy(() => import("@/pages/Ecommerce"));
const FormShowcase = lazy(() => import("@/pages/FormShowcase"));
const UATAutomation = lazy(() => import("@/pages/UATAutomation"));
const SystemHealth = lazy(() => import("@/pages/SystemHealth"));
const Planning = lazy(() => import("@/pages/Planning"));
const Health = lazy(() => import("@/pages/Health"));
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
const SessionManagement = lazy(() => import("@/pages/SessionManagement"));
const LoginHistory = lazy(() => import("@/pages/LoginHistory"));
const SecuritySettings = lazy(() => import("@/pages/SecuritySettings"));
const PermissionMatrix = lazy(() => import("@/pages/PermissionMatrix"));
const RoleHierarchy = lazy(() => import("@/pages/RoleHierarchy"));
const SoDRules = lazy(() => import("@/pages/SoDRules"));
const RoleAssignment = lazy(() => import("@/pages/RoleAssignment"));
const MFAEnrollment = lazy(() => import("@/pages/MFAEnrollment"));
const PasswordPolicies = lazy(() => import("@/pages/PasswordPolicies"));
const DeviceManagement = lazy(() => import("@/pages/DeviceManagement"));
const SecurityEventLog = lazy(() => import("@/pages/SecurityEventLog"));
const AuthenticationMethods = lazy(() => import("@/pages/AuthenticationMethods"));
const UserActivityDashboard = lazy(() => import("@/pages/UserActivityDashboard"));
const ComplianceMonitoring = lazy(() => import("@/pages/ComplianceMonitoring"));
const ComplianceExceptions = lazy(() => import("@/pages/ComplianceExceptions"));
const AutomationRules = lazy(() => import("@/pages/AutomationRules"));
const EventTriggers = lazy(() => import("@/pages/EventTriggers"));
const WorkflowMonitoring = lazy(() => import("@/pages/WorkflowMonitoring"));
const IntegrationStatus = lazy(() => import("@/pages/IntegrationStatus"));
const JournalEntries = lazy(() => import("@/pages/JournalEntries"));
const JournalEntry = lazy(() => import("./pages/gl/JournalEntry"));
const FinancialReports = lazy(() => import("./pages/gl/FinancialReports"));
const FSGBuilder = lazy(() => import("./pages/gl/FSGBuilder"));
const AuditLogsPage = lazy(() => import("@/pages/gl/AuditLogs"));
const IntercompanyRules = lazy(() => import("@/pages/gl/IntercompanyRules"));
const BudgetManager = lazy(() => import("@/pages/gl/BudgetManager"));
const CVRManager = lazy(() => import("@/pages/gl/CVRManager"));
const DataAccessManager = lazy(() => import("@/pages/gl/DataAccessManager"));
const JournalWizard = lazy(() => import("@/pages/gl/JournalWizard"));
const PostingRulesManager = lazy(() => import("@/pages/gl/PostingRulesManager").then(module => ({ default: module.PostingRulesManager })));
const ValidationControls = lazy(() => import("@/pages/gl/ValidationControls").then(module => ({ default: module.ValidationControls })));
const PeriodCloseDashboard = lazy(() => import("@/pages/gl/PeriodCloseDashboard"));
const TrialBalance = lazy(() => import("@/pages/gl/TrialBalance"));
const LedgerSetup = lazy(() => import("./pages/gl/LedgerSetup"));
const LedgerSetSetup = lazy(() => import("./pages/gl/LedgerSetSetup"));
const LegalEntitySetup = lazy(() => import("./pages/gl/LegalEntitySetup"));
const ValueSetManager = lazy(() => import("./pages/gl/ValueSetManager"));
const CoaStructureSetup = lazy(() => import("./pages/gl/CoaStructureSetup"));
const HierarchyManager = lazy(() => import("./pages/gl/HierarchyManager"));
const ConfigurationHub = lazy(() => import("./pages/gl/ConfigurationHub"));
const CalendarSetup = lazy(() => import("./pages/gl/CalendarSetup"));
const SlaRules = lazy(() => import("./pages/gl/SlaRules"));
const TranslationRules = lazy(() => import("./pages/gl/TranslationRules"));
const SourceCategorySetup = lazy(() => import("./pages/gl/SourceCategorySetup"));
const LedgerControlSetup = lazy(() => import("./pages/gl/LedgerControlSetup"));
const CashManagementPage = lazy(() => import("@/pages/CashManagementPage"));

const ReconciliationPage = lazy(() => import("@/pages/ReconciliationPage"));
const AssetWorkbench = lazy(() => import("@/pages/fixed-assets/AssetWorkbench"));
const FixedAssetsPage = lazy(() => import("@/pages/FixedAssetsPage"));
const TaxManagement = lazy(() => import("@/pages/TaxManagement"));
const NettingWorkbench = lazy(() => import("@/pages/NettingWorkbench"));

// Cost Management
const CostDashboard = lazy(() => import("@/pages/cost-management/CostDashboard"));
const CostInsights = lazy(() => import("@/pages/CostInsights"));
const CostScenarioManager = lazy(() => import("@/pages/CostScenarioManager"));
const DistributionsViewer = lazy(() => import("@/pages/cost-management/DistributionsViewer"));
const LcmWorkbench = lazy(() => import("@/pages/cost-management/LcmWorkbench"));

// Portal
const CustomerPortalLayout = lazy(() => import("@/pages/portal/CustomerPortalLayout"));
const PortalLogin = lazy(() => import("@/pages/portal/PortalLogin"));
const PortalDashboard = lazy(() => import("@/pages/portal/PortalDashboard"));
const PortalInvoices = lazy(() => import("@/pages/portal/PortalInvoices"));

// AR Components
const ArInvoiceList = lazy(() => import("@/components/ar/ArInvoiceList").then(module => ({ default: module.ArInvoiceList })));

const FinancialReportsDashboard = lazy(() => import("@/pages/FinancialReportsDashboard"));
const PurchaseRequisitions = lazy(() => import("@/pages/PurchaseRequisitions"));
const GoodsReceiptPage = lazy(() => import("@/pages/GoodsReceiptPage"));
const DemandForecastingPage = lazy(() => import("@/pages/DemandForecastingPage"));
const BOMManagement = lazy(() => import("@/pages/BOMManagement"));
const RoutingMaster = lazy(() => import("@/pages/RoutingMaster"));
const MRPDashboardFull = lazy(() => import("@/pages/MRPDashboard"));
const WIPTracking = lazy(() => import("@/pages/WIPTracking"));
const NCRManagement = lazy(() => import("@/pages/NCRManagement"));
const StandardCosting = lazy(() => import("@/pages/StandardCosting"));
const TradeComplianceDashboard = lazy(() => import("@/pages/TradeComplianceDashboard"));
const TransportationManagementSystem = lazy(() => import("@/pages/TransportationManagementSystem"));
const OrderFulfillment = lazy(() => import("@/pages/OrderFulfillment"));
const RMAManagement = lazy(() => import("@/pages/RMAManagement"));
const SupplyNetworkOptimization = lazy(() => import("@/pages/SupplyNetworkOptimization"));
const ThirdPartyLogistics = lazy(() => import("@/pages/ThirdPartyLogistics"));
const EstimationWorkbook = lazy(() => import("@/pages/EstimationWorkbook"));
const BOQManagementConstruction = lazy(() => import("@/pages/BOQManagementConstruction"));
const SubcontractorManagement = lazy(() => import("@/pages/SubcontractorManagement"));
const EquipmentManagement = lazy(() => import("@/pages/EquipmentManagement"));
const DailyProgressReport = lazy(() => import("@/pages/DailyProgressReport"));
const EarnedValueAnalysis = lazy(() => import("@/pages/EarnedValueAnalysis"));
const HSESafety = lazy(() => import("@/pages/HSESafety"));
const ProductCatalog = lazy(() => import("@/pages/ProductCatalog"));
const PricingPromoEngine = lazy(() => import("@/pages/PricingPromoEngine"));
const PointOfSale = lazy(() => import("@/pages/PointOfSale"));
const StoreOperationsDashboard = lazy(() => import("@/pages/StoreOperationsDashboard"));
const OmniChannelOrders = lazy(() => import("@/pages/OmniChannelOrders"));
const MerchandisePlanning = lazy(() => import("@/pages/MerchandisePlanning"));
const SalesOrderManagement = lazy(() => import("@/pages/SalesOrderManagement"));
const PricingRebatesEngine = lazy(() => import("@/pages/PricingRebatesEngine"));
const SupplierCollaborationPortal = lazy(() => import("@/pages/SupplierCollaborationPortal"));
const FreightManagement = lazy(() => import("@/pages/FreightManagement"));
const CreditManagementCollections = lazy(() => import("@/pages/CreditManagementCollections"));
const SalesCommissionManagement = lazy(() => import("@/pages/SalesCommissionManagement"));
const InventoryOptimization = lazy(() => import("@/pages/InventoryOptimization"));
const EDIMarketplaceConnectors = lazy(() => import("@/pages/EDIMarketplaceConnectors"));
const PLMEngineeringChangeControl = lazy(() => import("@/pages/PLMEngineeringChangeControl"));
const MRPMPSPlanning = lazy(() => import("@/pages/MRPMPSPlanning"));
const ShopFloorDataCollection = lazy(() => import("@/pages/ShopFloorDataCollection"));
const CMMSMaintenance = lazy(() => import("@/pages/CMMSMaintenance"));
const InspectionPlansITP = lazy(() => import("@/pages/InspectionPlansITP"));
const NCRCAMAManagement = lazy(() => import("@/pages/NCRCAMAManagement"));
const ProductionSchedulingGantt = lazy(() => import("@/pages/ProductionSchedulingGantt"));
const ToolingManagement = lazy(() => import("@/pages/ToolingManagement"));
const WIPTrackingDashboard = lazy(() => import("@/pages/WIPTrackingDashboard"));
const SupplierQualityScorecard = lazy(() => import("@/pages/SupplierQualityScorecard"));
const FormulationRecipeManagement = lazy(() => import("@/pages/FormulationRecipeManagement"));
const BatchOrdersManagement = lazy(() => import("@/pages/BatchOrdersManagement"));
const LIMSLabIntegration = lazy(() => import("@/pages/LIMSLabIntegration"));
const BulkInventoryManagement = lazy(() => import("@/pages/BulkInventoryManagement"));
const YieldVarianceTracking = lazy(() => import("@/pages/YieldVarianceTracking"));
const BatchTraceabilityGeology = lazy(() => import("@/pages/BatchTraceabilityGeology"));
const ShoppingCartCheckout = lazy(() => import("@/pages/ShoppingCartCheckout"));
const ProductReviewsRatings = lazy(() => import("@/pages/ProductReviewsRatings"));
const KanbanBoard = lazy(() => import("@/pages/KanbanBoard"));
const ChartOfAccounts = lazy(() => import("@/pages/ChartOfAccounts"));
const APInvoices = lazy(() => import("@/pages/APInvoices"));
const ARInvoices = lazy(() => import("@/pages/ARInvoices"));
const ArPeriodClose = lazy(() => import("@/pages/ArPeriodClose"));
const ArAnalytics = lazy(() => import("@/pages/ArAnalytics"));
const ArReports = lazy(() => import("@/pages/ArReports"));
const CustomerDetails = lazy(() => import("@/pages/CustomerDetails"));
const EmployeesList = lazy(() => import("@/pages/EmployeesList"));
const PayrollRuns = lazy(() => import("@/pages/PayrollRuns"));
const OpportunitiesNew = lazy(() => import("@/pages/OpportunitiesNew"));
const InventoryDashboard = lazy(() => import("@/pages/InventoryDashboard"));
const WorkOrdersDashboard = lazy(() => import("@/pages/WorkOrdersDashboard"));
const BudgetingDashboard = lazy(() => import("@/pages/BudgetingDashboard"));
const CampaignsDashboard = lazy(() => import("@/pages/CampaignsDashboard"));
const ComplianceDashboardNew = lazy(() => import("@/pages/ComplianceDashboardNew"));
const ContentManagement = lazy(() => import("@/pages/ContentManagement"));
const AdminConsole = lazy(() => import("@/pages/AdminConsole"));
const IntegrationHubNew = lazy(() => import("@/pages/IntegrationHubNew"));
const AIAssistantAdvanced = lazy(() => import("@/pages/AIAssistantAdvanced"));
const AdvancedAnalytics = lazy(() => import("@/pages/AdvancedAnalytics"));
const MultiTenancyConfig = lazy(() => import("@/pages/MultiTenancyConfig"));
const SecurityManagement = lazy(() => import("@/pages/SecurityManagement"));
const AuditTrails = lazy(() => import("@/pages/AuditTrails"));
const WarehouseManagement = lazy(() => import("@/pages/WarehouseManagement"));
const SupplierManagement = lazy(() => import("@/pages/SupplierManagement"));
const CustomerLoyalty = lazy(() => import("@/pages/CustomerLoyalty"));
const DataGovernancePage = lazy(() => import("@/pages/DataGovernancePage"));
const BusinessIntelligence = lazy(() => import("@/pages/BusinessIntelligence"));
const VoiceOfCustomer = lazy(() => import("@/pages/VoiceOfCustomer"));
const ProcurementAutomation = lazy(() => import("@/pages/ProcurementAutomation"));
const EmployeeEngagement = lazy(() => import("@/pages/EmployeeEngagement"));
const SuccessionPlanning = lazy(() => import("@/pages/SuccessionPlanning"));
const CapacityPlanning = lazy(() => import("@/pages/CapacityPlanning"));
const ChangeManagement = lazy(() => import("@/pages/ChangeManagement"));
const CostOptimization = lazy(() => import("@/pages/CostOptimization"));
const SustainabilityReporting = lazy(() => import("@/pages/SustainabilityReporting"));
const QualityAssuranceHub = lazy(() => import("@/pages/QualityAssuranceHub"));
const OpportunityList = lazy(() => import("@/pages/OpportunityList"));
const OpportunityDetail = lazy(() => import("@/pages/OpportunityDetail"));
const InventoryManagement = lazy(() => import("@/pages/InventoryManagement"));
const Finance = lazy(() => import("@/pages/Finance"));
const InvoicesDetail = lazy(() => import("@/pages/InvoicesDetail"));
const ExpensesDetail = lazy(() => import("@/pages/ExpensesDetail"));
const Service = lazy(() => import("@/pages/Service"));
const ServiceTicketsDetail = lazy(() => import("@/pages/ServiceTicketsDetail"));
const Manufacturing = lazy(() => import("@/pages/Manufacturing"));
const PayrollEngine = lazy(() => import("@/pages/PayrollEngine"));
const LeaveWorkflows = lazy(() => import("@/pages/LeaveWorkflows"));
const PerformanceManagement = lazy(() => import("@/pages/PerformanceManagement"));
const OnboardingAutomation = lazy(() => import("@/pages/OnboardingAutomation"));
const BudgetPlanning = lazy(() => import("@/pages/BudgetPlanning"));
const ConsolidationEngine = lazy(() => import("@/pages/ConsolidationEngine"));
const VarianceAnalysis = lazy(() => import("@/pages/VarianceAnalysis"));
const RAGEmbeddingsPipeline = lazy(() => import("@/pages/RAGEmbeddingsPipeline"));
const CRMCopilot = lazy(() => import("@/pages/CRMCopilot"));
const ERPCopilot = lazy(() => import("@/pages/ERPCopilot"));
const HRCopilot = lazy(() => import("@/pages/HRCopilot"));
const PerformanceTuning = lazy(() => import("@/pages/PerformanceTuning"));
const ErrorHandling = lazy(() => import("@/pages/ErrorHandling"));
const SemanticSearch = lazy(() => import("@/pages/SemanticSearch"));
const KnowledgeGraph = lazy(() => import("@/pages/KnowledgeGraph"));
const IoT = lazy(() => import("@/pages/IoT"));
const MobileApps = lazy(() => import("@/pages/MobileApps"));
const SupplyChain = lazy(() => import("@/pages/SupplyChain"));
const QualityManagement = lazy(() => import("@/pages/QualityManagement"));
const DocumentManagement = lazy(() => import("@/pages/DocumentManagement"));
const ExpenseManagement = lazy(() => import("@/pages/ExpenseManagement"));
const TravelManagement = lazy(() => import("@/pages/TravelManagement"));
const TimeAttendance = lazy(() => import("@/pages/TimeAttendance"));
const LearningManagement = lazy(() => import("@/pages/LearningManagement"));
const KnowledgeManagement = lazy(() => import("@/pages/KnowledgeManagement"));
const ServiceTicket = lazy(() => import("@/pages/ServiceTicket"));
const KnowledgeBase = lazy(() => import("@/pages/KnowledgeBase"));
const LogisticsDashboard = lazy(() => import("@/pages/LogisticsDashboard"));
const LogisticsComplianceSafety = lazy(() => import("@/pages/LogisticsComplianceSafety"));
const LogisticsBIDashboard = lazy(() => import("@/pages/LogisticsBIDashboard"));
const ColdChainLogistics = lazy(() => import("@/pages/ColdChainLogistics"));
const LogisticsShipping = lazy(() => import("@/pages/LogisticsShipping"));
const LogisticsAnalytics = lazy(() => import("@/pages/LogisticsAnalytics"));
const LogisticsOptimization = lazy(() => import("@/pages/LogisticsOptimization"));
const SupplyChainLogistics = lazy(() => import("@/pages/SupplyChainLogistics"));
const OrdersLogistics = lazy(() => import("@/pages/OrdersLogistics"));
const WarehouseInventoryLogistics = lazy(() => import("@/pages/WarehouseInventoryLogistics"));
const BillingLogistics = lazy(() => import("@/pages/BillingLogistics"));
const CustomerSubscriberManagement = lazy(() => import("@/pages/CustomerSubscriberManagement"));
const ServiceProvisioningOrder = lazy(() => import("@/pages/ServiceProvisioningOrder"));
const NetworkInventoryOSS = lazy(() => import("@/pages/NetworkInventoryOSS"));
const TelecomBillingRevenue = lazy(() => import("@/pages/TelecomBillingRevenue"));
const FaultPerformanceMonitoring = lazy(() => import("@/pages/FaultPerformanceMonitoring"));
const MarketingEngagement = lazy(() => import("@/pages/MarketingEngagement"));
const TelecomFinanceCompliance = lazy(() => import("@/pages/TelecomFinanceCompliance"));
const TelecomBIDashboard = lazy(() => import("@/pages/TelecomBIDashboard"));
const CustomerDeviceManagement = lazy(() => import("@/pages/CustomerDeviceManagement"));
const SLAServiceTierManagement = lazy(() => import("@/pages/SLAServiceTierManagement"));
const TelecomCustomerSupport = lazy(() => import("@/pages/TelecomCustomerSupport"));
const PatientManagement = lazy(() => import("@/pages/PatientManagement"));
const AppointmentScheduling = lazy(() => import("@/pages/AppointmentScheduling"));
const ClinicalDocumentation = lazy(() => import("@/pages/ClinicalDocumentation"));
const LaboratoryManagement = lazy(() => import("@/pages/LaboratoryManagement"));
const PharmacyManagement = lazy(() => import("@/pages/PharmacyManagement"));
const MedicalBilling = lazy(() => import("@/pages/MedicalBilling"));
const InpatientManagement = lazy(() => import("@/pages/InpatientManagement"));
const HealthcareBIDashboard = lazy(() => import("@/pages/HealthcareBIDashboard"));
const HealthcareCompliance = lazy(() => import("@/pages/HealthcareCompliance"));
const ReservationBooking = lazy(() => import("@/pages/ReservationBooking"));
const FrontDeskOperations = lazy(() => import("@/pages/FrontDeskOperations"));
const HousekeepingManagement = lazy(() => import("@/pages/HousekeepingManagement"));
const FoodBeveragePOS = lazy(() => import("@/pages/FoodBeveragePOS"));
const EventBanquetingManagement = lazy(() => import("@/pages/EventBanquetingManagement"));
const GuestCRMManagement = lazy(() => import("@/pages/GuestCRMManagement"));
const RevenueManagement = lazy(() => import("@/pages/RevenueManagement"));
const HospitalityInventory = lazy(() => import("@/pages/HospitalityInventory"));
const HospitalityHRRostering = lazy(() => import("@/pages/HospitalityHRRostering"));
const HospitalityBIDashboard = lazy(() => import("@/pages/HospitalityBIDashboard"));
const ShipmentOrderManagement = lazy(() => import("@/pages/ShipmentOrderManagement"));
const FormPage = lazy(() => import("@/pages/FormPage")) as any;
const RouteLoadOptimization = lazy(() => import("@/pages/RouteLoadOptimization"));
const YardDockManagement = lazy(() => import("@/pages/YardDockManagement"));
const CarrierProcurement = lazy(() => import("@/pages/CarrierProcurement"));
const ShipmentTracking = lazy(() => import("@/pages/ShipmentTracking"));
const FreightCostingBilling = lazy(() => import("@/pages/FreightCostingBilling"));
const CustomsCompliance = lazy(() => import("@/pages/CustomsCompliance"));
const FleetDriverManagement = lazy(() => import("@/pages/FleetDriverManagement"));
const TransportationBIDashboard = lazy(() => import("@/pages/TransportationBIDashboard"));
const VehicleInventoryManagement = lazy(() => import("@/pages/VehicleInventoryManagement"));
const DigitalRetailLeads = lazy(() => import("@/pages/DigitalRetailLeads"));
const VehicleSalesDeals = lazy(() => import("@/pages/VehicleSalesDeals"));
const WorkshopServiceOrders = lazy(() => import("@/pages/WorkshopServiceOrders"));
const PartsInventory = lazy(() => import("@/pages/PartsInventory"));
const WarrantyClaimsManagement = lazy(() => import("@/pages/WarrantyClaimsManagement"));
const TelematicsVehicleData = lazy(() => import("@/pages/TelematicsVehicleData"));
const AutomotiveBIDashboard = lazy(() => import("@/pages/AutomotiveBIDashboard"));
const RecipeFormulation = lazy(() => import("@/pages/RecipeFormulation"));
const BatchManufacturing = lazy(() => import("@/pages/BatchManufacturing"));
const QualityFoodSafety = lazy(() => import("@/pages/QualityFoodSafety"));
const FBInventoryColdChain = lazy(() => import("@/pages/FBInventoryColdChain"));
const ProcurementSourcing = lazy(() => import("@/pages/ProcurementSourcing"));
const MenuPOSOperations = lazy(() => import("@/pages/MenuPOSOperations"));
const ECommerceDelivery = lazy(() => import("@/pages/ECommerceDelivery"));
const PackagingTraceability = lazy(() => import("@/pages/PackagingTraceability"));
const FBDemandPlanning = lazy(() => import("@/pages/FBDemandPlanning"));
const SustainabilityTraceability = lazy(() => import("@/pages/SustainabilityTraceability"));

// Revenue Management
const RevenueContractWorkbench = lazy(() => import("@/pages/RevenueContractWorkbench"));
const RevenueContractDetail = lazy(() => import("@/pages/RevenueContractDetail"));
const RevenuePeriodClose = lazy(() => import("@/pages/RevenuePeriodClose"));
const SSPManager = lazy(() => import("@/pages/SSPManager"));
const RevenueWaterfall = lazy(() => import("@/pages/RevenueWaterfall"));
const DeferredRevenueMatrix = lazy(() => import("@/pages/DeferredRevenueMatrix"));
const RevenueSourceEvents = lazy(() => import("@/pages/RevenueSourceEvents"));
const RevenueAccountingSetup = lazy(() => import("@/pages/RevenueAccountingSetup"));

// Automotive Pack
const AutomotiveProduction = lazy(() => import("@/pages/AutomotiveProduction"));
const AutomotiveDealerInventory = lazy(() => import("@/pages/AutomotiveDealerInventory"));
const AutomotiveSalesCRM = lazy(() => import("@/pages/AutomotiveSalesCRM"));
const AutomotiveAfterSalesService = lazy(() => import("@/pages/AutomotiveAfterSalesService"));
const AutomotiveFinanceInvoicing = lazy(() => import("@/pages/AutomotiveFinanceInvoicing"));
const AutomotiveHRWorkforce = lazy(() => import("@/pages/AutomotiveHRWorkforce"));
const AutomotiveSupplyChain = lazy(() => import("@/pages/AutomotiveSupplyChain"));
const AutomotiveBIDashboardsFull = lazy(() => import("@/pages/AutomotiveBIDashboards"));
const AutomotiveCompliance = lazy(() => import("@/pages/AutomotiveCompliance"));
const AutomotiveMobileApp = lazy(() => import("@/pages/AutomotiveMobileApp"));
const AutomotiveQualityAnalytics = lazy(() => import("@/pages/AutomotiveQualityAnalytics"));
const AutomotiveReporting = lazy(() => import("@/pages/AutomotiveReporting"));

import ApSettings from "@/components/ap/ApSettings";


function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/form" component={FormPage} />
      <Route path="/ap/settings">
        <ProtectedRoute>
          <ApSettings />
        </ProtectedRoute>
      </Route>
      <Route path="/use-cases" component={UseCases} />
      <Route path="/industries" component={IndustriesPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/features" component={FeaturesPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:id" component={BlogPostPage} />
      <Route path="/open-source" component={OpenSourcePage} />
      <Route path="/contribution" component={ContributionPage} />
      <Route path="/license" component={LicensePage} />
      <Route path="/docs/contributing" component={ContributingPage} />
      <Route path="/security" component={SecurityPolicyPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/legal" component={LegalPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/partners" component={PartnersPage} />
      <Route path="/careers" component={CareersPage} />
      <Route path="/modules" component={ModulesPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/admin" component={AdminConsole} />
      <Route path="/admin/security" component={AccessControl} />
      <Route path="/admin-roles" component={AdminRoles} />
      <Route path="/demo" component={DemoManagement} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/crm/leads" component={LeadsDetail} />
      <Route path="/crm/accounts" component={AccountsDetail} />
      <Route path="/crm/contacts" component={ContactsDetail} />
      <Route path="/crm/:page?" component={CRM} />
      <Route path="/erp/:page?" component={ERP} />
      <Route path="/finance/cash-management" component={CashManagementPage} />
      <Route path="/cash/accounts/:id/reconcile" component={ReconciliationPage} />
      <Route path="/finance/fixed-assets" component={AssetWorkbench} />
      <Route path="/finance/accounts-payable" component={APInvoices} />
      <Route path="/finance/accounts-receivable" component={AccountsReceivable} />
      <Route path="/procurement" component={ProcurementManagement} />
      <Route path="/finance/ar/invoices" component={ArInvoiceList} />
      <Route path="/finance/ar/analytics" component={ArAnalytics} />
      <Route path="/finance/ar/reports" component={ArReports} />
      <Route path="/finance/ar/customers/:id" component={CustomerDetails} />

      {/* Customer Portal Routes */}
      <Route path="/portal/login" component={PortalLogin} />
      <Route path="/portal">
        <CustomerPortalLayout>
          <Switch>
            <Route path="/portal/dashboard" component={PortalDashboard} />
            <Route path="/portal/invoices" component={PortalInvoices} />
            <Route path="/portal" component={PortalDashboard} />
          </Switch>
        </CustomerPortalLayout>
      </Route>
      <Route path="/gl/journals/new" component={JournalEntry} />
      <Route path="/gl/journals/wizard" component={JournalWizard} />
      <Route path="/gl/config/posting-rules" component={PostingRulesManager} />
      <Route path="/gl/config/validations" component={ValidationControls} />
      <Route path="/gl/journals" component={JournalEntries} />
      <Route path="/gl/reports/builder" component={FSGBuilder} />
      <Route path="/gl/reports" component={FinancialReports} />
      <Route path="/gl/audit" component={AuditLogsPage} />
      <Route path="/finance/:page?" component={Finance} />
      <Route path="/hr/:page?" component={HR} />
      <Route path="/projects/:page?" component={Projects} />
      <Route path="/crm-module" component={CRMModule} />
      {/* Finance Module Routes */}
      <Route path="/finance-module" component={FinanceModule} />
      <Route path="/gl/period-close" component={CloseDashboard} />

      {/* HR Module Routes */}
      <Route path="/hr-module" component={HRModule} />
      <Route path="/erp-module" component={ERPModule} />
      <Route path="/service-module" component={ServiceModule} />
      <Route path="/projects-module" component={ProjectsModule} />
      <Route path="/marketing-module" component={MarketingModule} />
      <Route path="/manufacturing-module" component={ManufacturingModule} />
      <Route path="/manufacturing/dashboard" component={ManufacturingDashboard} />
      <Route path="/manufacturing/mrp-dashboard" component={ManufacturingDashboard} />
      <Route path="/manufacturing/bom" component={BOMDesigner} />
      <Route path="/manufacturing/routings" component={RoutingEditor} />
      <Route path="/manufacturing/work-centers" component={WorkCenterManager} />
      <Route path="/manufacturing/resources" component={ResourceManager} />
      <Route path="/manufacturing/work-orders" component={WorkOrderList} />
      <Route path="/manufacturing/shop-floor" component={ShopFloorTerminal} />
      <Route path="/manufacturing/terminal" component={ShopFloorTerminal} />
      <Route path="/manufacturing/quality" component={QualityManager} />
      <Route path="/manufacturing/mrp-workbench" component={MRPWorkbench} />
      <Route path="/manufacturing/gantt" component={ProductionGantt} />

      <Route path="/manufacturing/calendars" component={CalendarManager} />
      <Route path="/manufacturing/standard-operations" component={StandardOpLibrary} />
      <Route path="/manufacturing/costing" component={CostingWorkbench} />
      <Route path="/manufacturing/wip" component={WIPDashboard} />
      <Route path="/manufacturing/variances" component={MFGVarianceAnalysis} />
      <Route path="/manufacturing/formulas" component={FormulaDesigner} />
      <Route path="/manufacturing/recipes" component={RecipeManager} />
      <Route path="/manufacturing/batches" component={BatchWorkbench} />
      <Route path="/manufacturing/genealogy" component={BatchGenealogy} />
      <Route path="/analytics-module" component={AnalyticsModule} />
      <Route path="/admin-console-module" component={AdminConsoleModule} />
      <Route path="/compliance-module" component={ComplianceModule} />
      <Route path="/epm-module" component={EPMModule} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/copilot" component={Copilot} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/marketplace/apps" component={Marketplace} />
      <Route path="/marketplace/services" component={MarketplaceServices} />
      <Route path="/marketplace/jobs/:id" component={MarketplaceJobDetail} />
      <Route path="/marketplace/jobs" component={MarketplaceJobs} />
      <Route path="/marketplace/my-jobs" component={MyJobsDashboard} />
      <Route path="/marketplace/my-proposals" component={MyProposalsDashboard} />
      <Route path="/marketplace/contributor" component={ContributorDashboard} />
      <Route path="/marketplace/profile/:userId" component={ContributorProfile} />
      <Route path="/community" component={CommunityForum} />

      {/* Training Content Routes */}
      <Route path="/training/:type" component={TrainingContent} />
      <Route path="/contributor/training/submit" component={TrainingContentSubmit} />
      <Route path="/contributor/training/filter-request" component={TrainingContentSubmit} />
      <Route path="/admin/training" component={TrainingContentAdmin} />

      <Route path="/developer-portal" component={DeveloperPortal} />
      <Route path="/marketplace-admin" component={MarketplaceAdmin} />
      <Route path="/settings" component={Settings} />
      <Route path="/integrations" component={Integrations} />
      <Route path="/processes" component={ProcessHub} />
      <Route path="/process-hub" component={ProcessHub} />
      <Route path="/processes/procure-to-pay" component={ProcureToPayProcess} />
      <Route path="/processes/order-to-cash" component={OrderToCashProcess} />
      <Route path="/processes/hire-to-retire" component={HireToRetireProcess} />
      <Route path="/processes/month-end-consolidation" component={MonthEndConsolidationProcess} />
      <Route path="/processes/compliance-risk" component={ComplianceRiskProcess} />
      <Route path="/processes/inventory-management" component={InventoryManagementProcess} />
      <Route path="/processes/fixed-asset-lifecycle" component={FixedAssetLifecycleProcess} />
      <Route path="/processes/production-planning" component={ProductionPlanningProcess} />
      <Route path="/processes/mrp" component={MRPProcess} />
      <Route path="/processes/quality-assurance" component={QualityAssuranceProcess} />
      <Route path="/processes/contract-management" component={ContractManagementProcess} />
      <Route path="/processes/budget-planning" component={BudgetPlanningProcess} />
      <Route path="/processes/demand-planning" component={DemandPlanningProcess} />
      <Route path="/processes/capacity-planning" component={CapacityPlanningProcess} />
      <Route path="/processes/warehouse-management" component={WarehouseManagementProcess} />
      <Route path="/processes/customer-returns" component={CustomerReturnsProcess} />
      <Route path="/processes/vendor-performance" component={VendorPerformanceProcess} />
      <Route path="/processes/subscription-billing" component={SubscriptionBillingProcess} />

      {/* Public Process Pages */}
      <Route path="/public/processes" component={PublicProcessHub} />
      <Route path="/public/processes/procure-to-pay" component={PublicProcureToPayProcess} />
      <Route path="/public/processes/order-to-cash" component={PublicOrderToCashProcess} />
      <Route path="/public/processes/hire-to-retire" component={PublicHireToRetireProcess} />
      <Route path="/public/processes/month-end-consolidation" component={PublicMonthEndProcess} />
      <Route path="/public/processes/compliance-risk" component={PublicComplianceProcess} />
      <Route path="/public/processes/inventory-management" component={PublicInventoryProcess} />
      <Route path="/public/processes/fixed-asset-lifecycle" component={PublicFixedAssetProcess} />
      <Route path="/public/processes/production-planning" component={PublicProductionProcess} />
      <Route path="/public/processes/mrp" component={PublicMRPProcess} />
      <Route path="/public/processes/quality-assurance" component={PublicQualityProcess} />
      <Route path="/public/processes/contract-management" component={PublicContractProcess} />
      <Route path="/public/processes/budget-planning" component={PublicBudgetProcess} />
      <Route path="/public/processes/demand-planning" component={PublicDemandProcess} />
      <Route path="/public/processes/capacity-planning" component={PublicCapacityProcess} />
      <Route path="/public/processes/warehouse-management" component={PublicWarehouseProcess} />
      <Route path="/public/processes/customer-returns" component={PublicCustomerReturnsProcess} />
      <Route path="/public/processes/vendor-performance" component={PublicVendorPerformanceProcess} />
      <Route path="/public/processes/subscription-billing" component={PublicSubscriptionBillingProcess} />

      {/* Revenue Management */}
      <Route path="/revenue/contracts" component={RevenueContractWorkbench} />
      <Route path="/revenue/contracts/:id" component={RevenueContractDetail} />
      <Route path="/revenue/periods" component={RevenuePeriodClose} />
      <Route path="/revenue/ssp" component={SSPManager} />
      <Route path="/revenue/waterfall" component={RevenueWaterfall} />
      <Route path="/revenue/deferred" component={DeferredRevenueMatrix} />
      <Route path="/revenue/events" component={RevenueSourceEvents} />
      <Route path="/revenue/setup" component={RevenueAccountingSetup} />

      {/* Public Documentation Routes */}
      <Route path="/docs/process-flows" component={ProcessFlowsPage} />
      <Route path="/docs/training-guides" component={TrainingGuidesPage} />
      <Route path="/docs/training-guides/:category/:lesson" component={TrainingLessonPage} />
      <Route path="/docs/training-guides/crm" component={TrainingGuideCRM} />
      <Route path="/docs/training-guides/finance" component={TrainingGuideFinance} />
      <Route path="/docs/training-guides/inventory" component={TrainingGuideInventory} />
      <Route path="/docs/training-guides/manufacturing" component={TrainingGuideManufacturing} />
      <Route path="/docs/training-guides/analytics" component={TrainingGuideAnalytics} />
      <Route path="/docs/training-guides/hr" component={TrainingGuideHR} />
      <Route path="/docs/technical" component={TechnicalDocumentationPage} />
      <Route path="/docs/technical/api-reference" component={TechnicalAPIReference} />
      <Route path="/docs/implementation" component={ImplementationGuidelinesPage} />
      <Route path="/docs/implementation/system-setup" component={ImplementationSystemSetup} />

      <Route path="/mrp-dashboard" component={MRPDashboard} />
      <Route path="/attendance-dashboard" component={AttendanceDashboard} />
      <Route path="/ticket-dashboard" component={TicketDashboard} />
      <Route path="/api-gateway" component={APIGateway} />
      <Route path="/tenant-admin" component={TenantAdmin} />
      <Route path="/admin/platform" component={PlatformAdmin} />
      <Route path="/invoice-generator" component={InvoiceGenerator} />
      <Route path="/quote-builder" component={QuoteBuilder} />
      <Route path="/approval-workflow" component={ApprovalWorkflow} />
      <Route path="/payment-flow" component={PaymentFlow} />
      <Route path="/user-management" component={UserManagement} />
      <Route path="/industry-setup" component={IndustrySetup} />
      <Route path="/industry-deployments" component={IndustrySetup} />
      <Route path="/environment-management" component={EnvironmentManagement} />
      <Route path="/subscription-management" component={SubscriptionManagement} />
      <Route path="/reports/:module" component={Reports} />
      <Route path="/reports" component={Reports} />
      <Route path="/features" component={FeaturesComparison} />
      <Route path="/billing-management" component={BillingManagement} />
      <Route path="/industry/:slug" component={IndustryDetail} />
      <Route path="/module/:slug" component={ModuleDetail} />
      <Route path="/features/:slug" component={FeatureDetailPage} />
      <Route path="/gl/intercompany" component={IntercompanyRules} />
      <Route path="/gl/revaluation" component={Revaluation} />

      {/* Supply Chain & Operations Routes (Restored) */}
      <Route path="/inventory" component={InventoryDashboard} />
      <Route path="/inventory/management" component={InventoryManagement} />
      <Route path="/warehouse" component={WarehouseManagement} />
      <Route path="/supply-chain" component={SupplyChain} />
      <Route path="/supply-chain/optimization" component={SupplyChainOptimization} />
      <Route path="/manufacturing/shop-floor" component={ShopFloor} />
      <Route path="/manufacturing/work-orders" component={WorkOrder} />
      <Route path="/manufacturing/quality" component={QualityControl} />
      <Route path="/manufacturing/mrp" component={MRPDashboard} />
      <Route path="/order-fulfillment" component={OrderFulfillment} />
      <Route path="/transportation" component={TransportationManagementSystem} />

      {/* Finance Orphans */}
      <Route path="/finance/tax" component={TaxManagement} />
      <Route path="/finance/expense-management" component={ExpenseManagement} />

      {/* Other Orphans */}
      <Route path="/compliance" component={Compliance} />

      {/* New Finance Routes */}
      <Route path="/gl/budgets" component={BudgetManager} />
      <Route path="/gl/cvr" component={CVRManager} />
      <Route path="/gl/data-access" component={DataAccessManager} />

      <Route path="/finance/ar/period-close" component={ArPeriodClose} />
      <Route path="/gl/trial-balance" component={TrialBalance} />
      <Route path="/gl/config/ledgers" component={LedgerSetup} />

      {/* Cost Management Routes */}
      <Route path="/cost" component={CostDashboard} />
      <Route path="/cost/dashboard" component={CostDashboard} />
      <Route path="/cost/insights" component={CostInsights} />
      <Route path="/cost/distributions" component={DistributionsViewer} />
      <Route path="/cost/lcm" component={LcmWorkbench} />
      <Route path="/gl/config/ledger-sets" component={LedgerSetSetup} />
      <Route path="/gl/config/legal-entities" component={LegalEntitySetup} />
      <Route path="/gl/value-sets" component={ValueSetManager} />
      <Route path="/gl/coa-structures" component={CoaStructureSetup} />
      <Route path="/gl/hierarchies" component={HierarchyManager} />
      <Route path="/gl/config" component={ConfigurationHub} />
      <Route path="/gl/config/calendars" component={CalendarSetup} />
      <Route path="/gl/config/sla" component={SlaRules} />
      <Route path="/gl/config/translation" component={TranslationRules} />
      <Route path="/gl/config/sources" component={SourceCategorySetup} />
      <Route path="/gl/config/controls" component={LedgerControlSetup} />


      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedLayout() {
  return (
    <GlobalLayout>
      <Suspense fallback={<div className="p-4">Loading...</div>}>
        <Router />
      </Suspense>
      <AIChatWidgetWrapper />
    </GlobalLayout>
  );
}


function AIChatWidgetWrapper() {
  const [location] = useLocation();

  let context = "general";
  if (location.includes("/accounts-payable")) context = "ap";
  else if (location.includes("/accounts-receivable")) context = "ar";
  else if (location.includes("/cash-management")) context = "cash";
  else if (location.includes("/finance") || location.includes("/gl")) context = "finance";
  else if (location.includes("/crm")) context = "crm";
  else if (location.includes("/hr")) context = "hr";
  else if (location.includes("/projects")) context = "projects";

  return <AIChatWidget context={context} />;
}

function PublicLayout() {
  return (
    <div className="flex h-screen w-full">
      <div className="flex flex-col flex-1 w-full">
        <Suspense fallback={<div className="p-4">Loading...</div>}>
          <Router />
        </Suspense>
      </div>
    </div>
  );
}

export default function App() {
  const [location] = useLocation();
  const style = { "--sidebar-width": "18rem" } as React.CSSProperties;

  // Public routes don't show sidebar - includes dynamic routes
  const publicRoutes = ["/", "/use-cases", "/industries", "/about", "/blog", "/login", "/demo", "/contact", "/security", "/license", "/open-source", "/legal", "/pricing", "/privacy", "/terms", "/partners", "/contributing", "/contribution", "/modules", "/public/processes", "/careers", "/features", "/marketplace", "/community", "/marketplace/services", "/marketplace/apps", "/marketplace/jobs"];
  const isDynamicPublicRoute = location.startsWith("/industry/") || location.startsWith("/module/") || location.startsWith("/public/processes/") || location.startsWith("/docs/") || location.startsWith("/features/") || location.startsWith("/blog/") || location.startsWith("/marketplace/jobs/");
  const isPublicRoute = publicRoutes.includes(location) || isDynamicPublicRoute;

  // Industry setup routes should show authenticated layout
  const isIndustrySetup = location === "/industry-setup" || location === "/industry-deployments";

  return (
    <RBACProvider>
      <QueryClientProvider client={queryClient}>
        <LedgerProvider>
          <ThemeProvider>
            <TooltipProvider>
              <TourProvider>
                <QuickTipsProvider>
                  <SidebarProvider style={style}>
                    {isPublicRoute && !isIndustrySetup ? <PublicLayout /> : <ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}
                    <GuidedTourOverlay />
                    <Toaster />
                  </SidebarProvider>
                </QuickTipsProvider>
              </TourProvider>
            </TooltipProvider>
          </ThemeProvider>
        </LedgerProvider>
      </QueryClientProvider>
    </RBACProvider>
  );
}
