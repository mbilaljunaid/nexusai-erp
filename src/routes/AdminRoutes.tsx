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

export default function AdminRoutes() {
    return (
        <>
            {/* Admin Dashboard */}
            <Route path="/admin" component={AdminDashboard} />

            {/* Tenant & Demo Management */}
            <Route path="/admin/tenants" component={TenantManagement} />
            <Route path="/admin/demos" component={DemoManagement} />

            {/* Module Management */}
            <Route path="/admin/modules" component={ModuleManagement} />
            <Route path="/admin/module-mapping" component={ModuleIndustryMapping} />

            {/* Subscription & Billing */}
            <Route path="/admin/billing" component={SubscriptionBilling} />

            {/* Users & Security */}
            <Route path="/admin/users" component={UsersAccess} />
            <Route path="/admin/audit" component={AuditLogs} />

            {/* System Configuration */}
            <Route path="/admin/config" component={SystemConfiguration} />
        </>
    );
}
