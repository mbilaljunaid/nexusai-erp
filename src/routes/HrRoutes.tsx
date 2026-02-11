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
import TalentPool from "@/pages/TalentPool";
import JobRequisitionDetail from "../pages/recruitment/JobRequisitionDetail";
import OnboardingWorkbench from "../pages/recruitment/OnboardingWorkbench";
import InterviewerDashboard from "../pages/recruitment/InterviewerDashboard";
import MyInterviews from "../pages/recruitment/MyInterviews";
import OnboardingTracker from "../pages/recruitment/OnboardingTracker";
import RecruitmentAnalytics from "../pages/recruitment/RecruitmentAnalytics";
import SuccessionPlanning from "@/pages/SuccessionPlanning";
import CompetencyManagement from "../pages/talent/CompetencyManagement";
import HRPredictiveAnalytics from "../pages/analytics/HRPredictiveAnalytics";
import ModuleLayout from "@/components/layouts/ModuleLayout";
import { HrSidebar } from "@/components/nav/HrSidebar";

// Payroll & Rewards Imports
import CompensationDashboard from "../pages/rewards/CompensationDashboard";
import MyPayslips from "../pages/rewards/MyPayslips";
import PayrollRunDetails from "../pages/rewards/PayrollRunDetails";
import PayrollWorkbench from "../pages/rewards/PayrollWorkbench";
import PayslipView from "../pages/rewards/PayslipView";
import PayrollDetail from "@/pages/PayrollDetail";
import PayrollEngine from "@/pages/PayrollEngine";
import PayrollProcessing from "@/pages/PayrollProcessing";

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
import AssessmentBuilder from "../pages/hr/learning/admin/AssessmentBuilder";
import CurriculumBuilder from "../pages/hr/learning/admin/CurriculumBuilder";
import CommunityBrowser from "../pages/hr/learning/admin/CommunityBrowser";

// Workforce Management (WFM) Imports
import MyTime from "../pages/wfm/MyTime";
import ManagerApprovals from "../pages/wfm/ManagerApprovals";
import TeamSchedule from "../pages/wfm/TeamSchedule";
import WfmAnalytics from "../pages/wfm/WfmAnalytics";
import TimekeeperConsole from "../pages/wfm/TimekeeperConsole";
import PayrollTransfer from "../pages/wfm/PayrollTransfer";
import ViolationsDashboard from "../pages/wfm/ViolationsDashboard";
import ShiftConfiguration from "../pages/wfm/ShiftConfiguration";
import AccrualTesting from "../pages/wfm/AccrualTesting";
import AIWorkforceInsights from "../pages/wfm/AIWorkforceInsights";
import HolidayCalendar from "../pages/wfm/HolidayCalendar";

// HR Analytics
import HRAnalyticsDashboard from "@/pages/HRAnalyticsDashboard";
import HRReports from "@/pages/HRReports";

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
                <Route path="/hr/recruitment/onboarding" component={OnboardingWorkbench} />
                <Route path="/hr/recruitment/interviewer" component={InterviewerDashboard} />
                <Route path="/hr/recruitment/my-interviews" component={MyInterviews} />
                <Route path="/hr/recruitment/onboarding-tracker" component={OnboardingTracker} />
                <Route path="/hr/recruitment/analytics-dashboard" component={RecruitmentAnalytics} />

                <Route path="/hr/succession" component={SuccessionPlanning} />
                <Route path="/hr/talent/competencies" component={CompetencyManagement} />
                <Route path="/hr/talent-pool" component={TalentPool} />
                <Route path="/hr/performance" component={PerformanceManagement} />
                <Route path="/hr/employees" component={EmployeeDirectory} />

                {/* Payroll & Rewards */}
                <Route path="/hr/payroll" component={PayrollRuns} />
                <Route path="/hr/payroll/workbench" component={PayrollWorkbench} />
                <Route path="/hr/payroll/processing" component={PayrollProcessing} />
                <Route path="/hr/payroll/engine" component={PayrollEngine} />
                <Route path="/hr/payroll/runs/:id" component={PayrollRunDetails} />
                <Route path="/hr/payroll/detail/:id" component={PayrollDetail} />
                <Route path="/hr/rewards/compensation" component={CompensationDashboard} />
                <Route path="/hr/rewards/payslips" component={MyPayslips} />
                <Route path="/hr/rewards/payslips/:id" component={PayslipView} />

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

                {/* Learning Admin - Advanced Features */}
                <Route path="/hr/learning/admin/assessments" component={AssessmentBuilder} />
                <Route path="/hr/learning/admin/curricula" component={CurriculumBuilder} />
                <Route path="/hr/learning/communities" component={CommunityBrowser} />

                {/* Workforce Management (WFM) Routes */}
                {/* Employee Self-Service */}
                <Route path="/hr/wfm/me/time" component={MyTime} />
                <Route path="/hr/wfm/me/balances" component={AccrualTesting} />

                {/* Manager Tools */}
                <Route path="/hr/wfm/team/schedule" component={TeamSchedule} />
                <Route path="/hr/wfm/team/approvals" component={ManagerApprovals} />
                <Route path="/hr/wfm/timekeeper" component={TimekeeperConsole} />

                {/* Admin & Configuration */}
                <Route path="/hr/wfm/admin/shifts" component={ShiftConfiguration} />
                <Route path="/hr/wfm/admin/holidays" component={HolidayCalendar} />

                {/* Analytics & Reporting */}
                <Route path="/hr/analytics" component={HRAnalyticsDashboard} />
                <Route path="/hr/analytics/predictive" component={HRPredictiveAnalytics} />
                <Route path="/hr/reports" component={HRReports} />
                <Route path="/hr/wfm/analytics" component={WfmAnalytics} />
                <Route path="/hr/wfm/violations" component={ViolationsDashboard} />
                <Route path="/hr/wfm/insights" component={AIWorkforceInsights} />

                {/* Payroll Integration */}
                <Route path="/hr/wfm/payroll" component={PayrollTransfer} />

                {/* Main HR Dashboard */}
                <Route path="/hr" component={HR} />

                {/* Fallback for any other /hr/* route */}
                <Route path="/hr/*" component={HR} />
            </Switch>
        </ModuleLayout>
    );
}
