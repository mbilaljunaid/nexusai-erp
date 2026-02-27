
import { Route } from "wouter";
// import { lazy } from "react";

// Static Imports for Manufacturing
import ManufacturingDashboard from "@/pages/manufacturing/ManufacturingDashboard";
import BOMDesigner from "@/pages/manufacturing/BOMDesigner";
import RoutingEditor from "@/pages/manufacturing/RoutingEditor";
import WorkCenterManager from "@/pages/manufacturing/WorkCenterManager";
import ResourceManager from "@/pages/manufacturing/ResourceManager";
import WorkOrderList from "@/pages/manufacturing/WorkOrderList";
import ShopFloorTerminal from "@/pages/manufacturing/ShopFloorTerminal";
import QualityManager from "@/pages/manufacturing/QualityManager";
import MRPWorkbench from "@/pages/manufacturing/MRPWorkbench";
import ProductionGantt from "@/pages/manufacturing/ProductionGantt";
import CalendarManager from "@/pages/manufacturing/CalendarManager";
import StandardOpLibrary from "@/pages/manufacturing/StandardOpLibrary";
import CostingWorkbench from "@/pages/manufacturing/CostingWorkbench";
import WIPDashboard from "@/pages/manufacturing/WIPDashboard";
import MFGVarianceAnalysis from "@/pages/manufacturing/VarianceAnalysis";
import FormulaDesigner from "@/pages/manufacturing/FormulaDesigner";
import RecipeManager from "@/pages/manufacturing/RecipeManager";
import BatchWorkbench from "@/pages/manufacturing/BatchWorkbench";
import BatchGenealogy from "@/pages/manufacturing/BatchGenealogy";

// Static Imports for SCM & Logistics
import FulfillmentWorkbench from "@/pages/scm/FulfillmentWorkbench";
import Inventory from "@/pages/Inventory";
import WorkOrdersDashboard from "@/pages/WorkOrdersDashboard";
import Warehouse from "@/pages/Warehouse";
import SupplierManagement from "@/pages/SupplierManagement";
import LogisticsDashboard from "@/pages/LogisticsDashboard";
import RoutePlanningWorkbench from "@/pages/transportation/RoutePlanningWorkbench";
import CarrierManager from "@/pages/transportation/CarrierManager";
import FreightSettlementConsole from "@/pages/transportation/FreightSettlementConsole";
import TransportationManagementSystem from "@/pages/TransportationManagementSystem";
import TransportationBIDashboard from "@/pages/TransportationBIDashboard";
import FreightAccountingWorkbench from "@/pages/transportation/FreightAccountingWorkbench";
import FreightSettlementWorkbench from "@/pages/transportation/FreightSettlementWorkbench";
import CarrierScorecardDashboard from "@/pages/transportation/CarrierScorecardDashboard";
import CarrierRateWorkbench from "@/pages/transportation/CarrierRateWorkbench";
import ShipmentTrackingDashboard from "@/pages/transportation/ShipmentTrackingDashboard";
import CostComponents from "@/pages/lcm/CostComponents";
import LcmWorkbench from "@/pages/lcm/LcmWorkbench";
import TradeOperationDetails from "@/pages/lcm/TradeOperationDetails";
import CostDashboard from "@/pages/cost-management/CostDashboard";
import CostAdjustmentApprovalWorkbench from "@/pages/cost-management/CostAdjustmentApprovalWorkbench";
import SlaDashboard from "@/pages/sla/SlaDashboard";
import MappingSetWorkbench from "@/pages/sla/MappingSetWorkbench";
import MappingSetEditor from "@/pages/sla/MappingSetEditor";
import SlaAIExplainability from "@/pages/sla/SlaAIExplainability";
import SlaReconciliationWorkbench from "@/pages/sla/SlaReconciliationWorkbench";
import AdrBuilder from "@/pages/sla/AdrBuilder";


import WarehouseOperations from "@/pages/scm/WarehouseOperations";
import WmsDashboard from "@/pages/scm/WmsDashboard";

// WMS New Components
import WavePlanning from "@/pages/scm/wms/WavePlanning";
import TaskDashboard from "@/pages/scm/wms/TaskDashboard";
import MobileWarehouse from "@/pages/scm/wms/MobileWarehouse";
import WmsMasterData from "@/pages/scm/wms/WmsMasterData";
import YardManagement from "@/pages/scm/wms/YardManagement";
import ShippingWorkbench from "@/pages/scm/wms/ShippingWorkbench";
import WmsLaborPerformance from "@/pages/scm/wms/WmsLaborPerformance";
import SlottingWorkbench from "@/pages/scm/wms/SlottingWorkbench";

