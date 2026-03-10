import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
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
import RecruitmentCampaignBuilder from "../pages/hr/recruitment/RecruitmentCampaignBuilder";
import SuccessionPlanning from "@/pages/SuccessionPlanning";
import CompetencyManagement from "../pages/talent/CompetencyManagement";
import PerformanceCalibrationBoard from "../pages/hr/performance/PerformanceCalibrationBoard";
import HRPredictiveAnalytics from "../pages/analytics/HRPredictiveAnalytics";
import ModuleLayout from "@/components/layouts/ModuleLayout";
import { HrSidebar } from "@/components/nav/HrSidebar";
import GenericModuleDashboard from "@/components/shared/GenericModuleDashboard";

// Payroll & Rewards Imports
import CompensationDashboard from "../pages/rewards/CompensationDashboard";
import MyPayslips from "../pages/rewards/MyPayslips";
import PayrollRunDetails from "../pages/rewards/PayrollRunDetails";
import PayrollWorkbench from "../pages/rewards/PayrollWorkbench";
import PayslipView from "../pages/rewards/PayslipView";
import PayrollDetail from "@/pages/PayrollDetail";
import PayrollEngine from "@/pages/PayrollEngine";
import PayrollProcessing from "@/pages/PayrollProcessing";
import ElementConfiguration from "@/pages/hr/payroll/ElementConfiguration";
import PayrollCostingSetup from "../pages/hr/payroll/PayrollCostingSetup";
import RetroactivePayEngine from "../pages/hr/payroll/RetroactivePayEngine";
import RetroEventGroupSetup from "../pages/hr/payroll/RetroEventGroupSetup";
import PayslipGrossToNet from "../pages/hr/payroll/PayslipGrossToNet";
import YTDBalanceUpload from "../pages/hr/payroll/YTDBalanceUpload";

// Self-Service Imports
import ESSDashboard from "../pages/hr/selfservice/ESSDashboard";
import MSSDashboard from "../pages/hr/selfservice/MSSDashboard";
import PersonalDetails from "../pages/hr/selfservice/PersonalDetails";
import MyTimeCard from "../pages/hr/selfservice/MyTimeCard";
import BenefitsEnrollment from "../pages/hr/selfservice/BenefitsEnrollment";
import StatutoryForms from "../pages/hr/selfservice/StatutoryForms";
import VoluntaryDeductions from "../pages/hr/selfservice/VoluntaryDeductions";
import DelegationWorkbench from "../pages/hr/selfservice/DelegationWorkbench";
import AssignmentHistory from "../pages/hr/AssignmentHistory";
import LifeEvents from "../pages/hr/selfservice/LifeEvents";
import GuidedJourneyWorkerTransfer from "../pages/hr/GuidedJourneyWorkerTransfer";

// Learning Management (LMS) Imports
import MyLearning from "../pages/learning/MyLearning";
import CourseCatalogAdmin from "../pages/hr/learning/admin/CourseCatalogAdmin";
import ManagerLearningDashboard from "../pages/hr/learning/manager/ManagerLearningDashboard";
import LearningPlayer from "../pages/hr/learning/player/LearningPlayer";
import InstructorDashboard from "../pages/hr/learning/instructor/InstructorDashboard";
import AssessmentBuilder from "../pages/hr/learning/admin/AssessmentBuilder";
import CurriculumBuilder from "../pages/hr/learning/admin/CurriculumBuilder";
import CommunityBrowser from "../pages/hr/learning/admin/CommunityBrowser";

// Core HR configuration
import WorkforceStructureSetup from "../pages/hr/WorkforceStructureSetup";
import DocumentOfRecords from "../pages/hr/DocumentOfRecords";
import BenefitsProgramSetup from "../pages/hr/benefits/BenefitsProgramSetup";
import CompBenDashboard from "../pages/hr/CompBenDashboard";
import WorkforceStructureDashboard from "../pages/hr/WorkforceStructureDashboard";

