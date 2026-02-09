
import { lazy } from "react";
import { Route, Switch } from "wouter";

const ProcessHub = lazy(() => import("@/pages/processes/ProcessHub"));
const ProcureToPayProcess = lazy(() => import("@/pages/processes/pages/ProcureToPayProcess"));
const OrderToCashProcess = lazy(() => import("@/pages/processes/pages/OrderToCashProcess"));
const HireToRetireProcess = lazy(() => import("@/pages/processes/pages/HireToRetireProcess"));
const MonthEndConsolidationProcess = lazy(() => import("@/pages/processes/pages/MonthEndConsolidationProcess"));
const ComplianceRiskProcess = lazy(() => import("@/pages/processes/pages/ComplianceRiskProcess"));
const InventoryManagementProcess = lazy(() => import("@/pages/processes/pages/InventoryManagementProcess"));
const FixedAssetLifecycleProcess = lazy(() => import("@/pages/processes/pages/FixedAssetLifecycleProcess"));
const ProductionPlanningProcess = lazy(() => import("@/pages/processes/pages/ProductionPlanningProcess"));
const MRPProcess = lazy(() => import("@/pages/processes/pages/MRPProcess"));
const QualityAssuranceProcess = lazy(() => import("@/pages/processes/pages/QualityAssuranceProcess"));
const ContractManagementProcess = lazy(() => import("@/pages/processes/pages/ContractManagementProcess"));
const BudgetPlanningProcess = lazy(() => import("@/pages/processes/pages/BudgetPlanningProcess"));
const DemandPlanningProcess = lazy(() => import("@/pages/processes/pages/DemandPlanningProcess"));
const CapacityPlanningProcess = lazy(() => import("@/pages/processes/pages/CapacityPlanningProcess"));
const WarehouseManagementProcess = lazy(() => import("@/pages/processes/pages/WarehouseManagementProcess"));
const CustomerReturnsProcess = lazy(() => import("@/pages/processes/pages/CustomerReturnsProcess"));
const VendorPerformanceProcess = lazy(() => import("@/pages/processes/pages/VendorPerformanceProcess"));
const SubscriptionBillingProcess = lazy(() => import("@/pages/processes/pages/SubscriptionBillingProcess"));

export default function ProcessRoutes() {
    return (
        <Switch>
            <Route path="/processes/procure-to-pay" component={ProcureToPayProcess} />
            <Route path="/processes/order-to-cash" component={OrderToCashProcess} />
            <Route path="/processes/hire-to-retire" component={HireToRetireProcess} />
            <Route path="/processes/month-end-consolidation" component={MonthEndConsolidationProcess} />
            <Route path="/processes/compliance-risk" component={ComplianceRiskProcess} />
            <Route path="/processes/inventory-management" component={InventoryManagementProcess} />
            <Route path="/processes/fixed-asset-lifecycle" component={FixedAssetLifecycleProcess} />
            <Route path="/processes/production-planning" component={ProductionPlanningProcess} />
            <Route path="/processes/mrp" component={MRPProcess} />
            <Route path="/processes/quality-assurance" component={QualityAssuranceProcess} />
            <Route path="/processes/contract-management" component={ContractManagementProcess} />
            <Route path="/processes/budget-planning" component={BudgetPlanningProcess} />
            <Route path="/processes/demand-planning" component={DemandPlanningProcess} />
            <Route path="/processes/capacity-planning" component={CapacityPlanningProcess} />
            <Route path="/processes/warehouse-management" component={WarehouseManagementProcess} />
            <Route path="/processes/customer-returns" component={CustomerReturnsProcess} />
            <Route path="/processes/vendor-performance" component={VendorPerformanceProcess} />
            <Route path="/processes/subscription-billing" component={SubscriptionBillingProcess} />
            <Route path="/processes" component={ProcessHub} />
        </Switch>
    );
}
