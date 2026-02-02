
import { lazy } from "react";
import { Route, Switch } from "wouter";


const TicketDashboard = lazy(() => import("@/pages/TicketDashboard"));
const Service = lazy(() => import("@/pages/Service"));
const ServiceTicketsDetail = lazy(() => import("@/pages/ServiceTicketsDetail"));
const ServiceTicket = lazy(() => import("@/pages/ServiceTicket"));

export default function ServiceRoutes() {
    return (
        <Switch>

            <Route path="/ticket-dashboard" component={TicketDashboard} />
            <Route path="/service" component={Service} />
            <Route path="/service/tickets" component={ServiceTicketsDetail} />
            <Route path="/service/ticket/:id" component={ServiceTicket} />
        </Switch>
    );
}
