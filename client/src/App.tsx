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
import { RBACProvider } from "@/components/RBACContext";
import NotFound from "@/pages/not-found";

// Core pages
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const CRM = lazy(() => import("@/pages/CRM"));
const ERP = lazy(() => import("@/pages/ERP"));
const HR = lazy(() => import("@/pages/HR"));
const Projects = lazy(() => import("@/pages/Projects"));

// Phase 2: Module Overviews
const CRMModule = lazy(() => import("@/pages/CRMModule"));
const FinanceModule = lazy(() => import("@/pages/FinanceModule"));
const HRModule = lazy(() => import("@/pages/HRModule"));
const ERPModule = lazy(() => import("@/pages/ERPModule"));
const ServiceModule = lazy(() => import("@/pages/ServiceModule"));

// Phase 3: Advanced Modules
const ProjectsModule = lazy(() => import("@/pages/ProjectsModule"));
const MarketingModule = lazy(() => import("@/pages/MarketingModule"));
const ManufacturingModule = lazy(() => import("@/pages/ManufacturingModule"));
const AnalyticsModule = lazy(() => import("@/pages/AnalyticsModule"));
const AdminConsoleModule = lazy(() => import("@/pages/AdminConsoleModule"));
const ComplianceModule = lazy(() => import("@/pages/ComplianceModule"));

