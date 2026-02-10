
import { Route, Switch } from "wouter";
import Projects from "@/pages/Projects";

import { lazyWithRetry } from "@/lib/lazyWithRetry";

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

            {/* PPM Alias */}
            <Route path="/ppm" component={Projects} />
            <Route path="/ppm/*" component={Projects} />
        </Switch>
    );
}
