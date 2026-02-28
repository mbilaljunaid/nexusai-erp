import { Switch, Route, useLocation, Redirect } from "wouter";
import { Suspense } from "react";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import GlobalLayout from "@/components/layout/GlobalLayout";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RBACProvider, useRBAC } from "@/components/RBACContext";
import { TourProvider } from "@/hooks/use-tour";
import { GuidedTourOverlay } from "@/components/GuidedTour";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { QuickTipsProvider } from "@/components/QuickTips";
// AIChatWidget removed — consolidated into NexusAIPanel
import { LedgerProvider } from "@/context/LedgerContext";
import { NexusAIProvider } from "@/contexts/NexusAIContext";
import { NexusAIPanel } from "@/components/NexusAIPanel";
import NotFound from "@/pages/not-found";
import CrmRoutes from "@/routes/CrmRoutes";
import FinanceRoutes from "@/routes/FinanceRoutes";
import HrRoutes from "@/routes/HrRoutes";
import ScmRoutes from "@/routes/ScmRoutes";
import MaintenanceRoutes from "@/routes/MaintenanceRoutes";
import ConstructionRoutes from "@/routes/ConstructionRoutes";
import ProjectRoutes from "@/routes/ProjectRoutes";
import TestRoute from "./TestRoute";
import ServiceRoutes from "@/routes/ServiceRoutes";
import WfmAnalytics from "@/pages/wfm/WfmAnalytics";
import AccrualTesting from "@/pages/wfm/AccrualTesting";
import AdminRoutes from "@/routes/AdminRoutes";
import PortalRoutes from "@/routes/PortalRoutes";
import PublicRoutes from "@/routes/PublicRoutes";

import OrderRoutes from "@/routes/OrderRoutes";
import IndustryRoutes from "@/routes/IndustryRoutes";
import DashboardRoutes from "@/routes/DashboardRoutes";
import ReportRoutes from "@/routes/ReportRoutes";
import MarketingRoutes from "@/routes/MarketingRoutes";
import AnalyticsRoutes from "@/routes/AnalyticsRoutes";
import ComplianceRoutes from "@/routes/ComplianceRoutes";
import MdmRoutes from "@/routes/MdmRoutes";
import ModuleRoutes from "@/routes/ModuleRoutes";

import ErpRoutes from "@/routes/ErpRoutes";
import ProcessRoutes from "@/routes/ProcessRoutes";

// Direct page imports for sidebar links
const SettingsPage = lazyWithRetry(() => import("@/pages/Settings"));
const SCMDashboard = lazyWithRetry(() => import("@/pages/SCMOverview"));
const IndustryDashboard = lazyWithRetry(() => import("@/pages/IndustryDashboard"));
const DashboardPage = lazyWithRetry(() => import("@/pages/Dashboard"));
const EPMPage = lazyWithRetry(() => import("@/pages/EPMPage"));

// Talent/Learning
const ManagerLearningDashboard = lazyWithRetry(() => import("@/pages/hr/learning/manager/ManagerLearningDashboard"));
const LearningPlayer = lazyWithRetry(() => import("@/pages/hr/learning/player/LearningPlayer"));
const CourseCatalogAdmin = lazyWithRetry(() => import("@/pages/hr/learning/admin/CourseCatalogAdmin"));
const CurriculumBuilder = lazyWithRetry(() => import("@/pages/hr/learning/admin/CurriculumBuilder"));
const AssessmentBuilder = lazyWithRetry(() => import("@/pages/hr/learning/admin/AssessmentBuilder"));
const CommunityBrowser = lazyWithRetry(() => import("@/pages/hr/learning/admin/CommunityBrowser"));

