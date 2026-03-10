
import { Route, Switch } from "wouter";
import { lazyWithRetry } from "@/lib/lazyWithRetry";

const ERP = lazyWithRetry(() => import("@/pages/ERP"));


export default function ErpRoutes() {
    return (
        <Switch>

            <Route path="/erp/:page?" component={ERP} />
            <Route path="/erp*" component={ERP} />
        </Switch>
    );
}
