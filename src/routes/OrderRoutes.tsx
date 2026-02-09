
import { lazy } from "react";
import { Route, Switch } from "wouter";

const OrderWorkbench = lazy(() => import("@/pages/order/OrderWorkbench").then(module => ({ default: module.OrderWorkbench })));
const OrderEntry = lazy(() => import("@/pages/order/OrderEntry").then(module => ({ default: module.OrderEntry })));
const ShipmentWorkbench = lazy(() => import("@/pages/order/ShipmentWorkbench").then(module => ({ default: module.ShipmentWorkbench })));
const ReturnsWorkbench = lazy(() => import("@/pages/order/ReturnsWorkbench").then(module => ({ default: module.ReturnsWorkbench })));
const OrderConfigManager = lazy(() => import("@/pages/order/OrderConfigManager").then(module => ({ default: module.OrderConfigManager })));
const PriceListManager = lazy(() => import("@/pages/order/PriceListManager").then(module => ({ default: module.PriceListManager })));
const OrderFulfillment = lazy(() => import("@/pages/OrderFulfillment"));
const RMAManagement = lazy(() => import("@/pages/RMAManagement"));
const SalesOrderManagement = lazy(() => import("@/pages/SalesOrderManagement"));
const ShipmentOrderManagement = lazy(() => import("@/pages/ShipmentOrderManagement"));

export default function OrderRoutes() {
    return (
        <Switch>
            <Route path="/order-management" component={OrderWorkbench} />
            <Route path="/order-management/create" component={OrderEntry} />
            <Route path="/order-management/fulfillment" component={ShipmentWorkbench} />
            <Route path="/order-management/returns" component={ReturnsWorkbench} />
            <Route path="/order-management/config" component={OrderConfigManager} />
            <Route path="/order-management/pricing" component={PriceListManager} />

            {/* Legacy / Additional Order Routes */}
            <Route path="/order-management/fulfillment-legacy" component={OrderFulfillment} />
            <Route path="/order-management/rma-legacy" component={RMAManagement} />
            <Route path="/order-management/sales-legacy" component={SalesOrderManagement} />
            <Route path="/order-management/shipment-legacy" component={ShipmentOrderManagement} />

            {/* Dynamic :id must come AFTER all specific routes */}
            <Route path="/order-management/:id" component={OrderEntry} />
        </Switch>
    );
}
