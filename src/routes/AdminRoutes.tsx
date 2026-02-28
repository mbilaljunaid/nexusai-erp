import { Route } from 'wouter';
import { lazyWithRetry } from '@/lib/lazyWithRetry';

// Lazy load admin pages
const AdminDashboard = lazyWithRetry(() => import('@/pages/admin/AdminDashboard'));
const TenantManagement = lazyWithRetry(() => import('@/pages/admin/TenantManagement'));
const DemoManagement = lazyWithRetry(() => import('@/pages/admin/DemoManagement'));
const ModuleManagement = lazyWithRetry(() => import('@/pages/admin/ModuleManagement'));
const ModuleIndustryMapping = lazyWithRetry(() => import('@/pages/admin/ModuleIndustryMapping'));
const SubscriptionBilling = lazyWithRetry(() => import('@/pages/admin/SubscriptionBilling'));
const UsersAccess = lazyWithRetry(() => import('@/pages/admin/UsersAccess'));
const AuditLogs = lazyWithRetry(() => import('@/pages/admin/AuditLogs'));
const SystemConfiguration = lazyWithRetry(() => import('@/pages/admin/SystemConfiguration'));
const Affiliates = lazyWithRetry(() => import('@/pages/admin/Affiliates'));
const RequestsIssues = lazyWithRetry(() => import('@/pages/admin/RequestsIssues'));
const Analytics = lazyWithRetry(() => import('@/pages/admin/Analytics'));
const Marketing = lazyWithRetry(() => import('@/pages/admin/Marketing'));
const EmailAutomation = lazyWithRetry(() => import('@/pages/admin/EmailAutomation'));
const DatabaseBackups = lazyWithRetry(() => import('@/pages/admin/DatabaseBackups'));
const SystemHealthDashboard = lazyWithRetry(() => import('@/pages/admin/SystemHealthDashboard'));
const SystemLogsViewer = lazyWithRetry(() => import('@/pages/admin/SystemLogsViewer'));

export default function AdminRoutes() {
    return (
        <>
            {/* Admin Dashboard */}
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/admin/dashboard" component={AdminDashboard} />

            {/* Tenant & Demo Management */}
            <Route path="/admin/tenants" component={TenantManagement} />
            <Route path="/admin/tenant-management" component={TenantManagement} />
            <Route path="/admin/demos" component={DemoManagement} />
            <Route path="/admin/demo-management" component={DemoManagement} />

            {/* Module Management */}
            <Route path="/admin/modules" component={ModuleManagement} />
            <Route path="/admin/module-management" component={ModuleManagement} />
            <Route path="/admin/module-mapping" component={ModuleIndustryMapping} />

            {/* Subscription & Billing */}
            <Route path="/admin/billing" component={SubscriptionBilling} />
            <Route path="/admin/subscription-billing" component={SubscriptionBilling} />

            {/* Users & Security */}
            <Route path="/admin/users" component={UsersAccess} />
            <Route path="/admin/access-control" component={UsersAccess} />
            <Route path="/admin/audit" component={AuditLogs} />
            <Route path="/admin/audit-logs" component={AuditLogs} />

            {/* System Configuration */}
            <Route path="/admin/config" component={SystemConfiguration} />
            <Route path="/admin/system-config" component={SystemConfiguration} />
            <Route path="/system-configuration" component={SystemConfiguration} />

            {/* Affiliates & Marketing */}
            <Route path="/admin/affiliates" component={Affiliates} />
            <Route path="/admin/marketing" component={Marketing} />
            <Route path="/admin/email-automation" component={EmailAutomation} />

            {/* Support & Issues */}
            <Route path="/admin/requests" component={RequestsIssues} />
            <Route path="/admin/support" component={RequestsIssues} />
            <Route path="/admin/requests-issues" component={RequestsIssues} />

            {/* Analytics & Monitoring */}
            <Route path="/admin/analytics" component={Analytics} />
            <Route path="/admin/system-health" component={SystemHealthDashboard} />
            <Route path="/admin/logs" component={SystemLogsViewer} />
            <Route path="/admin/database-backups" component={DatabaseBackups} />
        </>
    );
}
