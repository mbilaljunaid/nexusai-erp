# Learning & Training (LMS) - Level-15 Canonical Decomposition & Gap Analysis

## 1. Executive Summary & Tier-1 Assessment

**Current State:** ⚠️ **NOT TIER-1 READY**
The current Learning & Training module is a functional MVP (Minimum Viable Product) capable of basic course catalog listing and simple enrollment tracking. It fundamentally lacks the depth required for an Enterprise LMS as defined by Oracle Fusion Learning standards. It treats learning as simple event registration rather than a comprehensive skill development and compliance engine.

**Critical Gaps:**
*   **No Structured Content:** Courses are metadata-only containers. No support for SCORM, AICC, Video, or PDF content delivery.
*   **Scalability Risk:** Course catalog and enrollment queries lack server-side pagination.
*   **Compliance Void:** No certification expirations, validity periods, or renewal workflows.
*   **Missing Personas:** No dedicated Instructor, Manager, or Learning Expert views.
*   **Integration Gap:** Isolated from Talent Management (Skills/Goals) and Finance.

## 2. Gap Analysis + Feature Parity Heatmap

| Feature Area | Oracle Fusion Learning | NexusAI Current State | Status | Parity Gap |
| :--- | :--- | :--- | :--- | :--- |
| **Catalog Structure** | Catalog > Community > Subject > Course > Offering > Activity | Flat List of Courses & Offerings | 🟡 Partial | Missing hierarchy & granular activities |
| **Content Delivery** | Native Video, SCORM 1.2/2004, AICC, PDF | Metadata only (Title/Desc) | 🔴 Missing | No content player or hosting mechanism |
| **Enrollments** | Approval flows, Waitlists, Prereqs, Eligibility Profiles | Simple "Click to Enroll" | 🟡 Partial | Missing rules engine & workflows |
| **Compliance** | Certifications, Recertification Logic, Validity Periods | Simple "Completed" flag | 🔴 Missing | No regulatory tracking capability |
| **Learning Paths** | Curriculums, Specializations, Learning Journeys | None | 🔴 Missing | No multi-course structures |
| **Assessments** | Quizzes, Tests, Surveys, Evaluations | Score field only | 🔴 Missing | No assessment engine |
| **Instructors** | Resources, Scheduling, Virtual Classroom Integration | Simple ID reference | 🟡 Partial | No instructor management UI |
| **Skill Impact** | Auto-update Profiles, Competency Gaps | None | 🔴 Missing | Disconnected from HR Core |
| **Managers** | Team Learning, Assignments, Compliance Dashboard | None | 🔴 Missing | Manager persona missing |
| **AI/Intelligence** | Recommendations, "Best for you", Skill Gap Analysis | None | 🔴 Missing | No predictive capability |

## 3. Level-15 Canonical Decomposition

### Level 1 — Module Domain
**Learning & Training (LMS)**

### Level 2 — Sub-Domain
*   **Current:** Course Management, Enrollments.
*   **Target:** Catalog Management, Learning Delivery, Learner Intelligence, Compliance & Certification, Instructor Resources.

### Level 3 — Functional Capability
*   **Current:** Create Course, Search Catalog, Enroll, View My Learning.
*   **Target:** Content Import (SCORM), Curriculum Building, Assignment Rules, Waitlist Management, Virtual Classroom Integration, Assessment Authoring.

### Level 4 — Business Use Case
*   **Current:** Employee self-enrolls in a generic course.
*   **Target:**
    *   Compliance Officer assigns mandatory harassment training to all NY employees.
    *   Manager assigns performance improvement training.
    *   System recommends course based on skill gap.

### Level 5 — User Personas
*   **Current:** Generic User (Learner), implicit Admin.
*   **Missing:**
    *   **Learning Specialist:** Manages catalog & assignments.
    *   **Instructor:** Manages rosters & sessions.
    *   **Line Manager:** Tracks team compliance.
    *   **Compliance Officer:** Audits regulatory training.

### Level 6 — UI Surfaces (UX Audit)
*   **Current Implementation:**
    *   `LearningManagement.tsx`: Combined Catalog & My Learning. Learner-centric.
    *   `CourseManagement.tsx`: **DEAD CODE** / Mock data.
