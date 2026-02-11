
import { Route, Switch } from "wouter";
import { lazyWithRetry } from "@/lib/lazyWithRetry";

const AdminConsole = lazyWithRetry(() => import("@/pages/AdminConsole"));
const PlatformAdmin = lazyWithRetry(() => import("@/pages/admin/PlatformAdmin"));
const AccessControl = lazyWithRetry(() => import("@/pages/admin/AccessControl"));
const AdminRoles = lazyWithRetry(() => import("@/pages/AdminRoles"));

const Settings = lazyWithRetry(() => import("@/pages/Settings"));
const Integrations = lazyWithRetry(() => import("@/pages/Integrations"));
const APIGateway = lazyWithRetry(() => import("@/pages/admin/api/APIGateway"));
const WebhookManagement = lazyWithRetry(() => import("@/pages/WebhookManagement"));
const TenantAdmin = lazyWithRetry(() => import("@/pages/TenantAdmin"));
const UserManagement = lazyWithRetry(() => import("@/pages/UserManagement"));
const IndustrySetup = lazyWithRetry(() => import("@/pages/IndustrySetup"));
const EnvironmentManagement = lazyWithRetry(() => import("@/pages/EnvironmentManagement"));
const SubscriptionManagement = lazyWithRetry(() => import("@/pages/SubscriptionManagement"));
const BillingManagement = lazyWithRetry(() => import("@/pages/billing/BillingWorkbench"));
const SoDMatrix = lazyWithRetry(() => import("@/pages/admin/SoDMatrix"));

// Production Management
const ProductionLayout = lazyWithRetry(() => import("@/pages/admin/ProductionLayout"));
const SystemHealthDashboard = lazyWithRetry(() => import("@/pages/admin/SystemHealthDashboard"));
const SystemLogsViewer = lazyWithRetry(() => import("@/pages/admin/SystemLogsViewer"));
const SecurityAdminPanel = lazyWithRetry(() => import("@/pages/admin/SecurityAdminPanel"));
const BackupRestoreManager = lazyWithRetry(() => import("@/pages/admin/BackupRestoreManager"));


export default function AdminRoutes() {
    return (
        <Switch>
            <Route path="/admin" component={AdminConsole} />
            <Route path="/admin/platform" component={PlatformAdmin} />
            <Route path="/admin/security" component={AccessControl} />
            {/* Core Admin Pages */}
            <Route path="/admin/sod" component={SoDMatrix} />

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

            {/* Production Management Routes */}
            <Route path="/admin/production/health" component={SystemHealthDashboard} />
            <Route path="/admin/production/logs" component={SystemLogsViewer} />
            <Route path="/admin/production/security" component={SecurityAdminPanel} />
            <Route path="/admin/production/backups" component={BackupRestoreManager} />
        </Switch>
    );
}