// HR/Recruitment
const InterviewerDashboard = lazyWithRetry(() => import("@/pages/recruitment/InterviewerDashboard"));
const OnboardingWorkbench = lazyWithRetry(() => import("@/pages/recruitment/OnboardingWorkbench"));
const RecruitingAnalytics = lazyWithRetry(() => import("@/pages/recruitment/RecruitingAnalytics"));
const RecruitmentConfiguration = lazyWithRetry(() => import("@/pages/RecruitmentConfiguration"));
const PerformanceConfiguration = lazyWithRetry(() => import("@/pages/PerformanceConfiguration"));
const TemplateManagement = lazyWithRetry(() => import("@/pages/TemplateManagement"));


// WFM
const MyTime = lazyWithRetry(() => import("@/pages/wfm/MyTime"));
const ManagerApprovals = lazyWithRetry(() => import("@/pages/wfm/ManagerApprovals"));
const ShiftConfiguration = lazyWithRetry(() => import("@/pages/wfm/ShiftConfiguration"));
const TeamSchedule = lazyWithRetry(() => import("@/pages/wfm/TeamSchedule"));
const PayrollTransfer = lazyWithRetry(() => import("@/pages/wfm/PayrollTransfer"));
const TimekeeperConsole = lazyWithRetry(() => import("@/pages/wfm/TimekeeperConsole"));
const ViolationsDashboard = lazyWithRetry(() => import("@/pages/wfm/ViolationsDashboard"));
const WfmAnalyticsLazy = lazyWithRetry(() => import("@/pages/wfm/WfmAnalytics"));
const AIWorkforceInsights = lazyWithRetry(() => import("@/pages/wfm/AIWorkforceInsights"));
const HolidayCalendar = lazyWithRetry(() => import("@/pages/wfm/HolidayCalendar"));

// Self-Service
const MyPayslips = lazyWithRetry(() => import("@/pages/rewards/MyPayslips"));
const BenefitsEnrollment = lazyWithRetry(() => import("@/pages/hr/selfservice/BenefitsEnrollment"));
const DelegationWorkbench = lazyWithRetry(() => import("@/pages/hr/selfservice/DelegationWorkbench"));
const VoluntaryDeductions = lazyWithRetry(() => import("@/pages/hr/selfservice/VoluntaryDeductions"));
const StatutoryForms = lazyWithRetry(() => import("@/pages/hr/selfservice/StatutoryForms"));

// Intercompany
const IntercompanyWorkbench = lazyWithRetry(() => import("@/pages/intercompany/IntercompanyWorkbench"));
const IntercompanyReconciliation = lazyWithRetry(() => import("@/pages/intercompany/IntercompanyReconciliation"));
const NettingWorkbench = lazyWithRetry(() => import("@/pages/intercompany/NettingWorkbench"));
const AllocationsWorkbench = lazyWithRetry(() => import("@/pages/intercompany/AllocationsWorkbench"));
const ICDataAccessManager = lazyWithRetry(() => import("@/pages/intercompany/ICDataAccessManager"));

import LearningDashboard from "@/pages/hr/learning/LearningDashboard";
import InstructorDashboard from "@/pages/hr/learning/instructor/InstructorDashboard";
import CompensationDashboard from "@/pages/rewards/CompensationDashboard";
import PayrollWorkbench from "@/pages/rewards/PayrollWorkbench";
import RecruitmentManagement from "@/pages/RecruitmentManagement";
import JobRequisitionDetail from "@/pages/recruitment/JobRequisitionDetail";
import PerformanceManagement from "@/pages/PerformanceManagement";
import ESSDashboard from "@/pages/hr/selfservice/ESSDashboard";
import PersonalDetails from "@/pages/hr/selfservice/PersonalDetails";
import MyTimeCard from "@/pages/hr/selfservice/MyTimeCard";
// AIGuide removed — HR capabilities consolidated into NexusAIPanel
import MSSDashboard from "@/pages/hr/selfservice/MSSDashboard";
import HRAnalyticsDashboard from "@/pages/HRAnalyticsDashboard";
import PredictiveAnalytics from "@/pages/PredictiveAnalytics";
import HRReports from "@/pages/HRReports";
import KpiConfiguration from "@/pages/analytics/KpiConfiguration";
import ReportScheduler from "@/pages/analytics/ReportScheduler";