*   **Target Architecture:**
    *   **Learner Self-Service:** Dashboard / Catalog / My Learning.
    *   **Administrator Work Space:** Catalog Mgmt / Content / Assignments / Intelligence.
    *   **Instructor Desk:** My Sessions / Roster / Grading.
    *   **Manager Dashboard:** Team Learning / Compliance.

### Level 7 — UI Components
*   **Current:** Grid of Cards for Catalog.
*   **Tier-1 Requirement:**
    *   **Catalog:** Search-optimized Tile View (Learner) vs Data Grid (Admin).
    *   **Enrollments:** High-volume `StandardTable`.
    *   **Content Player:** Dedicated immersive view.

### Level 8 — Configuration / Setup Screens
*   **Current:** None.
*   **Required:**
    *   Learning Providers Setup.
    *   Completion Status Mapping.
    *   Assessment Templates.
    *   Email Notification Templates.

### Level 9 — Master Data Screens
*   **Current:** Course creation via Dialog in Learner view (Incorrect Persona).
*   **Required:**
    *   Course / Offering / Class hierarchy editors.
    *   Instructor Directory.
    *   Training Vendor management.

### Level 10 — Transactional Objects
*   **Current:** `hrmLearningCourses`, `hrmLearningOfferings`, `hrmLearningEnrollments`.
*   **Missing:**
    *   `hrm_learning_content_items` (SCORM/Video metadata).
    *   `hrm_learning_assignments` (Distinct from voluntary enrollment).
    *   `hrm_learning_records` (Historical transcripts).
    *   `hrm_learning_certifications`.

### Level 11 — Workflow & Controls
*   **Current:** Immediate enrollment.
*   **Required:**
    *   Approval Workflow (Manager/Cost Center approval).
    *   Waitlist Engine (Auto-promotion).
    *   Prerequisite Validation.

### Level 12 — Rules / Derivation
*   **Current:** SQL Joins.
*   **Required:**
    *   **Eligibility Profiles:** Who can see this course?
    *   **Assignment Rules:** Auto-assign based on Org/Job/Location.
    *   **Recertification Logic:** If cert expires in 30 days, re-enroll.

### Level 13 — AI / Automation
*   **Current:** None.
*   **Required:**
    *   **Smart Recommendations:** "People with your role took X".
    *   **Skill Extraction:** Auto-tag content with skills.

### Level 14 — Security, Compliance & Audit
*   **Current:** `tenantId` filtered.
*   **Risks:** No field-level audit. No granular RBAC (Admin vs Instructor).
*   **Requirement:** GDPR 'Right to be Forgotten' for learning history.

### Level 15 — Performance & Scalability
*   **Current:** `fetchAll` pattern.
*   **Risk:** Will crash at >1,000 courses.
*   **Requirement:** Server-side pagination, infinite scroll for catalog.

## 4. Remediation Plan & Task List

### Phase 1: Foundation Refactoring (Data Model & Admin)
1.  **Schema Expansion:**
    *   Add `hrm_learning_content_items`, `hrm_learning_certifications`.
    *   Add `validity_period`, `renewal_rules` to courses.
2.  **Administrator Workspace:**
    *   Create dedicated Admin Route (`/learning/admin`).
    *   Implement `CourseCatalogView` (Admin) with `StandardTable` and Pagination.
    *   Move "Create Course" out of Learner view.

### Phase 2: Learner Experience & Content
1.  **Catalog Upgrade:**
    *   Implement faceted search (Category, Type, Duration).
    *   Connect "Self-Paced" to actual content URL logic.
2.  **My Learning Enhancement:**
    *   Add status filters (Active, Completed, Expired).
    *   Implement Certificate generation (PDF mock).

### Phase 3: Manager & Compliance
1.  **Manager Dashboard:**
    *   View Team Enrollments.
    *   View Team Compliance gaps.
2.  **Assignment Engine:**
    *   API endpoint to assigning courses to User Lists.

### Phase 4: AI & Architecture
1.  **Embedding:** Generate embeddings for Course Titles/Descriptions.
2.  **Recommendation Engine:** Simple cosine similarity against User Skills.

## 5. Explicit Stop
**DO NOT BUILD YET.** Review and Approval Required.