// Phase 1: Enterprise Foundation (8 pages)
const TenantAdmin = lazy(() => import("@/pages/TenantAdmin"));
const BillingPlans = lazy(() => import("@/pages/BillingPlans"));
const AdminRoles = lazy(() => import("@/pages/AdminRoles"));
const APIGateway = lazy(() => import("@/pages/APIGateway"));
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
const VendorsDetail = lazy(() => import("@/pages/VendorsDetail"));
const CustomersDetail = lazy(() => import("@/pages/CustomersDetail"));
const PurchaseOrdersDetail = lazy(() => import("@/pages/PurchaseOrdersDetail"));
const ExpensesDetail = lazy(() => import("@/pages/ExpensesDetail"));
const EmployeesDetail = lazy(() => import("@/pages/EmployeesDetail"));
const PayrollDetail = lazy(() => import("@/pages/PayrollDetail"));
const CampaignsDetail = lazy(() => import("@/pages/CampaignsDetail"));
const TasksDetail = lazy(() => import("@/pages/TasksDetail"));
const BOMDetail = lazy(() => import("@/pages/BOMDetail"));
const CRMCampaignsDetail = lazy(() => import("@/pages/detail/CRMCampaignsDetail"));
const CRMPipelineDetail = lazy(() => import("@/pages/detail/CRMPipelineDetail"));
const CRMAnalyticsDetail = lazy(() => import("@/pages/detail/CRMAnalyticsDetail"));
const ERPAPDetail = lazy(() => import("@/pages/detail/ERPAPDetail"));
const ERPARDetail = lazy(() => import("@/pages/detail/ERPARDetail"));
const ERPInventoryDetail = lazy(() => import("@/pages/detail/ERPInventoryDetail"));
const FinanceBudgetsDetail = lazy(() => import("@/pages/detail/FinanceBudgetsDetail"));
const FinanceReportsDetail = lazy(() => import("@/pages/detail/FinanceReportsDetail"));
const ServiceCustomersDetail = lazy(() => import("@/pages/detail/ServiceCustomersDetail"));
const ServiceKnowledgeDetail = lazy(() => import("@/pages/detail/ServiceKnowledgeDetail"));
const HRRecruitmentDetail = lazy(() => import("@/pages/detail/HRRecruitmentDetail"));
const HRPerformanceDetail = lazy(() => import("@/pages/detail/HRPerformanceDetail"));
const HRLeaveDetail = lazy(() => import("@/pages/detail/HRLeaveDetail"));
const MarketingEmailDetail = lazy(() => import("@/pages/detail/MarketingEmailDetail"));
const MarketingSocialDetail = lazy(() => import("@/pages/detail/MarketingSocialDetail"));
const ProjectsKanbanDetail = lazy(() => import("@/pages/detail/ProjectsKanbanDetail"));
const ManufacturingWorkOrdersDetail = lazy(() => import("@/pages/detail/ManufacturingWorkOrdersDetail"));
const ManufacturingProductionDetail = lazy(() => import("@/pages/detail/ManufacturingProductionDetail"));
const ManufacturingQualityDetail = lazy(() => import("@/pages/detail/ManufacturingQualityDetail"));
const CRMSettingsDetail = lazy(() => import("@/pages/detail/CRMSettingsDetail"));
const CRMContactsDetail = lazy(() => import("@/pages/detail/CRMContactsDetail"));
const ERPQualityDetail = lazy(() => import("@/pages/detail/ERPQualityDetail"));
const FinancePaymentsDetail = lazy(() => import("@/pages/detail/FinancePaymentsDetail"));
const ServiceSLADetail = lazy(() => import("@/pages/detail/ServiceSLADetail"));
const HRTrainingDetail = lazy(() => import("@/pages/detail/HRTrainingDetail"));
const MarketingLeadsDetail = lazy(() => import("@/pages/detail/MarketingLeadsDetail"));
const ProjectsResourcesDetail = lazy(() => import("@/pages/detail/ProjectsResourcesDetail"));
const HRSuccessionDetail = lazy(() => import("@/pages/detail/HRSuccessionDetail"));
const HREngagementDetail = lazy(() => import("@/pages/detail/HREngagementDetail"));
const HRCompensationDetail = lazy(() => import("@/pages/detail/HRCompensationDetail"));
const HRAttendanceDetail = lazy(() => import("@/pages/detail/HRAttendanceDetail"));
const HRAnalyticsDetail = lazy(() => import("@/pages/detail/HRAnalyticsDetail"));
const HRPoliciesDetail = lazy(() => import("@/pages/detail/HRPoliciesDetail"));
const HROnboardingDetail = lazy(() => import("@/pages/detail/HROnboardingDetail"));
const FinanceLedgerDetail = lazy(() => import("@/pages/detail/FinanceLedgerDetail"));
const FinanceSettingsDetail = lazy(() => import("@/pages/detail/FinanceSettingsDetail"));
const ServiceAnalyticsDetail = lazy(() => import("@/pages/detail/ServiceAnalyticsDetail"));
const ServiceQueueDetail = lazy(() => import("@/pages/detail/ServiceQueueDetail"));
const ServiceSettingsDetail = lazy(() => import("@/pages/detail/ServiceSettingsDetail"));
const MarketingSegmentationDetail = lazy(() => import("@/pages/detail/MarketingSegmentationDetail"));
const MarketingAutomationDetail = lazy(() => import("@/pages/detail/MarketingAutomationDetail"));
const MarketingBudgetDetail = lazy(() => import("@/pages/detail/MarketingBudgetDetail"));
const MarketingAnalyticsDetail = lazy(() => import("@/pages/detail/MarketingAnalyticsDetail"));
const MarketingSettingsDetail = lazy(() => import("@/pages/detail/MarketingSettingsDetail"));
const ProjectsSprintsDetail = lazy(() => import("@/pages/detail/ProjectsSprintsDetail"));
const ProjectsTimelineDetail = lazy(() => import("@/pages/detail/ProjectsTimelineDetail"));
const ProjectsAnalyticsDetail = lazy(() => import("@/pages/detail/ProjectsAnalyticsDetail"));
const ProjectsSettingsDetail = lazy(() => import("@/pages/detail/ProjectsSettingsDetail"));
const ERPSettingsDetail = lazy(() => import("@/pages/detail/ERPSettingsDetail"));
const AdminOverviewDetail = lazy(() => import("@/pages/detail/AdminOverviewDetail"));
const AdminUsersDetail = lazy(() => import("@/pages/detail/AdminUsersDetail"));
const AdminRolesDetail = lazy(() => import("@/pages/detail/AdminRolesDetail"));
const AdminPermissionsDetail = lazy(() => import("@/pages/detail/AdminPermissionsDetail"));
const AdminAuditDetail = lazy(() => import("@/pages/detail/AdminAuditDetail"));
const AnalyticsDashboardDetail = lazy(() => import("@/pages/detail/AnalyticsDashboardDetail"));
const AnalyticsReportsDetail = lazy(() => import("@/pages/detail/AnalyticsReportsDetail"));
const AnalyticsInsightsDetail = lazy(() => import("@/pages/detail/AnalyticsInsightsDetail"));
const ComplianceStandardsDetail = lazy(() => import("@/pages/detail/ComplianceStandardsDetail"));
const ComplianceRiskDetail = lazy(() => import("@/pages/detail/ComplianceRiskDetail"));
const ComplianceControlsDetail = lazy(() => import("@/pages/detail/ComplianceControlsDetail"));
const CompliancePoliciesDetail = lazy(() => import("@/pages/detail/CompliancePoliciesDetail"));
const ComplianceAuditDetail = lazy(() => import("@/pages/detail/ComplianceAuditDetail"));
const AIAssistantChatDetail = lazy(() => import("@/pages/detail/AIAssistantChatDetail"));
const AIAssistantKnowledgeDetail = lazy(() => import("@/pages/detail/AIAssistantKnowledgeDetail"));
const Finance = lazy(() => import("@/pages/Finance"));
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
const CustomerManagement = lazy(() => import("@/pages/CustomerManagement"));
const CashManagementPage = lazy(() => import("@/pages/CashManagementPage"));
const TaxManagement = lazy(() => import("@/pages/TaxManagement"));
const FinancialReportsDashboard = lazy(() => import("@/pages/FinancialReportsDashboard"));
const PurchaseRequisitions = lazy(() => import("@/pages/PurchaseRequisitions"));
const GoodsReceiptPage = lazy(() => import("@/pages/GoodsReceiptPage"));
const DemandForecastingPage = lazy(() => import("@/pages/DemandForecastingPage"));
const BOMManagement = lazy(() => import("@/pages/BOMManagement"));
const RoutingMaster = lazy(() => import("@/pages/RoutingMaster"));
const MRPDashboardFull = lazy(() => import("@/pages/MRPDashboardFull"));
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
const DemandForecastingAI = lazy(() => import("@/pages/DemandForecastingAI"));
const RetailAnalyticsDashboard = lazy(() => import("@/pages/RetailAnalyticsDashboard"));
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
const InventoryStockManagement = lazy(() => import("@/pages/InventoryStockManagement"));
const ShippingManagement = lazy(() => import("@/pages/ShippingManagement"));
const PromotionDiscountCodes = lazy(() => import("@/pages/PromotionDiscountCodes"));
const ReturnsRefundsManagement = lazy(() => import("@/pages/ReturnsRefundsManagement"));
const EcommerceBIDashboard = lazy(() => import("@/pages/EcommerceBIDashboard"));
const POSTerminalCheckout = lazy(() => import("@/pages/POSTerminalCheckout"));
const StoreOutletManagement = lazy(() => import("@/pages/StoreOutletManagement"));
const POSCashReconciliation = lazy(() => import("@/pages/POSCashReconciliation"));
const WorkforceScheduling = lazy(() => import("@/pages/WorkforceScheduling"));
const ReplenishmentPlanning = lazy(() => import("@/pages/ReplenishmentPlanning"));
const PricingPromotionManagement = lazy(() => import("@/pages/PricingPromotionManagement"));
const OmniChannelFulfillment = lazy(() => import("@/pages/OmniChannelFulfillment"));
const RetailBIDashboard = lazy(() => import("@/pages/RetailBIDashboard"));
const GoodsReceiptPutaway = lazy(() => import("@/pages/GoodsReceiptPutaway"));
const StockPickingPacking = lazy(() => import("@/pages/StockPickingPacking"));
const CycleCountingAudit = lazy(() => import("@/pages/CycleCountingAudit"));
const FreightRateCalculation = lazy(() => import("@/pages/FreightRateCalculation"));
const VehicleFleetManagement = lazy(() => import("@/pages/VehicleFleetManagement"));
const MaintenanceScheduling = lazy(() => import("@/pages/MaintenanceScheduling"));
const SupplierCarrierManagement = lazy(() => import("@/pages/SupplierCarrierManagement"));
const InventoryAllocationOptimization = lazy(() => import("@/pages/InventoryAllocationOptimization"));
const LogisticsComplianceSafety = lazy(() => import("@/pages/LogisticsComplianceSafety"));
const LogisticsBIDashboard = lazy(() => import("@/pages/LogisticsBIDashboard"));
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
const SubscriptionLifecycle = lazy(() => import("@/pages/SubscriptionLifecycle"));
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
const ColdChainLogistics = lazy(() => import("@/pages/ColdChainLogistics"));
const FBDemandPlanning = lazy(() => import("@/pages/FBDemandPlanning"));
const SustainabilityTraceability = lazy(() => import("@/pages/SustainabilityTraceability"));
const FoodBeverageBIDashboard = lazy(() => import("@/pages/FoodBeverageBIDashboard"));
const MaterialMaster = lazy(() => import("@/pages/MaterialMaster"));
const ProductMaster = lazy(() => import("@/pages/ProductMaster"));
const FormulationComposer = lazy(() => import("@/pages/FormulationComposer"));
const SupplierQualification = lazy(() => import("@/pages/SupplierQualification"));
const ELNResearchNotebook = lazy(() => import("@/pages/ELNResearchNotebook"));
const LIMSLabManagement = lazy(() => import("@/pages/LIMSLabManagement"));
const eBatchRecord = lazy(() => import("@/pages/eBatchRecord"));
const StabilityStudies = lazy(() => import("@/pages/StabilityStudies"));
const Serialization = lazy(() => import("@/pages/Serialization"));
const QMSCAPA = lazy(() => import("@/pages/QMSCAPA"));
const RegulatoryeCTD = lazy(() => import("@/pages/RegulatoryeCTD"));
const Pharmacovigilance = lazy(() => import("@/pages/Pharmacovigilance"));
const ClinicalSupply = lazy(() => import("@/pages/ClinicalSupply"));
const ValidationCSV = lazy(() => import("@/pages/ValidationCSV"));
const PharmaAnalytics = lazy(() => import("@/pages/PharmaAnalytics"));
const StyleMasterSKU = lazy(() => import("@/pages/StyleMasterSKU"));
const TechPackBuilder = lazy(() => import("@/pages/TechPackBuilder"));
const SampleTracking = lazy(() => import("@/pages/SampleTracking"));
const CMTFactoryManagement = lazy(() => import("@/pages/CMTFactoryManagement"));
const AssortmentPlanner = lazy(() => import("@/pages/AssortmentPlanner"));
const FashionInventory = lazy(() => import("@/pages/FashionInventory"));
const EcommerceMarketplace = lazy(() => import("@/pages/EcommerceMarketplace"));
const FashionPOS = lazy(() => import("@/pages/FashionPOS"));
const ReturnsExchanges = lazy(() => import("@/pages/ReturnsExchanges"));
const CostingProfitability = lazy(() => import("@/pages/CostingProfitability"));
const WholesaleB2B = lazy(() => import("@/pages/WholesaleB2B"));
const MarketingCampaigns = lazy(() => import("@/pages/MarketingCampaigns"));
const SustainabilityMaterials = lazy(() => import("@/pages/SustainabilityMaterials"));
const DemandForecastingFashion = lazy(() => import("@/pages/DemandForecastingFashion"));
const FashionAnalytics = lazy(() => import("@/pages/FashionAnalytics"));
const ProductMasterCPG = lazy(() => import("@/pages/ProductMasterCPG"));
const IngredientMasterCPG = lazy(() => import("@/pages/IngredientMasterCPG"));
const RecipeBOMMaster = lazy(() => import("@/pages/RecipeBOMMaster"));
const ProductionPackaging = lazy(() => import("@/pages/ProductionPackaging"));
const InventoryWarehousingCPG = lazy(() => import("@/pages/InventoryWarehousingCPG"));
const SalesDistribution = lazy(() => import("@/pages/SalesDistribution"));
const ForecastingDemandCPG = lazy(() => import("@/pages/ForecastingDemandCPG"));
const TradePromotions = lazy(() => import("@/pages/TradePromotions"));
const CRMLoyalty = lazy(() => import("@/pages/CRMLoyalty"));
const ReturnsWarranty = lazy(() => import("@/pages/ReturnsWarranty"));
const CostingMarginCPG = lazy(() => import("@/pages/CostingMarginCPG"));
const SustainabilityComplianceCPG = lazy(() => import("@/pages/SustainabilityComplianceCPG"));
const CPGAnalytics = lazy(() => import("@/pages/CPGAnalytics"));
const SubscriberManagement = lazy(() => import("@/pages/SubscriberManagement"));
const PlanPackageManagement = lazy(() => import("@/pages/PlanPackageManagement"));
const BillingInvoicing = lazy(() => import("@/pages/BillingInvoicing"));
const DeviceSIMManagement = lazy(() => import("@/pages/DeviceSIMManagement"));
const ServiceProvisioning = lazy(() => import("@/pages/ServiceProvisioning"));
const NetworkUsageMonitoring = lazy(() => import("@/pages/NetworkUsageMonitoring"));
const CustomerSupportCRM = lazy(() => import("@/pages/CustomerSupportCRM"));
const LoyaltyPrograms = lazy(() => import("@/pages/LoyaltyPrograms"));
const ChurnPredictionTelecom = lazy(() => import("@/pages/ChurnPrediction"));
const RevenueAssurance = lazy(() => import("@/pages/RevenueAssurance"));
const FinanceAccounting = lazy(() => import("@/pages/FinanceAccounting"));
const WarrantyReturns = lazy(() => import("@/pages/WarrantyReturns"));
const MarketingTelecom = lazy(() => import("@/pages/MarketingTelecom"));
const ComplianceAudit = lazy(() => import("@/pages/ComplianceAudit"));
const TelecomAnalytics = lazy(() => import("@/pages/TelecomAnalytics"));
const ClinicalEHR = lazy(() => import("@/pages/ClinicalEHR"));
const LaboratoryDiagnostics = lazy(() => import("@/pages/LaboratoryDiagnostics"));
const PharmacyInventory = lazy(() => import("@/pages/PharmacyInventory"));
const SupplyChainHealthcare = lazy(() => import("@/pages/SupplyChainHealthcare"));
const BillingInsurance = lazy(() => import("@/pages/BillingInsurance"));
const ClinicalTrials = lazy(() => import("@/pages/ClinicalTrials"));
const ComplianceQuality = lazy(() => import("@/pages/ComplianceQuality"));
const FinanceHealthcare = lazy(() => import("@/pages/FinanceHealthcare"));
const HRScheduling = lazy(() => import("@/pages/HRScheduling"));
const HealthcareBI = lazy(() => import("@/pages/HealthcareBI"));
const ReadmissionRisk = lazy(() => import("@/pages/ReadmissionRisk"));
const LabTurnaround = lazy(() => import("@/pages/LabTurnaround"));
const InventoryHealthcare = lazy(() => import("@/pages/InventoryHealthcare"));
const HealthcareDashboard = lazy(() => import("@/pages/HealthcareDashboard"));
const StudentManagementEd = lazy(() => import("@/pages/StudentManagementEd"));
const CourseManagement = lazy(() => import("@/pages/CourseManagement"));
const Assessments = lazy(() => import("@/pages/Assessments"));
const Attendance = lazy(() => import("@/pages/Attendance"));
const VirtualClassroom = lazy(() => import("@/pages/VirtualClassroom"));
const BillingEducation = lazy(() => import("@/pages/BillingEducation"));
const Enrollment = lazy(() => import("@/pages/Enrollment"));
const AlumniEngagement = lazy(() => import("@/pages/AlumniEngagement"));
const PersonalizedLearning = lazy(() => import("@/pages/PersonalizedLearning"));
const EdFaculty = lazy(() => import("@/pages/EdFaculty"));
const EdCompliance = lazy(() => import("@/pages/EdCompliance"));
const EdAnalytics = lazy(() => import("@/pages/EdAnalytics"));
const Gradebook = lazy(() => import("@/pages/Gradebook"));
const Certification = lazy(() => import("@/pages/Certification"));
const EdDashboard = lazy(() => import("@/pages/EdDashboard"));
const StockIssue = lazy(() => import("@/pages/StockIssue"));
const StockTransfer = lazy(() => import("@/pages/StockTransfer"));
const ShipmentPlanning = lazy(() => import("@/pages/ShipmentPlanning"));
const DeliveryScheduling = lazy(() => import("@/pages/DeliveryScheduling"));
const TrackingDashboard = lazy(() => import("@/pages/TrackingDashboard"));
const SupplierPerformance = lazy(() => import("@/pages/SupplierPerformance"));
const TimesheetManagement = lazy(() => import("@/pages/TimesheetManagement"));
const ProjectBudgetManagement = lazy(() => import("@/pages/ProjectBudgetManagement"));
const ResourceUtilizationDashboard = lazy(() => import("@/pages/ResourceUtilizationDashboard"));
const TeamCollaborationHub = lazy(() => import("@/pages/TeamCollaborationHub"));
const ContactManagement = lazy(() => import("@/pages/ContactManagement"));
const OpportunitiesPage = lazy(() => import("@/pages/OpportunitiesPage"));
const QuotesAndOrders = lazy(() => import("@/pages/QuotesAndOrders"));
const SalesActivities = lazy(() => import("@/pages/SalesActivities"));
const DataSourceConfiguration = lazy(() => import("@/pages/DataSourceConfiguration"));
const KPIDashboard = lazy(() => import("@/pages/KPIDashboard"));
const LeaveManagement = lazy(() => import("@/pages/LeaveManagement"));
const RecruitmentManagement = lazy(() => import("@/pages/RecruitmentManagement"));
const PeriodClose = lazy(() => import("@/pages/PeriodClose"));
const FinancialConsolidation = lazy(() => import("@/pages/FinancialConsolidation"));
const AccountReconciliation = lazy(() => import("@/pages/AccountReconciliation"));
const IntercompanyReconciliation = lazy(() => import("@/pages/IntercompanyReconciliation"));
const ExceptionManagement = lazy(() => import("@/pages/ExceptionManagement"));
const IntercompanyEliminations = lazy(() => import("@/pages/IntercompanyEliminations"));
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
const AnomalyDetection = lazy(() => import("@/pages/AnomalyDetection"));
const PredictiveModeling = lazy(() => import("@/pages/PredictiveModeling"));
const ServiceLevelConfig = lazy(() => import("@/pages/ServiceLevelConfig"));
const SupplyChainOptimization = lazy(() => import("@/pages/SupplyChainOptimization"));
const TemplateLibrary = lazy(() => import("@/pages/TemplateLibrary"));