function Router() {
  const [location] = useLocation();
  console.log("DEBUG: App Router Location:", location);
  return (
    <>
      <Switch>
        {/* Dashboard */}
        <Route path="/dashboard" component={DashboardPage} />

        {/* Processes */}
        <Route path="/processes" component={ProcessRoutes} />
        <Route path="/processes/:rest*" component={ProcessRoutes} />
        <Route path="/operations" component={SCMDashboard} />
        <Route path="/system-configuration" component={SettingsPage} />
        <Route path="/manufacturing"><Redirect to="/manufacturing/dashboard" /></Route>
        <Route path="/scm" component={SCMDashboard} />
        <Route path="/epm" component={EPMPage} />
        <Route path="/epm/:rest*" component={EPMPage} />
        <Route path="/wfm"><Redirect to="/wfm/my-time" /></Route>

        {/* Analytics & Compliance */}
        <Route path="/analytics" component={AnalyticsRoutes} />
        <Route path="/analytics/:rest*" component={AnalyticsRoutes} />
        <Route path="/compliance" component={ComplianceRoutes} />
        <Route path="/compliance/:rest*" component={ComplianceRoutes} />
        <Route path="/compliance-module" component={ComplianceRoutes} />
        <Route path="/wfm/analytics" component={WfmAnalytics} />
        <Route path="/rewards/payroll" component={PayrollWorkbench} />
        <Route path="/wfm/admin/accrual-test" component={AccrualTesting} />

        {/* Marketing */}
        <Route path="/marketing" component={MarketingRoutes} />
        <Route path="/marketing/:rest*" component={MarketingRoutes} />
        <Route path="/modules" component={ModuleRoutes} />
        <Route path="/modules/:rest*" component={ModuleRoutes} />

        {/* Order Management */}
        <Route path="/order-management" component={OrderRoutes} />
        <Route path="/order-management/:rest*" component={OrderRoutes} />

        {/* Industries */}
        <Route path="/industry" component={IndustryRoutes} />
        <Route path="/industry/:rest*" component={IndustryRoutes} />

        {/* Platform/Admin (including Settings, Integrations) */}
        <Route path="/admin" component={AdminRoutes} />
        <Route path="/admin/:rest*" component={AdminRoutes} />
        <Route path="/settings" component={AdminRoutes} />
        <Route path="/integrations" component={AdminRoutes} />
        <Route path="/tenant-admin" component={AdminRoutes} />
        <Route path="/user-management" component={AdminRoutes} />
        <Route path="/environment-management" component={AdminRoutes} />
        <Route path="/subscription-management" component={AdminRoutes} />
        <Route path="/billing-management" component={AdminRoutes} />
        <Route path="/template-management" component={TemplateManagement} />


        <Route path="/testroute" component={TestRoute} />

        {/* Core Modules */}
        <Route path="/crm" component={CrmRoutes} />
        <Route path="/crm/:rest*" component={CrmRoutes} />
        <Route path="/finance" component={FinanceRoutes} />
        <Route path="/finance/:rest*" component={FinanceRoutes} />

        <Route path="/scm" component={ScmRoutes} />
        <Route path="/scm/:rest*" component={ScmRoutes} />
        <Route path="/mdm" component={MdmRoutes} />
        <Route path="/mdm/:rest*" component={MdmRoutes} />

        {/* Talent Management Direct Routes (Debug/Fix for 404) */}
        <Route path="/talent/learning/manager" component={ManagerLearningDashboard} />
        <Route path="/talent/learning/play/:enrollmentId" component={LearningPlayer} />
        <Route path="/talent/learning/admin" component={CourseCatalogAdmin} />
        <Route path="/talent/learning/admin/curricula" component={CurriculumBuilder} />
        <Route path="/talent/learning/admin/assessments" component={AssessmentBuilder} />
        <Route path="/talent/learning/admin/communities" component={CommunityBrowser} />
        <Route path="/talent/learning/instructor" component={InstructorDashboard} />
        <Route path="/talent/learning" component={LearningDashboard} />

        {/* Rewards */}
        <Route path="/rewards/compensation" component={CompensationDashboard} />
        <Route path="/rewards/payroll" component={PayrollWorkbench} />

        {/* Projects */}
        <Route path="/hr/recruitment/requisitions/:id" component={JobRequisitionDetail} />
        <Route path="/hr/recruitment/pipeline" component={lazyWithRetry(() => import("@/pages/recruitment/RecruitmentPipelineBoard"))} />
        <Route path="/hr/recruitment/my-interviews" component={InterviewerDashboard} />
        <Route path="/hr/recruitment/onboarding" component={OnboardingWorkbench} />
        <Route path="/hr/recruitment/analytics" component={RecruitingAnalytics} />
        <Route path="/hr/recruitment/configuration" component={RecruitmentConfiguration} />
        <Route path="/hr/recruitment" component={RecruitmentManagement} />
        <Route path="/hr/performance" component={PerformanceManagement} />
        <Route path="/hr/setup/performance" component={PerformanceConfiguration} />

        {/* HR Analytics */}
        <Route path="/hr/analytics/predictive" component={PredictiveAnalytics} />
        <Route path="/hr/analytics/reports" component={HRReports} />
        <Route path="/hr/analytics/config/kpis" component={KpiConfiguration} />
        <Route path="/hr/analytics/config/scheduler" component={ReportScheduler} />
        <Route path="/hr/analytics" component={HRAnalyticsDashboard} />

        <Route path="/wfm/my-time" component={MyTime} />
        <Route path="/wfm/approvals" component={ManagerApprovals} />
        <Route path="/wfm/setup/shifts" component={ShiftConfiguration} />
        <Route path="/wfm/schedule" component={TeamSchedule} />
        <Route path="/wfm/integration/payroll" component={PayrollTransfer} />
        <Route path="/wfm/timekeeper" component={TimekeeperConsole} />
        <Route path="/wfm/violations" component={ViolationsDashboard} />
        <Route path="/wfm/analytics" component={WfmAnalyticsLazy} />
        <Route path="/wfm/intelligence" component={AIWorkforceInsights} />
        {/* Payroll */}
        <Route path="/wfm/admin/holidays" component={HolidayCalendar} />
        <Route path="/wfm/admin/accrual-test" component={AccrualTesting} />

        <Route path="/hr" component={HrRoutes} />
        <Route path="/hr/:rest*" component={HrRoutes} />
        <Route path="/talent" component={HrRoutes} />
        <Route path="/talent/:rest*" component={HrRoutes} />
        <Route path="/projects" component={ProjectRoutes} />
        <Route path="/projects/:rest*" component={ProjectRoutes} />
        <Route path="/service" component={ServiceRoutes} />
        <Route path="/service/:rest*" component={ServiceRoutes} />

        {/* Portal Login (Public) must come before PortalRoutes catch-all */}
        <Route path="/portal/login" component={PublicRoutes} />
        <Route path="/portal" component={PortalRoutes} />
        <Route path="/portal/:rest*" component={PortalRoutes} />

        {/* Legacy/Aliases */}
        <Route path="/inventory" component={ScmRoutes} />
        <Route path="/inventory/:rest*" component={ScmRoutes} />
        <Route path="/warehouse" component={ScmRoutes} />
        <Route path="/suppliers" component={ScmRoutes} />
        <Route path="/logistics" component={ScmRoutes} />
        <Route path="/transportation" component={ScmRoutes} />
        <Route path="/transportation/:rest*" component={ScmRoutes} />
        <Route path="/ppm" component={ProjectRoutes} />
        <Route path="/ppm/:rest*" component={ProjectRoutes} />
        <Route path="/construction*" component={ConstructionRoutes} />
        <Route path="/maintenance*" component={MaintenanceRoutes} />

        <Route path="/me/payslips" component={MyPayslips} />
        <Route path="/intercompany" component={IntercompanyWorkbench} />
        <Route path="/intercompany/reconciliation" component={IntercompanyReconciliation} />
        <Route path="/intercompany/netting" component={NettingWorkbench} />
        <Route path="/intercompany/allocations" component={AllocationsWorkbench} />
        <Route path="/intercompany/data-access" component={ICDataAccessManager} />

        {/* ERP Core (Temporary placeholder until refactored) */}
        {/* ERP Core */}
        <Route path="/erp*" component={ErpRoutes} />
        <Route path="/erp-module" component={ErpRoutes} />

        {/* Reporting */}
        <Route path="/reports*" component={ReportRoutes} />
        <Route path="/features" component={ReportRoutes} />

        <Route path="/me" component={ESSDashboard} />
        <Route path="/me/profile" component={PersonalDetails} />
        <Route path="/me/documents" component={PersonalDetails} />
        <Route path="/me/benefits/enroll" component={BenefitsEnrollment} />
        <Route path="/me/time-card" component={MyTimeCard} />
        <Route path="/me/delegation" component={DelegationWorkbench} />
        <Route path="/me/payroll/deductions" component={VoluntaryDeductions} />
        <Route path="/me/compliance/forms" component={StatutoryForms} />
        <Route path="/my-team" component={MSSDashboard} />

        {/* Public Catch-all */}
        <Route component={PublicRoutes} />
      </Switch>
    </>
  );
}

