# Learning & Training (LMS) - Level-15 Canonical Decomposition & Gap Analysis

> **Latest Audit:** 2026-02-02
> **Status:** Phase 4 (AI) Complete. Moving to Tier-1 Deepening.

## 1. Executive Summary & Tier-1 Assessment

**Current State:** ⚠️ **TIER-2 FUNCTIONAL (ENTERPRISE CORE READY)**
The Learning & Training module has advanced significantly from MVP. It now possesses core Enterprise structures including **Manager Self-Service (MSS)**, **AI-Driven Recommendations**, **Faceted Catalog Search**, and **Mandatory Assignments**.
However, it remains "Tier-2" because it lacks the deep "Engine" capabilities of Oracle Fusion:
1.  **Content Engine:** No native SCORM/xAPI player or video hosting.
2.  **Compliance Engine:** No automated recertification logic (e.g., "Expire 30 days after").
3.  **Financial Integration:** No cost tracking, chargebacks, or GL integration for paid learning.
4.  **Workflow Engine:** Enrollments are immediate; missing "Request -> Approve" flows.

**Critical Gaps (Remaining):**
*   **Content Player:** Implementation needed for SCORM 1.2/2004 & Video playback.
*   **Automated Rules:** Assignment profiles (e.g., "Assign 'Onboarding' to all new Hires") are manual.
*   **Instructor Persona:** No view for Instructors to grade or mark attendance.
*   **Finance Integration:** Pricing and cost centers are missing.

## 2. Gap Analysis + Feature Parity Heatmap

| Feature Area | Oracle Fusion Learning | NexusAI Current State | Status | Parity Gap |
| :--- | :--- | :--- | :--- | :--- |
| **Catalog Structure** | Catalog > Community > Subject > Course > Offering > Activity | Flat List of Courses & Offerings with Categories | 🟡 Partial | Missing hierarchical communities |
| **Content Delivery** | Native Video, SCORM 1.2/2004, AICC, PDF | Metadata (Content Items) defined, Output URL only | � Partial | **CRITICAL:** Missing Player UI |
| **Enrollments** | Approval flows, Waitlists, Prereqs, Eligibility Profiles | "Click to Enroll" & Manager Assign | 🟡 Partial | Missing Approvals & Waitlists |
| **Compliance** | Certifications, Recertification Logic, Validity Periods | Certification Entities exist; Manual Tracking | � Partial | Missing Auto-Renewal Jobs |
| **Learning Paths** | Curriculums, Specializations, Learning Journeys | None | 🔴 Missing | Single-course only |
| **Assessments** | Quizzes, Tests, Surveys, Evaluations | Score field only | 🔴 Missing | No Assessment Editor/Runner |
| **Instructors** | Resources, Scheduling, Virtual Classroom Integration | Simple ID reference | 🟡 Partial | No Instructor Portal |
| **Manager Self-Service**| Team Learning, Assignments, Compliance Dashboard | **Implemented** (Team View + Assignments) | 🟢 Parity | **Verified** |
| **AI/Intelligence** | Recommendations, "Best for you", Skill Gap Analysis | **Implemented** (Recs + Skill Extraction) | 🟢 Parity | **Verified** |

## 3. Level-15 Canonical Decomposition

### Level 1 — Module Domain
**Learning & Training (LMS)**

### Level 2 — Sub-Domain
*   **Current:** Course Management, Enrollments, Manager Assignments, AI Recommendations.
*   **Target:** Catalog Management, Learning Delivery (Player), Learner Intelligence, Compliance & Certification, Instructor Resources.

### Level 3 — Functional Capability
*   **Current:** Create Course, Search Catalog (Faceted), Enroll, View My Learning, Manager Assign, Extract Skills.
*   **Target:** Content Import (SCORM), Curriculum Building, Assignment Rules, Waitlist Management, Virtual Classroom Integration.

### Level 4 — Business Use Case
*   **Current:**
    *   Employee self-enrolls/downloads certificate.
    *   Manager assigns mandatory training.
    *   AI recommends courses based on history.
*   **Target:**
    *   Compliance Officer defines "Annual Safety" renewal rule.
    *   Instructor marks attendance for ILT session.
    *   Finance charges Cost Center for external training.

### Level 5 — User Personas
*   **Current:** Learner, Manager, Admin (Basic).
*   **Missing:**
    *   **Instructor:** Manages rosters & sessions.
    *   **Compliance Officer:** Audits regulatory training.

