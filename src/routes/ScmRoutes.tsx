import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
// import { lazy } from "react";
import GenericModuleDashboard from "@/components/shared/GenericModuleDashboard";
import CostManagementDashboard from "@/pages/scm/CostManagementDashboard";
import GlobalTradeDashboard from "@/pages/scm/GlobalTradeDashboard";
import TMSDashboard from "@/pages/scm/TMSDashboard";
import InventoryItemsPage from "@/pages/inventory/InventoryItemsPage";
import InventoryCycleCountPage from "@/pages/inventory/InventoryCycleCountPage";
import InventoryReplenishmentPage from "@/pages/inventory/InventoryReplenishmentPage";
import InventoryItemProfilePage from "@/pages/inventory/InventoryItemProfilePage";
import InventoryProductMasterPage from "@/pages/inventory/InventoryProductMasterPage";
import InterOrgTransfer from "@/pages/inventory/InterOrgTransfer";
import OnHandBalanceInquiry from "@/pages/inventory/OnHandBalanceInquiry";
import ItemRelationships from "@/pages/inventory/ItemRelationships";
import MinMaxPlanningSetup from "@/pages/inventory/MinMaxPlanningSetup";
import MaterialStatusControls from "@/pages/inventory/MaterialStatusControls";


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
import OSPWorkbench from "@/pages/manufacturing/OSPWorkbench";
import SCMEventMonitor from "@/pages/manufacturing/SCMEventMonitor";
import WorkInstructionLibrary from "@/pages/manufacturing/WorkInstructionLibrary";
import MRPExplosionViewer from "@/pages/manufacturing/MRPExplosionViewer";





// Static Imports for SCM & Logistics
import ProcurementDashboard from "@/pages/procurement/ProcurementDashboard";
import PurchaseOrderDetail from "@/pages/procurement/PurchaseOrderDetail";
import RequisitionEntry from "@/pages/procurement/RequisitionEntry";
import RequisitionApprovalWorkbench from "@/pages/procurement/RequisitionApprovalWorkbench";
import ApprovedSupplierList from "@/pages/procurement/ApprovedSupplierList";
import BlanketPurchaseAgreement from "@/pages/procurement/BlanketPurchaseAgreement";
import BuyerWorkArea from "@/pages/procurement/BuyerWorkArea";
import POChangeOrder from "@/pages/procurement/POChangeOrder";
import PODistributionWorkbench from "@/pages/procurement/PODistributionWorkbench";
import ContractPurchaseAgreement from "@/pages/procurement/ContractPurchaseAgreement";
import FundsCheckDashboard from "@/pages/procurement/FundsCheckDashboard";
import PunchoutCatalogSetup from "@/pages/procurement/PunchoutCatalogSetup";
import SupplierNegotiationWorkbench from "@/pages/procurement/SupplierNegotiationWorkbench";




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
import DangerousGoodsCompliance from "@/pages/transportation/DangerousGoodsCompliance";
import EDI214EventLog from "@/pages/transportation/EDI214EventLog";


import CostComponents from "@/pages/lcm/CostComponents";
import LcmWorkbench from "@/pages/lcm/LcmWorkbench";
import TradeOperationDetails from "@/pages/lcm/TradeOperationDetails";
import CostDashboard from "@/pages/cost-management/CostDashboard";
import CostAdjustmentApprovalWorkbench from "@/pages/cost-management/CostAdjustmentApprovalWorkbench";
import CostRollupWorkbench from "@/pages/cost-management/CostRollupWorkbench";
import CostProcessorMonitor from "@/pages/cost-management/CostProcessorMonitor";
import CostVarianceReport from "@/pages/cost-management/CostVarianceReport";


import ReceiptAccountingViewer from "@/pages/cost-management/ReceiptAccountingViewer";
import CostMethodSetup from "@/pages/cost-management/CostMethodSetup";

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
import DirectedPutawayRules from "@/pages/scm/wms/DirectedPutawayRules";
import PackStation from "@/pages/scm/wms/PackStation";
import CrossDockingWorkbench from "@/pages/scm/wms/CrossDockingWorkbench";
import TaskInterleavingEngine from "@/pages/scm/wms/TaskInterleavingEngine";
import LPNTransactionWorkbench from "@/pages/scm/wms/LPNTransactionWorkbench";
import UOMConversionMatrix from "@/pages/inventory/UOMConversionMatrix";





