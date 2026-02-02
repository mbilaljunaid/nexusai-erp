
import { Route, Switch } from "wouter";
import HR from "@/pages/HR";
import RecruitmentManagement from "@/pages/RecruitmentManagement";
import PerformanceManagement from "@/pages/PerformanceManagement";

export default function HrRoutes() {
    console.log("DEBUG: HrRoutes Mounted. Path:", window.location.pathname);
    return (
        <Switch>
            <Route path="/hr/recruitment" component={RecruitmentManagement} />
            <Route path="/hr/performance" component={PerformanceManagement} />

            {/* Main HR Dashboard */}
            <Route path="/hr" component={HR} />

            {/* Fallback for any other /hr/* route */}
            <Route path="/hr/*" component={HR} />
        </Switch>
    );
}