// Phase 3: Procurement Module
const RFQs = lazy(() => import("@/pages/RFQs"));
const PurchaseOrders = lazy(() => import("@/pages/PurchaseOrders"));
const GoodsReceipt = lazy(() => import("@/pages/GoodsReceipt"));
const SupplierInvoices = lazy(() => import("@/pages/SupplierInvoices"));
const ThreeWayMatch = lazy(() => import("@/pages/ThreeWayMatch"));

// Phase 4: IoT, Mobile, Advanced Analytics
const IoT = lazy(() => import("@/pages/IoT"));
const MobileApps = lazy(() => import("@/pages/MobileApps"));

// Phase 5: Supply Chain, Inventory, Quality, Integration
const SupplyChain = lazy(() => import("@/pages/SupplyChain"));
const Inventory = lazy(() => import("@/pages/Inventory"));
const QualityManagement = lazy(() => import("@/pages/QualityManagement"));

// Phase 6: Document, Expense, Travel, Time, Learning, Knowledge Management
const DocumentManagement = lazy(() => import("@/pages/DocumentManagement"));
const ExpenseManagement = lazy(() => import("@/pages/ExpenseManagement"));
const TravelManagement = lazy(() => import("@/pages/TravelManagement"));
const TimeAttendance = lazy(() => import("@/pages/TimeAttendance"));
const LearningManagement = lazy(() => import("@/pages/LearningManagement"));
const KnowledgeManagement = lazy(() => import("@/pages/KnowledgeManagement"));

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
const EmployeeEngagement = lazy(() => import("@/pages/EmployeeEngagement"));
const SuccessionPlanning = lazy(() => import("@/pages/SuccessionPlanning"));
const CapacityPlanning = lazy(() => import("@/pages/CapacityPlanning"));
const ChangeManagement = lazy(() => import("@/pages/ChangeManagement"));
const AIAutomation = lazy(() => import("@/pages/AIAutomation"));
const DocumentProcessing = lazy(() => import("@/pages/DocumentProcessing"));
const CognitiveServices = lazy(() => import("@/pages/CognitiveServices"));
const WebsiteManagement = lazy(() => import("@/pages/WebsiteManagement"));
const PortalManagement = lazy(() => import("@/pages/PortalManagement"));
const CommunicationCenter = lazy(() => import("@/pages/CommunicationCenter"));
const CostOptimization = lazy(() => import("@/pages/CostOptimization"));
const SustainabilityReporting = lazy(() => import("@/pages/SustainabilityReporting"));
const QualityAssuranceHub = lazy(() => import("@/pages/QualityAssuranceHub"));

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/crm" component={CRM} />
      <Route path="/crm/leads" component={LeadsDetail} />
      <Route path="/crm/opportunities" component={OpportunitiesDetail} />
      <Route path="/crm/customers" component={CustomersDetail} />
      <Route path="/crm/campaigns" component={CRMCampaignsDetail} />
      <Route path="/crm/pipeline" component={CRMPipelineDetail} />
      <Route path="/crm/analytics" component={CRMAnalyticsDetail} />
      <Route path="/crm/settings" component={CRMSettingsDetail} />
      <Route path="/crm/contacts" component={CRMContactsDetail} />
      <Route path="/hr" component={HR} />
      <Route path="/hr/employees" component={EmployeesDetail} />
      <Route path="/hr/payroll" component={PayrollDetail} />
      <Route path="/hr/recruitment" component={HRRecruitmentDetail} />
      <Route path="/hr/performance" component={HRPerformanceDetail} />
      <Route path="/hr/leave" component={HRLeaveDetail} />
      <Route path="/hr/training" component={HRTrainingDetail} />
      <Route path="/hr/succession" component={HRSuccessionDetail} />
      <Route path="/hr/engagement" component={HREngagementDetail} />
      <Route path="/hr/compensation" component={HRCompensationDetail} />
      <Route path="/hr/attendance" component={HRAttendanceDetail} />
      <Route path="/hr/analytics" component={HRAnalyticsDetail} />
      <Route path="/hr/policies" component={HRPoliciesDetail} />
      <Route path="/hr/onboarding" component={HROnboardingDetail} />
      <Route path="/marketing" component={Marketing} />
      <Route path="/marketing/campaigns" component={CampaignsDetail} />
      <Route path="/marketing/email" component={MarketingEmailDetail} />
      <Route path="/marketing/social" component={MarketingSocialDetail} />
      <Route path="/marketing/leads" component={MarketingLeadsDetail} />
      <Route path="/marketing/segments" component={MarketingSegmentationDetail} />
      <Route path="/marketing/automation" component={MarketingAutomationDetail} />
      <Route path="/marketing/budget" component={MarketingBudgetDetail} />
      <Route path="/marketing/analytics" component={MarketingAnalyticsDetail} />
      <Route path="/marketing/settings" component={MarketingSettingsDetail} />
      <Route path="/projects" component={Projects} />
      <Route path="/projects/tasks" component={TasksDetail} />
      <Route path="/projects/kanban" component={ProjectsKanbanDetail} />
      <Route path="/projects/resources" component={ProjectsResourcesDetail} />
      <Route path="/projects/sprints" component={ProjectsSprintsDetail} />
      <Route path="/projects/timeline" component={ProjectsTimelineDetail} />
      <Route path="/projects/analytics" component={ProjectsAnalyticsDetail} />
      <Route path="/projects/settings" component={ProjectsSettingsDetail} />
      <Route path="/manufacturing" component={Manufacturing} />
      <Route path="/manufacturing/bom" component={BOMDetail} />
      <Route path="/manufacturing/workorders" component={ManufacturingWorkOrdersDetail} />
      <Route path="/manufacturing/production" component={ManufacturingProductionDetail} />
      <Route path="/manufacturing/quality" component={ManufacturingQualityDetail} />
      <Route path="/erp" component={ERP} />
      <Route path="/erp/gl" component={GeneralLedgerDetail} />
      <Route path="/erp/vendors" component={VendorsDetail} />
      <Route path="/erp/purchase-orders" component={PurchaseOrdersDetail} />
      <Route path="/erp/ap" component={ERPAPDetail} />
      <Route path="/erp/ar" component={ERPARDetail} />
      <Route path="/erp/inventory" component={ERPInventoryDetail} />
      <Route path="/erp/quality" component={ERPQualityDetail} />
      <Route path="/erp/settings" component={ERPSettingsDetail} />
      <Route path="/admin" component={AdminConsole} />
      <Route path="/admin/overview" component={AdminOverviewDetail} />
      <Route path="/admin/users" component={AdminUsersDetail} />
      <Route path="/admin/roles" component={AdminRolesDetail} />
      <Route path="/admin/permissions" component={AdminPermissionsDetail} />
      <Route path="/admin/audit" component={AdminAuditDetail} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/analytics/dashboard" component={AnalyticsDashboardDetail} />
      <Route path="/analytics/reports" component={AnalyticsReportsDetail} />
      <Route path="/analytics/insights" component={AnalyticsInsightsDetail} />
      <Route path="/compliance" component={Compliance} />
      <Route path="/compliance/controls" component={ComplianceControlsDetail} />
      <Route path="/compliance/policies" component={CompliancePoliciesDetail} />
      <Route path="/compliance/audits" component={ComplianceAuditDetail} />
      <Route path="/compliance/standards" component={ComplianceStandardsDetail} />
      <Route path="/compliance/risks" component={ComplianceRiskDetail} />
      <Route path="/ai" component={AIChat} />
      <Route path="/ai/chat" component={AIAssistantChatDetail} />
      <Route path="/ai/knowledge" component={AIAssistantKnowledgeDetail} />
      <Route path="/iot" component={IoT} />
      <Route path="/mobile-apps" component={MobileApps} />
      <Route path="/advanced-analytics" component={AdvancedAnalytics} />
      <Route path="/supply-chain" component={SupplyChain} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/quality-management" component={QualityManagement} />
      <Route path="/documents" component={DocumentManagement} />
      <Route path="/expenses" component={ExpenseManagement} />
      <Route path="/travel" component={TravelManagement} />
      <Route path="/time-attendance" component={TimeAttendance} />
      <Route path="/learning" component={LearningManagement} />
      <Route path="/knowledge" component={KnowledgeManagement} />
      <Route path="/finance" component={Finance} />
      <Route path="/finance/invoices" component={InvoicesDetail} />
      <Route path="/finance/expenses" component={ExpensesDetail} />
      <Route path="/finance/budgets" component={FinanceBudgetsDetail} />
      <Route path="/finance/reports" component={FinanceReportsDetail} />
      <Route path="/finance/payments" component={FinancePaymentsDetail} />
      <Route path="/finance/ledger" component={FinanceLedgerDetail} />
      <Route path="/finance/settings" component={FinanceSettingsDetail} />
      <Route path="/hr" component={HR} />
      <Route path="/manufacturing" component={Manufacturing} />
      <Route path="/service" component={Service} />
      <Route path="/service/tickets" component={ServiceTicketsDetail} />
      <Route path="/service/customers" component={ServiceCustomersDetail} />
      <Route path="/service/knowledge" component={ServiceKnowledgeDetail} />
      <Route path="/service/sla" component={ServiceSLADetail} />
      <Route path="/service/analytics" component={ServiceAnalyticsDetail} />
      <Route path="/service/queue" component={ServiceQueueDetail} />
      <Route path="/service/settings" component={ServiceSettingsDetail} />
      <Route path="/tenant-admin" component={TenantAdmin} />
      <Route path="/billing-plans" component={BillingPlans} />
      <Route path="/admin-roles" component={AdminRoles} />
      <Route path="/api-gateway" component={APIGateway} />
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
      <Route path="/anomaly-detection" component={AnomalyDetection} />
      <Route path="/predictive-modeling" component={PredictiveModeling} />
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
      <Route path="/session-management" component={SessionManagement} />
      <Route path="/login-history" component={LoginHistory} />
      <Route path="/security-settings" component={SecuritySettings} />
      <Route path="/permission-matrix" component={PermissionMatrix} />
      <Route path="/role-hierarchy" component={RoleHierarchy} />
      <Route path="/sod-rules" component={SoDRules} />
      <Route path="/role-assignment" component={RoleAssignment} />
      <Route path="/mfa-enrollment" component={MFAEnrollment} />
      <Route path="/password-policies" component={PasswordPolicies} />
      <Route path="/device-management" component={DeviceManagement} />
      <Route path="/security-event-log" component={SecurityEventLog} />
      <Route path="/authentication-methods" component={AuthenticationMethods} />
      <Route path="/user-activity-dashboard" component={UserActivityDashboard} />
      <Route path="/compliance-monitoring" component={ComplianceMonitoring} />
      <Route path="/compliance-exceptions" component={ComplianceExceptions} />
      <Route path="/automation-rules" component={AutomationRules} />
      <Route path="/event-triggers" component={EventTriggers} />
      <Route path="/workflow-monitoring" component={WorkflowMonitoring} />
      <Route path="/integration-status" component={IntegrationStatus} />
      <Route path="/journal-entries" component={JournalEntries} />
      <Route path="/customers" component={CustomerManagement} />
      <Route path="/cash-management" component={CashManagementPage} />
      <Route path="/tax-management" component={TaxManagement} />
      <Route path="/financial-reports" component={FinancialReportsDashboard} />
      <Route path="/purchase-requisitions" component={PurchaseRequisitions} />
      <Route path="/goods-receipt" component={GoodsReceiptPage} />
      <Route path="/demand-forecasting" component={DemandForecastingPage} />
      <Route path="/bom-management" component={BOMManagement} />
      <Route path="/routing-master" component={RoutingMaster} />
      <Route path="/mrp-dashboard" component={MRPDashboardFull} />
      <Route path="/wip-tracking" component={WIPTracking} />
      <Route path="/ncr-management" component={NCRManagement} />
      <Route path="/standard-costing" component={StandardCosting} />
      <Route path="/trade-compliance" component={TradeComplianceDashboard} />
      <Route path="/transportation-management" component={TransportationManagementSystem} />
      <Route path="/order-fulfillment" component={OrderFulfillment} />
      <Route path="/rma-management" component={RMAManagement} />
      <Route path="/supply-network" component={SupplyNetworkOptimization} />
      <Route path="/3pl-management" component={ThirdPartyLogistics} />
      <Route path="/estimation-workbook" component={EstimationWorkbook} />
      <Route path="/boq-construction" component={BOQManagementConstruction} />
      <Route path="/subcontractor-management" component={SubcontractorManagement} />
      <Route path="/equipment-management" component={EquipmentManagement} />
      <Route path="/daily-progress-report" component={DailyProgressReport} />
      <Route path="/earned-value-analysis" component={EarnedValueAnalysis} />
      <Route path="/hse-safety" component={HSESafety} />
      <Route path="/product-catalog" component={ProductCatalog} />
      <Route path="/pricing-promo-engine" component={PricingPromoEngine} />
      <Route path="/point-of-sale" component={PointOfSale} />
      <Route path="/store-operations" component={StoreOperationsDashboard} />
      <Route path="/omni-channel-orders" component={OmniChannelOrders} />
      <Route path="/merchandise-planning" component={MerchandisePlanning} />
      <Route path="/sales-order-management" component={SalesOrderManagement} />
      <Route path="/pricing-rebates-engine" component={PricingRebatesEngine} />
      <Route path="/supplier-collaboration" component={SupplierCollaborationPortal} />
      <Route path="/freight-management" component={FreightManagement} />
      <Route path="/credit-management" component={CreditManagementCollections} />
      <Route path="/sales-commission" component={SalesCommissionManagement} />
      <Route path="/inventory-optimization" component={InventoryOptimization} />
      <Route path="/edi-marketplace" component={EDIMarketplaceConnectors} />
      <Route path="/plm-engineering-changes" component={PLMEngineeringChangeControl} />
      <Route path="/mrp-mps-planning" component={MRPMPSPlanning} />
      <Route path="/shop-floor-collection" component={ShopFloorDataCollection} />
      <Route path="/cmms-maintenance" component={CMMSMaintenance} />
      <Route path="/inspection-plans-itp" component={InspectionPlansITP} />
      <Route path="/ncr-cama-management" component={NCRCAMAManagement} />
      <Route path="/production-scheduling" component={ProductionSchedulingGantt} />
      <Route path="/tooling-management" component={ToolingManagement} />
      <Route path="/wip-tracking" component={WIPTrackingDashboard} />
      <Route path="/supplier-quality-scorecard" component={SupplierQualityScorecard} />
      <Route path="/formulation-recipes" component={FormulationRecipeManagement} />
      <Route path="/batch-orders" component={BatchOrdersManagement} />
      <Route path="/lims-lab" component={LIMSLabIntegration} />
      <Route path="/bulk-inventory" component={BulkInventoryManagement} />
      <Route path="/yield-variance" component={YieldVarianceTracking} />
      <Route path="/batch-genealogy" component={BatchTraceabilityGeology} />
      <Route path="/shopping-cart" component={ShoppingCartCheckout} />
      <Route path="/product-reviews" component={ProductReviewsRatings} />
      <Route path="/inventory-management" component={InventoryStockManagement} />
      <Route path="/shipping-management" component={ShippingManagement} />
      <Route path="/promotions" component={PromotionDiscountCodes} />
      <Route path="/returns-refunds" component={ReturnsRefundsManagement} />
      <Route path="/ecommerce-analytics" component={EcommerceBIDashboard} />
      <Route path="/pos-terminal" component={POSTerminalCheckout} />
      <Route path="/store-management" component={StoreOutletManagement} />
      <Route path="/pos-reconciliation" component={POSCashReconciliation} />
      <Route path="/workforce-scheduling" component={WorkforceScheduling} />
      <Route path="/replenishment-planning" component={ReplenishmentPlanning} />
      <Route path="/pricing-promotions" component={PricingPromotionManagement} />
      <Route path="/omni-fulfillment" component={OmniChannelFulfillment} />
      <Route path="/goods-receipt-putaway" component={GoodsReceiptPutaway} />
      <Route path="/stock-picking-packing" component={StockPickingPacking} />
      <Route path="/cycle-counting" component={CycleCountingAudit} />
      <Route path="/freight-rate-calc" component={FreightRateCalculation} />
      <Route path="/fleet-management" component={VehicleFleetManagement} />
      <Route path="/maintenance-schedule" component={MaintenanceScheduling} />
      <Route path="/suppliers-carriers" component={SupplierCarrierManagement} />
      <Route path="/inventory-allocation" component={InventoryAllocationOptimization} />
      <Route path="/compliance-safety" component={LogisticsComplianceSafety} />
      <Route path="/logistics-analytics" component={LogisticsBIDashboard} />
      <Route path="/telecom-subscribers" component={CustomerSubscriberManagement} />
      <Route path="/service-provisioning" component={ServiceProvisioningOrder} />
      <Route path="/network-inventory" component={NetworkInventoryOSS} />
      <Route path="/telecom-billing" component={TelecomBillingRevenue} />
      <Route path="/fault-monitoring" component={FaultPerformanceMonitoring} />
      <Route path="/telecom-marketing" component={MarketingEngagement} />
      <Route path="/telecom-finance" component={TelecomFinanceCompliance} />
      <Route path="/telecom-analytics" component={TelecomBIDashboard} />
      <Route path="/device-management" component={CustomerDeviceManagement} />
      <Route path="/sla-management" component={SLAServiceTierManagement} />
      <Route path="/subscription-lifecycle" component={SubscriptionLifecycle} />
      <Route path="/telecom-support" component={TelecomCustomerSupport} />
      <Route path="/patient-management" component={PatientManagement} />
      <Route path="/appointment-scheduling" component={AppointmentScheduling} />
      <Route path="/clinical-documentation" component={ClinicalDocumentation} />
      <Route path="/laboratory-management" component={LaboratoryManagement} />
      <Route path="/pharmacy-management" component={PharmacyManagement} />
      <Route path="/medical-billing" component={MedicalBilling} />
      <Route path="/inpatient-management" component={InpatientManagement} />
      <Route path="/healthcare-analytics" component={HealthcareBIDashboard} />
      <Route path="/healthcare-compliance" component={HealthcareCompliance} />
      <Route path="/reservations" component={ReservationBooking} />
      <Route path="/front-desk" component={FrontDeskOperations} />
      <Route path="/housekeeping" component={HousekeepingManagement} />
      <Route path="/fb-pos" component={FoodBeveragePOS} />
      <Route path="/events-banqueting" component={EventBanquetingManagement} />
      <Route path="/guest-crm" component={GuestCRMManagement} />
      <Route path="/revenue-management" component={RevenueManagement} />
      <Route path="/hospitality-inventory" component={HospitalityInventory} />
      <Route path="/hr-rostering" component={HospitalityHRRostering} />
      <Route path="/hospitality-analytics" component={HospitalityBIDashboard} />
      <Route path="/shipment-management" component={ShipmentOrderManagement} />
      <Route path="/route-optimization" component={RouteLoadOptimization} />
      <Route path="/yard-dock" component={YardDockManagement} />
      <Route path="/carrier-procurement" component={CarrierProcurement} />
      <Route path="/shipment-tracking" component={ShipmentTracking} />
      <Route path="/freight-billing" component={FreightCostingBilling} />
      <Route path="/customs-compliance" component={CustomsCompliance} />
      <Route path="/fleet-drivers" component={FleetDriverManagement} />
      <Route path="/tl-analytics" component={TransportationBIDashboard} />
      <Route path="/vehicle-inventory" component={VehicleInventoryManagement} />
      <Route path="/digital-retail-leads" component={DigitalRetailLeads} />
      <Route path="/vehicle-sales-deals" component={VehicleSalesDeals} />
      <Route path="/workshop-service" component={WorkshopServiceOrders} />
      <Route path="/auto-parts" component={PartsInventory} />
      <Route path="/warranty-claims" component={WarrantyClaimsManagement} />
      <Route path="/telematics" component={TelematicsVehicleData} />
      <Route path="/auto-analytics" component={AutomotiveBIDashboard} />
      <Route path="/recipes" component={RecipeFormulation} />
      <Route path="/batch-manufacturing" component={BatchManufacturing} />
      <Route path="/quality-safety" component={QualityFoodSafety} />
      <Route path="/fb-inventory" component={FBInventoryColdChain} />
      <Route path="/procurement" component={ProcurementSourcing} />
      <Route path="/menu-pos" component={MenuPOSOperations} />
      <Route path="/ecommerce-delivery" component={ECommerceDelivery} />
      <Route path="/packaging-labels" component={PackagingTraceability} />
      <Route path="/cold-chain" component={ColdChainLogistics} />
      <Route path="/demand-planning" component={FBDemandPlanning} />
      <Route path="/sustainability" component={SustainabilityTraceability} />
      <Route path="/fb-analytics" component={FoodBeverageBIDashboard} />
      <Route path="/material-master" component={MaterialMaster} />
      <Route path="/product-master" component={ProductMaster} />
      <Route path="/formulation-composer" component={FormulationComposer} />
      <Route path="/supplier-qualification" component={SupplierQualification} />
      <Route path="/eln-research" component={ELNResearchNotebook} />
      <Route path="/lims" component={LIMSLabManagement} />
      <Route path="/batch-record" component={eBatchRecord} />
      <Route path="/stability-studies" component={StabilityStudies} />
      <Route path="/serialization" component={Serialization} />
      <Route path="/qms-capa" component={QMSCAPA} />
      <Route path="/regulatory-ectd" component={RegulatoryeCTD} />
      <Route path="/pharmacovigilance" component={Pharmacovigilance} />
      <Route path="/clinical-supply" component={ClinicalSupply} />
      <Route path="/validation-csv" component={ValidationCSV} />
      <Route path="/pharma-analytics" component={PharmaAnalytics} />
      <Route path="/style-master" component={StyleMasterSKU} />
      <Route path="/tech-packs" component={TechPackBuilder} />
      <Route path="/sample-tracking" component={SampleTracking} />
      <Route path="/cmt-factories" component={CMTFactoryManagement} />
      <Route path="/assortment-planning" component={AssortmentPlanner} />
      <Route path="/fashion-inventory" component={FashionInventory} />
      <Route path="/ecommerce-marketplace" component={EcommerceMarketplace} />
      <Route path="/fashion-pos" component={FashionPOS} />
      <Route path="/returns-exchanges" component={ReturnsExchanges} />
      <Route path="/costing-profitability" component={CostingProfitability} />
      <Route path="/wholesale-b2b" component={WholesaleB2B} />
      <Route path="/marketing-campaigns" component={MarketingCampaigns} />
      <Route path="/sustainability-materials" component={SustainabilityMaterials} />
      <Route path="/demand-forecasting-fashion" component={DemandForecastingFashion} />
      <Route path="/fashion-analytics" component={FashionAnalytics} />
      <Route path="/cpg-products" component={ProductMasterCPG} />
      <Route path="/cpg-ingredients" component={IngredientMasterCPG} />
      <Route path="/cpg-recipes" component={RecipeBOMMaster} />
      <Route path="/cpg-production" component={ProductionPackaging} />
      <Route path="/cpg-inventory" component={InventoryWarehousingCPG} />
      <Route path="/cpg-sales" component={SalesDistribution} />
      <Route path="/cpg-forecast" component={ForecastingDemandCPG} />
      <Route path="/cpg-promotions" component={TradePromotions} />
      <Route path="/cpg-crm" component={CRMLoyalty} />
      <Route path="/cpg-returns" component={ReturnsWarranty} />
      <Route path="/cpg-costing" component={CostingMarginCPG} />
      <Route path="/cpg-compliance" component={SustainabilityComplianceCPG} />
      <Route path="/cpg-analytics" component={CPGAnalytics} />
      <Route path="/telecom-subscribers" component={SubscriberManagement} />
      <Route path="/telecom-plans" component={PlanPackageManagement} />
      <Route path="/telecom-billing" component={BillingInvoicing} />
      <Route path="/telecom-devices" component={DeviceSIMManagement} />
      <Route path="/telecom-services" component={ServiceProvisioning} />
      <Route path="/telecom-usage" component={NetworkUsageMonitoring} />
      <Route path="/telecom-support" component={CustomerSupportCRM} />
      <Route path="/telecom-loyalty" component={LoyaltyPrograms} />
      <Route path="/telecom-churn" component={ChurnPredictionTelecom} />
      <Route path="/telecom-revenue" component={RevenueAssurance} />
      <Route path="/telecom-finance" component={FinanceAccounting} />
      <Route path="/telecom-warranty" component={WarrantyReturns} />
      <Route path="/telecom-campaigns" component={MarketingTelecom} />
      <Route path="/telecom-compliance" component={ComplianceAudit} />
      <Route path="/telecom-analytics" component={TelecomAnalytics} />
      <Route path="/hc-patients" component={PatientManagement} />
      <Route path="/hc-ehr" component={ClinicalEHR} />
      <Route path="/hc-labs" component={LaboratoryDiagnostics} />
      <Route path="/hc-pharmacy" component={PharmacyInventory} />
      <Route path="/hc-supply" component={SupplyChainHealthcare} />
      <Route path="/hc-billing" component={BillingInsurance} />
      <Route path="/hc-trials" component={ClinicalTrials} />
      <Route path="/hc-compliance" component={ComplianceQuality} />
      <Route path="/hc-finance" component={FinanceHealthcare} />
      <Route path="/hc-hr" component={HRScheduling} />
      <Route path="/hc-analytics" component={HealthcareBI} />
      <Route path="/hc-readmission" component={ReadmissionRisk} />
      <Route path="/hc-tat" component={LabTurnaround} />
      <Route path="/hc-inventory" component={InventoryHealthcare} />
      <Route path="/hc-dashboard" component={HealthcareDashboard} />
      <Route path="/ed-students" component={StudentManagementEd} />
      <Route path="/ed-courses" component={CourseManagement} />
      <Route path="/ed-assessments" component={Assessments} />
      <Route path="/ed-attendance" component={Attendance} />
      <Route path="/ed-virtual" component={VirtualClassroom} />
      <Route path="/ed-billing" component={BillingEducation} />
      <Route path="/ed-enrollment" component={Enrollment} />
      <Route path="/ed-alumni" component={AlumniEngagement} />
      <Route path="/ed-personalized" component={PersonalizedLearning} />
      <Route path="/ed-faculty" component={EdFaculty} />
      <Route path="/ed-compliance" component={EdCompliance} />
      <Route path="/ed-analytics" component={EdAnalytics} />
      <Route path="/ed-grades" component={Gradebook} />
      <Route path="/ed-certificates" component={Certification} />
      <Route path="/ed-dashboard" component={EdDashboard} />
      <Route path="/stock-issue" component={StockIssue} />
      <Route path="/stock-transfer" component={StockTransfer} />
      <Route path="/shipment-planning" component={ShipmentPlanning} />
      <Route path="/delivery-scheduling" component={DeliveryScheduling} />
      <Route path="/tracking-dashboard" component={TrackingDashboard} />
      <Route path="/supplier-performance" component={SupplierPerformance} />
      <Route path="/timesheet-management" component={TimesheetManagement} />
      <Route path="/project-budget" component={ProjectBudgetManagement} />
      <Route path="/resource-utilization" component={ResourceUtilizationDashboard} />
      <Route path="/team-collaboration" component={TeamCollaborationHub} />
      <Route path="/contacts" component={ContactManagement} />
      <Route path="/opportunities" component={OpportunitiesPage} />
      <Route path="/quotes-orders" component={QuotesAndOrders} />
      <Route path="/sales-activities" component={SalesActivities} />
      <Route path="/data-sources" component={DataSourceConfiguration} />
      <Route path="/kpi-dashboard" component={KPIDashboard} />
      <Route path="/predictive-analytics" component={PredictiveAnalytics} />
      <Route path="/leave-management" component={LeaveManagement} />
      <Route path="/recruitment" component={RecruitmentManagement} />
      <Route path="/period-close" component={PeriodClose} />
      <Route path="/financial-consolidation" component={FinancialConsolidation} />
      <Route path="/account-reconciliation" component={AccountReconciliation} />
      <Route path="/intercompany-reconciliation" component={IntercompanyReconciliation} />
      <Route path="/exception-management" component={ExceptionManagement} />
      <Route path="/intercompany-eliminations" component={IntercompanyEliminations} />
      <Route path="/ai-automation" component={AIAutomation} />
      <Route path="/document-processing" component={DocumentProcessing} />
      <Route path="/cognitive-services" component={CognitiveServices} />
      <Route path="/website-management" component={WebsiteManagement} />
      <Route path="/portal-management" component={PortalManagement} />
      <Route path="/communication-center" component={CommunicationCenter} />
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
      <Route path="/employee-engagement" component={EmployeeEngagement} />
      <Route path="/succession-planning" component={SuccessionPlanning} />
      <Route path="/capacity-planning" component={CapacityPlanning} />
      <Route path="/change-management" component={ChangeManagement} />
      <Route path="/cost-optimization" component={CostOptimization} />
      <Route path="/sustainability-reporting" component={SustainabilityReporting} />
      <Route path="/quality-assurance" component={QualityAssuranceHub} />
      <Route path="/crm-module" component={CRMModule} />
      <Route path="/finance-module" component={FinanceModule} />
      <Route path="/hr-module" component={HRModule} />
      <Route path="/erp-module" component={ERPModule} />
      <Route path="/service-module" component={ServiceModule} />
      <Route path="/projects-module" component={ProjectsModule} />
      <Route path="/marketing-module" component={MarketingModule} />
      <Route path="/manufacturing-module" component={ManufacturingModule} />
      <Route path="/analytics-module" component={AnalyticsModule} />
      <Route path="/admin-console-module" component={AdminConsoleModule} />
      <Route path="/compliance-module" component={ComplianceModule} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const style = { "--sidebar-width": "18rem" } as React.CSSProperties;

  return (
    <RBACProvider>
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
    </RBACProvider>
  );
}
