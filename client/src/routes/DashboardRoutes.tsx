
import { lazy } from "react";
import { Route, Switch } from "wouter";

const Dashboard = lazy(() => import("@/pages/Dashboard"));

export default function DashboardRoutes() {
    return (
        <Switch>
            <Route path="/dashboard" component={Dashboard} />
        </Switch>
    );
}
