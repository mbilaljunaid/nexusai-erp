
import { lazy } from "react";
import { Route, Switch } from "wouter";

const AdminConsole = lazy(() => import("@/pages/AdminConsole"));
const PlatformAdmin = lazy(() => import("@/pages/admin/PlatformAdmin"));
const AccessControl = lazy(() => import("@/pages/admin/AccessControl"));
const AdminRoles = lazy(() => import("@/pages/AdminRoles"));

const Settings = lazy(() => import("@/pages/Settings"));
const Integrations = lazy(() => import("@/pages/Integrations"));
const APIGateway = lazy(() => import("@/pages/APIGateway"));
const WebhookManagement = lazy(() => import("@/pages/WebhookManagement"));
const TenantAdmin = lazy(() => import("@/pages/TenantAdmin"));
const UserManagement = lazy(() => import("@/pages/UserManagement"));
const IndustrySetup = lazy(() => import("@/pages/IndustrySetup"));
const EnvironmentManagement = lazy(() => import("@/pages/EnvironmentManagement"));
const SubscriptionManagement = lazy(() => import("@/pages/SubscriptionManagement"));
const BillingManagement = lazy(() => import("@/pages/billing/BillingWorkbench"));

export default function AdminRoutes() {
    return (
        <Switch>
            <Route path="/admin" component={AdminConsole} />
            <Route path="/admin/platform" component={PlatformAdmin} />
            <Route path="/admin/security" component={AccessControl} />
            {/* Core Admin Pages */}
            <Route path="/admin/sod" component={lazy(() => import("@/pages/admin/SoDMatrix"))} />

            <Route path="/settings" component={Settings} />
            <Route path="/integrations" component={Integrations} />

            <Route path="/admin/api-gateway" component={APIGateway} />
            <Route path="/api-gateway" component={APIGateway} />
            <Route path="/admin-roles" component={AdminRoles} />
            <Route path="/tenant-admin" component={TenantAdmin} />
            <Route path="/user-management" component={UserManagement} />
            <Route path="/industry-setup" component={IndustrySetup} />
            <Route path="/industry-deployments" component={IndustrySetup} />
            <Route path="/environment-management" component={EnvironmentManagement} />
            <Route path="/subscription-management" component={SubscriptionManagement} />
            <Route path="/billing-management" component={BillingManagement} />
        </Switch>
    );
}
