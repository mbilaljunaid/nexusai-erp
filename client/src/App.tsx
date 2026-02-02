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
import NotFound from "@/pages/not-found"; // Keep for now in case
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
import HolidayCalendar from "@/pages/wfm/HolidayCalendar";
import PayrollDashboard from "@/pages/rewards/PayrollDashboard";
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

// Phase 2: Module Overviews



import ErpRoutes from "@/routes/ErpRoutes";


// Phase 3: Advanced Modules
// const ProjectsModule = lazy(() => import("@/pages/ProjectsModule")); // Moved to ProjectRoutes

// DEBUG: Static Import to fix loading
import LearningManagement from "@/pages/LearningManagement";
import CompensationDashboard from "@/pages/rewards/CompensationDashboard";
import PayrollWorkbench from "@/pages/rewards/PayrollWorkbench";
import { PpmWorkbench } from "@/components/ppm/PpmWorkbench";
import RecruitmentManagement from "@/pages/RecruitmentManagement"; // Static import
import JobRequisitionDetail from "@/pages/recruitment/JobRequisitionDetail";
import PerformanceManagement from "@/pages/PerformanceManagement";

function Router() {
  const [location] = useLocation();
  console.log("DEBUG: App Router Location:", location);
  return (
    <>
      <div style={{ position: "fixed", top: 0, left: 0, zIndex: 9999, background: "red", color: "white", padding: "10px", fontSize: "20px" }}>
        DEBUG ROUTER PATH: {location}
      </div>
      <Switch>
        {/* Dashboard */}
        <Route path="/dashboard" component={DashboardRoutes} />

        {/* Analytics & Compliance */}
        <Route path="/analytics*" component={AnalyticsRoutes} />
        <Route path="/compliance*" component={ComplianceRoutes} />
        <Route path="/compliance-module" component={ComplianceRoutes} />
        <Route path="/wfm/analytics" component={WfmAnalytics} />
        <Route path="/rewards/payroll" component={PayrollDashboard} />
        <Route path="/wfm/admin/accrual-test" component={AccrualTesting} />
        <Route component={NotFound} />

        {/* Marketing */}
        <Route path="/marketing*" component={MarketingRoutes} />

        {/* Order Management */}
        <Route path="/order-management*" component={OrderRoutes} />

        {/* Industries */}
        <Route path="/industry*" component={IndustryRoutes} />

        {/* Platform/Admin (including Settings, Integrations) */}
        <Route path="/admin*" component={AdminRoutes} />
        <Route path="/settings" component={AdminRoutes} />
        <Route path="/integrations" component={AdminRoutes} />
        <Route path="/tenant-admin" component={AdminRoutes} />
        <Route path="/user-management" component={AdminRoutes} />
        <Route path="/environment-management" component={AdminRoutes} />
        <Route path="/subscription-management" component={AdminRoutes} />
        <Route path="/billing-management" component={AdminRoutes} />

        <Route path="/testroute" component={TestRoute} />

        {/* Core Modules */}
        <Route path="/crm*" component={CrmRoutes} />
        <Route path="/finance*" component={FinanceRoutes} />
        <Route path="/scm*" component={ScmRoutes} />

        {/* Talent Management Direct Routes (Debug/Fix for 404) */}
        <Route path="/talent/learning/admin" component={lazy(() => import("@/pages/learning/admin/CourseCatalogAdmin"))} />
        <Route path="/talent/learning" component={LearningManagement} />

        {/* Rewards */}
        <Route path="/rewards/compensation" component={CompensationDashboard} />
        <Route path="/rewards/payroll" component={PayrollWorkbench} />

        {/* Projects */}
        <Route path="/hr/recruitment/requisitions/:id" component={JobRequisitionDetail} />
        <Route path="/hr/recruitment/my-interviews" component={lazy(() => import("@/pages/recruitment/InterviewerDashboard"))} />
        <Route path="/hr/recruitment/onboarding" component={lazy(() => import("@/pages/recruitment/OnboardingWorkbench"))} />
        <Route path="/hr/recruitment/analytics" component={lazy(() => import("@/pages/recruitment/RecruitingAnalytics"))} />
        <Route path="/hr/recruitment/configuration" component={lazy(() => import("@/pages/RecruitmentConfiguration"))} />
        <Route path="/hr/recruitment" component={RecruitmentManagement} />
        <Route path="/hr/performance" component={PerformanceManagement} />
        <Route path="/hr/setup/performance" component={lazy(() => import("@/pages/PerformanceConfiguration"))} />

        <Route path="/wfm/my-time" component={lazy(() => import("@/pages/wfm/MyTime"))} />
        <Route path="/wfm/approvals" component={lazy(() => import("@/pages/wfm/ManagerApprovals"))} />
        <Route path="/wfm/setup/shifts" component={lazy(() => import("@/pages/wfm/ShiftConfiguration"))} />
        <Route path="/wfm/schedule" component={lazy(() => import("@/pages/wfm/TeamSchedule"))} />
        <Route path="/wfm/integration/payroll" component={lazy(() => import("@/pages/wfm/PayrollTransfer"))} />
        <Route path="/wfm/timekeeper" component={lazy(() => import("@/pages/wfm/TimekeeperConsole"))} />
        <Route path="/wfm/violations" component={lazy(() => import("@/pages/wfm/ViolationsDashboard"))} />
        <Route path="/wfm/analytics" component={lazy(() => import("@/pages/wfm/WfmAnalytics"))} />
        <Route path="/wfm/intelligence" component={lazy(() => import("@/pages/wfm/AIWorkforceInsights"))} />
        {/* Payroll */}
        <Route path="/wfm/admin/holidays" component={lazy(() => import("@/pages/wfm/HolidayCalendar"))} />
        <Route path="/wfm/admin/accrual-test" component={AccrualTesting} />

        <Route path="/hr*" component={HrRoutes} />
        <Route path="/projects*" component={ProjectRoutes} />
        <Route path="/manufacturing*" component={ScmRoutes} />
        <Route path="/service*" component={ServiceRoutes} />

        {/* Portal Login (Public) must come before PortalRoutes catch-all */}
        <Route path="/portal/login" component={PublicRoutes} />
        <Route path="/portal*" component={PortalRoutes} />

        {/* Legacy/Aliases */}
        <Route path="/gl/:rest*" component={FinanceRoutes} />
        <Route path="/ap*" component={FinanceRoutes} />
        <Route path="/inventory*" component={ScmRoutes} />
        <Route path="/warehouse" component={ScmRoutes} />
        <Route path="/suppliers" component={ScmRoutes} />
        <Route path="/logistics" component={ScmRoutes} />
        <Route path="/transportation*" component={ScmRoutes} />
        <Route path="/ppm*" component={ProjectRoutes} />
        <Route path="/construction*" component={ConstructionRoutes} />
        <Route path="/maintenance*" component={MaintenanceRoutes} />

        <Route path="/me/payslips" component={lazy(() => import("@/pages/rewards/MyPayslips"))} />
        <Route path="/intercompany" component={lazy(() => import("@/pages/intercompany/IntercompanyWorkbench"))} />
        <Route path="/intercompany/reconciliation" component={lazy(() => import("@/pages/intercompany/IntercompanyReconciliation"))} />
        <Route path="/intercompany/netting" component={lazy(() => import("@/pages/intercompany/NettingWorkbench"))} />
        <Route path="/intercompany/allocations" component={lazy(() => import("@/pages/intercompany/AllocationsWorkbench"))} />

        {/* ERP Core (Temporary placeholder until refactored) */}
        {/* ERP Core */}
        <Route path="/erp*" component={ErpRoutes} />
        <Route path="/erp-module" component={ErpRoutes} />

        {/* Reporting */}
        <Route path="/reports*" component={ReportRoutes} />
        <Route path="/features" component={ReportRoutes} />

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
      <AIChatWidgetWrapper />
    </GlobalLayout>
  );
}


function AIChatWidgetWrapper() {
  const [location] = useLocation();

  let context = "general";
  if (location.includes("/accounts-payable")) context = "ap";
  else if (location.includes("/accounts-receivable")) context = "ar";
  else if (location.includes("/cash-management") || location.includes("/treasury")) context = "treasury";
  else if (location.includes("/finance") || location.includes("/gl")) context = "finance";
  else if (location.includes("/crm")) context = "crm";
  else if (location.includes("/hr")) context = "hr";
  else if (location.includes("/projects") || location.includes("/ppm")) context = "projects";
  else if (location.includes("/transportation")) context = "logistics";

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
  const publicRoutes = ["/", "/use-cases", "/industries", "/about", "/blog", "/login", "/demo", "/contact", "/security", "/license", "/open-source", "/legal", "/pricing", "/privacy", "/terms", "/partners", "/contributing", "/contribution", "/modules", "/public/processes", "/careers", "/features", "/marketplace", "/community", "/marketplace/services", "/marketplace/apps", "/marketplace/jobs", "/supplier/register"];
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
