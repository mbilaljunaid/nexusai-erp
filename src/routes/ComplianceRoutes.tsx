
import { Route, Switch } from "wouter";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import GenericModuleDashboard from "@/components/shared/GenericModuleDashboard";

const Compliance = lazyWithRetry(() => import("@/pages/Compliance"));

const ComplianceDashboardNew = lazyWithRetry(() => import("@/pages/ComplianceDashboardNew"));
const ComplianceDashboardHub = lazyWithRetry(() => import("@/pages/compliance/ComplianceDashboard"));
const ComplianceControlsPage = lazyWithRetry(() => import("@/pages/compliance/ComplianceControlsPage"));
const ComplianceSoxPage = lazyWithRetry(() => import("@/pages/compliance/ComplianceSoxPage"));
const ComplianceMonitoring = lazyWithRetry(() => import("@/pages/ComplianceMonitoring"));
const ComplianceExceptions = lazyWithRetry(() => import("@/pages/ComplianceExceptions"));
const ComplianceGovernance = lazyWithRetry(() => import("@/pages/ComplianceGovernance"));
const AuditTrails = lazyWithRetry(() => import("@/pages/AuditTrails"));
const SecurityProfiles = lazyWithRetry(() => import("@/pages/SecurityProfiles"));

export default function ComplianceRoutes() {
    return (
        <Switch>
            <Route path="/compliance" component={ComplianceDashboardHub} />
            <Route path="/compliance/dashboard" component={ComplianceDashboardHub} />
            <Route path="/compliance/controls" component={ComplianceControlsPage} />
            <Route path="/compliance/sox" component={ComplianceSoxPage} />
            <Route path="/compliance/monitoring" component={ComplianceMonitoring} />
            <Route path="/compliance/exceptions" component={ComplianceExceptions} />
            <Route path="/compliance/governance" component={ComplianceGovernance} />
            <Route path="/compliance/audit" component={AuditTrails} />
            <Route path="/compliance/security" component={SecurityProfiles} />
            <Route component={GenericModuleDashboard} />
        </Switch>
    );
}