// Workforce Management (WFM) Imports
import TimeRuleBuilder from "../pages/hr/TimeRuleBuilder";
import PredictiveScheduler from "../pages/hr/PredictiveScheduler";
import AbsencePlanSetup from "../pages/hr/absence/AbsencePlanSetup";
import MyTime from "../pages/wfm/MyTime";
import ManagerApprovals from "../pages/wfm/ManagerApprovals";
import TeamSchedule from "../pages/wfm/TeamSchedule";
import WfmAnalytics from "../pages/wfm/WfmAnalytics";
import TimekeeperConsole from "../pages/wfm/TimekeeperConsole";
import PayrollTransfer from "../pages/wfm/PayrollTransfer";
import ViolationsDashboard from "../pages/wfm/ViolationsDashboard";
import ShiftConfiguration from "../pages/wfm/ShiftConfiguration";
import RepeatingTimePeriods from "../pages/hr/wfm/RepeatingTimePeriods"; // New import
import AccrualTesting from "../pages/hr/AccrualTesting"; // Updated path for AccrualTesting
import PerformanceTemplateBuilder from "../pages/hr/PerformanceTemplateBuilder";
import QuestionnaireBuilder from "../pages/hr/QuestionnaireBuilder";
import OfferLetterTemplateBuilder from "../pages/hr/OfferLetterTemplateBuilder";
import AIWorkforceInsights from "../pages/wfm/AIWorkforceInsights";
import HolidayCalendar from "../pages/wfm/HolidayCalendar";
import RegulatoryCalendar from "../pages/hr/RegulatoryCalendar";

// New Phase 8 Parity Components
import PersonSpotlight from "../pages/hr/PersonSpotlight";
import StatutoryTaxFiling from "../pages/hr/payroll/StatutoryTaxFiling";
import OffCyclePayment from "../pages/hr/payroll/OffCyclePayment";
import PayrollSimulator from "../pages/hr/payroll/PayrollSimulator";
import FmlaWorkbench from "../pages/wfm/FmlaWorkbench";
import ShiftBiddingBoard from "../pages/wfm/ShiftBiddingBoard";
import TimeCardAudit from "../pages/wfm/TimeCardAudit";
import CareerSiteBuilder from "../pages/recruiting/CareerSiteBuilder";
import CandidateMerge from "../pages/recruiting/CandidateMerge";
import GoalCascadeTree from "../pages/hr/talent/GoalCascadeTree";
import ComplianceRenewalMonitor from "../pages/hr/learning/ComplianceRenewalMonitor";
import SuccessionOrgChart from "../pages/hr/talent/SuccessionOrgChart";
import WorkforceCompensationWorkbench from "../pages/hr/compensation/WorkforceCompensationWorkbench";
import EquityAwardsManager from "../pages/hr/compensation/EquityAwardsManager";
import TotalCompensationStatement from "../pages/hr/compensation/TotalCompensationStatement";
import GradeLadderSetup from "../pages/hr/orgdesign/GradeLadderSetup";
import EeoEstablishmentReporting from "../pages/hr/orgdesign/EeoEstablishmentReporting";

// HCM Additional Gap Components
import SeniorityTracking from "../pages/hr/SeniorityTracking";
import DocumentRoutingConfig from "../pages/hr/performance/DocumentRoutingConfig";
import PerformanceToCompIntegration from "../pages/hr/performance/PerformanceToCompIntegration";
import ExternalTrainingCredit from "../pages/learning/ExternalTrainingCredit";
import LearningSkillIntegration from "../pages/learning/LearningSkillIntegration";
import RiskOfLossScoreboard from "../pages/hr/talent/RiskOfLossScoreboard";
import TreeVersioning from "../pages/hr/orgdesign/TreeVersioning";

// HCM Phase 3 Final Gap Components
import HireFlowWizard from "../pages/hr/HireFlowWizard";
import EffectiveDatingPanel from "../pages/hr/EffectiveDatingPanel";
import JobBoardDistribution from "../pages/recruitment/JobBoardDistribution";
import LearningRecommendations from "../pages/learning/LearningRecommendations";
import SuccessionNotification from "../pages/hr/talent/SuccessionNotification";


