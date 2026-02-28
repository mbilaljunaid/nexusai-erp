
import { Route, Switch } from "wouter";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import GenericModuleDashboard from "@/components/shared/GenericModuleDashboard";


const Analytics = lazyWithRetry(() => import("@/pages/Analytics"));
const AdvancedAnalytics = lazyWithRetry(() => import("@/pages/AdvancedAnalytics"));
const BusinessIntelligence = lazyWithRetry(() => import("@/pages/BusinessIntelligence"));
const SalesAnalytics = lazyWithRetry(() => import("@/pages/SalesAnalytics"));
const FinancialAnalytics = lazyWithRetry(() => import("@/pages/FinancialAnalytics"));
const OperationalAnalytics = lazyWithRetry(() => import("@/pages/OperationalAnalytics"));
const LeadScoringAnalytics = lazyWithRetry(() => import("@/pages/LeadScoringAnalytics"));
const ChurnRiskAnalysis = lazyWithRetry(() => import("@/pages/ChurnRiskAnalysis"));

export default function AnalyticsRoutes() {
    return (
        <Switch>

            <Route path="/analytics" component={Analytics} />
            <Route path="/analytics/advanced" component={AdvancedAnalytics} />
            <Route path="/analytics/bi" component={BusinessIntelligence} />
            <Route path="/analytics/sales" component={SalesAnalytics} />
            <Route path="/analytics/finance" component={FinancialAnalytics} />
            <Route path="/analytics/operational" component={OperationalAnalytics} />
            <Route path="/analytics/lead-scoring" component={LeadScoringAnalytics} />
            <Route path="/analytics/churn" component={ChurnRiskAnalysis} />
            <Route component={GenericModuleDashboard} />
        </Switch>
    );
}