function AuthenticatedLayout() {
  return (
    <GlobalLayout>
      <Suspense fallback={<div className="p-4">Loading...</div>}>
        <Router />
      </Suspense>
      <GuidedTourOverlay />
      <NexusAIPanel />
    </GlobalLayout>
  );
}

function PublicLayout() {
  return (
    <div className="flex h-screen w-full">
      <div className="flex flex-col flex-1 w-full">
        <Suspense fallback={<div className="p-4">Loading...</div>}>
          <Router />
        </Suspense>
      </div>
      <Toaster />
    </div>
  );
}

function AppInner() {
  const [location] = useLocation();
  const { isAuthenticated } = useRBAC();

  // Public routes don't show sidebar - includes dynamic routes
  const publicRoutes = ["/", "/use-cases", "/industries", "/about", "/blog", "/login", "/signup", "/forgot-password", "/demo", "/contact", "/security", "/license", "/open-source", "/legal", "/pricing", "/privacy", "/terms", "/partners", "/contributing", "/contribution", "/modules", "/public/processes", "/careers", "/features", "/marketplace", "/marketplace/services", "/marketplace/apps", "/marketplace/jobs", "/supplier/register", "/community"];
  const isDynamicPublicRoute = location.startsWith("/industry/") || location.startsWith("/module/") || location.startsWith("/public/processes/") || location.startsWith("/docs/") || location.startsWith("/features/") || location.startsWith("/blog/") || location.startsWith("/marketplace/jobs/") || location.startsWith("/scm/wms/");
  const isPublicRoute = publicRoutes.includes(location) || isDynamicPublicRoute;

  // Authenticated user at "/" should go to dashboard
  if (isAuthenticated && location === "/") {
    return <Redirect to="/dashboard" />;
  }

  // Industry setup routes should show authenticated layout
  const isIndustrySetup = location === "/industry-setup" || location === "/industry-deployments";

  return isPublicRoute && !isIndustrySetup ? <PublicLayout /> : <ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>;
}

export default function App() {
  return (
    <RBACProvider>
      <QueryClientProvider client={queryClient}>
        <LedgerProvider>
          <ThemeProvider>
            <TooltipProvider>
              <TourProvider>
                <QuickTipsProvider>
                  <NexusAIProvider>
                    <AppInner />
                  </NexusAIProvider>
                </QuickTipsProvider>
              </TourProvider>
            </TooltipProvider>
          </ThemeProvider>
        </LedgerProvider>
      </QueryClientProvider>
    </RBACProvider>
  );
}
