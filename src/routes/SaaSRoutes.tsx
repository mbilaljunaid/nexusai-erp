import { Route } from "wouter";
import CustomerHealthDashboard from "@/pages/saas/CustomerHealthDashboard";
import PlaybookBuilder from "@/pages/saas/PlaybookBuilder";
import UsageAnalyticsDashboard from "@/pages/saas/UsageAnalyticsDashboard";
import MRRAnalyticsDashboard from "@/pages/saas/MRRAnalyticsDashboard";
import TrialPlanManagementDashboard from "@/pages/saas/TrialPlanManagementDashboard";

export default function SaaSRoutes() {
    return (
        <>
            <Route path="/saas/customer-success" component={CustomerHealthDashboard} />
            <Route path="/saas/customer-success/:customerId" component={CustomerHealthDashboard} />
            <Route path="/saas/playbooks" component={PlaybookBuilder} />
            <Route path="/saas/usage-analytics" component={UsageAnalyticsDashboard} />
            <Route path="/saas/mrr-analytics" component={MRRAnalyticsDashboard} />
            <Route path="/saas/trial-plan-management" component={TrialPlanManagementDashboard} />
        </>
    );
}
