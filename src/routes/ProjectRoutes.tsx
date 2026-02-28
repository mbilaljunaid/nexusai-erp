
import { Route, Switch } from "wouter";
import Projects from "@/pages/Projects";

import { lazyWithRetry } from "@/lib/lazyWithRetry";
import GenericModuleDashboard from "@/components/shared/GenericModuleDashboard";

// Unified Project Container
// const Projects = lazyWithRetry(() => import("@/pages/Projects"));

// Lazy load components here for routing
const ProjectList = lazyWithRetry(() => import("@/pages/projects/ProjectList"));
const TaskList = lazyWithRetry(() => import("@/pages/projects/TaskList"));
const AccountingDashboard = lazyWithRetry(() => import("@/pages/projects/AccountingDashboard"));
const AssetWorkbench = lazyWithRetry(() => import("@/pages/projects/AssetWorkbench"));
const BillRateManager = lazyWithRetry(() => import("@/pages/projects/BillRateManager"));
const BillingRulesManager = lazyWithRetry(() => import("@/pages/projects/BillingRulesManager"));
const BurdenManager = lazyWithRetry(() => import("@/pages/projects/BurdenManager"));
const ProjectTemplateManager = lazyWithRetry(() => import("@/pages/projects/ProjectTemplateManager"));
const LeasePortfolioWorkbench = lazyWithRetry(() => import("@/pages/leases/LeasePortfolioWorkbench"));

// PPM Advanced Components
const CostImportWorkbench = lazyWithRetry(() => import("@/pages/projects/CostImportWorkbench"));
const CostBurdeningInterface = lazyWithRetry(() => import("@/pages/projects/CostBurdeningInterface"));
const CipWorkbench = lazyWithRetry(() => import("@/pages/projects/CipWorkbench"));
const BillingEventsManager = lazyWithRetry(() => import("@/pages/projects/BillingEventsManager"));
const DraftInvoiceWorkbench = lazyWithRetry(() => import("@/pages/projects/DraftInvoiceWorkbench"));
const BudgetConfiguration = lazyWithRetry(() => import("@/pages/projects/BudgetConfiguration"));
const FundsCheckInterface = lazyWithRetry(() => import("@/pages/projects/FundsCheckInterface"));

// Phase 5: Advanced Enhancements
const BudgetForecastingDashboard = lazyWithRetry(() => import("@/pages/projects/BudgetForecastingDashboard"));
const BurdenRuleBuilder = lazyWithRetry(() => import("@/pages/projects/BurdenRuleBuilder"));
const ErpIntegrationDashboard = lazyWithRetry(() => import("@/pages/projects/ErpIntegrationDashboard"));
const CipConsolidationDashboard = lazyWithRetry(() => import("@/pages/projects/CipConsolidationDashboard"));
const RevenueRecognitionDashboard = lazyWithRetry(() => import("@/pages/projects/RevenueRecognitionDashboard"));

export default function ProjectRoutes() {
    return (
        <Switch>
            <Route path="/projects" component={Projects} />
            <Route path="/projects/list" component={ProjectList} />
            <Route path="/projects/tasks" component={TaskList} />
            <Route path="/projects/financials" component={AccountingDashboard} />
            <Route path="/projects/billing-rules" component={BillingRulesManager} />
            <Route path="/projects/bill-rates" component={BillRateManager} />
            <Route path="/projects/burden" component={BurdenManager} />
            <Route path="/projects/assets" component={AssetWorkbench} />
            <Route path="/projects/templates" component={ProjectTemplateManager} />
            <Route path="/projects/leases" component={LeasePortfolioWorkbench} />

            {/* PPM Advanced Features */}
            <Route path="/projects/cost-import" component={CostImportWorkbench} />
            <Route path="/projects/cost-burdening" component={CostBurdeningInterface} />
            <Route path="/projects/cip" component={CipWorkbench} />
            <Route path="/projects/billing-events" component={BillingEventsManager} />
            <Route path="/projects/invoices" component={DraftInvoiceWorkbench} />
            <Route path="/projects/budget" component={BudgetConfiguration} />
            <Route path="/projects/funds-check" component={FundsCheckInterface} />

            {/* Phase 5: AI & Advanced Features */}
            <Route path="/projects/ai-forecasting" component={BudgetForecastingDashboard} />
            <Route path="/projects/burden-rules" component={BurdenRuleBuilder} />
            <Route path="/projects/erp-integration" component={ErpIntegrationDashboard} />
            <Route path="/projects/cip-consolidation" component={CipConsolidationDashboard} />
            <Route path="/projects/revenue-recognition" component={RevenueRecognitionDashboard} />

            {/* PPM Alias */}
            <Route path="/ppm" component={Projects} />
            <Route path="/ppm/*" component={Projects} />

            <Route component={GenericModuleDashboard} />
        </Switch>
    );
}
