
import { Route, Switch } from "wouter";
import Projects from "@/pages/Projects";

import { lazy } from "react";

// Unified Project Container
// const Projects = lazy(() => import("@/pages/Projects"));

// Lazy load components here for routing
const ProjectList = lazy(() => import("@/pages/projects/ProjectList"));
const TaskList = lazy(() => import("@/pages/projects/TaskList"));
const AccountingDashboard = lazy(() => import("@/pages/projects/AccountingDashboard"));
const AssetWorkbench = lazy(() => import("@/pages/projects/AssetWorkbench"));
const BillRateManager = lazy(() => import("@/pages/projects/BillRateManager"));
const BillingRulesManager = lazy(() => import("@/pages/projects/BillingRulesManager"));
const BurdenManager = lazy(() => import("@/pages/projects/BurdenManager"));
const ProjectTemplateManager = lazy(() => import("@/pages/projects/ProjectTemplateManager"));

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
