
import { Route, Switch } from "wouter";
import { lazyWithRetry } from "@/lib/lazyWithRetry";

const Compliance = lazyWithRetry(() => import("@/pages/Compliance"));

const ComplianceDashboardNew = lazyWithRetry(() => import("@/pages/ComplianceDashboardNew"));
const ComplianceMonitoring = lazyWithRetry(() => import("@/pages/ComplianceMonitoring"));
const ComplianceExceptions = lazyWithRetry(() => import("@/pages/ComplianceExceptions"));
const ComplianceGovernance = lazyWithRetry(() => import("@/pages/ComplianceGovernance"));
const AuditTrails = lazyWithRetry(() => import("@/pages/AuditTrails"));
const SecurityProfiles = lazyWithRetry(() => import("@/pages/SecurityProfiles"));

export default function ComplianceRoutes() {
    return (
        <Switch>
            <Route path="/compliance" component={ComplianceDashboardNew} />
            <Route path="/compliance/dashboard" component={ComplianceDashboardNew} />
            <Route path="/compliance/monitoring" component={ComplianceMonitoring} />
            <Route path="/compliance/exceptions" component={ComplianceExceptions} />
            <Route path="/compliance/governance" component={ComplianceGovernance} />
            <Route path="/compliance/audit" component={AuditTrails} />
            <Route path="/compliance/security" component={SecurityProfiles} />
        </Switch>
    );
}