### Level 6 — UI Surfaces (UX Audit)
*   **Current Implementation:**
    *   `LearningManagement.tsx`: Learner Dashboard (Catalog/My Learning/Recommendations).
    *   `ManagerLearningDashboard.tsx`: MSS Team View & Assignments.
    *   `CourseCatalogAdmin.tsx`: Admin Workspace.
*   **Target Architecture:**
    *   **Instructor Desk:** My Sessions / Roster / Grading.
    *   **Player UI:** Full-screen immersive content view.

### Level 7 — UI Components
*   **Current:**
    *   **Catalog:** Tile View with Filters (Category/Provider).
    *   **Admin:** `StandardTable` for Courses.
    *   **Manager:** Team Cards.
*   **Tier-1 Requirement:**
    *   **Content Player:** Dedicated immersive view (SCORM/Video).
    *   **Analytics Cards:** Compliance %, Learning Hours.

### Level 8 — Configuration / Setup Screens
*   **Current:** None (Hardcoded lists).
*   **Required:**
    *   Learning Providers Setup.
    *   Completion Status Mapping.
    *   Assessment Templates.

### Level 9 — Master Data Screens
*   **Current:** Course/Offering CRUD (Admin View).
*   **Required:**
    *   Instructor Directory.
    *   Training Vendor management.

### Level 10 — Transactional Objects
*   **Current:**
    *   `hrmLearningCourses` (with Categories, Validity).
    *   `hrmLearningOfferings`.
    *   `hrmLearningEnrollments` (Status, Certificate URL).
    *   `hrmLearningCertifications`.
    *   `hrmLearningContentItems` (Metadata).
*   **Missing:**
    *   `hrm_learning_assignments` (Distinct from voluntary enrollment).
    *   `hrm_learning_records` (Historical transcripts).

### Level 11 — Workflow & Controls
*   **Current:** Immediate enrollment; Manager Assignment (Force Enroll).
*   **Required:**
    *   Approval Workflow (Manager/Cost Center approval).
    *   Waitlist Engine (Auto-promotion).
    *   Prerequisite Validation.

### Level 12 — Rules / Derivation
*   **Current:** AI Recommendations (Cosine/Heuristic).
*   **Required:**
    *   **Eligibility Profiles:** Who can see this course?
    *   **Recertification Logic:** If cert expires in 30 days, re-enroll.

### Level 13 — AI / Automation
*   **Current:**
    *   **Recommendations:** Content-based filtering.
    *   **Skill Extraction:** Hybrid (Keyword/LLM).
*   **Required:**
    *   **Risk Prediction:** "Who is likely to expire compliance?"

### Level 14 — Security, Compliance & Audit
*   **Current:** `tenantId` filtered. Manager logic checks `managerId`.
*   **Risks:** No field-level audit.
*   **Requirement:** GDPR 'Right to be Forgotten' for learning history.

### Level 15 — Performance & Scalability
*   **Current:** Basic Fetch/Query.
*   **Risk:** Will crash at >1,000 courses.
*   **Requirement:** Server-side pagination, infinite scroll for catalog.

## 4. Remediation Plan & Task List

### Phase 1-4: Foundation & MVP (COMPLETED ✅)
*   [x] Schema Expansion (Courses, Offerings, Certifications).
*   [x] Admin Workspace.
*   [x] Learner Catalog (Faceted Search) & Certificates.
*   [x] Manager Dashboard & Assignment.
*   [x] AI Recommendations & Skill Extraction.

### Phase 5: Content Engine (The Player)
1.  **SCORM/Video Player:**
    *   Implement `/learning/player/:enrollmentId` route.
    *   Handle SCORM 1.2 CMI communication (Commit/Finish).
2.  **Content Hosting:**
    *   S3/MinIO Integration for uploading Course zips/MP4s.

### Phase 6: Deep Compliance
1.  **Recertification Engine:**
    *   Background Job (`cron`) to check `validityMonths`.
    *   Auto-assign new offering if status is `EXPIRED` or `EXPIRING_SOON`.
2.  **Audit Logs:**
    *   Track every status change (Enrolled -> In Progress -> Completed).

### Phase 7: Workflow & Financials
1.  **Approvals:**
    *   Integrate with `ApprovalService` (from Phase 1 of Project).
2.  **Commerce:**
    *   Price on Offerings. Use `FinanceService` to create AR Invoice or GL Charge.

## 5. Explicit Stop
**DO NOT BUILD YET.** Review and Approval Required.
