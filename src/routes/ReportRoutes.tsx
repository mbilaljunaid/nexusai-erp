
import { Route, Switch } from "wouter";
import { lazyWithRetry } from "@/lib/lazyWithRetry";

const Reports = lazyWithRetry(() => import("@/pages/Reports"));


export default function ReportRoutes() {
    return (
        <Switch>
            <Route path="/reports/:module" component={Reports} />
            <Route path="/reports" component={Reports} />

        </Switch>
    );
}
