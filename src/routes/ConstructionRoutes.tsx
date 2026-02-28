
import { Route, Switch } from "wouter";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import GenericModuleDashboard from "@/components/shared/GenericModuleDashboard";

const ConstructionContractWorkbench = lazyWithRetry(() => import("@/components/construction/ConstructionContractWorkbench"));
const ConstructionBillingWorkbench = lazyWithRetry(() => import("@/components/construction/ConstructionBillingWorkbench"));
const ConstructionExecutiveDashboard = lazyWithRetry(() => import("@/components/construction/ConstructionExecutiveDashboard"));
const ConstructionSetup = lazyWithRetry(() => import("@/components/construction/ConstructionSetup"));
const ConstructionResourceWorkbench = lazyWithRetry(() => import("@/components/construction/ConstructionResourceWorkbench"));
const ConstructionSiteManagement = lazyWithRetry(() => import("@/components/construction/ConstructionSiteManagement"));
const ConstructionCostCodeLibrary = lazyWithRetry(() => import("@/components/construction/ConstructionCostCodeLibrary"));


const ConstructionLanding = lazyWithRetry(() => import("@/pages/ConstructionLanding"));

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
            <Route component={GenericModuleDashboard} />
        </Switch>
    );
}
