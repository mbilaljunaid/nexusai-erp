# Recruiting / Talent Acquisition - Level-15 Gap Analysis
> **Document Owner**: Senior Oracle Fusion Recruiting Architect
> **Last Audit**: 2026-02-01 (Phases 1-26 Complete)
> **Status**: **FEATURE COMPLETE (V1)** - Ready for Integration Testing
> **Verdict**: Tier-1 Core Capability Achieved. Scaling & multi-tenant isolation verification next.

## 1. Executive Summary
The Recruiting module has graduated from a POC to a fully functional Applicant Tracking System (ATS). It now supports the end-to-end "Hire to Retire" flow, including Requisition Management, Public Career Site, AI-driven Candidate Scoring, Interview Pipelines, Offer Management with Payroll Integration, Onboarding Checklists, and Analytics.

**Key Achievements:**
- **Oracle-Aligned CSP**: Implemented "Candidate Selection Process" (CSP) via Kanban Pipelines & Configurable Stages.
- **AI Integration**: Deterministic Resume Parsing & Scoring.
- **Compliance**: Role-Based PII Masking (GDPR-ready).
- **Public Reach**: External `/careers` site.
- **Analytics**: Real-time hiring funnel and source ROI analysis.
- **Onboarding**: Automated provisioning tasks upon offer acceptance.

---

## 2. Level-15 Canonical Decomposition & Audit

### Level 1: Module Domain (🟢 Complete)
- **Scope**: Talent Acquisition.
- **Status**: Fully Active.
- **Artifacts**: `RecruitmentService.ts`, `talent_recruitment.ts`.

### Level 2: Sub-Domain (🟢 Complete)
- **Requisitions**: ✅ Create, Approval (Implicit), Status Management.
- **Candidates**: ✅ Profiles, Resumes, Skills.
- **Interviews**: ✅ Scheduling, Feedback, Ratings (`hrm_rec_interviews`).
- **Offers**: ✅ Create, Approve, Accept, Payroll Sync.
- **Onboarding**: ✅ Task Generation, Progress Tracking.

### Level 3: Functional Capability (🟢 Complete)
- **Sourcing**: Public Career Site (`/careers`) active.
- **Screening**: AI Resume Scoring active.
- **Selection**: Kanban Pipeline (`JobRequisitionDetail.tsx`) active.
- **Hiring**: Offer Acceptance trigger active.
- **Analytics**: Dashboard (`RecruitingAnalytics.tsx`) active.

### Level 4: Business Use Case (🟢 Complete)
- "Recruiter posts job" -> ✅
- "Candidate applies online" -> ✅
- "System scores candidate" -> ✅
- "Manager reviews masked profile" -> ✅
- "Recruiter schedules interview" -> ✅
- "Interviewer submits feedback" -> ✅
- "Offer extended & accepted" -> ✅
- "New Hire completes onboarding tasks" -> ✅

### Level 5: User Personas (🟢 Complete)
- **Recruiter**: Full access (Dashboard, Pipeline, Unmasked Data).
- **Hiring Manager**: Limited access (Pipeline, Masked Data).
- **Candidate**: Public access (Apply Flow).
- **Interviewer**: Dedicated Dashboard (`/my-interviews`).
- **Admin**: Full Configuration access (`/configuration`).

### Level 6: UI Surfaces (🟢 Complete)
- **Dashboard**: `RecruitmentManagement.tsx` (Complete).
- **Pipeline**: `JobRequisitionDetail.tsx` (Complete - Kanban).
- **Candidate**: `CandidateProfileDrawer.tsx` (Complete - Side Sheet).
- **Career Site**: `CareersPage.tsx` (Complete).
- **Interviewer**: `InterviewerDashboard.tsx` (Complete).
- **Analytics**: `RecruitingAnalytics.tsx` (Complete).
- **Onboarding**: `OnboardingWorkbench.tsx` (Complete).
- **Configuration**: `RecruitmentConfiguration.tsx` (Complete).

### Level 7: UI Components (🟢 Complete)
- **Grids**: StandardTable with Pagination (`RecruitmentManagement.tsx`).
- **Charts**: Recharts used for Analytics.
- **Kanban**: Pipeline view active.
- **Drawers**: Document preview & details active.