export default function ScmRoutes() {
    return (
        <Switch>
            {/* Manufacturing */}
            <Route path="/manufacturing" component={() => {
                const [loc, setLocation] = useLocation();
                useEffect(() => {
                    if (loc === "/manufacturing" || loc === "/manufacturing/") {
                        setLocation("/manufacturing/dashboard");
                    }
                }, [loc, setLocation]);
                return null;
            }} />
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
            <Route path="/manufacturing/osp" component={OSPWorkbench} />
            <Route path="/manufacturing/scm-events" component={SCMEventMonitor} />
            <Route path="/manufacturing/work-instructions" component={WorkInstructionLibrary} />
            <Route path="/manufacturing/mrp-explosion" component={MRPExplosionViewer} />





            {/* SCM */}
            <Route path="/scm/procurement" component={ProcurementDashboard} />
            <Route path="/procurement/orders/new" component={RequisitionEntry} />
            <Route path="/procurement/orders/:id" component={PurchaseOrderDetail} />
            <Route path="/procurement/requisitions/new" component={RequisitionEntry} />
            <Route path="/procurement/requisitions/approvals" component={RequisitionApprovalWorkbench} />
            <Route path="/procurement/asl" component={ApprovedSupplierList} />
            <Route path="/procurement/blanket-agreements" component={BlanketPurchaseAgreement} />
            <Route path="/procurement/buyer-workarea" component={BuyerWorkArea} />
            <Route path="/procurement/change-orders" component={POChangeOrder} />
            <Route path="/procurement/distributions" component={PODistributionWorkbench} />
            <Route path="/procurement/cpas" component={ContractPurchaseAgreement} />
            <Route path="/procurement/funds-check" component={FundsCheckDashboard} />
            <Route path="/procurement/punchout" component={PunchoutCatalogSetup} />
            <Route path="/procurement/negotiations" component={SupplierNegotiationWorkbench} />




            <Route path="/scm/fulfillment" component={FulfillmentWorkbench} />
            <Route path="/inventory" component={Inventory} />
            <Route path="/inventory/dashboard" component={Inventory} />
            <Route path="/inventory/items" component={InventoryItemsPage} />
            <Route path="/inventory/item-profile" component={InventoryItemProfilePage} />
            <Route path="/inventory/product-master" component={InventoryProductMasterPage} />
            <Route path="/inventory/cycle-count" component={InventoryCycleCountPage} />
            <Route path="/inventory/replenishment" component={InventoryReplenishmentPage} />
            <Route path="/inventory/inter-org-transfers" component={InterOrgTransfer} />
            <Route path="/inventory/on-hand" component={OnHandBalanceInquiry} />
            <Route path="/inventory/item-relationships" component={ItemRelationships} />
            <Route path="/inventory/min-max" component={MinMaxPlanningSetup} />
            <Route path="/inventory/material-status" component={MaterialStatusControls} />
            <Route path="/inventory/uom-conversions" component={UOMConversionMatrix} />


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
            <Route path="/scm/wms/putaway-rules" component={DirectedPutawayRules} />
            <Route path="/scm/wms/pack-station" component={PackStation} />
            <Route path="/scm/wms/cross-docking" component={CrossDockingWorkbench} />
            <Route path="/scm/wms/task-interleaving" component={TaskInterleavingEngine} />
            <Route path="/scm/wms/lpn" component={LPNTransactionWorkbench} />




            <Route path="/suppliers" component={SupplierManagement} />

            {/* Cost Management */}
            <Route path="/scm/costing" component={CostManagementDashboard} />
            <Route path="/scm/costing/dashboard" component={CostDashboard} />
            <Route path="/scm/costing/approvals" component={CostAdjustmentApprovalWorkbench} />
            <Route path="/scm/costing/rollup" component={CostRollupWorkbench} />
            <Route path="/scm/costing/processor" component={CostProcessorMonitor} />
            <Route path="/scm/costing/variance" component={CostVarianceReport} />


            <Route path="/scm/costing/receipt-accounting" component={ReceiptAccountingViewer} />
            <Route path="/scm/costing/method-setup" component={CostMethodSetup} />

            <Route path="/scm/lcm/operations" component={LcmWorkbench} />
            <Route path="/scm/lcm/components" component={CostComponents} />
            <Route path="/scm/lcm/trade-operation/:id" component={TradeOperationDetails} />

            {/* Warehouse Management (WMS) */}
            <Route path="/logistics" component={LogisticsDashboard} />
            <Route path="/transportation/planning" component={RoutePlanningWorkbench} />
            <Route path="/transportation/carriers" component={CarrierManager} />
            <Route path="/transportation/freight" component={FreightSettlementConsole} />
            <Route path="/transportation" component={TMSDashboard} />

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
            <Route path="/transportation/dangerous-goods" component={DangerousGoodsCompliance} />
            <Route path="/transportation/edi-events" component={EDI214EventLog} />


            <Route path="/scm/gtm" component={GlobalTradeDashboard} />
            <Route component={GenericModuleDashboard} />
        </Switch>
    );
}