// HCM Phase 9 Gap Components
import InterviewScoringRubric from "../pages/recruitment/InterviewScoringRubric";
import RequisitionApprovalRules from "../pages/recruitment/RequisitionApprovalRules";
import OnboardingChecklistManager from "../pages/recruitment/OnboardingChecklistManager";
import FeedbackCenter360 from "../pages/hr/performance/FeedbackCenter360";
import CompEligibilityProfiles from "../pages/hr/compensation/CompEligibilityProfiles";
import SalaryRangeCompaRatio from "../pages/hr/compensation/SalaryRangeCompaRatio";
import JobFamiliesProfiles from "../pages/hr/orgdesign/JobFamiliesProfiles";

// HCM Phase 10 Gap Components
import PayrollDefinitionSetup from "../pages/hr/payroll/PayrollDefinitionSetup";
import EmploymentContractManager from "../pages/hr/EmploymentContractManager";
import PositionBudgetingWorkbench from "../pages/hr/PositionBudgetingWorkbench";
import HRJourneyTemplateBuilder from "../pages/hr/HRJourneyTemplateBuilder";

// HR Analytics
import HRAnalyticsDashboard from "@/pages/HRAnalyticsDashboard";
import HRReports from "@/pages/HRReports";

export default function HrRoutes() {
    return (
        <ModuleLayout sidebar={<HrSidebar />}>
            <Switch>
                {/* WFM Base Route Redirect */}
                <Route path="/hr/wfm" component={() => {
                    const [loc, setLocation] = useLocation();
                    useEffect(() => {
                        if (loc === "/hr/wfm" || loc === "/hr/wfm/") {
                            setLocation("/hr/wfm/me/time");
                        }
                    }, [loc, setLocation]);
                    return null;
                }} />

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
                <Route path="/hr/recruitment/campaigns" component={RecruitmentCampaignBuilder} />
                <Route path="/hr/recruitment/career-site" component={CareerSiteBuilder} />
                <Route path="/hr/recruitment/candidate-merge" component={CandidateMerge} />
                <Route path="/hr/recruitment/job-boards" component={JobBoardDistribution} />
                <Route path="/hr/recruitment/interview-scoring" component={InterviewScoringRubric} />
                <Route path="/hr/recruitment/approval-rules" component={RequisitionApprovalRules} />
                <Route path="/hr/recruitment/onboarding-checklist" component={OnboardingChecklistManager} />

                <Route path="/hr/succession" component={SuccessionPlanning} />
                <Route path="/hr/succession/org-chart" component={SuccessionOrgChart} />
                <Route path="/hr/talent/competencies" component={CompetencyManagement} />
                <Route path="/hr/talent/performance/templates" component={PerformanceTemplateBuilder} />
                <Route path="/hr/talent/questionnaires" component={QuestionnaireBuilder} />
                <Route path="/hr/talent/offers/templates" component={OfferLetterTemplateBuilder} />
                <Route path="/hr/talent/goal-cascade" component={GoalCascadeTree} />
                <Route path="/hr/talent-pool" component={TalentPool} />
                <Route path="/hr/performance" component={PerformanceManagement} />
                <Route path="/hr/performance/calibration" component={PerformanceCalibrationBoard} />
                <Route path="/hr/talent/performance/routing" component={DocumentRoutingConfig} />
                <Route path="/hr/talent/performance/comp-sync" component={PerformanceToCompIntegration} />
                <Route path="/hr/performance/360-feedback" component={FeedbackCenter360} />
                <Route path="/hr/employees" component={EmployeeDirectory} />
                <Route path="/hr/hire" component={HireFlowWizard} />
                <Route path="/hr/seniority-tracking" component={SeniorityTracking} />
                <Route path="/hr/datetrack" component={EffectiveDatingPanel} />
                <Route path="/hr/employees/spotlight/:id" component={PersonSpotlight} />
                <Route path="/hr/succession/risk-board" component={RiskOfLossScoreboard} />
                <Route path="/hr/succession/notifications" component={SuccessionNotification} />

                {/* Payroll & Rewards */}
                <Route path="/hr/payroll" component={PayrollRuns} />
                <Route path="/hr/payroll/workbench" component={PayrollWorkbench} />
                <Route path="/hr/payroll/setup/elements" component={ElementConfiguration} />
                <Route path="/hr/payroll/setup/costing" component={PayrollCostingSetup} />
                <Route path="/hr/payroll/setup/events" component={RetroEventGroupSetup} />
                <Route path="/hr/payroll/setup/balances" component={YTDBalanceUpload} />
                <Route path="/hr/payroll/statutory-taxes" component={StatutoryTaxFiling} />
                <Route path="/hr/payroll/processing" component={PayrollProcessing} />
                <Route path="/hr/payroll/off-cycle" component={OffCyclePayment} />
                <Route path="/hr/payroll/simulator" component={PayrollSimulator} />
                <Route path="/hr/payroll/retro" component={RetroactivePayEngine} />
                <Route path="/hr/payroll/engine" component={PayrollEngine} />
                <Route path="/hr/payroll/runs/:id">
                    {(params: any) => params ? <PayrollRunDetails runId={params.id} isOpen={true} onClose={() => { }} /> : null}
                </Route>
                <Route path="/hr/payroll/detail/:id" component={PayrollDetail} />
                <Route path="/hr/payroll/payslip/:id">
                    {(params: any) => params ? <PayslipView isOpen={true} onClose={() => { }} runId="demo" assignmentId="demo" data={[]} /> : null}
                </Route>

                {/* ESS & MSS Routes */}
                <Route path="/hr/rewards/compensation" component={CompensationDashboard} />
                <Route path="/hr/rewards/payslips" component={MyPayslips} />
                <Route path="/hr/rewards/payslips/:id">
                    {(params: any) => params ? <PayslipView isOpen={true} onClose={() => { }} runId="demo" assignmentId="demo" data={[]} /> : null}
                </Route>
                <Route path="/hr/compensation/total-rewards" component={TotalCompensationStatement} />
                <Route path="/hr/compensation/equity" component={EquityAwardsManager} />
                <Route path="/hr/compensation/workbench" component={WorkforceCompensationWorkbench} />

                {/* Phase 10 — New HCM Pages */}
                <Route path="/hr/payroll/definition-setup" component={PayrollDefinitionSetup} />
                <Route path="/hr/employment-contracts" component={EmploymentContractManager} />
                <Route path="/hr/position-budgeting" component={PositionBudgetingWorkbench} />
                <Route path="/hr/journey-templates" component={HRJourneyTemplateBuilder} />

                {/* Self-Service Routes */}
                <Route path="/hr/self-service/me" component={ESSDashboard} />
                <Route path="/hr/self-service/team" component={MSSDashboard} />
                <Route path="/hr/self-service/profile" component={PersonalDetails} />
                <Route path="/hr/self-service/time" component={MyTimeCard} />
                <Route path="/hr/self-service/benefits" component={BenefitsEnrollment} />
                <Route path="/hr/self-service/life-events" component={LifeEvents} />
                <Route path="/hr/self-service/tax-forms" component={StatutoryForms} />
                <Route path="/hr/self-service/deductions" component={VoluntaryDeductions} />
                <Route path="/hr/self-service/delegation" component={DelegationWorkbench} />
                <Route path="/hr/self-service/history" component={AssignmentHistory} />
                <Route path="/hr/self-service/transfer" component={GuidedJourneyWorkerTransfer} />

                {/* Workforce Management (WFM) Routes - New additions */}
                <Route path="/hr/wfm/time-rules" component={TimeRuleBuilder} />
                <Route path="/hr/wfm/scheduler" component={PredictiveScheduler} />
                <Route path="/hr/wfm/absence/setup" component={AbsencePlanSetup} />
                <Route path="/hr/wfm/fmla" component={FmlaWorkbench} />
                <Route path="/hr/wfm/shift-bidding" component={ShiftBiddingBoard} />

                {/* Configuration / Setup */}
                <Route path="/hr/setup" component={WorkforceStructureDashboard} />
                <Route path="/hr/setup/workforce-structures" component={WorkforceStructureSetup} />
                <Route path="/hr/setup/tree-versioning" component={TreeVersioning} />
                <Route path="/hr/setup/document-records" component={DocumentOfRecords} />
                <Route path="/hr/setup/benefits-programs" component={BenefitsProgramSetup} />
                <Route path="/hr/setup/grade-ladders" component={GradeLadderSetup} />
                <Route path="/hr/setup/job-families" component={JobFamiliesProfiles} />
                <Route path="/hr/compensation" component={CompBenDashboard} />
                <Route path="/hr/compensation/eligibility-profiles" component={CompEligibilityProfiles} />
                <Route path="/hr/compensation/salary-ranges" component={SalaryRangeCompaRatio} />

                {/* Learning Management (LMS) Routes */}
                <Route path="/hr/learning/me" component={MyLearning} />
                <Route path="/hr/learning/team" component={ManagerLearningDashboard} />
                <Route path="/hr/learning/admin" component={CourseCatalogAdmin} />
                <Route path="/hr/learning/instructor" component={InstructorDashboard} />
                <Route path="/hr/learning/play/:id" component={LearningPlayer} />

                {/* Learning Admin - Advanced Features */}
                <Route path="/hr/learning/compliance" component={ComplianceRenewalMonitor} />
                <Route path="/hr/learning/admin/assessments" component={AssessmentBuilder} />
                <Route path="/hr/learning/admin/curricula" component={CurriculumBuilder} />
                <Route path="/hr/learning/communities" component={CommunityBrowser} />
                <Route path="/hr/learning/external-credit" component={ExternalTrainingCredit} />
                <Route path="/hr/learning/skill-sync" component={LearningSkillIntegration} />
                <Route path="/hr/learning/recommendations" component={LearningRecommendations} />

                {/* Workforce Management (WFM) Routes */}
                {/* Employee Self-Service */}
                <Route path="/hr/wfm/me/time" component={MyTime} />
                <Route path="/hr/wfm/me/balances" component={AccrualTesting} />

                {/* Manager Tools */}
                <Route path="/hr/wfm/team/schedule" component={TeamSchedule} />
                <Route path="/hr/wfm/team/approvals" component={ManagerApprovals} />
                <Route path="/hr/wfm/timekeeper" component={TimekeeperConsole} />
                <Route path="/hr/wfm/timecard-audit" component={TimeCardAudit} />

                {/* Admin & Configuration */}
                <Route path="/hr/wfm/admin/shifts" component={ShiftConfiguration} />
                <Route path="/hr/wfm/admin/holidays" component={HolidayCalendar} />
                <Route path="/hr/wfm/admin/time-rules" component={TimeRuleBuilder} />
                <Route path="/hr/wfm/admin/time-periods" component={RepeatingTimePeriods} />

                {/* Analytics & Reporting */}
                <Route path="/hr/analytics" component={HRAnalyticsDashboard} />
                <Route path="/hr/analytics/predictive" component={HRPredictiveAnalytics} />
                <Route path="/hr/reports" component={HRReports} />
                <Route path="/hr/reports/eeo-establishment" component={EeoEstablishmentReporting} />
                <Route path="/hr/wfm/analytics" component={WfmAnalytics} />
                <Route path="/hr/wfm/schedules/:deptId" component={PredictiveScheduler} />
                <Route path="/hr/wfm/time-entries" component={MyTimeCard} /> {/* Reusing for admin view */}
                <Route path="/hr/wfm/setup/rules" component={TimeRuleBuilder} />
                <Route path="/hr/wfm/setup/accruals/test" component={AccrualTesting} />
                <Route path="/hr/wfm/violations" component={ViolationsDashboard} />
                <Route path="/hr/wfm/insights" component={AIWorkforceInsights} />

                {/* Payroll Integration */}
                <Route path="/hr/wfm/payroll" component={PayrollTransfer} />

                {/* Main HR Dashboard */}
                <Route path="/hr/regulatory-calendar" component={RegulatoryCalendar} />
                <Route path="/hr" component={HR} />

                {/* Fallback for any other /hr/* route */}
                <Route path="/hr/*" component={HR} />
            </Switch>
        </ModuleLayout>
    );
}
