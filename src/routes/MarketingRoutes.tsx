
import { Route, Switch } from "wouter";
import { lazyWithRetry } from "@/lib/lazyWithRetry";

const Marketing = lazyWithRetry(() => import("@/pages/Marketing"));
const CampaignsDashboard = lazyWithRetry(() => import("@/pages/CampaignsDashboard"));
const MarketingEngagement = lazyWithRetry(() => import("@/pages/MarketingEngagement"));

export default function MarketingRoutes() {
    return (
        <Switch>
            <Route path="/marketing-module" component={Marketing} />
            <Route path="/marketing/:page?" component={Marketing} />
        </Switch>
    );
}
