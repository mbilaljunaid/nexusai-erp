
import { lazy } from "react";
import { Route, Switch } from "wouter";

const Marketing = lazy(() => import("@/pages/Marketing"));
const CampaignsDashboard = lazy(() => import("@/pages/CampaignsDashboard"));
const MarketingEngagement = lazy(() => import("@/pages/MarketingEngagement"));

export default function MarketingRoutes() {
    return (
        <Switch>
            <Route path="/marketing-module" component={Marketing} />
            <Route path="/marketing/:page?" component={Marketing} />
        </Switch>
    );
}
