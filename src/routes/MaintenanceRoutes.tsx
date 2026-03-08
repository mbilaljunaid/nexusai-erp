
import { Route, Switch } from "wouter";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import GenericModuleDashboard from "@/components/shared/GenericModuleDashboard";

const MaintenanceWorkbench = lazyWithRetry(() => import("@/pages/maintenance/MaintenanceWorkbench"));
const PMDefinitionBuilder = lazyWithRetry(() => import("@/pages/maintenance/PMDefinitionBuilder"));
const PMScheduler = lazyWithRetry(() => import("@/pages/maintenance/PMScheduler"));
const MeterReadingModule = lazyWithRetry(() => import("@/pages/maintenance/MeterReadingModule"));
const InspectionWorkflow = lazyWithRetry(() => import("@/pages/maintenance/InspectionWorkflow"));
const PermitWorkflow = lazyWithRetry(() => import("@/pages/maintenance/PermitWorkflow"));
const QualityAnalytics = lazyWithRetry(() => import("@/pages/maintenance/QualityAnalytics"));
const WorkLibrary = lazyWithRetry(() => import("@/pages/maintenance/WorkLibrary"));
const ServiceRequestPortal = lazyWithRetry(() => import("@/pages/maintenance/ServiceRequestPortal"));
const AssetHealthDashboard = lazyWithRetry(() => import("@/pages/maintenance/AssetHealthDashboard"));
const AdvancedSchedulingBoard = lazyWithRetry(() => import("@/pages/maintenance/AdvancedSchedulingBoard"));
const CostManagementHub = lazyWithRetry(() => import("@/pages/maintenance/CostManagementHub"));
const MaterialPlanningView = lazyWithRetry(() => import("@/pages/maintenance/MaterialPlanningView"));
const PMManager = lazyWithRetry(() => import("@/pages/PMManager"));
const AssetHierarchyTree = lazyWithRetry(() => import("@/pages/maintenance/AssetHierarchyTree"));
const FailureCodeConfig = lazyWithRetry(() => import("@/pages/maintenance/FailureCodeConfig"));
const ServiceRequestQueue = lazyWithRetry(() => import("@/pages/ServiceRequestQueue"));
const TechnicianTaskView = lazyWithRetry(() => import("@/pages/maintenance/TechnicianTaskView"));
const Asset360View = lazyWithRetry(() => import("@/pages/maintenance/Asset360View"));
const PMRouteManager = lazyWithRetry(() => import("@/pages/maintenance/PMRouteManager"));
const AssetWarrantyManager = lazyWithRetry(() => import("@/pages/maintenance/AssetWarrantyManager"));
const FMEAWorkbench = lazyWithRetry(() => import("@/pages/maintenance/FMEAWorkbench"));



export default function MaintenanceRoutes() {
    return (
        <Switch>
            <Route path="/maintenance">
                <MaintenanceWorkbench initialTab="overview" />
            </Route>
            <Route path="/maintenance/pm/builder" component={PMDefinitionBuilder} />
            <Route path="/maintenance/pm/scheduler" component={PMScheduler} />
            <Route path="/maintenance/meters" component={MeterReadingModule} />
            <Route path="/maintenance/inspections" component={InspectionWorkflow} />
            <Route path="/maintenance/permits" component={PermitWorkflow} />
            <Route path="/maintenance/quality/analytics" component={QualityAnalytics} />
            <Route path="/maintenance/work-library" component={WorkLibrary} />
            <Route path="/maintenance/service-requests" component={ServiceRequestPortal} />
            <Route path="/maintenance/asset-health" component={AssetHealthDashboard} />
            <Route path="/maintenance/scheduling" component={AdvancedSchedulingBoard} />
            <Route path="/maintenance/costs" component={CostManagementHub} />
            <Route path="/maintenance/materials" component={MaterialPlanningView} />
            <Route path="/maintenance/pm" component={PMManager} />
            <Route path="/maintenance/assets/hierarchy" component={AssetHierarchyTree} />
            <Route path="/maintenance/config/failure-codes" component={FailureCodeConfig} />
            <Route path="/maintenance/planning">
                <MaintenanceWorkbench initialTab="planning" />
            </Route>
            <Route path="/maintenance/triage" component={ServiceRequestQueue} />
            <Route path="/maintenance/dispatch">
                <MaintenanceWorkbench initialTab="dispatch" />
            </Route>
            <Route path="/maintenance/technician" component={TechnicianTaskView} />
            <Route path="/maintenance/asset-360" component={Asset360View} />
            <Route path="/maintenance/pm-routes" component={PMRouteManager} />
            <Route path="/maintenance/warranty" component={AssetWarrantyManager} />
            <Route path="/maintenance/fmea" component={FMEAWorkbench} />


            <Route component={GenericModuleDashboard} />
        </Switch>
    );
}
