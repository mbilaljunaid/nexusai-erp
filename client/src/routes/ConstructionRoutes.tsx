
import { lazy } from "react";
import { Route, Switch } from "wouter";

const ConstructionContractWorkbench = lazy(() => import("@/components/construction/ConstructionContractWorkbench"));
const ConstructionBillingWorkbench = lazy(() => import("@/components/construction/ConstructionBillingWorkbench"));
const ConstructionExecutiveDashboard = lazy(() => import("@/components/construction/ConstructionExecutiveDashboard"));
const ConstructionSetup = lazy(() => import("@/components/construction/ConstructionSetup"));
const ConstructionResourceWorkbench = lazy(() => import("@/components/construction/ConstructionResourceWorkbench"));
const ConstructionSiteManagement = lazy(() => import("@/components/construction/ConstructionSiteManagement"));
const ConstructionCostCodeLibrary = lazy(() => import("@/components/construction/ConstructionCostCodeLibrary"));


const ConstructionLanding = lazy(() => import("@/pages/ConstructionLanding"));

export default function ConstructionRoutes() {
    return (
        <Switch>
            <Route path="/construction" component={ConstructionLanding} />
            <Route path="/construction/contracts" component={ConstructionContractWorkbench} />
            <Route path="/construction/billing" component={ConstructionBillingWorkbench} />
            <Route path="/construction/cost-codes" component={ConstructionCostCodeLibrary} />
            <Route path="/construction/insights" component={ConstructionExecutiveDashboard} />
            <Route path="/construction/setup" component={ConstructionSetup} />
            <Route path="/construction/resources" component={ConstructionResourceWorkbench} />
            <Route path="/construction/site-management" component={ConstructionSiteManagement} />
        </Switch>
    );
}
