
import { lazy } from "react";
import { Route, Switch } from "wouter";


const Analytics = lazy(() => import("@/pages/Analytics"));
const AdvancedAnalytics = lazy(() => import("@/pages/AdvancedAnalytics"));
const BusinessIntelligence = lazy(() => import("@/pages/BusinessIntelligence"));
const SalesAnalytics = lazy(() => import("@/pages/SalesAnalytics"));
const FinancialAnalytics = lazy(() => import("@/pages/FinancialAnalytics"));
const OperationalAnalytics = lazy(() => import("@/pages/OperationalAnalytics"));
const LeadScoringAnalytics = lazy(() => import("@/pages/LeadScoringAnalytics"));
const ChurnRiskAnalysis = lazy(() => import("@/pages/ChurnRiskAnalysis"));

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
        </Switch>
    );
}
