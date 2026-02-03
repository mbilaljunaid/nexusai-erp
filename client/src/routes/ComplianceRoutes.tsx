
import { lazy } from "react";
import { Route, Switch } from "wouter";

const Compliance = lazy(() => import("@/pages/Compliance"));

const ComplianceDashboardNew = lazy(() => import("@/pages/ComplianceDashboardNew"));
const ComplianceMonitoring = lazy(() => import("@/pages/ComplianceMonitoring"));
const ComplianceExceptions = lazy(() => import("@/pages/ComplianceExceptions"));
const ComplianceGovernance = lazy(() => import("@/pages/ComplianceGovernance"));
const AuditTrails = lazy(() => import("@/pages/AuditTrails"));

export default function ComplianceRoutes() {
    return (
        <Switch>
            <Route path="/compliance" component={ComplianceDashboardNew} />
            <Route path="/compliance/dashboard" component={ComplianceDashboardNew} />
            <Route path="/compliance/monitoring" component={ComplianceMonitoring} />
            <Route path="/compliance/exceptions" component={ComplianceExceptions} />
            <Route path="/compliance/governance" component={ComplianceGovernance} />
            <Route path="/compliance/audit" component={AuditTrails} />
        </Switch>
    );
}
