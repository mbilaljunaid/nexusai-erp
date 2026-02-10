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

// Self-Service Imports
import ESSDashboard from "../pages/hr/selfservice/ESSDashboard";
import MSSDashboard from "../pages/hr/selfservice/MSSDashboard";
import PersonalDetails from "../pages/hr/selfservice/PersonalDetails";
import MyTimeCard from "../pages/hr/selfservice/MyTimeCard";
import BenefitsEnrollment from "../pages/hr/selfservice/BenefitsEnrollment";
import StatutoryForms from "../pages/hr/selfservice/StatutoryForms";
import VoluntaryDeductions from "../pages/hr/selfservice/VoluntaryDeductions";
import DelegationWorkbench from "../pages/hr/selfservice/DelegationWorkbench";

// Learning Management (LMS) Imports
import LearningDashboard from "../pages/hr/learning/LearningDashboard";
import CourseCatalogAdmin from "../pages/hr/learning/admin/CourseCatalogAdmin";
import ManagerLearningDashboard from "../pages/hr/learning/manager/ManagerLearningDashboard";
import LearningPlayer from "../pages/hr/learning/player/LearningPlayer";
import InstructorDashboard from "../pages/hr/learning/instructor/InstructorDashboard";

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

                {/* Self-Service Routes */}
                <Route path="/hr/self-service/me" component={ESSDashboard} />
                <Route path="/hr/self-service/team" component={MSSDashboard} />
                <Route path="/hr/self-service/profile" component={PersonalDetails} />
                <Route path="/hr/self-service/time" component={MyTimeCard} />
                <Route path="/hr/self-service/benefits" component={BenefitsEnrollment} />
                <Route path="/hr/self-service/tax-forms" component={StatutoryForms} />
                <Route path="/hr/self-service/deductions" component={VoluntaryDeductions} />
                <Route path="/hr/self-service/delegation" component={DelegationWorkbench} />

                {/* Learning Management (LMS) Routes */}
                <Route path="/hr/learning/me" component={LearningDashboard} />
                <Route path="/hr/learning/team" component={ManagerLearningDashboard} />
                <Route path="/hr/learning/admin" component={CourseCatalogAdmin} />
                <Route path="/hr/learning/instructor" component={InstructorDashboard} />
                <Route path="/hr/learning/play/:id" component={LearningPlayer} />

                {/* Main HR Dashboard */}
                <Route path="/hr" component={HR} />

                {/* Fallback for any other /hr/* route */}
                <Route path="/hr/*" component={HR} />
            </Switch>
        </ModuleLayout>
    );
}
