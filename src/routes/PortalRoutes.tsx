
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
        <Switch>
            {/* Customer Portal */}
            <Route path="/portal/dashboard">
                <CustomerPortalLayout><PortalDashboard /></CustomerPortalLayout>
            </Route>
            <Route path="/portal/invoices">
                <CustomerPortalLayout><PortalInvoices /></CustomerPortalLayout>
            </Route>

            {/* Supplier Portal */}
            <Route path="/portal/supplier/login" component={SupplierLogin} />
            <Route path="/portal/supplier/dashboard">
                <SupplierPortalLayout><SupplierDashboard /></SupplierPortalLayout>
            </Route>
            <Route path="/portal/supplier/orders">
                <SupplierPortalLayout><SupplierOrders /></SupplierPortalLayout>
            </Route>
            <Route path="/portal/supplier/asns">
                <SupplierPortalLayout><SupplierASNs /></SupplierPortalLayout>
            </Route>
            <Route path="/portal/supplier/performance">
                <SupplierPortalLayout><SupplierPerformance /></SupplierPortalLayout>
            </Route>
            <Route path="/portal/supplier/sourcing">
                <SupplierPortalLayout><SupplierSourcing /></SupplierPortalLayout>
            </Route>
            <Route path="/portal/supplier/documents">
                <SupplierPortalLayout><SupplierDocuments /></SupplierPortalLayout>
            </Route>
            <Route path="/portal/supplier">
                <SupplierPortalLayout><SupplierDashboard /></SupplierPortalLayout>
            </Route>

            {/* Customer Portal catch-all */}
            <Route path="/portal">
                <CustomerPortalLayout><PortalDashboard /></CustomerPortalLayout>
            </Route>
        </Switch>
    );
}
