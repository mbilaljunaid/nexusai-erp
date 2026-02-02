
import { lazy } from "react";
import { Route, Switch } from "wouter";

const Reports = lazy(() => import("@/pages/Reports"));


export default function ReportRoutes() {
    return (
        <Switch>
            <Route path="/reports/:module" component={Reports} />
            <Route path="/reports" component={Reports} />

        </Switch>
    );
}
