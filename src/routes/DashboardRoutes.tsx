
import { Route, Switch } from "wouter";
import { lazyWithRetry } from "@/lib/lazyWithRetry";

const Dashboard = lazyWithRetry(() => import("@/pages/Dashboard"));

export default function DashboardRoutes() {
    return (
        <Switch>
            <Route path="/dashboard" component={Dashboard} />
        </Switch>
    );
}
