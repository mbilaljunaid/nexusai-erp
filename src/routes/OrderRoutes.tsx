
import { Route, Switch } from "wouter";
import { lazyWithRetry } from "@/lib/lazyWithRetry";

const OrderWorkbench = lazyWithRetry(() => import("@/pages/order/OrderWorkbench").then(module => ({ default: module.OrderWorkbench })));
const OrderEntry = lazyWithRetry(() => import("@/pages/order/OrderEntry").then(module => ({ default: module.OrderEntry })));
const ShipmentWorkbench = lazyWithRetry(() => import("@/pages/order/ShipmentWorkbench").then(module => ({ default: module.ShipmentWorkbench })));
const ReturnsWorkbench = lazyWithRetry(() => import("@/pages/order/ReturnsWorkbench").then(module => ({ default: module.ReturnsWorkbench })));
const OrderConfigManager = lazyWithRetry(() => import("@/pages/order/OrderConfigManager").then(module => ({ default: module.OrderConfigManager })));
const PriceListManager = lazyWithRetry(() => import("@/pages/order/PriceListManager").then(module => ({ default: module.PriceListManager })));
const OrderFulfillment = lazyWithRetry(() => import("@/pages/OrderFulfillment"));
const RMAManagement = lazyWithRetry(() => import("@/pages/RMAManagement"));
const SalesOrderManagement = lazyWithRetry(() => import("@/pages/SalesOrderManagement"));
const ShipmentOrderManagement = lazyWithRetry(() => import("@/pages/ShipmentOrderManagement"));

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
