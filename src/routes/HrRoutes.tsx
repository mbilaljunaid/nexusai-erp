import { Route, Switch } from "wouter";
import HR from "@/pages/HR";
import RecruitmentManagement from "@/pages/RecruitmentManagement";
import PerformanceManagement from "@/pages/PerformanceManagement";
import EmployeeDirectory from "@/pages/EmployeeDirectory";
import PayrollRuns from "@/pages/PayrollRuns";
import RecruitmentPipelineBoard from "../pages/recruitment/RecruitmentPipelineBoard";
import InterviewScheduler from "../pages/recruitment/InterviewScheduler";
import OfferManagementWorkbench from "../pages/recruitment/OfferManagementWorkbench";
import CandidateMatchingView from "../pages/recruitment/CandidateMatchingView";
import RecruitingAnalytics from "../pages/recruitment/RecruitingAnalytics";
import TalentPool from "../pages/TalentPool";
import JobRequisitionDetail from "../pages/recruitment/JobRequisitionDetail";
import ModuleLayout from "@/components/layouts/ModuleLayout";
import { HrSidebar } from "@/components/nav/HrSidebar";

export default function HrRoutes() {
    return (
        <ModuleLayout sidebar={<HrSidebar />}>
            <Switch>
                <Route path="/hr/recruitment" component={RecruitmentManagement} />
                <Route path="/hr/recruitment/pipeline" component={RecruitmentPipelineBoard} />
                <Route path="/hr/recruitment/requisitions/:id" component={JobRequisitionDetail} />
                <Route path="/hr/recruitment/interviews" component={InterviewScheduler} />
                <Route path="/hr/recruitment/offers" component={OfferManagementWorkbench} />
                <Route path="/hr/recruitment/matching" component={CandidateMatchingView} />
                <Route path="/hr/recruitment/analytics" component={RecruitingAnalytics} />

                <Route path="/hr/talent-pool" component={TalentPool} />
                <Route path="/hr/performance" component={PerformanceManagement} />
                <Route path="/hr/employees" component={EmployeeDirectory} />
                <Route path="/hr/payroll" component={PayrollRuns} />

                {/* Main HR Dashboard */}
                <Route path="/hr" component={HR} />

                {/* Fallback for any other /hr/* route */}
                <Route path="/hr/*" component={HR} />
            </Switch>
        </ModuleLayout>
    );
}
