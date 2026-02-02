
import { lazy } from "react";
import { Route, Switch } from "wouter";

const MaintenanceWorkbench = lazy(() => import("@/pages/maintenance/MaintenanceWorkbench"));
const PMDefinitionBuilder = lazy(() => import("@/pages/maintenance/PMDefinitionBuilder"));
const PMManager = lazy(() => import("@/pages/PMManager"));
const AssetHierarchyTree = lazy(() => import("@/pages/maintenance/AssetHierarchyTree"));
const FailureCodeConfig = lazy(() => import("@/pages/maintenance/FailureCodeConfig"));
const ServiceRequestPortal = lazy(() => import("@/pages/ServiceRequestPortal"));
const ServiceRequestQueue = lazy(() => import("@/pages/ServiceRequestQueue"));
const TechnicianTaskView = lazy(() => import("@/pages/maintenance/TechnicianTaskView"));
const Asset360View = lazy(() => import("@/pages/maintenance/Asset360View"));

export default function MaintenanceRoutes() {
    return (
        <Switch>
            <Route path="/maintenance">
                <MaintenanceWorkbench initialTab="overview" />
            </Route>
            <Route path="/maintenance/pm/builder" component={PMDefinitionBuilder} />
            <Route path="/maintenance/pm" component={PMManager} />
            <Route path="/maintenance/assets/hierarchy" component={AssetHierarchyTree} />
            <Route path="/maintenance/config/failure-codes" component={FailureCodeConfig} />
            <Route path="/maintenance/planning">
                <MaintenanceWorkbench initialTab="planning" />
            </Route>
            <Route path="/maintenance/requests" component={ServiceRequestPortal} />
            <Route path="/maintenance/triage" component={ServiceRequestQueue} />
            <Route path="/maintenance/dispatch">
                <MaintenanceWorkbench initialTab="dispatch" />
            </Route>
            <Route path="/maintenance/technician" component={TechnicianTaskView} />
            <Route path="/maintenance/asset-360" component={Asset360View} />
        </Switch>
    );
}
