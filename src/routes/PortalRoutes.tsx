
import { lazy } from "react";
import { Route, Switch } from "wouter";

// Customer Portal
const CustomerPortalLayout = lazy(() => import("@/pages/portal/CustomerPortalLayout"));
const PortalDashboard = lazy(() => import("@/pages/portal/PortalDashboard"));
const PortalInvoices = lazy(() => import("@/pages/portal/PortalInvoices"));

// Supplier Portal
const SupplierPortalLayout = lazy(() => import("@/layouts/SupplierPortalLayout"));
const SupplierLogin = lazy(() => import("@/pages/supplier-portal/Login"));
const SupplierDashboard = lazy(() => import("@/pages/supplier-portal/Dashboard"));
const SupplierOrders = lazy(() => import("@/pages/supplier-portal/Orders"));
const SupplierASNs = lazy(() => import("@/pages/supplier-portal/ASNs"));
const SupplierPerformance = lazy(() => import("@/pages/supplier-portal/Performance"));
const SupplierDocuments = lazy(() => import("@/pages/supplier-portal/Documents"));
const SupplierSourcing = lazy(() => import("@/pages/supplier-portal/Sourcing"));

export default function PortalRoutes() {
    return (
        <>

            <Route path="/portal">
                <CustomerPortalLayout>
                    <Switch>
                        <Route path="/portal/dashboard" component={PortalDashboard} />
                        <Route path="/portal/invoices" component={PortalInvoices} />
                        <Route path="/portal" component={PortalDashboard} />
                    </Switch>
                </CustomerPortalLayout>
            </Route>

            <Route path="/portal/supplier/login" component={SupplierLogin} />
            <Route path="/portal/supplier">
                <SupplierPortalLayout>
                    <Switch>
                        <Route path="/portal/supplier/dashboard" component={SupplierDashboard} />
                        <Route path="/portal/supplier/orders" component={SupplierOrders} />
                        <Route path="/portal/supplier/asns" component={SupplierASNs} />
                        <Route path="/portal/supplier/performance" component={SupplierPerformance} />
                        <Route path="/portal/supplier/sourcing" component={SupplierSourcing} />
                        <Route path="/portal/supplier/documents" component={SupplierDocuments} />
                        <Route path="/portal/supplier" component={SupplierDashboard} />
                    </Switch>
                </SupplierPortalLayout>
            </Route>
        </>
    );
}