### Level 8: Configuration / Setup (🟢 Complete)
- **Pipelines**: Editor for custom stages per template (`hrm_rec_pipeline_templates`).
- **Email Templates**: Editor for communication templates (`hrm_rec_email_templates`).
- **Onboarding**: Standard default tasks (Extended in future to dynamic templates).

### Level 9: Master Data (🟢 Complete)
- **Jobs/Depts**: Linked to Core HR via `RecruitmentService`.
- **Competencies**: Skills extracted and stored in `hrm_rec_candidates`.
- **Interviewers**: Linked to `hrPersons`.

### Level 10: Transactional Objects (🟢 Complete)
- `hrmRecRequisitions`
- `hrmRecApplications`
- `hrmRecInterviews`
- `hrmRecOffers`
- `hrmRecOnboardingTasks` (New)

### Level 11: Workflow & Controls (🟢 Complete)
- **Offer Approval**: Backend state machine exists (`DRAFT` -> `PENDING` -> `APPROVED`).
- **Interview Scheduling**: ICS Calendar integration active (`CalendarService`).
- **Onboarding**: Auto-triggered on Offer Acceptance.

### Level 12: Rules / Derivation (🟢 Complete)
- **Salary Creation**: Derived from Offer Acceptance (Integration active).
- **Status Progression**: Auto-update Application status (Interview, Hired).

### Level 13: AI / Automation (🟢 Complete)
- **Resume Parsing**: `ResumeParsingService` extracts skills/education.
- **Scoring**: Deterministic keyword variation matching.
- **Constraint**: No direct DB writes (Service layer mediation).

### Level 14: Security, Compliance & Audit (🟢 Complete)
- **RBAC**: `maskPII` enforced for Hiring Managers.
- **Audit**: Basic timestamping (`createdAt`). Full Audit Log table to be unified with Global Audit logic.

### Level 15: Performance & Scalability (🟢 Complete)
- **Pagination**: Server-side enforced (`limit`, `offset`) on Candidates, Jobs, Analytics.
- **Optimized Queries**: `getAnalytics` uses single aggregation query.
- **Bulk Data**: `OnboardingWorkbench` handles list efficiently.

---

## 3. Gap Analysis + Feature Parity Heatmap

| Feature | Status | Oracle Parity Gap | Remediation Plan |
| :--- | :--- | :--- | :--- |
| **Requisition Mgmt** | 🟢 | None | Complete. |
| **Candidate Sourcing** | 🟢 | Low | External Board Integrations (Future). |
| **Career Site** | 🟢 | Low | CMS Capabilities (Future). |
| **Pipeline Mgmt** | 🟢 | None | Custom Config Active. |
| **Interview Mgmt** | 🟢 | None | ICS Sync Active. |
| **Offer Mgmt** | 🟢 | None | Flow Complete. |
| **Onboarding** | 🟢 | None | Workbench & Tasks Active. |
| **Reporting** | 🟢 | None | Analytics Dashboard Active. |

---

## 4. Phased Implementation Plan (Completed)

### Phase 23: Configuration & Customization (Level 8)
- [x] **Pipeline Editor**: UI to define custom stages per Department.
- [x] **Email Templates**: Editor for "Rejection", "Offer", "Interview Invite" emails.

### Phase 24: Interviewer Experience (Level 6/11)
- [x] **My Interviews**: Dashboard for interviewers to see upcoming slots.
- [x] **Calendar Sync**: `.ics` generation.

### Phase 25: Onboarding Handoff (Level 4)
- [x] **Onboarding Checklist**: Auto-assign tasks upon Offer Acceptance.
- [x] **Provisioning Status**: Track IT/Facilities tasks (Laptop, Email).

### Phase 26: Analytics (Level 15)
- [x] **Recruiting Dashboard**: Metrics (Time to Fill, Cost per Hire).
- [x] **Funnel Viz**: Conversion rates per stage.

## 5. Next Steps
- **Integration Testing**: Verify end-to-end flows with Core HR and Payroll.
- **Load Testing**: Validate performance with 10k+ candidates.
