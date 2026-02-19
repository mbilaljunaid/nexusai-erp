import { Route, Switch } from "wouter";
import { lazyWithRetry } from "@/lib/lazyWithRetry";

// Dynamic Module Landing Page
const ModuleLandingPage = lazyWithRetry(() => import("@/pages/modules/ModuleLandingPage"));

export default function ModuleRoutes() {
    return (
        <Switch>
            {/* Dynamic Module Route */}
            <Route path="/modules/:slug" component={ModuleLandingPage} />
        </Switch>
    );
}