export default function ScmRoutes() {
    return (
        <>
            {/* Manufacturing */}
            <Route path="/manufacturing/dashboard" component={ManufacturingDashboard} />
            <Route path="/manufacturing/mrp-dashboard" component={ManufacturingDashboard} />
            <Route path="/mrp-dashboard" component={ManufacturingDashboard} />
            <Route path="/manufacturing/bom" component={BOMDesigner} />
            <Route path="/manufacturing/routings" component={RoutingEditor} />
            <Route path="/manufacturing/work-centers" component={WorkCenterManager} />
            <Route path="/manufacturing/resources" component={ResourceManager} />
            <Route path="/manufacturing/work-orders" component={WorkOrderList} />
            <Route path="/manufacturing/shop-floor" component={ShopFloorTerminal} />
            <Route path="/manufacturing/terminal" component={ShopFloorTerminal} />
            <Route path="/manufacturing/quality" component={QualityManager} />
            <Route path="/manufacturing/mrp-workbench" component={MRPWorkbench} />
            <Route path="/manufacturing/gantt" component={ProductionGantt} />
            <Route path="/manufacturing/calendars" component={CalendarManager} />
            <Route path="/manufacturing/standard-operations" component={StandardOpLibrary} />
            <Route path="/manufacturing/costing" component={CostingWorkbench} />
            <Route path="/manufacturing/wip" component={WIPDashboard} />
            <Route path="/manufacturing/variances" component={MFGVarianceAnalysis} />
            <Route path="/manufacturing/formulas" component={FormulaDesigner} />
            <Route path="/manufacturing/recipes" component={RecipeManager} />
            <Route path="/manufacturing/batches" component={BatchWorkbench} />
            <Route path="/manufacturing/genealogy" component={BatchGenealogy} />

            {/* SCM */}
            <Route path="/scm/fulfillment" component={FulfillmentWorkbench} />
            <Route path="/inventory" component={Inventory} />
            <Route path="/inventory/dashboard" component={Inventory} />
            <Route path="/inventory/work-orders" component={WorkOrdersDashboard} />
            <Route path="/warehouse" component={Warehouse} />
            <Route path="/scm/wms/operations" component={WarehouseOperations} />
            <Route path="/scm/wms/dashboard" component={WmsDashboard} />

            {/* WMS Expanded */}
            <Route path="/scm/wms/waves" component={WavePlanning} />
            <Route path="/scm/wms/tasks" component={TaskDashboard} />
            <Route path="/scm/wms/mobile" component={MobileWarehouse} />
            <Route path="/scm/wms/masters" component={WmsMasterData} />
            <Route path="/scm/wms/yard" component={YardManagement} />
            <Route path="/scm/wms/shipping" component={ShippingWorkbench} />
            <Route path="/scm/wms/labor" component={WmsLaborPerformance} />
            <Route path="/scm/wms/slotting" component={SlottingWorkbench} />

            <Route path="/suppliers" component={SupplierManagement} />

            {/* Cost Management & SLA */}
            <Route path="/scm/costing/dashboard" component={CostDashboard} />
            <Route path="/scm/costing/approvals" component={CostAdjustmentApprovalWorkbench} />
            <Route path="/scm/lcm/operations" component={LcmWorkbench} />
            <Route path="/scm/lcm/components" component={CostComponents} />
            <Route path="/scm/lcm/trade-operation/:id" component={TradeOperationDetails} />

            <Route path="/finance/sla/dashboard" component={SlaDashboard} />
            <Route path="/finance/sla/mapping-sets" component={MappingSetWorkbench} />
            <Route path="/finance/sla/mapping-sets/:id" component={MappingSetEditor} />
            <Route path="/finance/sla/intelligence" component={SlaAIExplainability} />
            <Route path="/finance/sla/reconciliation" component={SlaReconciliationWorkbench} />
            <Route path="/finance/sla/adr" component={AdrBuilder} />

            {/* Warehouse Management (WMS) */}
            <Route path="/logistics" component={LogisticsDashboard} />
            <Route path="/transportation/planning" component={RoutePlanningWorkbench} />
            <Route path="/transportation/carriers" component={CarrierManager} />
            <Route path="/transportation/freight" component={FreightSettlementConsole} />
            <Route path="/transportation" component={TransportationManagementSystem} />

            {/* TMS - New Components */}
            <Route path="/tms/analytics" component={TransportationBIDashboard} />
            <Route path="/transportation/freight-accounting" component={FreightAccountingWorkbench} />
            <Route path="/transportation/freight-settlement" component={FreightSettlementWorkbench} />
            <Route path="/transportation/carrier-scorecard" component={CarrierScorecardDashboard} />
            <Route path="/transportation/carrier-rates" component={CarrierRateWorkbench} />
            <Route path="/transportation/tracking" component={ShipmentTrackingDashboard} />
            <Route path="/transportation/carrier-scorecard" component={CarrierScorecardDashboard} />
            <Route path="/transportation/carrier-rates" component={CarrierRateWorkbench} />
            <Route path="/transportation/tracking" component={ShipmentTrackingDashboard} />
        </>
    );
}
