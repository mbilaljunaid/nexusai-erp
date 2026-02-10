
import { Route, Switch } from "wouter";
import { lazyWithRetry } from "@/lib/lazyWithRetry";


const TicketDashboard = lazyWithRetry(() => import("@/pages/TicketDashboard"));
const Service = lazyWithRetry(() => import("@/pages/Service"));
const ServiceTicketsDetail = lazyWithRetry(() => import("@/pages/ServiceTicketsDetail"));
const ServiceTicket = lazyWithRetry(() => import("@/pages/ServiceTicket"));

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
