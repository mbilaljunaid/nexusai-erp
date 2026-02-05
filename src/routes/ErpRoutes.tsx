
import { lazy } from "react";
import { Route, Switch } from "wouter";

const ERP = lazy(() => import("@/pages/ERP"));


export default function ErpRoutes() {
    return (
        <Switch>

            <Route path="/erp/:page?" component={ERP} />
            <Route path="/erp*" component={ERP} />
        </Switch>
    );
}
