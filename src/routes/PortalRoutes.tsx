
import { Route, Switch } from "wouter";
import { lazyWithRetry } from "@/lib/lazyWithRetry";

// Customer Portal
const CustomerPortalLayout = lazyWithRetry(() => import("@/pages/portal/CustomerPortalLayout"));
const PortalDashboard = lazyWithRetry(() => import("@/pages/portal/PortalDashboard"));
const PortalInvoices = lazyWithRetry(() => import("@/pages/portal/PortalInvoices"));

// Supplier Portal
const SupplierPortalLayout = lazyWithRetry(() => import("@/layouts/SupplierPortalLayout"));
const SupplierLogin = lazyWithRetry(() => import("@/pages/supplier-portal/Login"));
const SupplierDashboard = lazyWithRetry(() => import("@/pages/supplier-portal/Dashboard"));
const SupplierOrders = lazyWithRetry(() => import("@/pages/supplier-portal/Orders"));
const SupplierASNs = lazyWithRetry(() => import("@/pages/supplier-portal/ASNs"));
const SupplierPerformance = lazyWithRetry(() => import("@/pages/supplier-portal/Performance"));
const SupplierDocuments = lazyWithRetry(() => import("@/pages/supplier-portal/Documents"));
const SupplierSourcing = lazyWithRetry(() => import("@/pages/supplier-portal/Sourcing"));

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
